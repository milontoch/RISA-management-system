import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";

export function useConfirm() {
  const [modal, setModal] = useState({ visible: false, title: "", message: "", resolve: null });

  const confirm = (title, message) => {
    return new Promise((resolve) => {
      setModal({ visible: true, title, message, resolve });
    });
  };

  const handleConfirm = () => {
    modal.resolve(true);
    setModal({ ...modal, visible: false });
  };
  const handleCancel = () => {
    modal.resolve(false);
    setModal({ ...modal, visible: false });
  };

  const Confirm = (
    <ConfirmModal
      visible={modal.visible}
      title={modal.title}
      message={modal.message}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return [confirm, Confirm];
} 