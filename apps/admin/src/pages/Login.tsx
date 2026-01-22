import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { authApi, setAuthToken } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await authApi.loginSuperAdmin(email, password);
      setAuthToken(response.accessToken);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş başarısız');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0A84FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-white">PIXPOS Admin</h1>
          <p className="text-white/40 mt-1">Super Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/6 border border-white/8 rounded-2xl p-6">
          {error && (
            <div className="mb-4 p-3 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-xl text-[#FF453A] text-sm">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-white/60 text-sm mb-2">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white focus:outline-none focus:border-[#0A84FF]"
              placeholder="admin@pixpos.cloud"
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label className="block text-white/60 text-sm mb-2">Şifre</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/6 border border-white/8 rounded-xl text-white pr-12 focus:outline-none focus:border-[#0A84FF]"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#0A84FF] text-white rounded-xl font-medium hover:bg-[#0A84FF]/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <p className="text-center text-white/30 text-sm mt-6">
          Varsayılan: admin@pixpos.cloud / admin123
        </p>
      </div>
    </div>
  );
}
