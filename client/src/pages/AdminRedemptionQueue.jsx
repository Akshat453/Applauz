import { Check, Clock3, RefreshCw, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import FormInput from '../components/FormInput';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { syncAuthenticatedProfile } from '../utils/profileSync';
import { formatDate, formatPoints, initials } from '../utils/formatters';

function AdminRedemptionQueue() {
  const dispatch = useDispatch();
  const [items, setItems] = useState([]);
  const [loadingState, setLoadingState] = useState('loading');
  const [submittingId, setSubmittingId] = useState(null);
  const [rejectOpenId, setRejectOpenId] = useState(null);
  const [reasonById, setReasonById] = useState({});

  const loadQueue = async () => {
    const response = await axiosClient.get('/redemptions', {
      params: { status: 'pending' },
    });
    setItems(response.data.items);
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const response = await axiosClient.get('/redemptions', {
          params: { status: 'pending' },
        });
        if (!mounted) return;
        setItems(response.data.items);
        setLoadingState('success');
      } catch {
        if (!mounted) return;
        setLoadingState('error');
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => ({
    pending: items.length,
    pointsInQueue: items.reduce((total, item) => total + item.points_spent, 0),
  }), [items]);

  const handleApprove = async (redemptionId) => {
    setSubmittingId(redemptionId);
    try {
      await axiosClient.patch(`/redemptions/${redemptionId}/approve`);
      await Promise.all([
        loadQueue(),
        syncAuthenticatedProfile(dispatch),
      ]);
      toast.success('Redemption approved successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to approve this redemption.');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (redemptionId) => {
    setSubmittingId(redemptionId);
    try {
      await axiosClient.patch(`/redemptions/${redemptionId}/reject`, {
        rejectionReason: reasonById[redemptionId],
      });
      await Promise.all([
        loadQueue(),
        syncAuthenticatedProfile(dispatch),
      ]);
      setRejectOpenId(null);
      setReasonById((current) => ({ ...current, [redemptionId]: '' }));
      toast.success('Redemption rejected and refunded successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to reject this redemption.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <AppLayout
      title="HR Redemption Queue"
      description="Review and process pending reward redemption requests across the company."
      searchPlaceholder="Search redemption queue..."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary">
            <Clock3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-ink/45">Pending Requests</p>
            <p className="font-monoPoints text-2xl font-semibold text-ink">{summary.pending}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent/12 text-accent">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-ink/45">Points In Queue</p>
            <p className="font-monoPoints text-2xl font-semibold text-ink">{formatPoints(summary.pointsInQueue)}</p>
          </div>
        </Card>
      </div>

      {loadingState === 'loading' ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, index) => (
            <LoadingSkeleton key={index} className="h-56 w-full" />
          ))}
        </div>
      ) : null}

      {loadingState === 'error' ? (
        <EmptyState
          title="Queue unavailable"
          description="We couldn't load the pending redemption queue right now. Please refresh and try again."
          actionLabel="Reload queue"
          onAction={() => window.location.reload()}
        />
      ) : null}

      {loadingState === 'success' && items.length === 0 ? (
        <EmptyState
          title="No pending redemption requests"
          description="The HR queue is currently clear. New redemption requests will appear here for review."
        />
      ) : null}

      {loadingState === 'success' && items.length > 0 ? (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {initials(item.user.name)}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-lg font-semibold text-ink">{item.user.name}</p>
                      <p className="mt-1 text-xs text-ink/50">
                        {item.user.department?.name || 'No department'} • Requested {formatDate(item.requested_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="warning">pending</Badge>
                      <Badge tone="default">{item.reward.category.replaceAll('_', ' ')}</Badge>
                    </div>
                    <div className="rounded-lg bg-surface p-4">
                      <p className="text-sm font-semibold text-ink">{item.reward.title}</p>
                      <p className="mt-1 text-sm text-ink/60">
                        {item.reward.description || 'No description available for this reward.'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="min-w-[220px] space-y-3">
                  <div className="rounded-lg bg-accent/10 px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Points spent</p>
                    <p className="mt-1 font-monoPoints text-2xl font-semibold text-[#a86400]">
                      {formatPoints(item.points_spent)} pts
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="danger"
                      className="flex-1"
                      icon={X}
                      size="sm"
                      type="button"
                      disabled={submittingId === item.id}
                      onClick={() => setRejectOpenId((current) => current === item.id ? null : item.id)}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="success"
                      className="flex-1"
                      icon={Check}
                      size="sm"
                      type="button"
                      loading={submittingId === item.id}
                      onClick={() => handleApprove(item.id)}
                    >
                      Approve
                    </Button>
                  </div>
                  {rejectOpenId === item.id ? (
                    <div className="space-y-3 rounded-lg border border-line bg-surface p-3">
                      <FormInput
                        id={`reject-reason-${item.id}`}
                        label="Rejection reason"
                        value={reasonById[item.id] ?? ''}
                        onChange={(event) => setReasonById((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))}
                        placeholder="Explain why this request is being rejected"
                      />
                      <Button
                        variant="secondary"
                        className="w-full"
                        size="sm"
                        type="button"
                        disabled={!reasonById[item.id]?.trim() || submittingId === item.id}
                        onClick={() => handleReject(item.id)}
                      >
                        Confirm rejection
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </AppLayout>
  );
}

export default AdminRedemptionQueue;
