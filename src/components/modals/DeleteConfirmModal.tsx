import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemType: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemType,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Delete ${itemType}`}
      subtitle="This action cannot be undone"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-red-500/20 border border-red-500/30 text-red-300 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>
            Are you sure you want to permanently delete <strong>"{title}"</strong>?
          </span>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            icon={Trash2}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
