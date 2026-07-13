import { Bell } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../store/notificationsSlice';
import { formatRelativeTime } from '../utils/formatters';

const ROUTE_BY_ENTITY_TYPE = {
  recognition: '/recognitions',
  redemption: '/redemptions',
};

function getNotificationRoute(notification) {
  if (notification.type === 'recognition_review') {
    return '/recognitions/review';
  }

  return ROUTE_BY_ENTITY_TYPE[notification.related_entity_type] || '/dashboard';
}

function NotificationBell() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const { items, unreadCount, status } = useSelector((state) => state.notifications);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return undefined;

    dispatch(fetchNotifications());
    const intervalId = window.setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [dispatch, user]);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const visibleItems = useMemo(() => items.slice(0, 10), [items]);

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await dispatch(markNotificationRead(notification.id));
    }

    setOpen(false);
    navigate(getNotificationRoute(notification));
  };

  const handleMarkAllRead = async () => {
    await dispatch(markAllNotificationsRead());
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className="relative rounded-full p-2 text-ink/55 transition hover:bg-surface"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-white/70 bg-white/95 shadow-panel backdrop-blur">
          <div className="flex items-center justify-between border-b border-line/70 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">Notifications</p>
              <p className="text-xs text-ink/45">{unreadCount} unread</p>
            </div>
            <button
              type="button"
              className="text-xs font-semibold text-primary disabled:text-ink/30"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {status === 'loading' ? (
              <div className="px-4 py-6 text-sm text-ink/55">Loading notifications...</div>
            ) : null}
            {status !== 'loading' && visibleItems.length === 0 ? (
              <div className="px-4 py-6 text-sm text-ink/55">No notifications yet.</div>
            ) : null}
            {visibleItems.map((notification) => (
              <button
                key={notification.id}
                type="button"
                className={`flex w-full flex-col gap-1 border-b border-line/50 px-4 py-3 text-left transition hover:bg-surfaceAlt ${notification.is_read ? 'bg-white' : 'bg-primary/5'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{notification.title}</p>
                  {!notification.is_read ? (
                    <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  ) : null}
                </div>
                <p className="text-sm leading-5 text-ink/65">{notification.message}</p>
                <p className="text-xs text-ink/40">{formatRelativeTime(notification.created_at)}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;
