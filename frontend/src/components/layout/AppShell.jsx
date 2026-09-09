import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNavigation } from './MobileNavigation';
import { Footer } from './Footer';
import { ChatWidget } from '../chat/ChatWidget';

export function AppShell({ children, pageTitle = 'Dashboard' }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Desktop Sidebar */}
      <div className="desktop-only">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      <MobileNavigation isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Main Content Body Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        <TopBar onOpenMobileNav={() => setMobileNavOpen(true)} pageTitle={pageTitle} />
        
        <main
          style={{
            flex: 1,
            padding: 'var(--page-padding)',
            maxWidth: 'var(--content-max-width)',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>

        {/* Site-Wide Footer */}
        <Footer />
      </div>

      {/* Floating AI Chat Assistant */}
      <ChatWidget />
    </div>
  );
}
