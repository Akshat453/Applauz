import { BriefcaseBusiness, MapPin, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import axiosClient from '../api/axiosClient';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { setUser } from '../store/authSlice';
import { setPointsBalance } from '../store/pointsSlice';
import { formatPoints, initials } from '../utils/formatters';

function ProfilePage() {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [loadingState, setLoadingState] = useState('loading');

  useEffect(() => {
    let mounted = true;
    const loadProfile = async () => {
      try {
        const response = await axiosClient.get('/users/me');
        if (!mounted) return;
        setProfile(response.data);
        dispatch(setUser(response.data));
        dispatch(setPointsBalance(response.data.pointsBalance));
        setLoadingState('success');
      } catch {
        if (!mounted) return;
        setLoadingState('error');
      }
    };
    loadProfile();
    return () => { mounted = false; };
  }, []);

  return (
    <AppLayout title="Profile" description="Your role, department, and current point balance in one place.">
      {loadingState === 'loading' ? <LoadingSkeleton className="h-[360px] w-full" /> : null}
      {loadingState === 'success' && profile ? (
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="p-5 md:p-6">
            <div className="grid gap-5 md:grid-cols-[180px_1fr]">
              <div className="flex flex-col items-center gap-3 rounded-lg bg-surface p-5">
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-primary/10 text-4xl font-semibold text-primary">{initials(profile.name)}</div>
                <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold text-primary">Active</span>
              </div>
              <div className="space-y-3">
                <div>
                  <h2 className="text-3xl font-bold text-ink">{profile.name}</h2>
                  <p className="mt-1 text-lg text-ink/55">{profile.roleName}</p>
                </div>
                <div className="grid gap-3 text-sm text-ink/60 md:grid-cols-2">
                  <p className="inline-flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-primary" /> {profile.departmentName || 'No department assigned'}</p>
                  <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {profile.email}</p>
                </div>
                <p className="max-w-xl text-sm leading-6 text-ink/55">This profile is currently powered by the authenticated `/api/users/me` endpoint, keeping identity and points data aligned with the backend.</p>
              </div>
            </div>
          </Card>
          <Card className="bg-primary p-5 text-white md:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Available Points</p>
            <p className="mt-3 font-monoPoints text-4xl font-semibold text-accent">{formatPoints(profile.pointsBalance)}</p>
            <div className="mt-4 h-2.5 rounded-full bg-white/20">
              <div className="h-full w-4/5 rounded-full bg-accent" />
            </div>
            <div className="mt-4 inline-flex items-center gap-2 text-sm text-white/75">
              <Star className="h-4 w-4 text-accent" />
              <span>Live balance ready for future reward catalog integrations.</span>
            </div>
          </Card>
        </div>
      ) : null}
      {loadingState === 'error' ? <Card className="p-6 text-center text-sm text-ink/60">We couldn't load your profile right now.</Card> : null}
    </AppLayout>
  );
}

export default ProfilePage;
