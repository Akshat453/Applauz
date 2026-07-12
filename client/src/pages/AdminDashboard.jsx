import { Calendar, Download, Monitor, Gift, Bell, Users, MoreVertical } from 'lucide-react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';

const topEmployees = [
  { name: 'Alex Rivers', points: 12400 },
  { name: 'Sarah Chen', points: 11200 },
  { name: 'Marcus Miller', points: 10800 },
  { name: 'Elena Rodriguez', points: 9600 },
  { name: 'Jordan Smith', points: 8900 },
];

const deptData = [
  { name: 'Engineering (45%)', value: 45, color: '#215E61' },
  { name: 'Sales (25%)', value: 25, color: '#FF9E20' },
  { name: 'Marketing (20%)', value: 20, color: '#6366F1' },
  { name: 'HR/Admin (10%)', value: 10, color: '#9CA3AF' },
];

const managerBudgets = [
  { name: 'David Vance', dept: 'Engineering', allocated: 500000, used: 410000, pct: 82, status: 'Healthy' },
  { name: 'Sarah Connor', dept: 'Product', allocated: 250000, used: 245000, pct: 98, status: 'Near Limit' },
  { name: 'Robert King', dept: 'Sales', allocated: 750000, used: 780000, pct: 104, status: 'Exceeded' },
];

const statusStyle = {
  Healthy: 'text-success bg-success/10',
  'Near Limit': 'text-accent bg-accent/12',
  Exceeded: 'text-danger bg-danger/10',
};
const barColor = { Healthy: '#215E61', 'Near Limit': '#215E61', Exceeded: '#C0392B' };

function AdminDashboard() {
  const headerActions = (
    <>
      <Button variant="secondary" size="sm" icon={Calendar}>Last 30 Days</Button>
      <Button size="sm" icon={Download}>Export Report</Button>
    </>
  );

  return (
    <AppLayout title="Analytics Overview" description="Real-time performance metrics for RewardsPro ecosystem." actions={headerActions} searchPlaceholder="Search analytics...">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-primary/10 text-primary"><Monitor className="h-4 w-4" /></div>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">+12.5%</span>
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-ink/45">Total Points Awarded</p>
          <p className="mt-0.5 font-monoPoints text-2xl font-bold text-ink">1,284,500</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-accent/12 text-accent"><Gift className="h-4 w-4" /></div>
            <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">+8.2%</span>
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-ink/45">Total Redeemed</p>
          <p className="mt-0.5 font-monoPoints text-2xl font-bold text-ink">842,300</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-danger/10 text-danger"><Bell className="h-4 w-4" /></div>
            <span className="rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-semibold text-accent">42 New</span>
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-ink/45">Pending Redemptions</p>
          <p className="mt-0.5 font-monoPoints text-2xl font-bold text-ink">156</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-mist text-ink/55"><Users className="h-4 w-4" /></div>
            <span className="text-[11px] text-ink/45">94% active</span>
          </div>
          <p className="mt-2 text-[11px] uppercase tracking-[0.1em] text-ink/45">Active Employees</p>
          <p className="mt-0.5 font-monoPoints text-2xl font-bold text-ink">4,812</p>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Bar chart */}
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink">Top 10 Recognized Employees</h2>
            <button type="button" className="text-ink/30 hover:text-ink/60"><MoreVertical className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 space-y-3">
            {topEmployees.map((emp) => (
              <div key={emp.name} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-xs text-ink/60 truncate">{emp.name}</span>
                <div className="flex-1">
                  <div className="h-5 overflow-hidden rounded bg-surface">
                    <div className="h-full rounded bg-primary" style={{ width: `${(emp.points / 12400) * 100}%` }} />
                  </div>
                </div>
                <span className="w-16 text-right font-monoPoints text-xs font-semibold text-ink/70">{emp.points.toLocaleString()} pts</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Donut chart */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-ink">Points Given by Department</h2>
          <div className="mt-4 flex items-center justify-center">
            <div className="relative">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={deptData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" strokeWidth={0}>
                    {deptData.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-monoPoints text-xl font-bold text-ink">1.2M</span>
                <span className="text-[10px] text-ink/45">Total Points</span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
            {deptData.map((d) => (
              <div key={d.name} className="flex items-center gap-1 text-[11px] text-ink/60">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Manager Budget Utilization */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Manager Budget Utilization</h2>
          <div className="flex items-center gap-3 text-[11px] text-ink/50">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary" />Utilized</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-danger" />Over Budget</span>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="text-[11px] uppercase tracking-[0.1em] text-ink/45">
              <tr>
                <th className="px-3 py-2 font-semibold">Manager Name</th>
                <th className="px-3 py-2 font-semibold">Department</th>
                <th className="px-3 py-2 font-semibold">Allocated Budget</th>
                <th className="px-3 py-2 font-semibold">Utilization</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {managerBudgets.map((m) => (
                <tr key={m.name} className="border-t border-line/40 text-sm">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {m.name.split(' ').map((w) => w[0]).join('')}
                      </div>
                      <span className="font-semibold text-ink">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-ink/60">{m.dept}</td>
                  <td className="px-3 py-3 text-ink/70">{m.allocated.toLocaleString()} pts</td>
                  <td className="px-3 py-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink/50">{m.used.toLocaleString()} pts</span>
                        <span className="font-semibold text-ink/70">{m.pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface">
                        <div
                          className={`h-full rounded-full ${m.pct > 100 ? 'bg-danger' : 'bg-primary'}`}
                          style={{ width: `${Math.min(m.pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyle[m.status]}`}>{m.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}

export default AdminDashboard;
