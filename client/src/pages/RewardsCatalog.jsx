import { Gift, Lock, Package, ShoppingCart, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axiosClient from '../api/axiosClient';
import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import FormInput from '../components/FormInput';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Modal from '../components/Modal';
import { syncAuthenticatedProfile } from '../utils/profileSync';
import { formatPoints } from '../utils/formatters';

function RewardImage({ reward }) {
  if (reward.image_url) {
    return (
      <img
        src={reward.image_url}
        alt={reward.title}
        className="h-40 w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-40 w-full items-center justify-center bg-surface text-primary">
      <Gift className="h-12 w-12" />
    </div>
  );
}

function buildStockLabel(reward) {
  if (reward.stock_quantity == null) return 'Unlimited availability';
  if (reward.stock_quantity <= 0) return 'Out of stock';
  if (reward.stock_quantity === 1) return '1 item left';
  return `${reward.stock_quantity} items left`;
}

function RewardsCatalog() {
  const dispatch = useDispatch();
  const balance = useSelector((state) => state.points.balance);
  const [items, setItems] = useState([]);
  const [loadingState, setLoadingState] = useState('loading');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedReward, setSelectedReward] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadRewards = async () => {
    const response = await axiosClient.get('/rewards', {
      params: { page: 1, limit: 100 },
    });
    setItems(response.data.items);
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const response = await axiosClient.get('/rewards', {
          params: { page: 1, limit: 100 },
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

  const categories = useMemo(() => (
    ['all', ...Array.from(new Set(items.map((item) => item.category).filter(Boolean)))]
  ), [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = category === 'all' || item.category === category;
      const query = search.trim().toLowerCase();
      const matchesSearch = !query
        || item.title.toLowerCase().includes(query)
        || (item.description || '').toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [category, items, search]);

  const handleRedeem = async () => {
    if (!selectedReward) return;

    setSubmitting(true);
    try {
      await axiosClient.post('/redemptions', { rewardId: selectedReward.id });
      await Promise.all([
        loadRewards(),
        syncAuthenticatedProfile(dispatch),
      ]);
      toast.success(`Redemption request created for ${selectedReward.title}.`);
      setSelectedReward(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to redeem this reward right now.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRewardAfterBalance = selectedReward
    ? balance - selectedReward.points_cost
    : balance;

  return (
    <AppLayout
      title="Rewards Catalog"
      description="Browse active rewards and redeem them with your available points."
      eyebrow="Redeem points"
      searchPlaceholder="Search rewards..."
    >
      <div className="grid gap-4 rounded-xl border border-white/70 bg-white/70 p-4 shadow-panel md:grid-cols-[1fr_auto] md:items-end">
        <FormInput
          id="reward-search"
          label="Search rewards"
          placeholder="Search by reward title"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setCategory(entry)}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                category === entry
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-white text-ink/60 hover:border-primary/30'
              }`}
            >
              {entry === 'all' ? 'All Categories' : entry.replaceAll('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loadingState === 'loading' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <LoadingSkeleton key={index} className="h-[360px] w-full" />
          ))}
        </div>
      ) : null}

      {loadingState === 'error' ? (
        <EmptyState
          title="Rewards catalog is unavailable"
          description="We couldn't load the rewards catalog just now. Try again or come back in a moment."
          actionLabel="Reload catalog"
          onAction={() => window.location.reload()}
        />
      ) : null}

      {loadingState === 'success' && filteredItems.length === 0 ? (
        <EmptyState
          title="No rewards match your filters"
          description="Try another category or search term to explore the currently active catalog."
          actionLabel="Clear search"
          onAction={() => {
            setSearch('');
            setCategory('all');
          }}
        />
      ) : null}

      {loadingState === 'success' && filteredItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((reward) => {
            const isOutOfStock = reward.stock_quantity != null && reward.stock_quantity <= 0;
            const insufficientBalance = reward.points_cost > balance;
            const disabled = isOutOfStock || insufficientBalance;

            return (
              <Card key={reward.id} className="overflow-hidden">
                <RewardImage reward={reward} />
                <div className="space-y-4 p-5 md:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-2">
                      <Badge tone="default">{reward.category.replaceAll('_', ' ')}</Badge>
                      <h2 className="text-lg font-semibold text-ink">{reward.title}</h2>
                    </div>
                    <span className="inline-flex items-center gap-1 font-monoPoints text-lg font-semibold text-accent">
                      <Star className="h-4 w-4" />
                      {formatPoints(reward.points_cost)}
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-ink/60">
                    {reward.description || 'No description available for this reward yet.'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-ink/55">
                    <span className="inline-flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {buildStockLabel(reward)}
                    </span>
                    {insufficientBalance ? (
                      <span className="inline-flex items-center gap-1 text-danger">
                        <Lock className="h-4 w-4" />
                        Need {formatPoints(reward.points_cost - balance)} more pts
                      </span>
                    ) : null}
                  </div>
                  <Button
                    className="w-full"
                    icon={ShoppingCart}
                    disabled={disabled}
                    onClick={() => setSelectedReward(reward)}
                  >
                    {isOutOfStock ? 'Unavailable' : insufficientBalance ? 'Insufficient balance' : 'Redeem'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}

      <Modal
        isOpen={Boolean(selectedReward)}
        title="Confirm redemption"
        onClose={() => {
          if (!submitting) setSelectedReward(null);
        }}
        actions={(
          <>
            <Button variant="secondary" onClick={() => setSelectedReward(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleRedeem} loading={submitting}>
              Confirm redemption
            </Button>
          </>
        )}
      >
        {selectedReward ? (
          <>
            <p className="text-base font-semibold text-ink">{selectedReward.title}</p>
            <div className="rounded-lg bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/45">Points impact</p>
              <p className="mt-3 text-sm text-ink/65">
                Your balance: <span className="font-monoPoints font-semibold text-primary">{formatPoints(balance)}</span> {' '}
                → {' '}
                <span className="font-monoPoints font-semibold text-accent">{formatPoints(selectedRewardAfterBalance)}</span>
              </p>
              <p className="mt-2 text-sm text-ink/65">
                Reward cost: <span className="font-monoPoints font-semibold text-ink">{formatPoints(selectedReward.points_cost)} pts</span>
              </p>
            </div>
          </>
        ) : null}
      </Modal>
    </AppLayout>
  );
}

export default RewardsCatalog;
