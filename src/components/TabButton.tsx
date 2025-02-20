import { ReactNode } from 'react';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function TabButton({ isActive, onClick, children }: TabButtonProps) {
  return (
    <button
      className={`px-4 py-2 flex items-center space-x-2 ${isActive ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}