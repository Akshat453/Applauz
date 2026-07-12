import Button from './Button';

function Modal({ isOpen, title, children, onClose, actions }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-panel">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold text-ink">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
        <div className="space-y-4 text-sm text-ink/70">{children}</div>
        {actions ? <div className="mt-6 flex flex-wrap justify-end gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}

export default Modal;
