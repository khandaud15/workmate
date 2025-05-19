'use client';

import { signOut } from 'next-auth/react';
import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUser, FaCog, FaSignOutAlt, FaTimes } from 'react-icons/fa';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  position: {
    top: number;
    left: number;
    width: number;
  };
}

export default function ProfileDropdown({ isOpen, onClose, user, position }: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl overflow-hidden w-64 border border-gray-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left + position.width + 16}px`,
      }}
    >
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900">My Account</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close"
          >
            <FaTimes size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={user.image || '/default-avatar.png'}
              alt={user.name || 'User'}
            />
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{user.email || 'No email provided'}</p>
          </div>
        </div>
      </div>

      <div className="py-1">
        <button
          onClick={() => {
            router.push('/profile');
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
        >
          <FaUser className="text-gray-400" />
          <span>View Profile</span>
        </button>
        <button
          onClick={() => {
            router.push('/settings');
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
        >
          <FaCog className="text-gray-400" />
          <span>Settings</span>
        </button>
      </div>

      <div className="py-1 border-t border-gray-100">
        <button
          onClick={() => {
            signOut({ callbackUrl: '/' });
            onClose();
          }}
          className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
        >
          <FaSignOutAlt className="text-red-400" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
}
