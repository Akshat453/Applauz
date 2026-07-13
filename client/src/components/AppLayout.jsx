import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

function AppLayout({ title, description, eyebrow, actions, children, searchPlaceholder }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-ink">
      <div className="flex min-h-screen">
        <Sidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col">
          <TopBar
            onMenuToggle={() => setMobileMenuOpen((v) => !v)}
            searchPlaceholder={searchPlaceholder}
          />
          <main className="flex-1 px-4 pb-8 pt-6 md:px-8 md:pb-10 md:pt-8">
            <div className="mx-auto max-w-[1280px] space-y-6">
              <header className="rounded-xl border border-white/70 bg-white/70 px-5 py-5 shadow-panel backdrop-blur md:px-7 md:py-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                  <div className="space-y-2">
                    {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/55">{eyebrow}</p> : null}
                    <h1 className="text-[28px] font-semibold tracking-tight text-ink md:text-[34px]">{title}</h1>
                    {description ? <p className="max-w-3xl text-sm leading-7 text-ink/60 md:text-[15px]">{description}</p> : null}
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
