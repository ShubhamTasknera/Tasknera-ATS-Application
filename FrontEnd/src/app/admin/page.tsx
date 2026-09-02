'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/api';
import { atsStore, AuditEvent, RecruiterMetric, JobItem, CandidateItem } from '@/lib/atsStore';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export default function AdminPage() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'timetracking' | 'leaderboard' | 'requisitions' | 'audit' | 'governance'>('overview');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
  const [podFilter, setPodFilter] = useState<string>('All');
  const [searchRecruiter, setSearchRecruiter] = useState('');
  const [searchJob, setSearchJob] = useState('');
  const [searchAudit, setSearchAudit] = useState('');

  // Modals & detail view
  const [selectedRecruiter, setSelectedRecruiter] = useState<RecruiterMetric | null>(null);
  const [showRecruiterModal, setShowRecruiterModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('RECRUITER_MEMBER');
  const [inviteTeam, setInviteTeam] = useState('SAP & Enterprise Practice');

  // Governance settings
  const [autoSubmitThreshold, setAutoSubmitThreshold] = useState(85);
  const [strictMandatoryMode, setStrictMandatoryMode] = useState(true);

  // Live state from Store
  const [recruiters, setRecruiters] = useState<RecruiterMetric[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);

  const syncData = () => {
    setRecruiters(atsStore.getRecruiters());
    setJobs(atsStore.getJobs());
    setCandidates(atsStore.getCandidates());
    setAuditEvents(atsStore.getAuditEvents());
  };

  useEffect(() => {
    setMounted(true);
    syncData();
    const unsubscribe = atsStore.subscribe(syncData);
    return () => unsubscribe();
  }, []);

  const stats = atsStore.getAdminOverviewStats();
  const weeklyTrends = atsStore.getWeeklyEvaluationTrends();
  const podAnalytics = atsStore.getPodAnalytics();
  const scoreTiers = atsStore.getScoreTierDistribution();

  // Daily team hours comparison data for Recharts
  const teamDailyHoursData = [
    { day: 'Mon', 'Sarah Mitchell': 6.8, 'Priya Sharma': 7.4, 'David Park': 5.2, 'John Reynolds': 7.8, 'Alex Morales': 7.0 },
    { day: 'Tue', 'Sarah Mitchell': 7.2, 'Priya Sharma': 7.0, 'David Park': 5.6, 'John Reynolds': 7.5, 'Alex Morales': 7.2 },
    { day: 'Wed', 'Sarah Mitchell': 6.5, 'Priya Sharma': 7.2, 'David Park': 5.0, 'John Reynolds': 7.2, 'Alex Morales': 6.8 },
    { day: 'Thu', 'Sarah Mitchell': 5.9, 'Priya Sharma': 6.9, 'David Park': 5.0, 'John Reynolds': 7.0, 'Alex Morales': 6.5 },
    { day: 'Fri', 'Sarah Mitchell': 6.4, 'Priya Sharma': 7.1, 'David Park': 5.4, 'John Reynolds': 7.5, 'Alex Morales': 7.0 },
  ];

  // Activity time breakdown data
  const activityTimeDistribution = [
    { name: 'Resume Review & Evaluation', value: 54, color: '#3B82F6', hours: '89.6 hrs' },
    { name: 'Phone Screening Calls', value: 31, color: '#F59E0B', hours: '51.4 hrs' },
    { name: 'JD Creation & Setup', value: 15, color: '#FF6B00', hours: '24.9 hrs' },
  ];

  // Filtered recruiters
  const filteredRecruiters = recruiters.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchRecruiter.toLowerCase()) ||
                          r.email.toLowerCase().includes(searchRecruiter.toLowerCase()) ||
                          r.team.toLowerCase().includes(searchRecruiter.toLowerCase());
    const matchesPod = podFilter === 'All' || r.team === podFilter;
    return matchesSearch && matchesPod;
  });

  // Filtered jobs
  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchJob.toLowerCase()) ||
                          j.client.toLowerCase().includes(searchJob.toLowerCase()) ||
                          j.assignedRecruiter.toLowerCase().includes(searchJob.toLowerCase());
    const matchesPod = podFilter === 'All' || j.pod === podFilter;
    return matchesSearch && matchesPod;
  });

  // Filtered audit events
  const filteredAudit = auditEvents.filter(e =>
    e.user.toLowerCase().includes(searchAudit.toLowerCase()) ||
    e.action.toLowerCase().includes(searchAudit.toLowerCase()) ||
    e.detail.toLowerCase().includes(searchAudit.toLowerCase()) ||
    e.target.toLowerCase().includes(searchAudit.toLowerCase())
  );

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const newMember: RecruiterMetric = {
      id: `rec-${Date.now()}`,
      name: inviteName || inviteEmail.split('@')[0],
      email: inviteEmail,
      role: inviteRole as any,
      team: inviteTeam,
      activeJobs: 1,
      jdsUploaded: 1,
      resumesSeen: 15,
      screenedThisWeek: 4,
      tlApprovedCount: 2,
      avgMatchScore: 85,
      avgTimePerScreen: '3.0 min',
      avgTimePerResume: '1.9 min',
      todayHoursSpent: 4.5,
      totalHoursThisWeek: 22.5,
      dailyTimeLogs: [
        { day: 'Mon', date: 'Aug 28', hoursSpent: 4.5, resumesReviewedCount: 15, resumesTimeHours: 2.2, screeningsCount: 4, screeningTimeHours: 1.3, jdsUploadedCount: 1, jdTimeHours: 1.0 },
      ],
      capacity: 'Optimal',
      lastActive: 'Just invited',
      recentActivity: ['Invited to TaskNera TA Platform'],
    };
    setRecruiters(prev => [newMember, ...prev]);
    setShowInviteModal(false);
    setInviteName('');
    setInviteEmail('');
  };

  const totalTeamHoursToday = recruiters.reduce((sum, r) => sum + (r.todayHoursSpent || 0), 0);
  const totalTeamHoursThisWeek = recruiters.reduce((sum, r) => sum + (r.totalHoursThisWeek || 0), 0);

  // Strict Role Guard: Only Administrators can view this page
  if (mounted && user && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#EEF2F6] flex flex-col">
        <Header />
        <main className="max-w-screen-md mx-auto px-6 pt-32 pb-16 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl font-bold mb-4 shadow-sm">
            🔒
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-wider mb-2">
            Access Restricted
          </span>
          <h1 className="text-2xl font-black text-slate-900">Administrator Access Required</h1>
          <p className="text-sm text-slate-500 max-w-md mt-2 leading-relaxed">
            You are currently signed in as a <strong>Talent Acquisition Team Member</strong> ({user.name || user.email}). This executive performance review and governance hub is strictly accessible to administrators.
          </p>
          <div className="flex items-center gap-3 mt-6">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-extrabold rounded-xl shadow-orange transition-all"
            >
              Return to My Recruiter Workspace →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF2F6] text-[#1E293B] flex flex-col selection:bg-brand-orange-pale selection:text-brand-orange">
      <Header />

      <main className="max-w-screen-xl mx-auto px-6 pt-24 pb-16 flex-1 w-full">

        {/* ── TOP EXECUTIVE BANNER ── */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-violet-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-violet-800/40 relative overflow-hidden">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-600/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-brand-orange/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/25 border border-violet-400/30 rounded-full text-xs font-black text-violet-200 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                  Administrator &amp; Executive Oversight Hub
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/10 text-white/90 border border-white/10">
                  Daily Engagement &amp; Performance Review
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Talent Acquisition Team Performance &amp; Time Tracking
              </h1>
              <p className="text-sm text-violet-200/80 max-w-2xl leading-relaxed">
                Track how much time each team member spends daily reviewing resumes, creating JDs, screening candidates, and check their operational velocity.
              </p>
            </div>

            {/* Top Right Controls: Time Range & Invite */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Time selector */}
              <div className="bg-slate-900/80 border border-violet-500/30 p-1 rounded-2xl flex items-center gap-1 text-xs font-bold">
                {(['today', 'week', 'month', 'all'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setTimeRange(t)}
                    className={`px-3 py-1.5 rounded-xl transition-all capitalize cursor-pointer ${
                      timeRange === t
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-violet-300/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {t === 'today' ? 'Today' : t === 'week' ? 'This Week' : t === 'month' ? 'This Month' : 'All Time'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-extrabold rounded-xl transition-all shadow-orange hover:shadow-orange-lg hover:-translate-y-0.5 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Add Recruiter</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── EXECUTIVE KPI METRIC CARDS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {/* Metric 1: Resumes Seen & Evaluated */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Resumes Seen &amp; Evaluated</span>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold text-xs">
                📄
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.totalResumesSeen.toLocaleString()}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100">
              <span className="text-blue-600 font-bold flex items-center gap-1">
                <span>↑ 18%</span>
                <span className="text-slate-400 font-medium">vs last week</span>
              </span>
              <span className="font-semibold text-slate-700">98.4% ATS Parsed</span>
            </div>
          </div>

          {/* Metric 2: JDs Uploaded & Created */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">JDs Uploaded &amp; Created</span>
              <span className="w-8 h-8 rounded-xl bg-brand-orange-pale text-brand-orange border border-brand-orange-border flex items-center justify-center font-bold text-xs">
                💼
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.totalJdsUploaded}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100">
              <span className="font-semibold text-slate-700">{jobs.length} Active Positions</span>
              <span className={`font-bold ${stats.agingJdsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {stats.agingJdsCount} Aging (&gt;25d)
              </span>
            </div>
          </div>

          {/* Metric 3: Time Spent by Team Today & This Week */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Team Time Spent Today</span>
              <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center font-bold text-xs">
                ⏱️
              </span>
            </div>
            <div className="text-3xl font-black text-purple-700 tracking-tight">
              {totalTeamHoursToday.toFixed(1)} hrs
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100">
              <span className="text-purple-600 font-bold">{totalTeamHoursThisWeek.toFixed(1)} hrs this week</span>
              <span className="font-semibold text-slate-700">Avg 6.7h / member</span>
            </div>
          </div>

          {/* Metric 4: Shortlisted for Client */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Shortlisted Candidates</span>
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xs">
                ⭐
              </span>
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {stats.totalShortlisted}
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2.5 pt-2.5 border-t border-slate-100">
              <span className="text-emerald-600 font-bold">{stats.conversionRate}% Conversion</span>
              <span className="font-semibold text-slate-700">Mean Score: 88%</span>
            </div>
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div className="flex items-center gap-2 mb-6 border-b border-slate-200/80 pb-3 overflow-x-auto">
          {[
            { id: 'overview', label: '📊 Performance & Volume Analytics' },
            { id: 'timetracking', label: '⏱️ Daily Time Tracking & Hours Spent' },
            { id: 'leaderboard', label: '👥 Recruiter Performance Leaderboard', count: recruiters.length },
            { id: 'requisitions', label: '🎯 Requisitions Oversight Radar', count: jobs.length },
            { id: 'audit', label: '📋 Live Team Audit Stream', count: auditEvents.length },
            { id: 'governance', label: '⚙️ ATS Rules & User Governance' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/90'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB 1: VISUAL PERFORMANCE & VOLUME ANALYTICS ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Chart Grid: Main Throughput AreaChart & Score Tier PieChart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Chart 1: Resumes Seen & Screenings Over Time */}
              <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Weekly Resume Evaluation &amp; Screening Velocity
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Daily candidate CV evaluations parsed by team vs phone screening calls logged
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-3 h-3 rounded-md bg-brand-orange inline-block" /> Resumes Evaluated
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-3 h-3 rounded-md bg-blue-500 inline-block" /> Phone Screenings
                    </span>
                  </div>
                </div>

                {mounted && (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorResumes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.0}/>
                          </linearGradient>
                          <linearGradient id="colorScreenings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="resumesEvaluated" stroke="#FF6B00" strokeWidth={2.5} fillOpacity={1} fill="url(#colorResumes)" name="Resumes Evaluated" />
                        <Area type="monotone" dataKey="screenings" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorScreenings)" name="Screening Calls" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Chart 2: ATS Match Score Fit Distribution */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    ATS Score Quality Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Distribution of candidate match scores evaluated across all active requisitions
                  </p>
                </div>

                {mounted && (
                  <div className="h-[210px] w-full my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={scoreTiers}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {scoreTiers.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {scoreTiers.map((tier, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                        <span className="font-bold text-slate-700">{tier.name}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">{tier.value}% ({tier.label})</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Pod Delivery Performance Grid */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Talent Acquisition Pod Sourcing &amp; Upload Performance
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    JD creation velocity, resumes processed, and shortlist delivery by functional team pod
                  </p>
                </div>
                <span className="text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200 self-start sm:self-auto">
                  3 Delivery Pods Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {podAnalytics.map((pod, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between hover:border-slate-300 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-violet-700 bg-violet-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          TA Practice Pod
                        </span>
                        <span className="text-xs font-black text-emerald-600">Mean Fit: {pod.avgScore}%</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{pod.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Pod Lead: <strong>{pod.lead}</strong></p>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200/60 text-xs">
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">JDs UPLOADED</span>
                          <span className="text-base font-black text-slate-800">{pod.jds} Positions</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">RESUMES SEEN</span>
                          <span className="text-base font-black text-blue-600">{pod.resumes} CVs</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">SCREENINGS</span>
                          <span className="text-base font-black text-amber-600">{pod.screenings} Calls</span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block">SHORTLISTED</span>
                          <span className="text-base font-black text-emerald-600">{pod.shortlists} Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: TIME TRACKING & DAILY ENGAGEMENT ── */}
        {activeTab === 'timetracking' && (
          <div className="space-y-6">
            {/* Top Cards for Time Tracking */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1">Total Team Hours Today</span>
                <div className="text-3xl font-black text-purple-700">{totalTeamHoursToday.toFixed(1)} Hours</div>
                <p className="text-xs text-slate-500 mt-2">Active recruitment &amp; screening sessions across all 5 recruiters</p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1">Weekly Active Workload</span>
                <div className="text-3xl font-black text-slate-900">{totalTeamHoursThisWeek.toFixed(1)} Hours</div>
                <p className="text-xs text-slate-500 mt-2">Team averaging 6.8 hours daily active engagement on ATS</p>
              </div>

              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block mb-1">Average Review Speed</span>
                <div className="text-3xl font-black text-emerald-600">1.7 min / CV</div>
                <p className="text-xs text-slate-500 mt-2">From raw resume drop to deterministic ATS score calculation</p>
              </div>
            </div>

            {/* Daily Hours Comparison BarChart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      Daily Time Spent Comparison by Recruiter (Hours/Day)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Track exact hours spent by each team member on Monday through Friday
                    </p>
                  </div>
                </div>

                {mounted && (
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={teamDailyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                        <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                        <Bar dataKey="Sarah Mitchell" fill="#FF6B00" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Priya Sharma" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="David Park" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="John Reynolds" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Alex Morales" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Activity Time Allocation Pie */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Recruiter Time Allocation Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    How the team splits their daily hours across ATS operations
                  </p>
                </div>

                {mounted && (
                  <div className="h-[210px] w-full my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={activityTimeDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {activityTimeDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {activityTimeDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-bold text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-extrabold text-slate-900">{item.value}% ({item.hours})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recruiter Daily Hours & Speed Table */}
            <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
                <h3 className="text-base font-extrabold text-slate-900">Individual Recruiter Daily Time Log</h3>
                <span className="text-xs font-bold text-slate-500">Live Time Tracking Active</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-[#F1F5F9] text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-4">Recruiter</th>
                      <th className="px-4 py-4 text-center">Time Spent Today</th>
                      <th className="px-4 py-4 text-center">Hours This Week</th>
                      <th className="px-4 py-4 text-center">Avg Time / Resume</th>
                      <th className="px-4 py-4 text-center">Avg Time / Screening Call</th>
                      <th className="px-4 py-4 text-center">Resumes Seen / Hr</th>
                      <th className="px-6 py-4 text-right">Daily Breakdown</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recruiters.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-900 text-sm">{r.name}</div>
                          <div className="text-slate-500 text-[11px]">{r.team}</div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
                            ⏱️ {r.todayHoursSpent} hrs
                          </span>
                        </td>

                        <td className="px-4 py-4 text-center font-black text-slate-900 text-sm">
                          {r.totalHoursThisWeek} hrs
                        </td>

                        <td className="px-4 py-4 text-center font-bold text-blue-600">
                          {r.avgTimePerResume || '1.8 min'}
                        </td>

                        <td className="px-4 py-4 text-center font-bold text-amber-600">
                          {r.avgTimePerScreen}
                        </td>

                        <td className="px-4 py-4 text-center font-black text-emerald-600">
                          ~{Math.round(r.resumesSeen / (r.totalHoursThisWeek || 30))} CVs/hr
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedRecruiter(r);
                              setShowRecruiterModal(true);
                            }}
                            className="px-3.5 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-brand-orange transition-all cursor-pointer"
                          >
                            View Day-by-Day Log →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: RECRUITER PERFORMANCE LEADERBOARD ── */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 sm:px-6 sm:py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="text"
                  placeholder="Search recruiters by name, email, or pod..."
                  value={searchRecruiter}
                  onChange={e => setSearchRecruiter(e.target.value)}
                  className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 w-full sm:w-80"
                />

                <select
                  value={podFilter}
                  onChange={e => setPodFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                >
                  <option value="All">All Pods</option>
                  <option value="SAP & Enterprise Practice">SAP &amp; Enterprise Practice</option>
                  <option value="Cloud & Engineering Pod">Cloud &amp; Engineering Pod</option>
                  <option value="Finance & Operations TA">Finance &amp; Operations TA</option>
                </select>
              </div>

              <span className="text-xs text-slate-500 font-bold">{filteredRecruiters.length} Recruiter Profiles Active</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F1F5F9] text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Recruiter / Team Member</th>
                    <th className="px-4 py-4">Assigned Pod</th>
                    <th className="px-4 py-4 text-center">JDs Uploaded</th>
                    <th className="px-4 py-4 text-center">Resumes Seen</th>
                    <th className="px-4 py-4 text-center">Hours Active</th>
                    <th className="px-4 py-4 text-center">Screened/Wk</th>
                    <th className="px-4 py-4 text-center">Shortlists</th>
                    <th className="px-4 py-4 text-center">Avg Match Fit</th>
                    <th className="px-6 py-4 text-right">Performance Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecruiters.map((r, i) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-orange-pale text-brand-orange font-black text-xs flex items-center justify-center flex-shrink-0">
                            {r.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                              <span>{r.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                                {r.role === 'TEAM_LEAD' ? 'Team Lead' : 'TA Member'}
                              </span>
                            </div>
                            <div className="text-slate-400 text-[11px] mt-0.5">{r.email} • {r.lastActive}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-semibold text-slate-700">{r.team}</td>

                      <td className="px-4 py-4 text-center font-black text-slate-900 text-sm">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-50 text-brand-orange border border-orange-200/80">
                          {r.jdsUploaded} JDs
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center font-black text-blue-600 text-sm">
                        {r.resumesSeen} CVs
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
                          ⏱️ {r.todayHoursSpent}h today
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center font-bold text-slate-800">
                        {r.screenedThisWeek}
                      </td>

                      <td className="px-4 py-4 text-center font-black text-emerald-600 text-sm">
                        {r.tlApprovedCount}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.avgMatchScore}% Fit
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedRecruiter(r);
                            setShowRecruiterModal(true);
                          }}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                        >
                          Review Activity →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 4: REQUISITIONS OVERSIGHT RADAR ── */}
        {activeTab === 'requisitions' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-5 sm:px-6 sm:py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">All Company Requisitions Radar</h3>
                <p className="text-xs text-slate-500 mt-0.5">Track every uploaded job description, candidate resume volume, and aging status</p>
              </div>

              <input
                type="text"
                placeholder="Search job requisitions or assigned recruiters..."
                value={searchJob}
                onChange={e => setSearchJob(e.target.value)}
                className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 w-full sm:w-80"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F1F5F9] text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Position &amp; Client</th>
                    <th className="px-4 py-4">Assigned TA Member</th>
                    <th className="px-4 py-4">Assigned Pod</th>
                    <th className="px-4 py-4 text-center">Resumes Processed</th>
                    <th className="px-4 py-4 text-center">Top ATS Score</th>
                    <th className="px-4 py-4 text-center">Aging / SLA</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/jobs/${job.id}`} className="font-extrabold text-slate-900 hover:text-brand-orange text-sm block">
                          {job.title}
                        </Link>
                        <div className="text-slate-500 text-[11px] mt-0.5">{job.client} • {job.location} ({job.mode})</div>
                      </td>

                      <td className="px-4 py-4">
                        {job.workedBy && job.workedBy.length > 1 ? (
                          <div className="relative group/team inline-block">
                            <div className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-xl hover:bg-slate-100/90 transition-all">
                              <div className="flex -space-x-2 overflow-hidden items-center">
                                {job.workedBy.slice(0, 3).map((w, idx) => {
                                  const initials = w.name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2) || 'TA';
                                  const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-blue-600', 'bg-rose-600'];
                                  return (
                                    <div
                                      key={w.id || idx}
                                      title={`${w.name} (${w.action || w.role || 'Member'})`}
                                      className={`w-6 h-6 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-black text-white shadow-xs shrink-0 ${colors[idx % colors.length]}`}
                                    >
                                      {initials}
                                    </div>
                                  );
                                })}
                                {job.workedBy.length > 3 && (
                                  <div className="w-6 h-6 rounded-full ring-2 ring-white bg-slate-800 text-white flex items-center justify-center text-[9px] font-bold shadow-xs shrink-0">
                                    +{job.workedBy.length - 3}
                                  </div>
                                )}
                              </div>
                              <div className="text-left">
                                <div className="text-xs font-bold text-slate-800 leading-tight">
                                  {job.workedBy[0].name.split(' ')[0]} <span className="text-slate-400 font-semibold">& {job.workedBy.length - 1} more</span>
                                </div>
                                <div className="text-[10px] font-semibold text-brand-orange">
                                  {job.workedBy.length} Assigned
                                </div>
                              </div>
                            </div>

                            {/* Dropdown Popover on Hover */}
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover/team:block z-50 w-64 bg-slate-900 text-white rounded-2xl p-3 shadow-2xl border border-slate-700 pointer-events-none">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 border-b border-slate-800 pb-1 flex justify-between">
                                <span>Assigned TA Team</span>
                                <span className="text-brand-orange font-bold">{job.workedBy.length} Members</span>
                              </div>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {job.workedBy.map((w, idx) => (
                                  <div key={w.id || idx} className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                                      {w.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                                        <span>{w.name}</span>
                                        {w.isCreator && <span className="text-[8px] px-1 py-0.2 bg-amber-500/20 text-amber-300 rounded">Owner</span>}
                                      </div>
                                      <div className="text-[10px] text-slate-400 truncate">{w.action || w.role}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-[9px] font-black shrink-0 shadow-xs">
                              {(job.assignedRecruiter || 'TA').slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-800 text-xs truncate max-w-[130px]">{job.assignedRecruiter}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-600 font-medium">
                        {job.pod}
                      </td>

                      <td className="px-4 py-4 text-center font-black text-blue-600 text-sm">
                        {job.candidates} CVs
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {job.topScore}% Fit
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        {job.createdAtDaysAgo >= 25 ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                            ⚠️ Aging ({job.createdAtDaysAgo}d)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Optimal ({job.createdAtDaysAgo}d)
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/jobs/${job.id}/candidates`}
                          className="px-3.5 py-1.5 bg-slate-100 hover:bg-brand-orange hover:text-white text-slate-700 text-xs font-bold rounded-xl transition-all"
                        >
                          View Candidate Pool →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 5: LIVE COMPLIANCE & AUDIT STREAM ── */}
        {activeTab === 'audit' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Real-Time Team Activity &amp; Audit Trail</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tamper-evident system event log capturing JD creation, candidate uploads, score checks, and screening decisions</p>
              </div>

              <input
                type="text"
                placeholder="Filter audit events..."
                value={searchAudit}
                onChange={e => setSearchAudit(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 w-full sm:w-64"
              />
            </div>

            <div className="divide-y divide-slate-100">
              {filteredAudit.map(evt => (
                <div key={evt.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-black text-slate-900 text-sm">{evt.user}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        evt.action === 'JOB_CREATED' ? 'bg-orange-50 text-brand-orange border border-orange-200' :
                        evt.action === 'RESUMES_UPLOADED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        evt.action === 'TL_APPROVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'bg-violet-50 text-violet-700 border border-violet-200'
                      }`}>
                        {evt.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">{evt.detail}</p>
                    <span className="text-[11px] text-slate-400 font-semibold block">Target: {evt.target}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-bold whitespace-nowrap sm:self-start bg-slate-100 px-2.5 py-1 rounded-lg">
                    {evt.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 6: ATS RULES & GOVERNANCE ── */}
        {activeTab === 'governance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Global ATS Quality Parameters */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Organization-Wide Evaluation Rules</h3>
                <p className="text-xs text-slate-500 mt-1">Configure global quality thresholds and mandatory rule compliance parameters</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block font-bold text-slate-800 mb-1">
                    Automatic Client Submission Threshold: <strong className="text-brand-orange">{autoSubmitThreshold}%</strong>
                  </label>
                  <p className="text-slate-500 mb-3 text-[11px]">
                    Candidates scoring above this threshold are marked &quot;SUBMIT&quot; and ready for interview without requiring mandatory Team Lead escalation.
                  </p>
                  <input
                    type="range"
                    min="70"
                    max="95"
                    value={autoSubmitThreshold}
                    onChange={e => setAutoSubmitThreshold(parseInt(e.target.value))}
                    className="w-full accent-brand-orange cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800">Strict Mandatory Criteria Gate</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      When enabled, any candidate failing even 1 mandatory criterion automatically triggers Team Lead QA review.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStrictMandatoryMode(v => !v)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${strictMandatoryMode ? 'bg-brand-orange' : 'bg-slate-300'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${strictMandatoryMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Role & Access Governance */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">User Access &amp; Roles</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Manage permissions between TA Team Members and Admins</p>
                </div>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-3 py-1.5 bg-brand-orange text-white text-xs font-bold rounded-xl"
                >
                  + Invite Member
                </button>
              </div>

              <div className="space-y-3">
                {recruiters.map(r => (
                  <div key={r.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{r.name}</span>
                      <span className="text-[11px] text-slate-500">{r.email} • {r.team}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      r.role === 'ADMIN' ? 'bg-violet-100 text-violet-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {r.role === 'ADMIN' ? '👑 Admin' : '👤 TA Member'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: RECRUITER ACTIVITY & TIME DRILL-DOWN ── */}
        {showRecruiterModal && selectedRecruiter && (
          <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-orange text-white font-black text-lg flex items-center justify-center">
                    {selectedRecruiter.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{selectedRecruiter.name} — Detailed Time &amp; Activity Log</h3>
                    <p className="text-xs text-slate-500">{selectedRecruiter.email} • {selectedRecruiter.team}</p>
                  </div>
                </div>
                <button onClick={() => setShowRecruiterModal(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1">✕</button>
              </div>

              <div className="space-y-5 text-xs">
                {/* 4 Metric Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-purple-50 rounded-2xl border border-purple-200">
                    <span className="text-[10px] text-purple-600 font-black uppercase block">TODAY&apos;S TIME</span>
                    <span className="text-lg font-black text-purple-900">{selectedRecruiter.todayHoursSpent} Hours</span>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                    <span className="text-[10px] text-blue-600 font-black uppercase block">RESUMES SEEN</span>
                    <span className="text-lg font-black text-blue-900">{selectedRecruiter.resumesSeen} CVs</span>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-2xl border border-orange-200">
                    <span className="text-[10px] text-brand-orange font-black uppercase block">JDs UPLOADED</span>
                    <span className="text-lg font-black text-slate-900">{selectedRecruiter.jdsUploaded} Positions</span>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-600 font-black uppercase block">AVG SPEED</span>
                    <span className="text-lg font-black text-emerald-900">{selectedRecruiter.avgTimePerResume || '1.8 min'}/CV</span>
                  </div>
                </div>

                {/* Day by Day Time Log Table */}
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                    📅 Daily Time Spent Breakdown (Past 5 Days)
                  </h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/50">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100 text-[10px] font-black text-slate-500 uppercase">
                          <th className="p-3">Day / Date</th>
                          <th className="p-3 text-center">Total Hours</th>
                          <th className="p-3 text-center">Resumes Evaluated</th>
                          <th className="p-3 text-center">Screening Calls</th>
                          <th className="p-3 text-center">JDs Uploaded</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/80 bg-white">
                        {(selectedRecruiter.dailyTimeLogs || [
                          { day: 'Mon', date: 'Aug 28', hoursSpent: 6.8, resumesReviewedCount: 38, resumesTimeHours: 3.4, screeningsCount: 10, screeningTimeHours: 2.2, jdsUploadedCount: 1, jdTimeHours: 1.2 },
                          { day: 'Tue', date: 'Aug 29', hoursSpent: 7.2, resumesReviewedCount: 42, resumesTimeHours: 3.8, screeningsCount: 12, screeningTimeHours: 2.4, jdsUploadedCount: 2, jdTimeHours: 1.0 },
                          { day: 'Wed', date: 'Aug 30', hoursSpent: 6.5, resumesReviewedCount: 36, resumesTimeHours: 3.2, screeningsCount: 9, screeningTimeHours: 2.1, jdsUploadedCount: 1, jdTimeHours: 1.2 },
                          { day: 'Thu', date: 'Aug 31', hoursSpent: 5.9, resumesReviewedCount: 34, resumesTimeHours: 3.0, screeningsCount: 8, screeningTimeHours: 1.9, jdsUploadedCount: 1, jdTimeHours: 1.0 },
                          { day: 'Fri', date: 'Sep 01', hoursSpent: 6.4, resumesReviewedCount: 34, resumesTimeHours: 3.1, screeningsCount: 9, screeningTimeHours: 2.1, jdsUploadedCount: 1, jdTimeHours: 1.2 },
                        ]).map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-3 font-bold text-slate-800">
                              {log.day}, {log.date}
                            </td>
                            <td className="p-3 text-center font-black text-purple-700">
                              {log.hoursSpent} hrs
                            </td>
                            <td className="p-3 text-center text-slate-700">
                              <strong>{log.resumesReviewedCount} CVs</strong> <span className="text-slate-400">({log.resumesTimeHours}h)</span>
                            </td>
                            <td className="p-3 text-center text-slate-700">
                              <strong>{log.screeningsCount} calls</strong> <span className="text-slate-400">({log.screeningTimeHours}h)</span>
                            </td>
                            <td className="p-3 text-center text-slate-700">
                              <strong>{log.jdsUploadedCount} JDs</strong> <span className="text-slate-400">({log.jdTimeHours}h)</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Activity List */}
                <div>
                  <h4 className="font-black text-slate-900 uppercase text-[11px] tracking-wider mb-2">
                    Recent Operations with Time Estimates
                  </h4>
                  <div className="space-y-2">
                    {(selectedRecruiter.recentActivity || ['Screened Michael Chen for SAP CO (18 min)', 'Uploaded 32 candidate resumes (Took 1.2 hrs)', 'Created SAP Requisition (Took 45 min)']).map((act, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setShowRecruiterModal(false)}
                    className="px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl"
                  >
                    Close Log
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: INVITE TEAM MEMBER ── */}
        {showInviteModal && (
          <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-900">Invite TA Team Member</h3>
                <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
              </div>

              <form onSubmit={handleInvite} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rachel Adams"
                    value={inviteName}
                    onChange={e => setInviteName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tasknera Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="rachel.a@tasknera.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Assignment</label>
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/30 font-bold"
                  >
                    <option value="RECRUITER_MEMBER">👤 TA Team Member (Operational ATS User)</option>
                    <option value="ADMIN">👑 System Admin (Performance Review &amp; Governance)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pod / Team</label>
                  <select
                    value={inviteTeam}
                    onChange={e => setInviteTeam(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                  >
                    <option value="SAP & Enterprise Practice">SAP &amp; Enterprise Practice</option>
                    <option value="Cloud & Engineering Pod">Cloud &amp; Engineering Pod</option>
                    <option value="Finance & Operations TA">Finance &amp; Operations TA</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold rounded-xl shadow-orange"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
}
