import { Clock3, Gift, History } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import axiosClient from '../api/axiosClient';
import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatDate, formatPoints } from '../utils/formatters';

const STATUS_TONES = {
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

function MyRedemptions() {
  const [items, setItems] = useState([]);
  const [loadingState, setLoadingState] = useState('loading');

  useEffect(() => {
    let mounted = true;

    const loadRedemptions = async () => {
      try {
        const response = await axiosClient.get('/redemptions');
        if (!mounted) return;
        setItems(response.data.items);
        setLoadingState('success');
      } catch {
        if (!mounted) return;
        setLoadingState('error');
      }
    };

    loadRedemptions();
    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    return {
      total: items.length,
      pending: items.filter((item) => item.status === 'pending').length,
      pointsSpent: items.reduce((total, item) => total + item.points_spent, 0),
    };
  }, [items]);

  return (
    <AppLayout
      title="My Redemptions"
      description="Track your reward redemption requests and their current status."
      eyebrow="Rewards activity"
      searchPlaceholder="Search your redemptions..."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-primary/10 text-primary">
            <History className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink/45">Total Requests</p>
            <p className="font-monoPoints text-2xl font-semibold text-ink">{summary.total}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-accent/12 text-accent">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink/45">Pending Approval</p>
            <p className="font-monoPoints text-2xl font-semibold text-ink">{summary.pending}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-success/10 text-success">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-ink/45">Points Requested</p>
            <p className="font-monoPoints text-2xl font-semibold text-ink">{formatPoints(summary.pointsSpent)}</p>
          </div>
        </Card>
      </div>

      {loadingState === 'loading' ? (
        <LoadingSkeleton className="h-[420px] w-full" />
      ) : null}

      {loadingState === 'error' ? (
        <EmptyState
          title="We couldn't load your redemptions"
          description="Your redemption history is temporarily unavailable. Please refresh and try again."
          actionLabel="Reload history"
          onAction={() => window.location.reload()}
        />
      ) : null}

      {loadingState === 'success' && items.length === 0 ? (
        <EmptyState
          title="No redemptions yet"
          description="Browse the rewards catalog and submit your first redemption request."
          actionLabel="Open rewards catalog"
          onAction={() => window.location.assign('/rewards')}
        />
      ) : null}

      {loadingState === 'success' && items.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-surfaceAlt text-[11px] uppercase tracking-[0.12em] text-ink/50">
                <tr>
                  <th className="px-5 py-4 font-semibold">Reward</th>
                  <th className="px-5 py-4 font-semibold">Points</th>
                  <th className="px-5 py-4 font-semibold">Requested</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-line/50 text-sm">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-ink">{item.reward.title}</p>
                        <p className="mt-1 text-xs text-ink/50">{item.reward.category.replaceAll('_', ' ')}</p>
                        {item.rejection_reason ? (
                          <p className="mt-2 text-xs text-danger">Reason: {item.rejection_reason}</p>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-monoPoints text-sm font-semibold text-accent">
                      {formatPoints(item.points_spent)}
                    </td>
                    <td className="px-5 py-4 text-ink/60">{formatDate(item.requested_at)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={STATUS_TONES[item.status] || 'default'}>
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </AppLayout>
  );
}

export default MyRedemptions;
