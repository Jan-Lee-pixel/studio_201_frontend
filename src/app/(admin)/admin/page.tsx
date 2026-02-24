'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@/providers/AuthProvider';

export default function DashboardPage() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 font-dm-mono text-gray-500 uppercase tracking-widest text-sm">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-red-50 text-red-600 p-4 border border-red-200">
        Error: User profile not found.
      </div>
    );
  }

  if (!profile) {
    return <div>User profile not found. Please log in again.</div>;
  }

  return (
    <div className="font-karla min-h-screen bg-[#f8f9fa] pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 pt-12 pb-16 px-6 lg:px-12 2xl:px-24 mb-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-dm-mono font-medium tracking-widest uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                {profile.role}
              </span>
              <span className="text-sm font-dm-mono text-gray-500 flex items-center gap-1.5 border border-gray-200 px-2 py-0.5 rounded-full bg-gray-50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> SYSTEM ONLINE
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-playfair font-medium text-gray-900 tracking-tight">
              Admin Control, <br className="hidden md:block" />
              <span className="text-gray-600">{profile.fullName}</span>
            </h1>
          </div>
          <div className="md:text-right text-gray-500 font-dm-mono text-sm max-w-sm">
            <p>Monitor platform health, manage gallery exhibitions, and review incoming artwork submissions.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 2xl:px-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Manage Exhibitions Card */}
        <div className="group relative bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer hover:-translate-y-1">
          <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center rounded-lg mb-6 shrink-0 group-hover:bg-indigo-600 transition-colors duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
          </div>
          <h2 className="text-2xl font-playfair font-medium text-gray-900 mb-3">Manage Exhibitions</h2>
          <p className="text-gray-500 text-sm mb-8 flex-grow leading-relaxed">
            Create, schedule, and curate upcoming gallery exhibitions. Organize artworks into cohesive digital gallery rooms.
          </p>
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-5">
            <span className="text-sm font-dm-mono tracking-widest uppercase font-medium group-hover:text-indigo-600 transition-colors">View All</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        </div>

        {/* Artwork Submissions Card */}
        <div className="group relative bg-[#0a0a0a] text-white rounded-xl border border-gray-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="flex justify-between items-start mb-6 shrink-0 relative z-10">
            <div className="w-12 h-12 bg-white/10 text-white flex items-center justify-center rounded-lg group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <span className="bg-red-500 text-white text-xs font-dm-mono font-bold px-2.5 py-1 rounded-full animate-bounce">
              3 NEW
            </span>
          </div>
          <h2 className="text-2xl font-playfair font-medium mb-3 relative z-10">Artwork Submissions</h2>
          <p className="text-gray-400 text-sm mb-8 flex-grow leading-relaxed relative z-10">
            Review pending artworks submitted by platform artists. Approve or reject pieces for exhibition inclusion.
          </p>
          <div className="mt-auto flex items-center justify-between border-t border-gray-800 pt-5 relative z-10">
            <span className="text-sm font-dm-mono tracking-widest uppercase font-medium group-hover:text-white text-gray-300 transition-colors">Review Queue</span>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        </div>

        {/* User Management Card */}
        <div className="group relative bg-white rounded-xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer hover:-translate-y-1">
          <div className="w-12 h-12 bg-gray-50 text-gray-900 border border-gray-200 flex items-center justify-center rounded-lg mb-6 shrink-0 group-hover:border-gray-900 transition-colors duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h2 className="text-2xl font-playfair font-medium text-gray-900 mb-3">User Directory</h2>
          <p className="text-gray-500 text-sm mb-8 flex-grow leading-relaxed">
            Manage platform access, audit artist accounts, and adjust role permissions across the system.
          </p>
          <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-5">
            <span className="text-sm font-dm-mono tracking-widest uppercase font-medium group-hover:text-black text-gray-500 transition-colors">Manage Users</span>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
