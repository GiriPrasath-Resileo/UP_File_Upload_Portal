import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  to?:    string;
  href?:  string;
  label:  string;
  icon:   React.ReactNode;
  admin?: boolean;
}

const iconClass = 'h-6 w-6 flex-shrink-0';
const iconProps = { strokeWidth: 2.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

const NAV_ITEMS: NavItem[] = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...iconProps}>
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    to: '/schools',
    label: 'School Master',
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...iconProps}>
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    admin: true,
  },
  {
    to: '/users',
    label: 'Manage Users',
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...iconProps}>
        <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    admin: true,
  },
  {
    to: '/about',
    label: 'About',
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...iconProps}>
        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    admin: false,
  },
  {
    to: '/architecture',
    label: 'Architecture',
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...iconProps}>
        <path d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
      </svg>
    ),
    admin: false,
  },
  {
    to: '/coverage',
    label: 'Coverage',
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...iconProps}>
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    admin: true,
  },
  {
    href: `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') ?? 'http://localhost:5000'}/api-docs`,
    label: 'API Docs',
    icon: (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" {...iconProps}>
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    admin: true,
  },
];

interface SidebarProps {
  collapsed:         boolean;
  isMobile:          boolean;
  onToggleCollapse:  () => void;
  onClose:           () => void;
}

export function Sidebar({ collapsed, isMobile, onToggleCollapse, onClose }: SidebarProps) {
  const isAdmin = useAuthStore(s => s.isAdmin());

  const navLinkClass = (isActive: boolean, col: boolean) =>
    clsx(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.95rem] font-medium transition-all duration-150',
      col && 'justify-center px-2',
      isActive
        ? 'bg-indigo-50 text-indigo-700 font-semibold [&_svg]:text-indigo-600'
        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 [&_svg]:text-slate-600'
    );

  const externalLinkClass = (col: boolean) =>
    clsx(
      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[0.95rem] font-medium transition-all duration-150',
      col && 'justify-center px-2',
      'text-slate-700 hover:bg-slate-100 hover:text-slate-900 [&_svg]:text-slate-600'
    );

  const visibleItems = NAV_ITEMS.filter(item => !item.admin || isAdmin);
  // Separate main items from the footer items (About and API Docs are the last ones)
  const mainItems   = visibleItems.filter(item => item.to !== '/about' && !item.href);
  const footerItems = visibleItems.filter(item => item.to === '/about' || item.href);

  return (
    <aside
      className={clsx(
        'group/sidebar h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Header: logo + collapse toggle */}
      <div
        className={clsx(
          'relative flex items-center border-b border-slate-100 flex-shrink-0',
          collapsed ? 'justify-center px-0 py-5' : 'px-4 py-5 gap-3'
        )}
      >
        {/* Logo icon */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>

        {/* App name (hidden when collapsed) */}
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-[1rem] font-bold text-slate-900 leading-none truncate">EduResource</p>
            <p className="text-[0.8rem] text-slate-500 mt-0.5 truncate">{import.meta.env.VITE_APP_STATE_LABEL}</p>
          </div>
        )}

        {/* Collapse / close button */}
        {isMobile ? (
          /* Mobile: X close button */
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors ml-auto"
            aria-label="Close sidebar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          /* Desktop/tablet: chevron toggle */
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={clsx(
              'p-1.5 rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150',
              'opacity-0 group-hover/sidebar:opacity-100',
              collapsed
                ? 'absolute right-1 top-1/2 -translate-y-1/2'
                : 'ml-auto flex-shrink-0'
            )}
          >
            <svg
              className={clsx('h-5 w-5 transition-transform duration-300 text-slate-600', collapsed ? 'rotate-0' : 'rotate-180')}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5 px-2">
          {mainItems.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to!}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) => navLinkClass(isActive, collapsed)}
              >
                {item.icon}
                {!collapsed && (
                  <span className="truncate transition-opacity duration-200">{item.label}</span>
                )}
              </NavLink>
            </li>
          ))}

          {footerItems.length > 0 && (
            <li>
              <hr className="mx-2 my-1 border-slate-100" />
            </li>
          )}

          {footerItems.map(item => (
            <li key={item.to ?? item.href}>
              {item.href ? (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={collapsed ? item.label : undefined}
                  className={externalLinkClass(collapsed)}
                >
                  {item.icon}
                  {!collapsed && (
                    <span className="truncate transition-opacity duration-200">{item.label}</span>
                  )}
                </a>
              ) : (
                <NavLink
                  to={item.to!}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => navLinkClass(isActive, collapsed)}
                >
                  {item.icon}
                  {!collapsed && (
                    <span className="truncate transition-opacity duration-200">{item.label}</span>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <p className="text-[0.8rem] text-slate-500 text-center">
            © {new Date().getFullYear()} EduResource Portal
          </p>
        </div>
      )}
    </aside>
  );
}
