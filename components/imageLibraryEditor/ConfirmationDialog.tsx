import React from 'react';

interface ConfirmationDialogProps {
  onExitWithoutUpdating: () => void;
  onConfirmUpdateAndExit: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ onExitWithoutUpdating, onConfirmUpdateAndExit }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-xl font-bold text-yellow-300 mb-4">Xác nhận</h3>
        <p className="text-slate-300 mb-6">Bạn chưa cập nhật các thay đổi vào Thiên Thư. Bạn có muốn cập nhật trước khi thoát không?</p>
        <div className="flex justify-end gap-4">
          <button onClick={onExitWithoutUpdating} className="px-4 py-2 font-bold text-base rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition-colors">Không</button>
          <button onClick={onConfirmUpdateAndExit} className="px-4 py-2 font-bold text-base rounded-lg bg-yellow-500 hover:bg-yellow-600 text-slate-900 transition-colors">Cập nhật</button>
        </div>
      </div>
    </div>
  );
};
