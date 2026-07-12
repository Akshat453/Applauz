import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Button from '../components/Button';
import FormInput from '../components/FormInput';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Enter a valid work email.'),
  password: z.string().min(1, 'Enter your password.'),
});

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors }, setError } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (values) => {
    try {
      await login(values.email, values.password);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setError('root', { message: error.message });
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-surface px-4 py-12 text-ink">
      <div className="absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-accent/55 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-16 top-0 h-72 w-72 rounded-full bg-primary/35 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-[calc(100vh-96px)] max-w-5xl items-center justify-center rounded-lg bg-white/75 p-6 shadow-panel backdrop-blur md:p-12">
        <div className="grid w-full max-w-4xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-sm bg-primary text-white">
              <Shield className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              <p className="text-3xl font-bold text-primary">RewardsPro</p>
              <p className="max-w-md text-lg leading-7 text-ink/55">Enterprise recognition and rewards platform for culture-building teams.</p>
            </div>
          </section>
          <section className="rounded-lg bg-white p-6 shadow-panel md:p-8">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-ink">Sign in to your account</h1>
              <p className="text-sm text-ink/50">Use one of the seeded backend users to test the full authenticated flow.</p>
            </div>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <FormInput id="email" label="Work email" type="email" placeholder="name@company.com" error={errors.email?.message} {...register('email')} />
              <div className="relative">
                <FormInput id="password" label="Password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" error={errors.password?.message} className="pr-12" {...register('password')} />
                <button type="button" className="absolute right-4 top-[42px] text-ink/40" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.root?.message ? <p className="text-sm font-medium text-danger">{errors.root.message}</p> : null}
              <Button type="submit" className="w-full" loading={isLoading} icon={Mail}>Sign In</Button>
            </form>
            <div className="mt-6 flex items-center gap-2 text-xs text-ink/45">
              <Lock className="h-4 w-4" aria-hidden="true" />
              <span>JWT-backed login, in-memory session, and protected API routing enabled.</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default LoginPage;
