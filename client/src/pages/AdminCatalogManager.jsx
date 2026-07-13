import { Plus, Save } from 'lucide-react';
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
function normalizeDraft(item) {
  return {
    title: item.title,
    description: item.description || '',
    category: item.category,
    pointsCost: String(item.points_cost),
    stockQuantity: item.stock_quantity == null ? '' : String(item.stock_quantity),
    imageUrl: item.image_url || '',
    isActive: item.is_active,
  };
}

function toPayload(draft) {
  return {
    title: draft.title.trim(),
    description: draft.description.trim() ? draft.description.trim() : null,
    category: draft.category.trim(),
    pointsCost: Number(draft.pointsCost),
    stockQuantity: draft.stockQuantity === '' ? null : Number(draft.stockQuantity),
    imageUrl: draft.imageUrl.trim() ? draft.imageUrl.trim() : null,
    isActive: draft.isActive,
  };
}

function AdminCatalogManager() {
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loadingState, setLoadingState] = useState('loading');
  const [creating, setCreating] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'gift_card',
    pointsCost: '',
    stockQuantity: '',
    imageUrl: '',
    isActive: true,
  });

  const loadCatalog = async () => {
    const response = await axiosClient.get('/rewards', {
      params: { page: 1, limit: 100, includeInactive: 'true' },
    });
    setItems(response.data.items);
    setDrafts(Object.fromEntries(response.data.items.map((item) => [item.id, normalizeDraft(item)])));
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        const response = await axiosClient.get('/rewards', {
          params: { page: 1, limit: 100, includeInactive: 'true' },
        });
        if (!mounted) return;
        setItems(response.data.items);
        setDrafts(Object.fromEntries(response.data.items.map((item) => [item.id, normalizeDraft(item)])));
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

  const stats = useMemo(() => ({
    total: items.length,
    active: items.filter((item) => item.is_active).length,
    lowStock: items.filter((item) => item.stock_quantity != null && item.stock_quantity > 0 && item.stock_quantity <= 5).length,
  }), [items]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      await axiosClient.post('/rewards', toPayload(createForm));
      await loadCatalog();
      setCreateForm({
        title: '',
        description: '',
        category: 'gift_card',
        pointsCost: '',
        stockQuantity: '',
        imageUrl: '',
        isActive: true,
      });
      toast.success('Reward created successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create reward.');
    } finally {
      setCreating(false);
    }
  };

  const handleSave = async (rewardId) => {
    const draft = drafts[rewardId];
    setSavingId(rewardId);
    try {
      await axiosClient.patch(`/rewards/${rewardId}`, toPayload(draft));
      await loadCatalog();
      toast.success('Reward updated successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update reward.');
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleActive = async (rewardId, checked) => {
    setDrafts((current) => ({
      ...current,
      [rewardId]: {
        ...current[rewardId],
        isActive: checked,
      },
    }));
    setSavingId(rewardId);
    try {
      await axiosClient.patch(`/rewards/${rewardId}`, { isActive: checked });
      await loadCatalog();
      toast.success(`Reward ${checked ? 'activated' : 'deactivated'} successfully.`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to update reward status.');
      setDrafts((current) => ({
        ...current,
        [rewardId]: {
          ...current[rewardId],
          isActive: !checked,
        },
      }));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AppLayout
      title="HR Catalog Manager"
      description="Create, edit, and deactivate rewards used in the company catalog."
      searchPlaceholder="Search reward catalog..."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-ink/45">Total Items</p>
          <p className="mt-1 font-monoPoints text-2xl font-semibold text-ink">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink/45">Active Rewards</p>
          <p className="mt-1 font-monoPoints text-2xl font-semibold text-ink">{stats.active}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-ink/45">Low Stock</p>
          <p className="mt-1 font-monoPoints text-2xl font-semibold text-ink">{stats.lowStock}</p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2 text-primary">
          <Plus className="h-4 w-4" />
          <h2 className="text-lg font-semibold">Add new reward</h2>
        </div>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={handleCreate}>
          <FormInput
            id="create-title"
            label="Title"
            value={createForm.title}
            onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
            required
          />
          <FormInput
            id="create-category"
            label="Category"
            value={createForm.category}
            onChange={(event) => setCreateForm((current) => ({ ...current, category: event.target.value }))}
            required
          />
          <FormInput
            id="create-points"
            label="Points cost"
            type="number"
            min="1"
            value={createForm.pointsCost}
            onChange={(event) => setCreateForm((current) => ({ ...current, pointsCost: event.target.value }))}
            required
          />
          <FormInput
            id="create-stock"
            label="Stock quantity"
            type="number"
            min="0"
            placeholder="Leave blank for unlimited"
            value={createForm.stockQuantity}
            onChange={(event) => setCreateForm((current) => ({ ...current, stockQuantity: event.target.value }))}
          />
          <FormInput
            id="create-image"
            label="Image URL"
            value={createForm.imageUrl}
            onChange={(event) => setCreateForm((current) => ({ ...current, imageUrl: event.target.value }))}
          />
          <FormInput
            id="create-description"
            label="Description"
            value={createForm.description}
            onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
          />
          <label className="flex items-center gap-3 text-sm font-medium text-ink">
            <input
              type="checkbox"
              checked={createForm.isActive}
              onChange={(event) => setCreateForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            Active reward
          </label>
          <div className="md:col-span-2 xl:col-span-3">
            <Button type="submit" loading={creating}>Create reward</Button>
          </div>
        </form>
      </Card>

      {loadingState === 'loading' ? (
        <LoadingSkeleton className="h-[420px] w-full" />
      ) : null}

      {loadingState === 'error' ? (
        <EmptyState
          title="Catalog unavailable"
          description="We couldn't load the HR catalog manager just now. Please refresh and try again."
          actionLabel="Reload catalog"
          onAction={() => window.location.reload()}
        />
      ) : null}

      {loadingState === 'success' && items.length === 0 ? (
        <EmptyState
          title="No rewards configured yet"
          description="Use the form above to add the first reward to the catalog."
        />
      ) : null}

      {loadingState === 'success' && items.length > 0 ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-surface text-[11px] uppercase tracking-[0.12em] text-ink/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Reward</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Points</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const draft = drafts[item.id] || normalizeDraft(item);
                  const lowStock = item.stock_quantity != null && item.stock_quantity > 0 && item.stock_quantity <= 5;

                  return (
                    <tr key={item.id} className="border-t border-line/50 align-top text-sm">
                      <td className="px-4 py-4">
                        <div className="space-y-3">
                          <FormInput
                            id={`title-${item.id}`}
                            label="Title"
                            value={draft.title}
                            onChange={(event) => setDrafts((current) => ({
                              ...current,
                              [item.id]: { ...current[item.id], title: event.target.value },
                            }))}
                          />
                          <FormInput
                            id={`description-${item.id}`}
                            label="Description"
                            value={draft.description}
                            onChange={(event) => setDrafts((current) => ({
                              ...current,
                              [item.id]: { ...current[item.id], description: event.target.value },
                            }))}
                          />
                          <FormInput
                            id={`image-${item.id}`}
                            label="Image URL"
                            value={draft.imageUrl}
                            onChange={(event) => setDrafts((current) => ({
                              ...current,
                              [item.id]: { ...current[item.id], imageUrl: event.target.value },
                            }))}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <FormInput
                          id={`category-${item.id}`}
                          label="Category"
                          value={draft.category}
                          onChange={(event) => setDrafts((current) => ({
                            ...current,
                            [item.id]: { ...current[item.id], category: event.target.value },
                          }))}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <FormInput
                          id={`points-${item.id}`}
                          label="Points"
                          type="number"
                          min="1"
                          value={draft.pointsCost}
                          onChange={(event) => setDrafts((current) => ({
                            ...current,
                            [item.id]: { ...current[item.id], pointsCost: event.target.value },
                          }))}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <FormInput
                          id={`stock-${item.id}`}
                          label="Stock"
                          type="number"
                          min="0"
                          placeholder="Blank = unlimited"
                          value={draft.stockQuantity}
                          onChange={(event) => setDrafts((current) => ({
                            ...current,
                            [item.id]: { ...current[item.id], stockQuantity: event.target.value },
                          }))}
                        />
                        {lowStock ? (
                          <p className="mt-2 text-xs font-medium text-danger">Low stock</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-3">
                          <Badge tone={item.is_active ? 'success' : 'danger'}>
                            {item.is_active ? 'active' : 'inactive'}
                          </Badge>
                          <label className="flex items-center gap-2 text-xs text-ink/65">
                            <input
                              type="checkbox"
                              checked={draft.isActive}
                              disabled={savingId === item.id}
                              onChange={(event) => handleToggleActive(item.id, event.target.checked)}
                            />
                            Active
                          </label>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Button
                          size="sm"
                          icon={Save}
                          loading={savingId === item.id}
                          onClick={() => handleSave(item.id)}
                        >
                          Save
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </AppLayout>
  );
}

export default AdminCatalogManager;
