import { ArrowRight, Medal, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import AppLayout from '../components/AppLayout';
import Button from '../components/Button';
import Card from '../components/Card';
import LoadingSkeleton from '../components/LoadingSkeleton';
import StatCard from '../components/StatCard';
import { useAuth } from '../hooks/useAuth';
import { setUser } from '../store/authSlice';
import { setPointsBalance } from '../store/pointsSlice';
import { formatPoints } from '../utils/formatters';

function DashboardPage() {
  const { user } = useAuth();
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
    <AppLayout title={`Welcome back, ${user?.name || 'there'}`} description="Your recognition workspace for appreciation, review, and culture momentum.">
      {loadingState === 'loading' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <LoadingSkeleton className="h-36" />
          <LoadingSkeleton className="h-36" />
          <LoadingSkeleton className="h-36" />
        </div>
      ) : null}
      {loadingState === 'success' && profile ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Current Balance" value={`${formatPoints(profile.pointsBalance)} pts`} helper="Live from your authenticated profile" accent />
            <StatCard label="Role" value={profile.roleName} helper={profile.departmentName || 'No department assigned'} />
            <StatCard label="Status" value={profile.status} helper={`Employee code: ${profile.employeeCode}`} />
          </div>
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="p-5 md:p-6">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <h2 className="text-lg font-semibold">What you can do now</h2>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-surface p-4">
                  <Medal className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-ink">Browse the feed</p>
                  <p className="mt-1 text-xs leading-5 text-ink/55">See the latest company-wide recognition activity.</p>
                </div>
                <div className="rounded-lg bg-surface p-4">
                  <Trophy className="h-5 w-5 text-accent" />
                  <p className="mt-3 text-sm font-semibold text-ink">Send appreciation</p>
                  <p className="mt-1 text-xs leading-5 text-ink/55">Celebrate a teammate with a reviewed appreciation message.</p>
                </div>
                <div className="rounded-lg bg-surface p-4">
                  <ShieldCheck className="h-5 w-5 text-success" />
                  <p className="mt-3 text-sm font-semibold text-ink">Review queue</p>
                  <p className="mt-1 text-xs leading-5 text-ink/55">Managers and HR can approve or reject pending recognitions.</p>
                </div>
              </div>
            </Card>
            <Card className="bg-primary p-5 text-white md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">Current Highlight</p>
              <h2 className="mt-3 text-xl font-semibold">Recognition happens in two steps</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">Employees send the appreciation now. Managers or HR review it before points are ever awarded, keeping the process fair and auditable.</p>
              <div className="mt-5">
                <Link to="/recognitions/send">
                  <Button variant="secondary" className="border-white/20 bg-white text-primary hover:bg-white/90" icon={ArrowRight} size="sm">Send Appreciation</Button>
                </Link>
              </div>
            </Card>
          </div>
        </>
      ) : null}
      {loadingState === 'error' ? <Card className="p-6 text-center text-sm text-ink/60">We couldn't load your profile details. Please log in again or refresh the page.</Card> : null}
    </AppLayout>
  );
}

export default DashboardPage;
