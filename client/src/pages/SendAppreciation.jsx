import { zodResolver } from '@hookform/resolvers/zod';
import { Info, Search, SendHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import axiosClient from '../api/axiosClient';
import AppLayout from '../components/AppLayout';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import FormTextarea from '../components/FormTextarea';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { initials } from '../utils/formatters';

const appreciationSchema = z.object({
  receiverId: z.string().min(1, 'Choose a colleague.'),
  categoryId: z.string().optional(),
  message: z.string().trim().min(8, 'Please share a little more context.').max(500, 'Keep the message within 500 characters.'),
});

function SendAppreciation() {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loadingState, setLoadingState] = useState('loading');
  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(appreciationSchema),
    defaultValues: { receiverId: '', categoryId: '', message: '' },
  });

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const [usersResponse, categoriesResponse] = await Promise.all([
          axiosClient.get('/users'),
          axiosClient.get('/recognitions/categories'),
        ]);
        if (!mounted) return;
        setUsers(usersResponse.data.items);
        setCategories(categoriesResponse.data.items);
        setLoadingState('success');
      } catch {
        if (!mounted) return;
        setLoadingState('error');
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => `${user.name} ${user.departmentName || ''}`.toLowerCase().includes(query));
  }, [searchTerm, users]);

  const onSubmit = async (values) => {
    await axiosClient.post('/recognitions', {
      receiverId: values.receiverId,
      categoryId: values.categoryId || null,
      message: values.message,
    });
    toast.success('Appreciation sent. Your manager will review this appreciation and decide points if approved.');
    reset();
    setSelectedCategoryId('');
    setSearchTerm('');
  };

  const selectedReceiverId = watch('receiverId');

  return (
    <AppLayout title="Send Appreciation" description="Recognize a colleague's impact. Managers or HR review appreciation before any points are awarded." searchPlaceholder="Search people, teams, or awards...">
      {loadingState === 'loading' ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <LoadingSkeleton className="h-[520px]" />
          <LoadingSkeleton className="h-[300px]" />
        </div>
      ) : null}
      {loadingState === 'error' ? (
        <Card className="p-6 text-center text-sm text-ink/60">We couldn't load the appreciation form right now. Please refresh and try again.</Card>
      ) : null}
      {loadingState === 'success' ? (
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.55fr]">
          <Card className="p-5 md:p-6">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55" htmlFor="user-search">Select Recipient</label>
                  <div className="flex items-center gap-2 rounded-sm border border-line bg-surface px-3 py-2">
                    <Search className="h-4 w-4 text-ink/35" />
                    <input id="user-search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/35" placeholder="Search for a colleague..." />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    {filteredUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => setValue('receiverId', user.id, { shouldValidate: true })}
                        className={`rounded-lg border p-3 text-left transition ${selectedReceiverId === user.id ? 'border-accent bg-accent/8 shadow-soft' : 'border-line bg-white hover:border-primary/30'}`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials(user.name)}</div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                            <p className="truncate text-xs text-ink/50">{user.departmentName || 'No department'}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...register('receiverId')} />
                  {errors.receiverId?.message ? <p className="text-xs font-medium text-danger">{errors.receiverId.message}</p> : null}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink/55">Core Value Category</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId('');
                        setValue('categoryId', '');
                      }}
                      className={`rounded-full border px-3 py-2 text-xs font-medium transition ${selectedCategoryId === '' ? 'border-primary bg-primary/8 text-primary' : 'border-line bg-white text-ink/60 hover:border-primary/30'}`}
                    >
                      No category
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                          setValue('categoryId', category.id);
                        }}
                        className={`rounded-full border px-3 py-2 text-xs font-medium transition ${selectedCategoryId === category.id ? 'border-accent bg-accent/10 text-accent' : 'border-line bg-white text-ink/60 hover:border-primary/30'}`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                  <input type="hidden" {...register('categoryId')} />
                </div>
                <FormTextarea id="message" label="Your Message" placeholder="Tell us what makes this contribution so special..." error={errors.message?.message} maxLength={500} {...register('message')} className="md:col-span-2" />
              </div>
              <div className="rounded-lg border border-primary/12 bg-mist p-4">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 text-primary" />
                  <p className="text-sm leading-6 text-ink/65">Your manager will review this appreciation and decide points if approved.</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 border-t border-line pt-5 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-xs text-ink/45">
                  <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                  Public in recognition feed after submission.
                </div>
                <Button type="submit" loading={isSubmitting} icon={SendHorizontal}>Send Appreciation</Button>
              </div>
            </form>
          </Card>
          <div className="space-y-4">
            <Card className="bg-primary p-5 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Recognition Tip</p>
              <p className="mt-3 text-base leading-7">The strongest appreciation examples call out the action, the impact, and why it mattered to the team.</p>
            </Card>
            <Card className="p-5">
              <h2 className="text-lg font-semibold text-primary">Selected category</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="outline">{selectedCategoryId ? categories.find((item) => item.id === selectedCategoryId)?.name : 'No category selected'}</Badge>
              </div>
              <p className="mt-3 text-xs leading-5 text-ink/55">This phase keeps appreciation focused on the message itself. Managers or HR decide points later during review.</p>
            </Card>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}

export default SendAppreciation;
