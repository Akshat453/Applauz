import { CircleHelp, Menu, Search, Star } from 'lucide-react';
import { useSelector } from 'react-redux';
import NotificationBell from './NotificationBell';
import { formatPoints, initials } from '../utils/formatters';

function TopBar({ onMenuToggle, searchPlaceholder }) {
  const user = useSelector((state) => state.auth.user);
  const pointsBalance = useSelector((state) => state.points.balance);

  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/75 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-[1280px] items-center gap-4">
        <button
          type="button"
          className="rounded-sm p-2 text-ink/60 transition hover:bg-surface lg:hidden"
          onClick={onMenuToggle}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden max-w-xl flex-1 items-center gap-2 rounded-full border border-white/70 bg-white px-4 py-2 shadow-soft md:flex">
          <Search className="h-4 w-4 text-ink/35" aria-hidden="true" />
          <span className="text-sm text-ink/40">{searchPlaceholder || 'Search recognitions...'}</span>
        </div>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {user ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-2">
              <Star className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="font-monoPoints text-xs font-semibold text-accent md:text-sm">
                {formatPoints(pointsBalance)} pts
              </span>
            </div>
          ) : null}
          <NotificationBell />
          <button type="button" className="rounded-full p-2 text-ink/55 transition hover:bg-surface" aria-label="Help">
            <CircleHelp className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 border-l border-line/60 pl-3">
            <div className="hidden text-right md:block">
              <p className="text-sm font-semibold text-ink">{user?.name || 'Guest User'}</p>
              <p className="text-[11px] uppercase tracking-[0.1em] text-ink/40">{user?.roleName || 'Employee'}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials(user?.name)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
