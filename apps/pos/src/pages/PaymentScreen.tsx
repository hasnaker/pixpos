import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, Banknote, CreditCard, Smartphone, Users, Scissors, X, Loader2, ShieldAlert } from 'lucide-react';
import { ordersApi, paymentsApi } from '@/services/api';
import type { Order } from '@/services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Get current user from localStorage
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) return JSON.parse(userStr);
  } catch {}
  return null;
};

// Check if user can take payments
const canTakePayment = () => {
  const user = getCurrentUser();
  if (!user) return false;
  // Waiter cannot take payments
  return user.role !== 'waiter';
};

type PaymentStep = 'method' | 'cash' | 'card-processing' | 'success' | 'split-type' | 'split-people' | 'split-amount' | 'split-items';

interface PartialPayment {
  amount: number;
  method: 'cash' | 'card';
  paid: boolean;
}

export default function PaymentScreen() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const orderFromState = location.state?.order as Order | undefined;

  const [paymentStep, setPaymentStep] = useState<PaymentStep>('method');
  const [cashReceived, setCashReceived] = useState('');
  
  // Split payment state
  const [splitPayments, setSplitPayments] = useState<PartialPayment[]>([]);
  const [currentPaymentIndex, setCurrentPaymentIndex] = useState(0);
  const [peopleCount, setPeopleCount] = useState(2);
  const [customAmounts, setCustomAmounts] = useState<number[]>([]);
  const [selectedItemsPerPerson, setSelectedItemsPerPerson] = useState<Record<number, string[]>>({});
  
  // OKC state
  const [okcProcessing, setOkcProcessing] = useState(false);
  const [okcResult, setOkcResult] = useState<{ success: boolean; message: string; cardType?: string } | null>(null);
  const [okcPaymentType, setOkcPaymentType] = useState<'cash' | 'card'>('card');

  const { data: fetchedOrder } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.getOne(orderId!),
    enabled: !!orderId,
  });

  const order = orderFromState || fetchedOrder;

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const paymentMutation = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      
      if (splitPayments.length > 0) {
        // Mark current payment as paid
        const newPayments = [...splitPayments];
        newPayments[currentPaymentIndex].paid = true;
        setSplitPayments(newPayments);
        
        // Check if all payments done
        const allPaid = newPayments.every(p => p.paid);
        if (allPaid) {
          setPaymentStep('success');
        } else {
          // Move to next unpaid
          const nextUnpaid = newPayments.findIndex(p => !p.paid);
          setCurrentPaymentIndex(nextUnpaid);
          setPaymentStep('method');
          setCashReceived('');
        }
      } else {
        setPaymentStep('success');
      }
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      const message = error.response?.data?.message || error.message || 'Ödeme işlemi başarısız';
      setErrorMessage(message);
      console.error('Payment error:', error);
    },
  });


  const formatPrice = (value: number | string) => {
    const num = typeof value === 'number' ? value : parseFloat(value) || 0;
    return `₺${num.toFixed(0)}`;
  };

  const total = useMemo(() => {
    if (!order) return 0;
    return typeof order.totalAmount === 'number' ? order.totalAmount : parseFloat(order.totalAmount || '0') || 0;
  }, [order]);

  const currentPaymentAmount = useMemo(() => {
    if (splitPayments.length > 0) {
      return splitPayments[currentPaymentIndex]?.amount || 0;
    }
    return total;
  }, [splitPayments, currentPaymentIndex, total]);

  const remainingAmount = useMemo(() => {
    const paid = splitPayments.filter(p => p.paid).reduce((sum, p) => sum + p.amount, 0);
    return total - paid;
  }, [splitPayments, total]);

  const change = useMemo(() => {
    const received = parseFloat(cashReceived) || 0;
    return Math.max(0, received - currentPaymentAmount);
  }, [cashReceived, currentPaymentAmount]);

  const handlePayment = (method: 'cash' | 'card') => {
    if (!order || paymentMutation.isPending) return;
    paymentMutation.mutate({
      orderId: order.id,
      amount: currentPaymentAmount,
      paymentMethod: method,
    });
  };

  const handleMethodSelect = async (method: string) => {
    if (paymentMutation.isPending || okcProcessing) return;
    if (method === 'cash') {
      setPaymentStep('cash');
    } else if (method === 'card') {
      // ÖKC ile kart ödemesi
      setPaymentStep('card-processing');
      setOkcProcessing(true);
      setOkcResult(null);
      setOkcPaymentType('card');
      
      try {
        const response = await fetch(`${API_URL}/api/okc/sale`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Math.round(currentPaymentAmount * 100), // Kuruş cinsinden
            orderId: order?.id || '',
            description: `Sipariş #${order?.orderNumber}`,
            paymentType: 'card', // Kart olduğunu belirt
          }),
        });
        
        const result = await response.json();
        
        if (result.success) {
          setOkcResult({
            success: true,
            message: 'Kart ödemesi başarılı',
            cardType: result.cardType,
          });
          // Ödemeyi kaydet
          handlePayment('card');
        } else {
          setOkcResult({
            success: false,
            message: result.errorMessage || 'Kart ödemesi başarısız',
          });
          setOkcProcessing(false);
        }
      } catch (error) {
        setOkcResult({
          success: false,
          message: 'ÖKC bağlantı hatası',
        });
        setOkcProcessing(false);
      }
    } else {
      handlePayment('card');
    }
  };

  const handleCashConfirm = async () => {
    const received = parseFloat(cashReceived) || 0;
    if (received < currentPaymentAmount || okcProcessing) return;
    
    // Nakit ödeme de ÖKC'ye gidecek (mali fiş için)
    setPaymentStep('card-processing'); // Aynı processing ekranını kullan
    setOkcProcessing(true);
    setOkcResult(null);
    setOkcPaymentType('cash');
    
    try {
      const response = await fetch(`${API_URL}/api/okc/sale`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(currentPaymentAmount * 100), // Kuruş cinsinden
          orderId: order?.id || '',
          description: `Sipariş #${order?.orderNumber}`,
          paymentType: 'cash', // Nakit olduğunu belirt
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setOkcResult({
          success: true,
          message: 'Nakit ödeme kaydedildi',
        });
        // Ödemeyi kaydet
        handlePayment('cash');
      } else {
        setOkcResult({
          success: false,
          message: result.errorMessage || 'ÖKC kaydı başarısız',
        });
        setOkcProcessing(false);
      }
    } catch (error) {
      setOkcResult({
        success: false,
        message: 'ÖKC bağlantı hatası',
      });
      setOkcProcessing(false);
    }
  };

  // Split by people count
  const handleSplitByPeople = () => {
    const amountPerPerson = Math.ceil(total / peopleCount);
    const payments: PartialPayment[] = [];
    let remaining = total;
    
    for (let i = 0; i < peopleCount; i++) {
      const amount = i === peopleCount - 1 ? remaining : amountPerPerson;
      payments.push({ amount, method: 'cash', paid: false });
      remaining -= amount;
    }
    
    setSplitPayments(payments);
    setCurrentPaymentIndex(0);
    setPaymentStep('method');
  };

  // Split by custom amounts
  const handleSplitByAmount = () => {
    const payments: PartialPayment[] = customAmounts.map(amount => ({
      amount,
      method: 'cash',
      paid: false,
    }));
    setSplitPayments(payments);
    setCurrentPaymentIndex(0);
    setPaymentStep('method');
  };

  const handleBack = () => {
    if (paymentStep === 'cash') {
      setPaymentStep('method');
      setCashReceived('');
    } else if (paymentStep === 'card-processing') {
      // Kart işlemi sırasında geri dönülemez (işlem devam ediyorsa)
      if (!okcProcessing) {
        setPaymentStep('method');
        setOkcResult(null);
      }
    } else if (paymentStep === 'split-people' || paymentStep === 'split-amount' || paymentStep === 'split-items') {
      // Alt bölme ekranlarından split-type'a dön
      setPaymentStep('split-type');
      setSelectedItemsPerPerson({});
    } else if (paymentStep === 'split-type') {
      // split-type'dan method'a dön
      setPaymentStep('method');
      setSplitPayments([]);
    } else if (paymentStep === 'method' && splitPayments.length > 0) {
      // Bölünmüş ödeme sırasında method'dan split-type'a dön
      setPaymentStep('split-type');
      setSplitPayments([]);
      setCurrentPaymentIndex(0);
    } else {
      navigate(-1);
    }
  };


  const quickAmounts = useMemo(() => {
    const amt = currentPaymentAmount;
    const suggestions: number[] = [];
    suggestions.push(Math.ceil(amt));
    const r10 = Math.ceil(amt / 10) * 10;
    if (r10 !== Math.ceil(amt)) suggestions.push(r10);
    const r50 = Math.ceil(amt / 50) * 50;
    if (r50 !== r10) suggestions.push(r50);
    const r100 = Math.ceil(amt / 100) * 100;
    if (r100 !== r50) suggestions.push(r100);
    return suggestions.slice(0, 4);
  }, [currentPaymentAmount]);

  useEffect(() => {
    if (paymentStep === 'success') {
      // Clear customer display on payment success
      fetch(`${API_URL}/orders/display/clear`, { method: 'POST' }).catch(() => {});
      const timer = setTimeout(() => navigate('/tables'), 3000);
      return () => clearTimeout(timer);
    }
  }, [paymentStep, navigate]);

  // Initialize custom amounts
  useEffect(() => {
    if (paymentStep === 'split-amount' && customAmounts.length === 0) {
      setCustomAmounts([Math.ceil(total / 2), Math.floor(total / 2)]);
    }
  }, [paymentStep, total, customAmounts.length]);

  if (!order) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: 'rgba(255,255,255,0.5)' }}>
        Yükleniyor...
      </div>
    );
  }

  // Check if user has payment permission
  if (!canTakePayment()) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', gap: '24px' }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255,69,58,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ShieldAlert size={40} style={{ color: '#FF453A' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Yetkisiz Erişim</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Ödeme alma yetkiniz bulunmamaktadır.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '14px 32px',
            borderRadius: '12px',
            border: 'none',
            background: '#0A84FF',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Geri Dön
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif' }}>
      
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#0A84FF', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}>
          <ArrowLeft size={20} />
          Geri
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{order.table?.name || 'Masa'}</span>
          {splitPayments.length > 0 && (
            <span style={{ color: '#FF9F0A', fontSize: '13px', fontWeight: 500 }}>
              Bölünmüş Ödeme ({splitPayments.filter(p => p.paid).length}/{splitPayments.length})
            </span>
          )}
        </div>
      </header>

      {/* Error Message */}
      {errorMessage && (
        <div style={{ margin: '16px 32px 0', padding: '12px 16px', background: 'rgba(255,69,58,0.15)', border: '1px solid rgba(255,69,58,0.3)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#FF453A', fontSize: '14px' }}>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} style={{ background: 'none', border: 'none', color: '#FF453A', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', overflow: 'auto' }}>

        {/* Payment Method Selection */}
        {paymentStep === 'method' && (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            
            {/* Current Payment Info */}
            {splitPayments.length > 0 ? (
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '4px' }}>
                  Ödeme {currentPaymentIndex + 1} / {splitPayments.length}
                </div>
                <div style={{ color: '#30D158', fontSize: '48px', fontWeight: 700 }}>
                  {formatPrice(currentPaymentAmount)}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>
                  Kalan: {formatPrice(remainingAmount)}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '8px' }}>Toplam Tutar</div>
                <div style={{ color: '#30D158', fontSize: '56px', fontWeight: 700 }}>{formatPrice(total)}</div>
              </div>
            )}

            {/* Order Items - Only show if not split */}
            {splitPayments.length === 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px', marginBottom: '32px', maxHeight: '200px', overflowY: 'auto' }}>
                {order.items.map((item, idx) => (
                  <div key={item.id}>
                    {idx > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>{item.quantity}× {item.productName}</span>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>{formatPrice(item.totalPrice)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Progress - Show paid payments */}
            {splitPayments.length > 0 && splitPayments.some(p => p.paid) && (
              <div style={{ background: 'rgba(48,209,88,0.08)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px' }}>Tamamlanan Ödemeler</div>
                {splitPayments.map((p, i) => p.paid && (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <Check size={16} style={{ color: '#30D158' }} />
                    <span style={{ color: '#30D158', fontSize: '14px' }}>Ödeme {i + 1}: {formatPrice(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Methods */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <PaymentButton icon={<Banknote size={24} />} label="Nakit" color="#30D158" onClick={() => handleMethodSelect('cash')} />
              <PaymentButton icon={<CreditCard size={24} />} label="Kredi Kartı" color="#0A84FF" onClick={() => handleMethodSelect('card')} />
              <PaymentButton icon={<Smartphone size={24} />} label="Online" color="#BF5AF2" onClick={() => handleMethodSelect('online')} />
              <PaymentButton icon={<Users size={24} />} label="Personel" color="#FF9F0A" onClick={() => handleMethodSelect('staff')} />
            </div>

            {/* Split Button - Only show if not already split */}
            {splitPayments.length === 0 && (
              <button
                onClick={() => setPaymentStep('split-type')}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 500, cursor: 'pointer', marginTop: '8px' }}
              >
                <Scissors size={20} />
                Hesabı Böl
              </button>
            )}
          </div>
        )}


        {/* Split Type Selection */}
        {paymentStep === 'split-type' && (
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Hesabı Böl</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Nasıl bölmek istiyorsunuz?</div>
              <div style={{ color: '#30D158', fontSize: '28px', fontWeight: 700, marginTop: '16px' }}>{formatPrice(total)}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => setPaymentStep('split-people')}
                style={{ padding: '20px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '14px', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Kişi Sayısına Göre</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Toplam tutarı eşit olarak böl</div>
              </button>

              <button
                onClick={() => setPaymentStep('split-amount')}
                style={{ padding: '20px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '14px', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Tutara Göre</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Her kişinin ödeyeceği tutarı belirle</div>
              </button>

              <button
                onClick={() => setPaymentStep('split-items')}
                style={{ padding: '20px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '14px', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Ürüne Göre</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Hangi ürünü kim ödeyecek seç</div>
              </button>
            </div>
          </div>
        )}

        {/* Split by People Count */}
        {paymentStep === 'split-people' && (
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Kaç Kişi?</div>
              <div style={{ color: '#30D158', fontSize: '28px', fontWeight: 700 }}>{formatPrice(total)}</div>
            </div>

            {/* People Count Selector */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', marginBottom: '32px' }}>
              <button
                onClick={() => setPeopleCount(Math.max(2, peopleCount - 1))}
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
              >
                -
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: '48px', fontWeight: 700 }}>{peopleCount}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>kişi</div>
              </div>
              <button
                onClick={() => setPeopleCount(peopleCount + 1)}
                style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer' }}
              >
                +
              </button>
            </div>

            {/* Preview */}
            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '12px' }}>Kişi başı</div>
              <div style={{ color: '#30D158', fontSize: '32px', fontWeight: 700, textAlign: 'center' }}>
                {formatPrice(Math.ceil(total / peopleCount))}
              </div>
            </div>

            <button
              onClick={handleSplitByPeople}
              style={{ width: '100%', padding: '18px', background: '#30D158', border: 'none', borderRadius: '14px', color: '#000', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
            >
              Böl ve Ödemeye Geç
            </button>
          </div>
        )}


        {/* Split by Custom Amount */}
        {paymentStep === 'split-amount' && (
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Tutarları Belirle</div>
              <div style={{ color: '#30D158', fontSize: '28px', fontWeight: 700 }}>{formatPrice(total)}</div>
            </div>

            {/* Amount Inputs */}
            <div style={{ marginBottom: '24px' }}>
              {customAmounts.map((amount, idx) => {
                const isLast = idx === customAmounts.length - 1;
                const othersTotal = customAmounts.slice(0, -1).reduce((a, b) => a + b, 0);
                const autoAmount = isLast ? Math.max(0, total - othersTotal) : amount;
                
                return (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', width: '60px' }}>Kişi {idx + 1}</span>
                    {isLast ? (
                      <div style={{ flex: 1, padding: '14px', background: 'rgba(48,209,88,0.1)', border: '1px solid rgba(48,209,88,0.3)', borderRadius: '10px', color: '#30D158', fontSize: '18px', fontWeight: 600, textAlign: 'center' }}>
                        {formatPrice(autoAmount)}
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>otomatik</div>
                      </div>
                    ) : (
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          const newAmounts = [...customAmounts];
                          const newValue = parseInt(e.target.value) || 0;
                          newAmounts[idx] = newValue;
                          // Son kişinin tutarını otomatik hesapla
                          const othersSum = newAmounts.slice(0, -1).reduce((a, b) => a + b, 0);
                          newAmounts[newAmounts.length - 1] = Math.max(0, total - othersSum);
                          setCustomAmounts(newAmounts);
                        }}
                        style={{ flex: 1, padding: '14px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '18px', fontWeight: 600, textAlign: 'center' }}
                      />
                    )}
                    {customAmounts.length > 2 && !isLast && (
                      <button
                        onClick={() => {
                          const newAmounts = customAmounts.filter((_, i) => i !== idx);
                          // Son kişinin tutarını yeniden hesapla
                          const othersSum = newAmounts.slice(0, -1).reduce((a, b) => a + b, 0);
                          newAmounts[newAmounts.length - 1] = Math.max(0, total - othersSum);
                          setCustomAmounts(newAmounts);
                        }}
                        style={{ padding: '10px', background: 'rgba(255,69,58,0.15)', border: 'none', borderRadius: '8px', color: '#FF453A', cursor: 'pointer' }}
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Person */}
            <button
              onClick={() => {
                // Yeni kişi eklendiğinde son kişinin tutarını 0 yap, yeni son kişi kalanı alsın
                const newAmounts = [...customAmounts, 0];
                const othersSum = newAmounts.slice(0, -1).reduce((a, b) => a + b, 0);
                newAmounts[newAmounts.length - 1] = Math.max(0, total - othersSum);
                setCustomAmounts(newAmounts);
              }}
              style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: '10px', color: 'rgba(255,255,255,0.5)', fontSize: '14px', cursor: 'pointer', marginBottom: '24px' }}
            >
              + Kişi Ekle
            </button>

            {/* Total Check */}
            <div style={{ background: customAmounts.reduce((a, b) => a + b, 0) === total ? 'rgba(48,209,88,0.1)' : 'rgba(255,69,58,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '4px' }}>Toplam</div>
              <div style={{ color: customAmounts.reduce((a, b) => a + b, 0) === total ? '#30D158' : '#FF453A', fontSize: '24px', fontWeight: 700 }}>
                {formatPrice(customAmounts.reduce((a, b) => a + b, 0))}
              </div>
              {customAmounts.reduce((a, b) => a + b, 0) !== total && (
                <div style={{ color: '#FF453A', fontSize: '12px', marginTop: '4px' }}>
                  {customAmounts.reduce((a, b) => a + b, 0) > total ? 'Fazla' : 'Eksik'}: {formatPrice(Math.abs(customAmounts.reduce((a, b) => a + b, 0) - total))}
                </div>
              )}
            </div>

            <button
              onClick={handleSplitByAmount}
              disabled={customAmounts.reduce((a, b) => a + b, 0) !== total}
              style={{ width: '100%', padding: '18px', background: customAmounts.reduce((a, b) => a + b, 0) === total ? '#30D158' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '14px', color: customAmounts.reduce((a, b) => a + b, 0) === total ? '#000' : 'rgba(255,255,255,0.3)', fontSize: '16px', fontWeight: 600, cursor: customAmounts.reduce((a, b) => a + b, 0) === total ? 'pointer' : 'not-allowed' }}
            >
              Böl ve Ödemeye Geç
            </button>
          </div>
        )}

        {/* Split by Items */}
        {paymentStep === 'split-items' && (
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Ürünlere Göre Böl</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Her ürünü kimin ödeyeceğini seçin</div>
            </div>

            {/* Person Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {Object.keys(selectedItemsPerPerson).length === 0 ? (
                <>
                  <button
                    onClick={() => setSelectedItemsPerPerson({ 0: [], 1: [] })}
                    style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer' }}
                  >
                    2 Kişi
                  </button>
                  <button
                    onClick={() => setSelectedItemsPerPerson({ 0: [], 1: [], 2: [] })}
                    style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer' }}
                  >
                    3 Kişi
                  </button>
                  <button
                    onClick={() => setSelectedItemsPerPerson({ 0: [], 1: [], 2: [], 3: [] })}
                    style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', cursor: 'pointer' }}
                  >
                    4 Kişi
                  </button>
                </>
              ) : (
                <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                  {Object.keys(selectedItemsPerPerson).map((personIdx) => {
                    const idx = parseInt(personIdx);
                    const personItems = selectedItemsPerPerson[idx] || [];
                    const personTotal = order.items
                      .filter(item => personItems.includes(item.id))
                      .reduce((sum, item) => sum + (typeof item.totalPrice === 'number' ? item.totalPrice : parseFloat(item.totalPrice) || 0), 0);
                    
                    return (
                      <div
                        key={idx}
                        style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', textAlign: 'center' }}
                      >
                        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '4px' }}>Kişi {idx + 1}</div>
                        <div style={{ color: '#30D158', fontSize: '16px', fontWeight: 600 }}>{formatPrice(personTotal)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Items List */}
            {Object.keys(selectedItemsPerPerson).length > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px', marginBottom: '24px', maxHeight: '280px', overflowY: 'auto' }}>
                {order.items.map((item, idx) => {
                  return (
                    <div key={item.id}>
                      {idx > 0 && <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '10px 0' }} />}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>{item.quantity}× {item.productName}</div>
                          <div style={{ color: '#30D158', fontSize: '13px', marginTop: '2px' }}>{formatPrice(item.totalPrice)}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {Object.keys(selectedItemsPerPerson).map((personIdx) => {
                            const pIdx = parseInt(personIdx);
                            const isSelected = selectedItemsPerPerson[pIdx]?.includes(item.id);
                            
                            return (
                              <button
                                key={pIdx}
                                onClick={() => {
                                  const newSelection = { ...selectedItemsPerPerson };
                                  // Remove from all
                                  Object.keys(newSelection).forEach(k => {
                                    newSelection[parseInt(k)] = newSelection[parseInt(k)].filter(id => id !== item.id);
                                  });
                                  // Add to selected person
                                  if (!isSelected) {
                                    newSelection[pIdx] = [...newSelection[pIdx], item.id];
                                  }
                                  setSelectedItemsPerPerson(newSelection);
                                }}
                                style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.2)',
                                  background: isSelected ? '#30D158' : 'transparent',
                                  color: isSelected ? '#000' : 'rgba(255,255,255,0.6)',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                {pIdx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Confirm Button */}
            {Object.keys(selectedItemsPerPerson).length > 0 && (
              <button
                onClick={() => {
                  // Calculate totals per person
                  const payments: PartialPayment[] = Object.keys(selectedItemsPerPerson).map((personIdx) => {
                    const idx = parseInt(personIdx);
                    const personItems = selectedItemsPerPerson[idx] || [];
                    const personTotal = order.items
                      .filter(item => personItems.includes(item.id))
                      .reduce((sum, item) => sum + (typeof item.totalPrice === 'number' ? item.totalPrice : parseFloat(item.totalPrice) || 0), 0);
                    return { amount: personTotal, method: 'cash' as const, paid: false };
                  }).filter(p => p.amount > 0);
                  
                  if (payments.length > 0) {
                    setSplitPayments(payments);
                    setCurrentPaymentIndex(0);
                    setPaymentStep('method');
                  }
                }}
                disabled={Object.values(selectedItemsPerPerson).every(items => items.length === 0)}
                style={{
                  width: '100%',
                  padding: '18px',
                  background: Object.values(selectedItemsPerPerson).some(items => items.length > 0) ? '#30D158' : 'rgba(255,255,255,0.06)',
                  border: 'none',
                  borderRadius: '14px',
                  color: Object.values(selectedItemsPerPerson).some(items => items.length > 0) ? '#000' : 'rgba(255,255,255,0.3)',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: Object.values(selectedItemsPerPerson).some(items => items.length > 0) ? 'pointer' : 'not-allowed',
                }}
              >
                Böl ve Ödemeye Geç
              </button>
            )}

            {Object.keys(selectedItemsPerPerson).length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', textAlign: 'center', marginTop: '16px' }}>
                Önce kaç kişi olduğunu seçin
              </div>
            )}
          </div>
        )}


        {/* Card Processing (ÖKC) */}
        {paymentStep === 'card-processing' && (
          <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ marginBottom: '32px' }}>
              {splitPayments.length > 0 && (
                <div style={{ color: '#FF9F0A', fontSize: '13px', marginBottom: '8px' }}>
                  Ödeme {currentPaymentIndex + 1} / {splitPayments.length}
                </div>
              )}
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '4px' }}>Ödenecek</div>
              <div style={{ color: '#0A84FF', fontSize: '48px', fontWeight: 700, marginBottom: '24px' }}>{formatPrice(currentPaymentAmount)}</div>
            </div>

            {okcProcessing && !okcResult && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ 
                  width: '100px', height: '100px', borderRadius: '24px',
                  background: okcPaymentType === 'cash' ? 'rgba(48, 209, 88, 0.15)' : 'rgba(10, 132, 255, 0.15)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  <Loader2 size={48} style={{ color: okcPaymentType === 'cash' ? '#30D158' : '#0A84FF', animation: 'spin 1s linear infinite' }} />
                </div>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
                  {okcPaymentType === 'cash' ? 'ÖKC İşleniyor' : 'Kart Bekleniyor'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                  {okcPaymentType === 'cash' ? 'Nakit ödeme ÖKC\'ye kaydediliyor...' : 'Lütfen kartınızı ÖKC cihazına okutun'}
                </div>
              </div>
            )}

            {okcResult && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ 
                  width: '100px', height: '100px', borderRadius: '24px',
                  background: okcResult.success ? 'rgba(48, 209, 88, 0.15)' : 'rgba(255, 69, 58, 0.15)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  {okcResult.success ? (
                    <Check size={48} style={{ color: '#30D158' }} />
                  ) : (
                    <X size={48} style={{ color: '#FF453A' }} />
                  )}
                </div>
                <div style={{ 
                  color: okcResult.success ? '#30D158' : '#FF453A', 
                  fontSize: '18px', fontWeight: 600, marginBottom: '8px' 
                }}>
                  {okcResult.message}
                </div>
                {okcResult.cardType && (
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                    {okcResult.cardType}
                  </div>
                )}
              </div>
            )}

            {!okcProcessing && okcResult && !okcResult.success && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setPaymentStep('method');
                    setOkcResult(null);
                  }}
                  style={{ 
                    flex: 1, padding: '16px', 
                    background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '12px',
                    color: '#fff', fontSize: '15px', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Geri Dön
                </button>
                <button
                  onClick={() => handleMethodSelect('card')}
                  style={{ 
                    flex: 1, padding: '16px', 
                    background: '#0A84FF', border: 'none', borderRadius: '12px',
                    color: '#fff', fontSize: '15px', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Tekrar Dene
                </button>
              </div>
            )}

            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        )}

        {/* Cash Payment */}
        {paymentStep === 'cash' && (
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              {splitPayments.length > 0 && (
                <div style={{ color: '#FF9F0A', fontSize: '13px', marginBottom: '8px' }}>
                  Ödeme {currentPaymentIndex + 1} / {splitPayments.length}
                </div>
              )}
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '4px' }}>Ödenecek</div>
              <div style={{ color: '#fff', fontSize: '32px', fontWeight: 600, marginBottom: '24px' }}>{formatPrice(currentPaymentAmount)}</div>
              
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '8px' }}>Alınan</div>
              <div style={{ color: cashReceived ? '#fff' : 'rgba(255,255,255,0.2)', fontSize: '48px', fontWeight: 700, marginBottom: '16px' }}>
                ₺{cashReceived || '0'}
              </div>

              {parseFloat(cashReceived) >= currentPaymentAmount && (
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', marginBottom: '4px' }}>Para Üstü</div>
                  <div style={{ color: '#30D158', fontSize: '28px', fontWeight: 700 }}>{formatPrice(change)}</div>
                </div>
              )}
            </div>

            {/* Quick Amounts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {quickAmounts.map((amount) => (
                <button key={amount} onClick={() => setCashReceived(amount.toString())} style={{ padding: '12px', background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '14px', fontWeight: 500, cursor: 'pointer' }}>
                  ₺{amount}
                </button>
              ))}
            </div>

            {/* Numpad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '24px' }}>
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    if (key === '⌫') setCashReceived(prev => prev.slice(0, -1));
                    else if (key) setCashReceived(prev => prev + key);
                  }}
                  disabled={!key}
                  style={{ padding: '20px', background: key ? 'rgba(255,255,255,0.06)' : 'transparent', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '22px', fontWeight: 500, cursor: key ? 'pointer' : 'default' }}
                >
                  {key}
                </button>
              ))}
            </div>

            <button
              onClick={handleCashConfirm}
              disabled={parseFloat(cashReceived) < currentPaymentAmount || paymentMutation.isPending}
              style={{ width: '100%', padding: '18px', background: parseFloat(cashReceived) >= currentPaymentAmount ? '#30D158' : 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '14px', color: parseFloat(cashReceived) >= currentPaymentAmount ? '#000' : 'rgba(255,255,255,0.3)', fontSize: '16px', fontWeight: 600, cursor: parseFloat(cashReceived) >= currentPaymentAmount ? 'pointer' : 'not-allowed' }}
            >
              {paymentMutation.isPending ? 'İşleniyor...' : 'Ödemeyi Onayla'}
            </button>
          </div>
        )}

        {/* Success */}
        {paymentStep === 'success' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(48,209,88,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <Check size={40} style={{ color: '#30D158' }} />
            </div>
            
            <div style={{ color: '#fff', fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>Ödeme Başarılı</div>
            {splitPayments.length > 0 && (
              <div style={{ color: '#FF9F0A', fontSize: '14px', marginBottom: '8px' }}>Bölünmüş Ödeme ({splitPayments.length} kişi)</div>
            )}
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', marginBottom: '32px' }}>#{order.orderNumber}</div>
            
            <div style={{ color: '#30D158', fontSize: '40px', fontWeight: 700, marginBottom: '48px' }}>{formatPrice(total)}</div>

            <button onClick={() => navigate('/tables')} style={{ padding: '16px 48px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 500, cursor: 'pointer' }}>
              Ana Ekrana Dön
            </button>
            
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '16px' }}>
              3 saniye içinde otomatik dönülecek...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentButton({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px 24px', background: `${color}15`, border: `1px solid ${color}40`, borderRadius: '16px', color: color, cursor: 'pointer' }}>
      {icon}
      <span style={{ fontSize: '15px', fontWeight: 600 }}>{label}</span>
    </button>
  );
}
