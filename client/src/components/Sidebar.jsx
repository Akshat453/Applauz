import {
  AlignJustify, BarChart3, ClipboardCheck, Gift, LayoutGrid,
  LogOut, Plus, RotateCcw, Settings, Sparkles, User,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const mainNav = [
  { to: '/recognitions', label: 'Recognition Feed', icon: AlignJustify },
  { to: '/rewards', label: 'Rewards Catalog', icon: Gift },
  { to: '/redemptions', label: 'My Redemptions', icon: RotateCcw },
];

const managementNav = [
  { to: '/recognitions/review', label: 'Manager Review', icon: ClipboardCheck, roles: ['Manager', 'HR'] },
];

const adminNav = [
  { to: '/admin/catalog', label: 'HR Catalog', icon: LayoutGrid, roles: ['HR'] },
  { to: '/admin/redemptions', label: 'HR Redemptions', icon: Sparkles, roles: ['HR'] },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3, roles: ['HR'] },
];

const bottomNav = [
  { to: '/profile', label: 'Profile', icon: User },
];

function NavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition ${
          isActive
            ? 'bg-white text-primary shadow-soft'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      <span>{item.label}</span>
    </NavLink>
  );
}

function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const role = user?.roleName;

  const filteredManagement = managementNav.filter((i) => !i.roles || i.roles.includes(role));
  const filteredAdmin = adminNav.filter((i) => !i.roles || i.roles.includes(role));
  const showAdminSection = filteredAdmin.length > 0;

  const sidebar = (
    <div className="flex h-full flex-col bg-primary px-4 py-5">
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 shadow-inset">
        <p className="text-[26px] font-semibold text-white">RewardsPro</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-white/55">Recognition workspace</p>
        <div className="mt-4 rounded-lg bg-white/10 px-3 py-3">
          <p className="text-sm font-semibold text-white">{user?.name || 'Guest User'}</p>
          <p className="mt-1 text-xs text-white/60">{role || 'Employee'}</p>
        </div>
      </div>

      <nav className="mt-6 flex flex-1 flex-col gap-1" aria-label="Primary">
        {mainNav.map((item) => <NavItem key={item.to} item={item} />)}
        {filteredManagement.map((item) => <NavItem key={item.to} item={item} />)}

        {showAdminSection ? (
          <>
            <p className="mb-2 mt-6 px-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
              HR Controls
            </p>
            {filteredAdmin.map((item) => <NavItem key={item.to} item={item} />)}
          </>
        ) : null}

        {bottomNav.map((item) => <NavItem key={item.to} item={item} />)}
      </nav>

      <div className="space-y-2 pt-4">
        <button
          type="button"
          onClick={() => { navigate('/recognitions/send'); onClose?.(); }}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-sm bg-accent px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-[#f6920d]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Send Appreciation
        </button>
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <NavLink
            to="/profile"
            className="flex items-center gap-3 rounded-sm px-3 py-2 text-[13px] text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </NavLink>
          <button
            type="button"
            onClick={() => { logout(); navigate('/login', { replace: true }); }}
            className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-[13px] text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
          <div className="relative h-full w-[280px] shadow-lg">{sidebar}</div>
        </div>
      ) : null}
    </>
  );
}

export default Sidebar;
