import Card from './Card';

function StatCard({ label, value, accent, helper, icon: Icon, iconBg, change, changeTone }) {
  return (
    <Card className={`p-5 md:p-6 ${accent ? 'bg-primary text-white' : ''}`}>
      <div className="flex items-start justify-between">
        {Icon ? (
          <div className={`flex h-11 w-11 items-center justify-center rounded-sm ${iconBg || 'bg-primary/10 text-primary'}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
        {change ? (
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${changeTone === 'success' ? 'bg-success/12 text-success' : changeTone === 'danger' ? 'bg-danger/12 text-danger' : changeTone === 'accent' ? 'bg-accent/15 text-accent' : 'bg-mist text-primary'}`}>
            {change}
          </span>
        ) : null}
      </div>
      <p className={`mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] ${accent ? 'text-white/65' : 'text-ink/45'}`}>{label}</p>
      <p className={`mt-2 font-monoPoints text-3xl font-semibold ${accent ? 'text-[#AEE9F0]' : 'text-ink'}`}>{value}</p>
      {helper ? <p className={`mt-2 text-sm leading-6 ${accent ? 'text-white/78' : 'text-ink/55'}`}>{helper}</p> : null}
    </Card>
  );
}

export default StatCard;
