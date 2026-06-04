import React from "react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  children?: React.ReactNode;
};

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  children,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box bg-[#12151a] text-white border border-white/10 max-w-md">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="py-3 text-sm text-white/80">{message}</p>
        {children ? <div className="py-2">{children}</div> : null}
        <div className="modal-action">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onConfirm} disabled={loading}>
            {loading ? "Saving…" : confirmLabel}
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onCancel} disabled={loading}>
          close
        </button>
      </form>
    </dialog>
  );
}
