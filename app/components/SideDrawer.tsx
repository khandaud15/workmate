import React from 'react';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  className?: string;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose, children, width = '500px', className = '' }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"
          onClick={onClose}
          aria-label="Close side drawer overlay"
        />
      )}
      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full z-50 bg-[#18171c] shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${className}`}
        style={{ width, minWidth: width, maxWidth: '90vw' }}
        aria-modal="true"
        role="dialog"
      >
        <button
          className="absolute top-4 right-4 text-gray-300 hover:text-white text-2xl focus:outline-none"
          onClick={onClose}
          aria-label="Close side drawer"
        >
          &times;
        </button>
        <div className="h-full overflow-y-auto p-6 pt-14">{children}</div>
      </div>
    </>
  );
};

export default SideDrawer;
