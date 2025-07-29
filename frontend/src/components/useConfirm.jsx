import { useState } from "react";
import ConfirmModal from "./ConfirmModal";

export function useConfirm() {
  const [modal, setModal] = useState({ open: false, title: "", message: "", resolve: null });

  const confirm = (title, message) => {
    return new Promise((resolve) => {
      setModal({ open: true, title, message, resolve });
    });
  };

  const handleConfirm = () => {
    modal.resolve(true);
    setModal({ ...modal, open: false });
  };
  const handleCancel = () => {
    modal.resolve(false);
    setModal({ ...modal, open: false });
  };

  const Confirm = (
    <ConfirmModal
      open={modal.open}
      title={modal.title}
      message={modal.message}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return [confirm, Confirm];
} 