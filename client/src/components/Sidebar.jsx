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
        `flex items-center gap-3 rounded-sm px-4 py-3 text-[15px] font-medium transition ${
          isActive
            ? 'border-l-4 border-accent bg-white/12 pl-3 text-white'
            : 'border-l-4 border-transparent text-white/65 hover:bg-white/7 hover:text-white'
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
    <div className="flex h-full flex-col bg-primary px-4 py-6">
      <div className="px-3">
        <p className="text-2xl font-bold text-white">RewardsPro</p>
        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/50">Enterprise Recognition</p>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Primary">
        {mainNav.map((item) => <NavItem key={item.to} item={item} />)}
        {filteredManagement.map((item) => <NavItem key={item.to} item={item} />)}

        {showAdminSection ? (
          <>
            <p className="mb-2 mt-6 px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
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
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-4 py-3 text-[15px] font-semibold text-white shadow-soft transition hover:bg-[#f6920d]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Send Appreciation
        </button>
        <NavLink
          to="/profile"
          className="flex items-center gap-3 px-4 py-2 text-[13px] text-white/50 transition hover:text-white/80"
        >
          <Settings className="h-4 w-4" aria-hidden="true" />
          Settings
        </NavLink>
        <button
          type="button"
          onClick={() => { logout(); navigate('/login', { replace: true }); }}
          className="flex w-full items-center gap-3 px-4 py-2 text-[13px] text-white/50 transition hover:text-white/80"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-[220px] shrink-0 lg:block">{sidebar}</aside>

      {open ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
          <div className="relative w-[260px] shadow-lg">{sidebar}</div>
        </div>
      ) : null}
    </>
  );
}

export default Sidebar;
