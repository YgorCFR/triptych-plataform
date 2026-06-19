import React from 'react';

interface SpinnerModalProps {
  isOpen: boolean;
}

const SpinnerModal: React.FC<SpinnerModalProps> = ({ isOpen }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-lg flex items-center">
          <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-12 h-12 animate-spin"></div>
          <span className="ml-4 text-gray-700">Processing...</span>
        </div>
      </div>
    );
};

export default SpinnerModal;
