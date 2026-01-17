import { useState } from 'react';
import { StickyNote, Check } from 'lucide-react';
import { Modal, Button } from '@/components/ui';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNote?: string;
  onSaveNote: (note: string) => void;
  isLoading?: boolean;
}

export default function NoteModal({
  isOpen,
  onClose,
  currentNote = '',
  onSaveNote,
  isLoading = false,
}: NoteModalProps) {
  const [note, setNote] = useState(currentNote);

  const handleSave = () => {
    onSaveNote(note.trim());
    handleClose();
  };

  const handleClose = () => {
    setNote(currentNote);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Sipariş Notu"
      size="md"
    >
      <div className="space-y-6">
        {/* Info */}
        <div className="flex items-start gap-3 p-4 bg-[#FFEECE] rounded-xl">
          <StickyNote size={20} className="text-[#FFA90B] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[#D48D09]">
              Siparişe not ekleyin
            </p>
            <p className="text-xs text-[#D48D09]/70 mt-1">
              Bu not mutfak ekranında ve fişte görünecektir
            </p>
          </div>
        </div>

        {/* Textarea */}
        <div>
          <label className="block text-sm font-medium text-[#121212] mb-2">
            Not
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Örn: Glutensiz, az tuzlu, acele..."
            rows={4}
            maxLength={500}
            className="
              w-full px-4 py-3 bg-[#F6F6F6] border border-[#E3E3E3] rounded-xl
              text-sm text-[#121212] placeholder:text-[#A5A5A5]
              focus:outline-none focus:border-[#A27B5C] focus:ring-2 focus:ring-[#A27B5C]/20
              resize-none transition-all
            "
          />
          <div className="flex justify-end mt-2">
            <span className="text-xs text-[#A5A5A5]">
              {note.length}/500
            </span>
          </div>
        </div>

        {/* Quick Notes */}
        <div>
          <p className="text-xs font-medium text-[#7F7F7F] mb-2">HIZLI NOTLAR</p>
          <div className="flex flex-wrap gap-2">
            {['Acele', 'Glutensiz', 'Vejetaryen', 'Az tuzlu', 'Ekstra sos', 'Paket'].map((quickNote) => (
              <button
                key={quickNote}
                onClick={() => setNote(prev => prev ? `${prev}, ${quickNote}` : quickNote)}
                className="
                  px-3 py-1.5 bg-[#F6F6F6] rounded-full text-xs font-medium text-[#7F7F7F]
                  hover:bg-[#EEEEEE] hover:text-[#121212] transition-all
                "
              >
                {quickNote}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            İptal
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="flex-1"
            leftIcon={<Check size={18} />}
          >
            {isLoading ? 'Kaydediliyor...' : 'Notu Kaydet'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
