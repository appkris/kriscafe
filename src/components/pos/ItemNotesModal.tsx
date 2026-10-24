import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import type { MenuItem } from '../../types/database';
import { Button } from '../common/Button';
import './ItemNotesModal.css';

interface ItemNotesModalProps {
  menu: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (menu: MenuItem, notes: string) => void;
}

const PRESET_TAGS = [
  'Dingin / Es',
  'Panas / Hangat',
  'Less Sugar',
  'Tanpa Gula',
  'Pedas Sedang',
  'Extra Pedas',
  'Tanpa Sayur',
  'Bungkus Terpisah'
];

export const ItemNotesModal: React.FC<ItemNotesModalProps> = ({
  menu,
  isOpen,
  onClose,
  onConfirm
}) => {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');

  if (!isOpen || !menu) return null;

  const handleSelectTag = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag('');
    } else {
      setSelectedTag(tag);
    }
  };

  const handleConfirm = () => {
    const combinedNotes = [selectedTag, customNote.trim()]
      .filter(Boolean)
      .join(' - ');

    onConfirm(menu, combinedNotes);
    setSelectedTag('');
    setCustomNote('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title">Varian & Catatan Khusus</div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {menu.name}
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              PILIHAN CEPAT
            </label>
            <div className="preset-notes-grid">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`preset-chip ${selectedTag === tag ? 'preset-chip--selected' : ''}`}
                  onClick={() => handleSelectTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'block', marginBottom: 'var(--space-2)' }}>
              CATATAN TAMBAHAN (OPSIONAL)
            </label>
            <textarea
              className="notes-input-textarea"
              placeholder="Contoh: jangan terlalu manis, saus pisah..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-footer">
          <Button variant="ghost" size="md" onClick={onClose}>
            Batal
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            icon={<Check size={16} />}
            onClick={handleConfirm}
          >
            Tambahkan ke Keranjang
          </Button>
        </div>
      </div>
    </div>
  );
};
