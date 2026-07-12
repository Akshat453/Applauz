import Card from './Card';

function StatCard({ label, value, accent, helper, icon: Icon, iconBg, change, changeTone }) {
  return (
    <Card className={`p-6 ${accent ? 'bg-primary text-white' : 'bg-white'}`}>
      <div className="flex items-start justify-between">
        {Icon ? (
          <div className={`flex h-10 w-10 items-center justify-center rounded-sm ${iconBg || 'bg-primary/10 text-primary'}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
        {change ? (
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${changeTone === 'success' ? 'bg-success/12 text-success' : changeTone === 'danger' ? 'bg-danger/12 text-danger' : changeTone === 'accent' ? 'bg-accent/15 text-accent' : 'bg-mist text-primary'}`}>
            {change}
          </span>
        ) : null}
      </div>
      <p className={`mt-2 text-xs font-semibold uppercase tracking-[0.14em] ${accent ? 'text-white/70' : 'text-ink/50'}`}>{label}</p>
      <p className={`mt-1 font-monoPoints text-3xl font-semibold ${accent ? 'text-[#AEE9F0]' : 'text-ink'}`}>{value}</p>
      {helper ? <p className={`mt-1 text-xs ${accent ? 'text-white/80' : 'text-ink/55'}`}>{helper}</p> : null}
    </Card>
  );
}

export default StatCard;
