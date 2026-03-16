import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../common/Badge';

interface TopbarProps {
  onToggleSidebar: () => void;
  collapsed:       boolean;
}

export function Topbar({ onToggleSidebar, collapsed }: TopbarProps) {
  const user = useAuthStore(s => s.user);
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
      <header className="h-16 flex-shrink-0 z-10 bg-white border-b border-slate-200 flex items-center px-3 sm:px-5 gap-3">
      {/* Hamburger — visible on all sizes; on desktop it triggers sidebar collapse */}
      <button
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors flex-shrink-0"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Spacer */}
      <div className="flex-1 min-w-0" />

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Badge variant="indigo" className="hidden xs:inline-flex">
          {import.meta.env.VITE_APP_STATE_LABEL as string}
        </Badge>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(m => !m)}
            className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-sm font-bold uppercase flex-shrink-0 shadow-sm">
              {user?.userId?.[0] ?? 'U'}
            </div>
            {/* Name + role — hidden on very small screens */}
            <div className="text-left hidden sm:block">
              <p className="text-[0.95rem] font-semibold text-slate-800 leading-none">{user?.userId}</p>
              <p className="text-[0.8rem] font-medium text-slate-500 uppercase tracking-wider mt-0.5">{user?.role?.toLowerCase()}</p>
            </div>
            <svg className="h-5 w-5 text-slate-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-36 animate-slide-down">
                <button
                  onClick={() => { logout(undefined); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[0.95rem] text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
