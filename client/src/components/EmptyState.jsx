import { Sparkles } from 'lucide-react';
import Button from './Button';
import Card from './Card';

function EmptyState({ title, description, actionLabel, onAction, secondaryLabel, onSecondary, children }) {
  return (
    <Card className="flex flex-col items-center gap-6 p-8 text-center md:p-12">
      <div className="rounded-full bg-accent/12 p-4 text-accent">
        <Sparkles className="h-8 w-8" aria-hidden="true" />
      </div>
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-ink md:text-3xl">{title}</h2>
        <p className="mx-auto max-w-2xl text-base leading-7 text-ink/60">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
        {secondaryLabel && onSecondary ? <Button variant="secondary" onClick={onSecondary}>{secondaryLabel}</Button> : null}
      </div>
      {children}
    </Card>
  );
}

export default EmptyState;
