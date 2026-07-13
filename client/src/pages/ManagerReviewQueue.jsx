import { Check, CircleDollarSign, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import FormInput from '../components/FormInput';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { formatDate, formatPoints, formatRelativeTime, initials } from '../utils/formatters';

function ManagerReviewQueueContent() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loadingState, setLoadingState] = useState('loading');
  const [submittingId, setSubmittingId] = useState(null);
  const [pointsById, setPointsById] = useState({});
  const [reasonById, setReasonById] = useState({});
  const [rejectOpenId, setRejectOpenId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const loadQueue = async () => {
      try {
        const response = await axiosClient.get('/recognitions/pending-review');
        if (!mounted) return;
        setItems(response.data.items);
        setBudget(response.data.budget);
        setLoadingState('success');
      } catch {
        if (!mounted) return;
        setLoadingState('error');
      }
    };
    loadQueue();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setPointsById(Object.fromEntries(items.map((item) => [item.id, item.points_recommended ? String(item.points_recommended) : '100'])));
  }, [items]);

  const budgetSummary = useMemo(() => {
    if (!budget) return null;
    const utilization = budget.allocatedPoints ? Math.min(100, Math.round((budget.usedPoints / budget.allocatedPoints) * 100)) : 0;
    return { ...budget, utilization };
  }, [budget]);

  const updateQueue = (recognitionId) => {
    setItems((current) => current.filter((item) => item.id !== recognitionId));
  };

  const approve = async (id) => {
    setSubmittingId(id);
    try {
      const pointsAwarded = Number(pointsById[id]);
      await axiosClient.patch(`/recognitions/${id}/approve`, { pointsAwarded });
      updateQueue(id);
      if (budgetSummary && user.roleName === 'Manager') {
        setBudget((current) => ({ ...current, usedPoints: current.usedPoints + pointsAwarded, remainingPoints: current.remainingPoints - pointsAwarded }));
      }
      toast.success('Recognition approved successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to approve this recognition right now.');
    } finally {
      setSubmittingId(null);
    }
  };

  const reject = async (id) => {
    setSubmittingId(id);
    try {
      await axiosClient.patch(`/recognitions/${id}/reject`, { rejectionReason: reasonById[id] });
      updateQueue(id);
      setRejectOpenId(null);
      toast.success('Recognition rejected successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to reject this recognition right now.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <AppLayout title="Manager Review" description="Review pending appreciation requests before any points are awarded." searchPlaceholder="Search reviews...">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          {loadingState === 'loading' ? Array.from({ length: 3 }, (_, index) => <LoadingSkeleton key={index} className="h-56 w-full" />) : null}
          {loadingState === 'error' ? <Card className="p-6 text-center text-sm text-ink/60">We couldn't load the review queue right now.</Card> : null}
          {loadingState === 'success' && items.length === 0 ? <EmptyState title="No pending recognitions" description="Your queue is clear for now. New appreciation requests will show up here for review." /> : null}
          {loadingState === 'success' && items.length > 0 ? items.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{initials(item.receiver.name)}</div>
                  <div className="space-y-3 min-w-0">
                    <div>
                      <p className="text-lg font-semibold text-ink">Recognition for {item.receiver.name}</p>
                      <p className="mt-0.5 text-xs text-ink/50">Nominated by {item.sender.name} • {formatRelativeTime(item.created_at)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.category ? <Badge tone="accent">{item.category.name}</Badge> : null}
                      <Badge tone="warning">Pending</Badge>
                      <span className="text-xs text-ink/45">{item.receiver.department?.name || 'No department'}</span>
                    </div>
                    <div className="rounded-lg border-l-4 border-accent bg-mist p-4 text-sm leading-6 text-ink/80 italic">&ldquo;{item.message}&rdquo;</div>
                  </div>
                </div>
                <div className="min-w-[200px] space-y-3">
                  <div className="rounded-lg bg-accent/10 px-4 py-3 text-right">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">Review Award</p>
                    <p className="mt-1 font-monoPoints text-2xl font-semibold text-[#a86400]">{formatPoints(pointsById[item.id] || 0)} pts</p>
                  </div>
                  <FormInput id={`points-${item.id}`} label="Points to award" type="number" min="1" value={pointsById[item.id] ?? ''} onChange={(event) => setPointsById((current) => ({ ...current, [item.id]: event.target.value }))} />
                  <div className="flex flex-wrap gap-2">
                    <Button variant="danger" className="flex-1" icon={X} type="button" size="sm" onClick={() => setRejectOpenId((current) => current === item.id ? null : item.id)}>Reject</Button>
                    <Button variant="success" className="flex-1" icon={Check} type="button" size="sm" loading={submittingId === item.id} disabled={!pointsById[item.id]} onClick={() => approve(item.id)}>Approve</Button>
                  </div>
                  {rejectOpenId === item.id ? (
                    <div className="space-y-2 rounded-lg border border-line bg-surface p-3">
                      <FormInput id={`reason-${item.id}`} label="Rejection reason" value={reasonById[item.id] ?? ''} onChange={(event) => setReasonById((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Share what needs to change" />
                      <Button variant="secondary" className="w-full" type="button" size="sm" disabled={!reasonById[item.id]?.trim() || submittingId === item.id} onClick={() => reject(item.id)}>Confirm Rejection</Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </Card>
          )) : null}
        </div>
        <div className="space-y-4">
          {user.roleName === 'Manager' && budgetSummary ? (
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">Monthly Budget</p>
              <p className="mt-2 font-monoPoints text-2xl font-semibold text-primary">{formatPoints(budgetSummary.remainingPoints)} / {formatPoints(budgetSummary.allocatedPoints)} pts</p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-mist">
                <div className="h-full rounded-full bg-accent" style={{ width: `${budgetSummary.utilization}%` }} />
              </div>
              <p className="mt-2 text-xs text-ink/55">{budgetSummary.utilization}% utilized. Period: {formatDate(budgetSummary.periodStart)} to {formatDate(budgetSummary.periodEnd)}.</p>
            </Card>
          ) : null}
          {user.roleName === 'HR' ? (
            <Card className="bg-primary p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Review Scope</p>
              <p className="mt-3 text-base leading-7">Company-wide review access is enabled for HR. Budget enforcement does not apply to HR approvals.</p>
            </Card>
          ) : null}
          <Card className="p-5">
            <div className="flex items-center gap-2 text-primary">
              <CircleDollarSign className="h-4 w-4" />
              <h2 className="text-base font-semibold">Queue Summary</h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-ink/40">Pending</p>
                <p className="mt-1 font-monoPoints text-2xl font-semibold text-primary">{items.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-ink/40">Reviewer</p>
                <p className="mt-1 text-base font-semibold text-ink">{user.roleName}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function ManagerReviewQueue() {
  return (
    <ProtectedRoute roles={['Manager', 'HR']}>
      <ManagerReviewQueueContent />
    </ProtectedRoute>
  );
}

export default ManagerReviewQueue;
