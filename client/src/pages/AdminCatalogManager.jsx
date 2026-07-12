import { AlertTriangle, Eye, Filter, Package, Plus, Star } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';

const catalogTabs = ['All Items', 'Digital Gift Cards', 'Merchandise', 'Experiences'];

const mockItems = [
  { id: 1, name: 'ProLink Wireless Mouse', sku: 'TECH-992-01', category: 'TECHNOLOGY', catColor: 'text-primary bg-primary/10', points: 2500, stock: '48 units', lowStock: false, active: true, emoji: '🖱️' },
  { id: 2, name: 'Executive Leather Journal', sku: 'MERCH-441-LL', category: 'LIFESTYLE', catColor: 'text-accent bg-accent/10', points: 1200, stock: '4 units', lowStock: true, active: true, emoji: '📓' },
  { id: 3, name: 'Morning Brew $25 Card', sku: 'DIGI-CAR-001', category: 'GIFT CARDS', catColor: 'text-success bg-success/10', points: 2500, stock: '∞ (Digital)', lowStock: false, active: false, emoji: '☕' },
  { id: 4, name: 'QuietCloud Headphones', sku: 'TECH-882-ANC', category: 'TECHNOLOGY', catColor: 'text-primary bg-primary/10', points: 15000, stock: '12 units', lowStock: false, active: true, emoji: '🎧' },
];

function AdminCatalogManager() {
  const [activeTab, setActiveTab] = useState('All Items');

  const headerActions = (
    <Button icon={Plus}>Add New Reward</Button>
  );

  return (
    <AppLayout title="Catalog Manager" description="Manage reward items, inventory levels, and redemption values." actions={headerActions} searchPlaceholder="Search catalog items...">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary"><Package className="h-5 w-5" /></div>
          <div>
            <p className="text-xs text-ink/45">Total Items</p>
            <p className="font-monoPoints text-2xl font-bold text-ink">124</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent/12 text-accent"><Star className="h-5 w-5" /></div>
          <div>
            <p className="text-xs text-ink/45">Active Rewards</p>
            <p className="font-monoPoints text-2xl font-bold text-ink">98</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-danger/10 text-danger"><AlertTriangle className="h-5 w-5" /></div>
          <div>
            <p className="text-xs text-ink/45">Low Stock</p>
            <p className="font-monoPoints text-2xl font-bold text-ink">12</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-mist text-ink/55"><Eye className="h-5 w-5" /></div>
          <div>
            <p className="text-xs text-ink/45">Total Views</p>
            <p className="font-monoPoints text-2xl font-bold text-ink">4.2k</p>
          </div>
        </Card>
      </div>

      {/* Tabs + filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {catalogTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-semibold transition ${activeTab === tab ? 'border-b-2 border-primary text-primary' : 'text-ink/45 hover:text-ink/70'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <Button variant="secondary" size="sm" icon={Filter}>Filter</Button>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-surface text-[11px] uppercase tracking-[0.12em] text-ink/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Item Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Points</th>
                <th className="px-4 py-3 font-semibold">Stock</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockItems.map((item) => (
                <tr key={item.id} className="border-t border-line/50 text-sm">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-surface text-xl">{item.emoji}</div>
                      <div>
                        <p className="font-semibold text-ink">{item.name}</p>
                        <p className="text-xs text-ink/40">SKU: {item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-[11px] font-bold uppercase ${item.catColor}`}>{item.category}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-monoPoints text-sm font-semibold text-accent">⊕ {item.points.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={item.lowStock ? 'font-semibold text-danger' : 'text-ink/70'}>{item.stock}</span>
                    {item.lowStock ? <span className="ml-1 text-xs text-danger">!</span> : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`h-5 w-9 rounded-full p-0.5 transition ${item.active ? 'bg-primary' : 'bg-ink/20'}`}>
                        <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${item.active ? 'translate-x-4' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-xs text-ink/55">{item.active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-ink/40 hover:text-ink/70">•••</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line/50 px-4 py-3 text-xs text-ink/50">
          <span>Showing 4 of 124 items</span>
          <div className="flex items-center gap-1">
            <button type="button" className="rounded px-2 py-1 hover:bg-surface">&lsaquo;</button>
            <button type="button" className="rounded bg-primary px-2.5 py-1 font-semibold text-white">1</button>
            <button type="button" className="rounded px-2 py-1 hover:bg-surface">2</button>
            <button type="button" className="rounded px-2 py-1 hover:bg-surface">3</button>
            <button type="button" className="rounded px-2 py-1 hover:bg-surface">&rsaquo;</button>
          </div>
        </div>
      </Card>

      {/* Footer */}
      <footer className="flex flex-col items-center justify-between gap-2 border-t border-line/40 pt-4 text-xs text-ink/40 sm:flex-row">
        <span>© 2024 RewardsPro Administrative Portal. All rights reserved.</span>
        <div className="flex gap-4">
          <span>Catalog Policy</span>
          <span>System Status</span>
        </div>
      </footer>
    </AppLayout>
  );
}

export default AdminCatalogManager;
