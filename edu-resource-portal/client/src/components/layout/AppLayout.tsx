import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuthStore } from '../../store/authStore';

function useBreakpoint() {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return {
    isMobile:  width < 768,
    isTablet:  width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}

export function AppLayout() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated());
  const { isMobile, isTablet } = useBreakpoint();

  // Desktop: expanded; Tablet: collapsed; Mobile: uses drawer
  const [collapsed, setCollapsed]       = useState(isTablet);
  const [drawerOpen, setDrawerOpen]     = useState(false);

  // Sync collapse state when breakpoint changes
  useEffect(() => {
    if (isMobile) {
      setCollapsed(false);   // sidebar is a full drawer on mobile — collapse state irrelevant
      setDrawerOpen(false);
    } else if (isTablet) {
      setCollapsed(true);
    } else {
      setCollapsed(false);
    }
  }, [isMobile, isTablet]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleToggle = () => {
    if (isMobile) setDrawerOpen(o => !o);
    else          setCollapsed(c => !c);
  };

  return (
    <div className="h-screen flex bg-slate-50 overflow-hidden">
      {/* Mobile backdrop */}
      {isMobile && drawerOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on larger screens */}
      <div
        className={[
          isMobile
            ? `fixed inset-y-0 left-0 z-30 transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'relative flex-shrink-0',
        ].join(' ')}
      >
        <Sidebar
          collapsed={!isMobile && collapsed}
          isMobile={isMobile}
          onToggleCollapse={() => setCollapsed(c => !c)}
          onClose={() => setDrawerOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar
          onToggleSidebar={handleToggle}
          collapsed={isMobile ? !drawerOpen : collapsed}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
