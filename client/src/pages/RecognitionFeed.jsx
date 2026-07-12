import { ChevronDown, MessageSquare, Plus, ThumbsUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import FormSelect from '../components/FormSelect';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PageErrorBoundary from '../components/PageErrorBoundary';
import { formatPoints, formatRelativeTime, initials } from '../utils/formatters';

/* ---------- Feature cards for empty state ---------- */
function FeatureCards() {
  const features = [
    { icon: '👥', title: 'Team Building', desc: 'Boost morale by acknowledging collective efforts.' },
    { icon: '🏅', title: 'Earn Points', desc: 'Senders and receivers can earn points for engagement.' },
    { icon: '📈', title: 'Impact Insights', desc: 'See how recognition improves overall team sentiment.' },
  ];
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {features.map((f) => (
        <div key={f.title} className="rounded-lg border border-line/60 bg-white p-5 text-left">
          <span className="text-2xl">{f.icon}</span>
          <p className="mt-3 text-sm font-semibold text-primary">{f.title}</p>
          <p className="mt-1 text-xs leading-5 text-ink/55">{f.desc}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Recognition card ---------- */
function RecognitionCard({ recognition }) {
  const approved = recognition.status === 'approved';
  return (
    <Card className="p-5 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-4">
          {/* Avatars with connector */}
          <div className="flex w-12 shrink-0 flex-col items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {initials(recognition.sender.name)}
            </div>
            <div className="my-0.5 h-4 w-0.5 bg-primary/25" />
            <ChevronDown className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            <div className="my-0.5 h-4 w-0.5 bg-primary/25" />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
              {initials(recognition.receiver.name)}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3 min-w-0">
            <div>
              <p className="text-base font-semibold text-ink">
                {recognition.sender.name} <span className="font-normal text-ink/55">recognized</span> {recognition.receiver.name}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-ink/50">
                {recognition.category ? <Badge tone="default">{recognition.category.name}</Badge> : null}
                <span>{formatRelativeTime(recognition.created_at)}</span>
              </div>
            </div>
            <p className="rounded-lg bg-surface p-4 text-sm leading-6 text-ink/80 italic">
              &ldquo;{recognition.message}&rdquo;
            </p>
            <div className="flex items-center gap-4 text-xs text-ink/55">
              <span className="inline-flex items-center gap-1"><ThumbsUp className="h-4 w-4" />12 High Fives</span>
              <span className="inline-flex items-center gap-1"><MessageSquare className="h-4 w-4" />3 Comments</span>
            </div>
          </div>
        </div>

        {/* Status + points */}
        <div className="flex flex-row items-center gap-2 md:flex-col md:items-end">
          <Badge tone={approved ? 'success' : 'warning'}>{recognition.status}</Badge>
          {approved && recognition.points_awarded != null ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 font-monoPoints text-sm font-semibold text-accent">
              ⊕ {formatPoints(recognition.points_awarded)} pts
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

/* ---------- Feed page ---------- */
function RecognitionFeed() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [departmentId, setDepartmentId] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingState, setLoadingState] = useState('loading');
  const [loadingMore, setLoadingMore] = useState(false);

  const loadRecognitions = async ({ nextPage, append, nextDepartmentId }) => {
    const activeDepartment = nextDepartmentId === 'all' ? undefined : nextDepartmentId;
    const response = await axiosClient.get('/recognitions', {
      params: { page: nextPage, limit: 20, departmentId: activeDepartment },
    });
    setItems((current) => (append ? [...current, ...response.data.items] : response.data.items));
    setPage(response.data.page);
    setTotal(response.data.total);
    const nextDepartments = Array.from(new Set(response.data.items.map((item) => item.receiver.department?.id ? `${item.receiver.department.id}::${item.receiver.department.name}` : null).filter(Boolean))).map((value) => {
      const [id, name] = value.split('::');
      return { id, name };
    });
    setDepartments((current) => {
      const merged = [...current, ...nextDepartments];
      return Array.from(new Map(merged.map((item) => [item.id, item])).values());
    });
  };

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        await loadRecognitions({ nextPage: 1, append: false, nextDepartmentId: departmentId });
        if (mounted) setLoadingState('success');
      } catch {
        if (mounted) setLoadingState('error');
      }
    };
    run();
    return () => { mounted = false; };
  }, []);

  const handleFilterChange = async (event) => {
    const nextDepartmentId = event.target.value;
    setDepartmentId(nextDepartmentId);
    setLoadingState('loading');
    try {
      await loadRecognitions({ nextPage: 1, append: false, nextDepartmentId });
      setLoadingState('success');
    } catch {
      setLoadingState('error');
    }
  };

  const hasMore = items.length < total;
  const headerActions = (
    <>
      <FormSelect id="department-filter" value={departmentId} onChange={handleFilterChange}>
        <option value="all">All Departments</option>
        {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
      </FormSelect>
      <Button variant="secondary" size="sm">Latest</Button>
    </>
  );

  const skeletons = Array.from({ length: 3 }, (_, index) => <LoadingSkeleton key={index} className="h-48 w-full" />);

  return (
    <AppLayout
      title="Recognition Feed"
      description="Celebrate the achievements of your colleagues across the organization."
      actions={headerActions}
      searchPlaceholder="Search recognitions..."
    >
      <PageErrorBoundary>
        <div className="space-y-4">
          {loadingState === 'loading' ? skeletons : null}
          {loadingState === 'error' ? (
            <EmptyState title="We couldn't load the feed." description="Try again in a moment or head to Send Appreciation while the feed reconnects." actionLabel="Refresh feed" onAction={() => window.location.reload()} />
          ) : null}
          {loadingState === 'success' && items.length === 0 ? (
            <EmptyState
              title="No recognitions yet — be the first to send one"
              description="Start building a culture of appreciation. Recognize a colleague's hard work, a milestone reached, or a helpful hand extended today."
              actionLabel="Send Appreciation"
              onAction={() => navigate('/recognitions/send')}
              secondaryLabel="View Sample Recognitions"
              onSecondary={() => {}}
            >
              <FeatureCards />
            </EmptyState>
          ) : null}
          {loadingState === 'success' && items.length > 0 ? items.map((recognition) => <RecognitionCard key={recognition.id} recognition={recognition} />) : null}
          {loadingState === 'success' && hasMore ? (
            <div className="flex justify-center pt-4">
              <Button variant="secondary" loading={loadingMore} onClick={async () => {
                setLoadingMore(true);
                try {
                  await loadRecognitions({ nextPage: page + 1, append: true, nextDepartmentId: departmentId });
                } finally {
                  setLoadingMore(false);
                }
              }} icon={ChevronDown}>
                Load More History
              </Button>
            </div>
          ) : null}
        </div>
      </PageErrorBoundary>

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => navigate('/recognitions/send')}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:bg-[#f6920d] hover:shadow-xl"
        aria-label="Send appreciation"
      >
        <Plus className="h-6 w-6" />
      </button>
    </AppLayout>
  );
}

export default RecognitionFeed;
