import { Bell, CircleHelp, Menu, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { initials } from '../utils/formatters';

function TopBar({ onMenuToggle, searchPlaceholder }) {
  const user = useSelector((state) => state.auth.user);
  const unreadCount = useSelector((state) => state.notifications.unreadCount);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line/60 bg-white/95 px-4 backdrop-blur md:px-6">
      {/* Mobile hamburger */}
      <button
        type="button"
        className="rounded-sm p-2 text-ink/60 transition hover:bg-surface lg:hidden"
        onClick={onMenuToggle}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Search */}
      <div className="hidden max-w-md flex-1 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 md:flex">
        <Search className="h-4 w-4 text-ink/35" aria-hidden="true" />
        <span className="text-sm text-ink/40">{searchPlaceholder || 'Search recognitions...'}</span>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2 md:gap-4">
        <button type="button" className="relative rounded-full p-2 text-ink/55 transition hover:bg-surface" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">{unreadCount}</span>
          ) : null}
        </button>
        <button type="button" className="rounded-full p-2 text-ink/55 transition hover:bg-surface" aria-label="Help">
          <CircleHelp className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3 border-l border-line/70 pl-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-semibold text-ink">{user?.name || 'Guest User'}</p>
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink/40">{user?.roleName || 'Employee'}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials(user?.name)}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
