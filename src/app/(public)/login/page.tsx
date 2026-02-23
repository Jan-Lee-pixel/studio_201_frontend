'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let authError;

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      authError = error;
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      authError = error;
    }

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Refresh layout and naturally fall into the correct protected dashboard
    router.refresh();
    router.push('/admin'); // Or wherever artists/admin land
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9] px-4 font-karla">
      <div className="max-w-md w-full space-y-8 bg-white p-10 shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-playfair font-medium text-gray-900">
            {isSignUp ? 'Apply to Studio 201' : 'Sign in to Studio 201'}
          </h2>
          <p className="mt-4 text-center text-sm text-gray-600">
            For Artists and Administrators
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          {error && (
            <div className="bg-red-50 text-red-500 text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 font-dm-mono mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:ring-0 transition-colors text-sm"
                placeholder="artist@studio201.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 font-dm-mono mb-2 block">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:ring-0 transition-colors text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 uppercase tracking-widest text-xs border border-transparent text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50 font-dm-mono"
            >
              {loading ? (isSignUp ? 'Creating Account...' : 'Authenticating...') : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-600">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              className="text-black font-medium hover:underline focus:outline-none"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
