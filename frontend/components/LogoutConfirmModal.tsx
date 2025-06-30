import React from 'react';

interface LogoutConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({ open, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/40 animate-fadeIn">
      <div className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-2xl p-8 w-full max-w-sm transform transition-all scale-100 animate-slideUp relative">
        <div className="flex flex-col items-center">
          <div className="mb-4 animate-bounceIn">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="28,6 54,50 2,50" fill="#FEF3C7" stroke="#FACC15" strokeWidth="3" />
              <text x="28" y="40" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#F59E1B" fontFamily="Arial">!</text>
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2 text-gray-800 text-center">Are you sure you want to logout?</h2>
          <p className="text-gray-500 text-center mb-6">You will need to log in again to access your account.</p>
          <div className="flex justify-center gap-4 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold border border-gray-200 shadow-sm transition-all duration-150 hover:bg-gray-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white font-semibold shadow transition-all duration-150 hover:bg-red-600 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-red-300"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes slideUp {
          0% { transform: translateY(40px) scale(0.97); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-slideUp {
          animation: slideUp 0.32s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes bounceIn {
          0% { transform: scale(0.7); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); }
        }
        .animate-bounceIn {
          animation: bounceIn 0.4s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

export default LogoutConfirmModal; 