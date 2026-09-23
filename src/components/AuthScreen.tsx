import React, { FormEvent, useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  onAuthenticated: () => void;
}

export const AuthScreen: React.FC<Props> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const confirmationRedirect = import.meta.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    setMessage('');

    const result = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: confirmationRedirect,
          },
        });

    setIsSubmitting(false);

    if (result.error) {
      const lowerMessage = result.error.message.toLowerCase();
      if (lowerMessage.includes('not authorized') || lowerMessage.includes('email_address_not_authorized')) {
        setError('या Supabase प्रकल्पाच्या email provider कडून या पत्त्यावर confirmation email पाठवण्याची परवानगी नाही. अधिकृत email वापरा किंवा administrator ने custom SMTP जोडणे आवश्यक आहे.');
        return;
      }
      if (lowerMessage.includes('rate limit') || lowerMessage.includes('over_email_send_rate_limit')) {
        setError('Confirmation email ची rate limit पूर्ण झाली आहे. काही मिनिटांनी पुन्हा प्रयत्न करा.');
        return;
      }
      if (lowerMessage.includes('email not confirmed')) {
        setError('Please confirm your email before signing in.');
      } else if (lowerMessage.includes('password') && lowerMessage.includes('weak')) {
        setError('Choose a stronger password with at least 6 characters.');
      } else if (mode === 'login' && (lowerMessage.includes('invalid login') || lowerMessage.includes('credentials'))) {
        setError('Invalid email or password.');
      } else {
        setError('We could not complete that request. Please try again.');
      }
      return;
    }

    if (mode === 'signup' && !result.data.session) {
      setMessage('Account तयार झाले. आता तुमच्या email आणि password ने login करा. जर confirmation मागितले तर Supabase Auth मध्ये email confirmation बंद करणे आवश्यक आहे.');
      setMode('login');
      return;
    }

    onAuthenticated();
  };

  return (
    <main className="min-h-screen bg-[#0f2740] px-4 py-8 flex items-center justify-center font-['Mukta',sans-serif]">
      <section className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="bg-[#1a4a72] px-6 py-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/15">
            <ShieldCheck className="h-8 w-8 text-[#f39c12]" />
          </div>
          <h1 className="text-2xl font-bold">आरोग्य सेवा अहवाल</h1>
          <p className="mt-1 text-sm text-slate-200">Individual staff login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
            <p className="mt-1 text-sm text-slate-500">{mode === 'login' ? 'Sign in to access your health centre workspace.' : 'Use your personal email to create an individual account.'}</p>
          </div>

          <label className="block text-sm font-semibold text-slate-700">
            Email address
            <span className="relative mt-1 block">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-slate-900 outline-none transition focus:border-[#1a4a72] focus:ring-2 focus:ring-[#1a4a72]/20" placeholder="you@example.com" />
            </span>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Password
            <span className="relative mt-1 block">
              <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input required minLength={6} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-slate-900 outline-none transition focus:border-[#1a4a72] focus:ring-2 focus:ring-[#1a4a72]/20" placeholder="At least 6 characters" />
            </span>
          </label>

          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}

          <button disabled={isSubmitting} type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1a4a72] px-4 py-3 font-bold text-white transition hover:bg-[#123653] disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
            {!isSubmitting && <ArrowRight className="h-4 w-4" />}
          </button>

          <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setMessage(''); }} className="mx-auto flex items-center gap-2 text-sm font-semibold text-[#1a4a72] hover:underline">
            <UserPlus className="h-4 w-4" />
            {mode === 'login' ? 'Create an individual account' : 'Already have an account? Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
};
