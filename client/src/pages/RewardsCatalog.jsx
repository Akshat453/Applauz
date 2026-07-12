import { Gift, Search, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';

const categories = ['All', 'Gift Cards', 'Merchandise', 'Experiences', 'Technology'];

const mockRewards = [
  { id: 1, name: 'Amazon Gift Card', category: 'Gift Cards', points: 5000, description: 'Redeemable on Amazon for any product.', emoji: '🛒', popular: true },
  { id: 2, name: 'ProLink Wireless Mouse', category: 'Technology', points: 2500, description: 'Ergonomic wireless mouse for daily use.', emoji: '🖱️', popular: false },
  { id: 3, name: 'Spa & Wellness Day', category: 'Experiences', points: 15000, description: 'Full-day spa package at partner locations.', emoji: '🧖', popular: true },
  { id: 4, name: 'Company Hoodie', category: 'Merchandise', points: 1200, description: 'Premium cotton hoodie with brand embroidery.', emoji: '👕', popular: false },
  { id: 5, name: 'Morning Brew $25 Card', category: 'Gift Cards', points: 2500, description: 'Coffee gift card for your favorite brew.', emoji: '☕', popular: false },
  { id: 6, name: 'QuietCloud Headphones', category: 'Technology', points: 15000, description: 'Noise-cancelling over-ear headphones.', emoji: '🎧', popular: true },
  { id: 7, name: 'Executive Leather Journal', category: 'Merchandise', points: 1200, description: 'Premium leather-bound notebook.', emoji: '📓', popular: false },
  { id: 8, name: 'Travel Voucher', category: 'Experiences', points: 50000, description: 'Redeemable for flights or hotel stays.', emoji: '✈️', popular: true },
];

function RewardsCatalog() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = mockRewards.filter((r) => {
    const matchCategory = activeCategory === 'All' || r.category === activeCategory;
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <AppLayout title="Rewards Catalog" description="Browse and redeem rewards using your earned points." searchPlaceholder="Search rewards...">
      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line/60 pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${activeCategory === cat ? 'bg-primary text-white' : 'bg-white text-ink/60 hover:bg-surface'}`}
          >
            {cat}
          </button>
        ))}
        <div className="ml-auto hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 md:flex">
          <Search className="h-3.5 w-3.5 text-ink/35" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter rewards..." className="w-32 bg-transparent text-xs text-ink outline-none placeholder:text-ink/35" />
        </div>
      </div>

      {/* Rewards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((reward) => (
          <Card key={reward.id} className="flex flex-col overflow-hidden">
            <div className="flex h-32 items-center justify-center bg-surface text-5xl">{reward.emoji}</div>
            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">{reward.name}</h3>
                {reward.popular ? <Badge tone="accent">Popular</Badge> : null}
              </div>
              <p className="mt-1 text-xs leading-5 text-ink/50">{reward.description}</p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="inline-flex items-center gap-1 font-monoPoints text-sm font-semibold text-accent">
                  <Star className="h-3.5 w-3.5" /> {reward.points.toLocaleString()} pts
                </span>
                <Button size="sm" icon={ShoppingCart}>Redeem</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-8 text-center">
          <Gift className="mx-auto h-10 w-10 text-ink/25" />
          <p className="mt-3 text-sm font-semibold text-ink/60">No rewards match your search.</p>
        </Card>
      ) : null}
    </AppLayout>
  );
}

export default RewardsCatalog;
