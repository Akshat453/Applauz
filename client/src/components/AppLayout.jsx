import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

function AppLayout({ title, description, eyebrow, actions, children, searchPlaceholder }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-page text-ink">
      <div className="flex min-h-screen">
        <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar
            onMenuToggle={() => setMobileMenuOpen((v) => !v)}
            searchPlaceholder={searchPlaceholder}
          />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto max-w-6xl space-y-6">
              <header className="space-y-2">
                {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/50">{eyebrow}</p> : null}
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">{title}</h1>
                    {description ? <p className="max-w-2xl text-sm leading-6 text-ink/60">{description}</p> : null}
                  </div>
                  {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
                </div>
              </header>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
