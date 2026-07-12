import { AlertTriangle, Check, Clock, Coins, Download, Filter, X } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';

const tabs = [
  { key: 'pending', label: 'PENDING', count: 14 },
  { key: 'approved', label: 'APPROVED', count: 142 },
  { key: 'rejected', label: 'REJECTED', count: 12 },
];

const mockPending = [
  { id: 1, initials: 'JS', color: 'bg-emerald-600', name: 'Jordan Smith', dept: 'Software Engineering', reward: 'Amazon Gift Card ($500)', rewardIcon: '🎁', points: 50000, date: 'Oct 24, 2023', time: '14:22 PM', overdue: false },
  { id: 2, initials: 'EV', color: 'bg-orange-500', name: 'Elena Vance', dept: 'Project Management', reward: 'Travel Voucher - Global Explorer', rewardIcon: '✈️', points: 120000, date: 'Oct 24, 2023', time: '11:05 AM', overdue: false },
  { id: 3, initials: 'MT', color: 'bg-red-500', name: 'Marcus Thorne', dept: 'Executive Leadership', reward: 'Workstation Upgrade (Pro Kit)', rewardIcon: '🖥️', points: 75000, date: 'Oct 23, 2023', time: '', overdue: true },
  { id: 4, initials: 'SR', color: 'bg-purple-500', name: 'Sarah Rogers', dept: 'Customer Success', reward: 'Premium Coffee Machine Subscription', rewardIcon: '☕', points: 800, date: 'Oct 25, 2023', time: '08:45 AM', overdue: false },
];

function AdminRedemptionQueue() {
  const [activeTab, setActiveTab] = useState('pending');

  return (
    <AppLayout title="Admin Redemptions" description="Process and manage pending employee reward claims." searchPlaceholder="Search pending requests...">
      {/* Queue health */}
      <div className="flex justify-end">
        <div className="text-right text-xs">
          <span className="text-ink/45">QUEUE HEALTH</span>
          <p className="mt-0.5 font-semibold text-ink">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-accent" />14 Pending
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-ink/45">Avg Processing Time</p>
            <p className="mt-1 font-monoPoints text-2xl font-bold text-ink">4.2 Hours</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 text-primary"><Clock className="h-5 w-5" /></div>
        </Card>
        <Card className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-ink/45">Points in Queue</p>
            <p className="mt-1 font-monoPoints text-2xl font-bold text-ink">245,800</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-accent/12 text-accent"><Coins className="h-5 w-5" /></div>
        </Card>
        <Card className="flex items-center justify-between bg-danger/10 p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.1em] text-danger/70">Critical Action</p>
            <p className="mt-1 text-xl font-bold text-ink">3 Urgent Requests</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-danger/60" />
        </Card>
      </div>

      {/* Tabs + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] transition ${activeTab === tab.key ? 'border-b-2 border-primary text-primary' : 'text-ink/45 hover:text-ink/70'}`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Filter}>Filter</Button>
          <Button variant="secondary" size="sm" icon={Download}>Export</Button>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-surface text-[11px] uppercase tracking-[0.12em] text-ink/50">
              <tr>
                <th className="px-4 py-3 font-semibold">Employee Name</th>
                <th className="px-4 py-3 font-semibold">Reward</th>
                <th className="px-4 py-3 font-semibold">Points</th>
                <th className="px-4 py-3 font-semibold">Requested Date</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockPending.map((r) => (
                <tr key={r.id} className={`border-t text-sm ${r.overdue ? 'border-l-4 border-l-danger border-t-line/50' : 'border-t-line/50'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${r.color}`}>{r.initials}</div>
                      <div>
                        <p className="font-semibold text-ink">{r.name}</p>
                        <p className="text-xs text-ink/45">{r.dept}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.rewardIcon}</span>
                      <span className="text-ink/80">{r.reward}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-accent/15 px-3 py-1 font-monoPoints text-xs font-semibold text-accent">
                      {r.points.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className={`text-sm ${r.overdue ? 'font-semibold text-danger' : 'text-ink/70'}`}>{r.date}</p>
                    {r.overdue ? <p className="text-xs text-danger">Overdue (24h+)</p> : r.time ? <p className="text-xs text-ink/40">{r.time}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="success" size="sm" icon={Check}>Approve</Button>
                      <Button variant="danger" size="sm" icon={X}>Reject</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-line/50 px-4 py-3 text-xs text-ink/50">
          <span>Showing 1 to 4 of 14 entries</span>
          <div className="flex items-center gap-1">
            <button type="button" className="rounded px-2 py-1 hover:bg-surface">&lsaquo;</button>
            <button type="button" className="rounded bg-primary px-2.5 py-1 font-semibold text-white">1</button>
            <button type="button" className="rounded px-2 py-1 hover:bg-surface">2</button>
            <button type="button" className="rounded px-2 py-1 hover:bg-surface">3</button>
            <button type="button" className="rounded px-2 py-1 hover:bg-surface">&rsaquo;</button>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}

export default AdminRedemptionQueue;
