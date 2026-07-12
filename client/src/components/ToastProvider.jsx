import { Toaster } from 'react-hot-toast';

function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          borderRadius: '12px',
          border: '1px solid rgba(33,94,97,0.12)',
          padding: '12px 16px',
        },
      }}
    />
  );
}

export default ToastProvider;
