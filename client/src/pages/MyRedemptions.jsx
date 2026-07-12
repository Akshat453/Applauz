import { Clock, Package } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Card from '../components/Card';

const mockRedemptions = [
  { id: 1, reward: 'Amazon Gift Card ($50)', points: 5000, date: 'Nov 2, 2023', status: 'Delivered', emoji: '🛒' },
  { id: 2, reward: 'Company Hoodie', points: 1200, date: 'Oct 18, 2023', status: 'Shipped', emoji: '👕' },
  { id: 3, reward: 'Morning Brew $25 Card', points: 2500, date: 'Oct 5, 2023', status: 'Delivered', emoji: '☕' },
  { id: 4, reward: 'Spa & Wellness Day', points: 15000, date: 'Sep 22, 2023', status: 'Processing', emoji: '🧖' },
  { id: 5, reward: 'Executive Leather Journal', points: 1200, date: 'Sep 10, 2023', status: 'Delivered', emoji: '📓' },
];

const statusTone = { Delivered: 'success', Shipped: 'default', Processing: 'warning' };

function MyRedemptions() {
  return (
    <AppLayout title="My Redemptions" description="Track the status of your redeemed rewards.">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 text-primary"><Package className="h-4 w-4" /></div>
          <div>
            <p className="text-xs text-ink/45">Total Redeemed</p>
            <p className="font-monoPoints text-lg font-semibold text-ink">5</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-accent/12 text-accent"><Clock className="h-4 w-4" /></div>
          <div>
            <p className="text-xs text-ink/45">In Progress</p>
            <p className="font-monoPoints text-lg font-semibold text-ink">2</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-success/10 text-success"><Package className="h-4 w-4" /></div>
          <div>
            <p className="text-xs text-ink/45">Points Spent</p>
            <p className="font-monoPoints text-lg font-semibold text-ink">24,900</p>
          </div>
        </Card>
      </div>

      {/* Redemptions list */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-surface text-[11px] uppercase tracking-[0.12em] text-ink/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Reward</th>
                <th className="px-4 py-3 font-semibold">Points</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockRedemptions.map((r) => (
                <tr key={r.id} className="border-t border-line/50 text-sm">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{r.emoji}</span>
                      <span className="font-medium text-ink">{r.reward}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-monoPoints text-sm font-semibold text-accent">{r.points.toLocaleString()}</td>
                  <td className="px-4 py-3 text-ink/55">{r.date}</td>
                  <td className="px-4 py-3"><Badge tone={statusTone[r.status]}>{r.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}

export default MyRedemptions;
