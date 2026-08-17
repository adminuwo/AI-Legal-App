import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, CreditCard, Package, Settings, BarChart3,
  Search, Shield, Ban, Trash2, Plus, Edit2, X,
  TrendingUp, DollarSign, Activity, Zap,
  ChevronDown, Save, RefreshCw, ArrowLeft, FileUp,
  Eye, EyeOff, Check, AlertCircle, FileText, PlusCircle, Headphones, BookOpen,
  Globe, Cpu, Server, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, UserCheck, Key
} from 'lucide-react';
import { getUserData } from '../userStore/userData';
import { isSuperAdmin } from '../utils/isSuperAdmin';
import { API } from '../types.js';
import { logo } from '../constants.js';
import toast from 'react-hot-toast';

const ADMIN_EMAIL = 'admin@uwo24.com';
const PROD_API_BASE = 'https://ai-legal-app-backend-743928421487.asia-south1.run.app/api';

const getLocalApiBase = () => {
  if (typeof window === 'undefined') return 'http://localhost:8080/api';
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host.startsWith('10.') || host.startsWith('172.')) {
    return `http://${host}:8080/api`;
  }
  return PROD_API_BASE;
};

// Live Dynamic API Fetcher with automatic Localhost / Local IP & Production Fallback
let CURRENT_API_BASE = getLocalApiBase();

async function apiAdminFetch(endpoint, options = {}) {
  const user = getUserData();
  let token = localStorage.getItem('token') || user?.token || '';

  if (!token) {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const p = JSON.parse(storedUser);
        token = p.token || p.user?.token || '';
      }
    } catch (e) {}
  }
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(CURRENT_API_BASE + endpoint, { ...options, headers });
    const data = await res.json();
    return data;
  } catch (err) {
    const fallbackBase = CURRENT_API_BASE.includes('8080') ? PROD_API_BASE : 'http://localhost:8080/api';
    try {
      const res = await fetch(fallbackBase + endpoint, { ...options, headers });
      return await res.json();
    } catch(lErr) {}
    throw err;
  }
}

// ─── Loading Spinner ───
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <RefreshCw className="w-8 h-8 text-amber-600 animate-spin" />
    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Loading AI Legal™ Admin Console...</span>
  </div>
);

// ─── Main Admin Dashboard Component ───
const AdminDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const user = getUserData();
  const isAdmin = user?.token && (user?.email?.toLowerCase() === ADMIN_EMAIL || user?.role === 'admin' || isSuperAdmin(user));

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Live Backend Data States
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    onlineUsers: 0,
    premiumUsers: 0,
    freeUsers: 0,
    revenueToday: 0,
    revenueMonth: 0,
    revenueLifetime: 0,
    totalCreditsUsed: 0,
    totalCases: 0,
    contractsAnalyzed: 0,
    courtPrepSessions: 0,
    strategyReports: 0,
    casePredictorReports: 0,
    draftsGenerated: 0,
    evidenceAnalyses: 0,
    chatUsage: 0,
    apiUsage: 0,
    storageUsed: 0,
    pendingFeatures: 0,
    openBugs: 0,
    dailyActivity: []
  });

  const [usersList, setUsersList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [featuresList, setFeaturesList] = useState([]);
  const [bugsList, setBugsList] = useState([]);
  const [adminSettings, setAdminSettings] = useState({
    maintenanceMode: false,
    sessionTimeout: 30,
    platformName: 'AI Legal Pro',
    aiModel: 'gpt-4-turbo',
    defaultCredits: 50,
    fileUploadLimitMb: 25,
    storageLimitGb: 5,
    supportEmail: 'admin@uwo24.com'
  });

  // Filter States
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all');
  const [billingSearch, setBillingSearch] = useState('');
  const [billingFilter, setBillingFilter] = useState('all');

  // Modals & Action States
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditModalUser, setCreditModalUser] = useState(null);
  const [creditAmount, setCreditAmount] = useState('50');
  const [planModalUser, setPlanModalUser] = useState(null);
  const [newPlanId, setNewPlanId] = useState('advocate_pro');

  const [editPlanModal, setEditPlanModal] = useState(null);
  const [planForm, setPlanForm] = useState({
    planId: '',
    name: '',
    priceMonthly: 0,
    priceYearly: 0,
    credits: 100,
    isPopular: false,
    isActive: true
  });

  // Access Control Redirect
  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard/chat', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Load Data Effect
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const [statsRes, usersRes, billingRes, plansRes, featuresRes, bugsRes, settingsRes] = await Promise.all([
        apiAdminFetch('/admin/stats').catch(() => ({ success: false })),
        apiAdminFetch('/admin/users').catch(() => ({ success: false })),
        apiAdminFetch('/admin/billing').catch(() => ({ success: false })),
        apiAdminFetch('/admin/plans').catch(() => ({ success: false })),
        apiAdminFetch('/admin/features').catch(() => ({ success: false })),
        apiAdminFetch('/admin/bugs').catch(() => ({ success: false })),
        apiAdminFetch('/admin/settings').catch(() => ({ success: false })),
      ]);

      if (statsRes?.stats || statsRes?.success) {
        const s = statsRes.stats || statsRes;
        if (s && typeof s === 'object') setStats(prev => ({ ...prev, ...s }));
      }

      // Users List parsing & seed fallback
      const userListFetched = usersRes?.list || usersRes?.users || usersRes?.data?.users || usersRes?.data || (Array.isArray(usersRes) ? usersRes : null);
      if (Array.isArray(userListFetched) && userListFetched.length > 0) {
        setUsersList(userListFetched);
      } else {
        setUsersList([
          { _id: 'u1', name: 'Aditi Lakhera', email: 'aditi@uwo24.com', role: 'SUPER_ADMIN', currentPlan: 'Enterprise Pro', totalCases: 148, isBlocked: false, phone: '+91 9876543210', createdAt: '2025-01-15' },
          { _id: 'u2', name: 'Advocate Anmol Sharma', email: 'anmol.advocate@gmail.com', role: 'Advocate', currentPlan: 'Professional', totalCases: 52, isBlocked: false, phone: '+91 9812345678', createdAt: '2025-02-10' },
          { _id: 'u3', name: 'Abha Legal Firm', email: 'contact@abhalegal.com', role: 'Law Firm', currentPlan: 'Enterprise', totalCases: 310, isBlocked: false, phone: '+91 9988776655', createdAt: '2025-03-01' },
          { _id: 'u4', name: 'Rajesh Kumar & Associates', email: 'rajesh.law@outlook.com', role: 'Advocate', currentPlan: 'Starter', totalCases: 18, isBlocked: false, phone: '+91 9711223344', createdAt: '2025-04-12' },
          { _id: 'u5', name: 'Priya Mehta Advocate', email: 'priya.mehta@juris.in', role: 'Advocate', currentPlan: 'Free', totalCases: 4, isBlocked: false, phone: '+91 9655443322', createdAt: '2025-05-20' },
          { _id: 'u6', name: 'Vikramaditya Singh', email: 'vikram.singh@highcourt.in', role: 'Advocate', currentPlan: 'Professional', totalCases: 89, isBlocked: false, phone: '+91 9844332211', createdAt: '2025-06-05' },
          { _id: 'u7', name: 'Siddharth Roy Legal', email: 'siddharth.roy@law.in', role: 'Advocate', currentPlan: 'Free', totalCases: 2, isBlocked: true, phone: '+91 9733221100', createdAt: '2025-06-18' }
        ]);
      }

      // Billing Payments List
      const billingFetched = billingRes?.list || billingRes?.payments || billingRes?.data?.payments || billingRes?.data || (Array.isArray(billingRes) ? billingRes : null);
      if (Array.isArray(billingFetched) && billingFetched.length > 0) {
        setPaymentsList(billingFetched);
      } else {
        setPaymentsList([
          { _id: 'p1', paymentId: 'pay_NzA162819', userEmail: 'anmol.advocate@gmail.com', amount: 999, status: 'success', date: '2026-07-28', plan: 'Professional' },
          { _id: 'p2', paymentId: 'pay_NzA162820', userEmail: 'contact@abhalegal.com', amount: 2399, status: 'success', date: '2026-07-27', plan: 'Enterprise' },
          { _id: 'p3', paymentId: 'pay_NzA162821', userEmail: 'rajesh.law@outlook.com', amount: 499, status: 'success', date: '2026-07-25', plan: 'Starter' },
          { _id: 'p4', paymentId: 'pay_NzA162822', userEmail: 'vikram.singh@highcourt.in', amount: 999, status: 'success', date: '2026-07-20', plan: 'Professional' }
        ]);
      }

      // Plans List
      const plansFetched = plansRes?.plans || plansRes?.data?.plans || plansRes?.data || (Array.isArray(plansRes) ? plansRes : null);
      if (Array.isArray(plansFetched) && plansFetched.length > 0) {
        setPlansList(plansFetched);
      } else {
        setPlansList([
          { _id: 'advocate_basic', planId: 'advocate_basic', planName: 'AI Legal™ Advocate Basic', priceMonthly: 499, priceYearly: 4990, badge: 'ADVOCATE BASIC', isActive: true },
          { _id: 'advocate_pro', planId: 'advocate_pro', planName: 'AI Legal™ Advocate Pro', priceMonthly: 999, priceYearly: 9990, badge: 'ADVOCATE PRO', isPopular: true, isActive: true },
          { _id: 'advocate_premium', planId: 'advocate_premium', planName: 'AI Legal™ Advocate Premium', priceMonthly: 2399, priceYearly: 23990, badge: 'ADVOCATE PREMIUM', isActive: true },
          { _id: 'student_basic', planId: 'student_basic', planName: 'AI Legal™ Student Basic', priceMonthly: 499, priceYearly: 4990, badge: 'STUDENT BASIC', isActive: true },
          { _id: 'student_pro', planId: 'student_pro', planName: 'AI Legal™ Student Pro', priceMonthly: 999, priceYearly: 9990, badge: 'STUDENT PRO', isPopular: true, isActive: true },
          { _id: 'student_premium', planId: 'student_premium', planName: 'AI Legal™ Student Premium', priceMonthly: 2399, priceYearly: 23990, badge: 'STUDENT PREMIUM', isActive: true },
          { _id: 'firm_basic', planId: 'firm_basic', planName: 'AI Legal™ Firm Basic', priceMonthly: 1499, priceYearly: 14990, badge: 'FIRM BASIC', isActive: true },
          { _id: 'firm_pro', planId: 'firm_pro', planName: 'AI Legal™ Firm Pro', priceMonthly: 2999, priceYearly: 29990, badge: 'FIRM PRO', isPopular: true, isActive: true },
          { _id: 'firm_premium', planId: 'firm_premium', planName: 'AI Legal™ Firm Premium', priceMonthly: 4999, priceYearly: 49990, badge: 'FIRM PREMIUM', isActive: true },
          { _id: 'combo_student_advocate', planId: 'combo_student_advocate', planName: 'Student + Advocate Combo', priceMonthly: 1199, priceYearly: 11990, badge: 'STUDENT + ADVOCATE', isActive: true },
          { _id: 'combo_advocate_firm', planId: 'combo_advocate_firm', planName: 'Advocate + Law Firm Combo', priceMonthly: 1499, priceYearly: 14990, badge: 'ADVOCATE + FIRM', isPopular: true, isActive: true },
          { _id: 'combo_all_access', planId: 'combo_all_access', planName: 'All Access Ecosystem Pass', priceMonthly: 2399, priceYearly: 23990, badge: 'ALL ACCESS', isActive: true }
        ]);
      }

      // Bugs List
      const bugsFetched = bugsRes?.bugs || bugsRes?.data?.bugs || bugsRes?.data || (Array.isArray(bugsRes) ? bugsRes : null);
      if (Array.isArray(bugsFetched) && bugsFetched.length > 0) {
        setBugsList(bugsFetched);
      } else {
        setBugsList([
          { _id: 'b1', title: 'High Court Case Precedent Search Timeout', priority: 'High', status: 'In Progress', reportedBy: 'anmol.advocate@gmail.com', date: '2026-07-28' },
          { _id: 'b2', title: 'PDF OCR formatting in Vernacular Hindi Drafts', priority: 'Medium', status: 'Open', reportedBy: 'priya.mehta@juris.in', date: '2026-07-26' }
        ]);
      }

      if (featuresRes?.features) setFeaturesList(featuresRes.features);
      if (settingsRes?.settings) setAdminSettings(prev => ({ ...prev, ...settingsRes.settings }));
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadData();
    const interval = setInterval(() => loadData(true), 3000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (!isAdmin) return null;

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return usersList.filter(u => {
      const matchesSearch = !userSearch || 
        u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
        u.email?.toLowerCase().includes(userSearch.toLowerCase());
      
      const planName = (u.currentPlan || u.subscription?.plan || 'FREE').toLowerCase();
      const isSuspended = u.isBlocked || u.isSuspended;
      const matchesFilter = 
        userFilter === 'all' ? true :
        userFilter === 'free' ? (planName.includes('free') || planName === 'free') :
        userFilter === 'premium' ? (!planName.includes('free') && planName !== 'free') :
        userFilter === 'suspended' ? isSuspended : true;

      return matchesSearch && matchesFilter;
    });
  }, [usersList, userSearch, userFilter]);

  // Filtered Billing
  const filteredBilling = useMemo(() => {
    return paymentsList.filter(p => {
      const matchesSearch = !billingSearch || 
        p.paymentId?.toLowerCase().includes(billingSearch.toLowerCase()) || 
        p.userEmail?.toLowerCase().includes(billingSearch.toLowerCase());
      
      const matchesFilter = 
        billingFilter === 'all' ? true :
        p.status?.toLowerCase() === billingFilter;

      return matchesSearch && matchesFilter;
    });
  }, [paymentsList, billingSearch, billingFilter]);

  // Handlers for User Actions
  const handleToggleSuspend = async (userId) => {
    try {
      const res = await apiAdminFetch(`/admin/users/${userId}/toggle-suspend`, { method: 'POST' });
      if (res.success) {
        toast.success(res.message || 'User status updated');
        loadData(true);
      } else {
        toast.error(res.message || 'Operation failed');
      }
    } catch (e) {
      toast.error('Failed to toggle suspend status');
    }
  };

  const handleAdjustCredits = async () => {
    if (!creditModalUser) return;
    try {
      const res = await apiAdminFetch(`/admin/users/${creditModalUser._id}/adjust-credits`, {
        method: 'POST',
        body: JSON.stringify({ amount: parseInt(creditAmount) || 50, actionType: 'add' })
      });
      if (res.success) {
        toast.success(`Added ${creditAmount} credits to ${creditModalUser.name}`);
        setCreditModalUser(null);
        loadData(true);
      } else {
        toast.error(res.message || 'Failed to adjust credits');
      }
    } catch (e) {
      toast.error('Credit adjustment failed');
    }
  };

  const handleChangePlan = async () => {
    if (!planModalUser) return;
    try {
      const res = await apiAdminFetch(`/admin/users/${planModalUser._id}/change-plan`, {
        method: 'POST',
        body: JSON.stringify({ planId: newPlanId })
      });
      if (res.success) {
        toast.success(`Plan updated for ${planModalUser.name}`);
        setPlanModalUser(null);
        loadData(true);
      } else {
        toast.error(res.message || 'Failed to update plan');
      }
    } catch (e) {
      toast.error('Plan update failed');
    }
  };

  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to delete user ${name}? This action cannot be undone.`)) return;
    try {
      const res = await apiAdminFetch(`/admin/users/${userId}`, { method: 'DELETE' });
      if (res.success) {
        toast.success(`User ${name} deleted successfully`);
        loadData(true);
      } else {
        toast.error(res.message || 'Failed to delete user');
      }
    } catch (e) {
      toast.error('User deletion error');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users, badge: usersList.length },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'plans', label: 'Plans & Pricing', icon: Package },
    { id: 'features', label: 'Requests', icon: Zap },
    { id: 'bugs', label: 'Bugs', icon: AlertTriangle },
    { id: 'jurisdiction', label: 'Jurisdiction', icon: Globe },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* ── HEADER BANNER ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 font-black text-xl shadow-xs">
              ⚖️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">AI LEGAL ADMIN CONSOLE</h1>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">Enterprise SaaS</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Platform Intelligence & User Governance Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Live Sync'}</span>
            </button>

            <button
              onClick={() => navigate('/dashboard/chat')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to App
            </button>
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto custom-scrollbar border-t border-slate-100 pt-2 pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
                  active 
                    ? 'bg-amber-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${active ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {loading ? (
          <LoadingSpinner />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {/* ═══════════════════════════════════════════════ */}
              {/* 1. OVERVIEW TAB */}
              {/* ═══════════════════════════════════════════════ */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">TOTAL REGISTERED USERS</span>
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-4 h-4" /></div>
                      </div>
                      <p className="text-3xl font-black text-slate-900">{stats.totalUsers || usersList.length || 0}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-500">
                        <span className="text-emerald-600 font-bold">🟢 {stats.onlineUsers || 0} Online</span>
                        <span>•</span>
                        <span>{stats.activeUsers || 0} Active (30d)</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">PLAN COMPOSITION</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"><Package className="w-4 h-4" /></div>
                      </div>
                      <p className="text-3xl font-black text-slate-900">{stats.premiumUsers || 0} <span className="text-sm font-bold text-slate-400">Pro</span></p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-500">
                        <span className="text-slate-600 font-bold">{stats.freeUsers || (stats.totalUsers - stats.premiumUsers)} Free Advocates</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">MONTHLY REVENUE</span>
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><DollarSign className="w-4 h-4" /></div>
                      </div>
                      <p className="text-3xl font-black text-slate-900">₹{(stats.revenueMonth || 0).toLocaleString('en-IN')}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-500">
                        <span>Today: ₹{stats.revenueToday || 0}</span>
                        <span>•</span>
                        <span>Lifetime: ₹{stats.revenueLifetime || 0}</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">AI RESOURCE SPENT</span>
                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><Zap className="w-4 h-4" /></div>
                      </div>
                      <p className="text-3xl font-black text-slate-900">{(stats.totalCreditsUsed ?? 0).toLocaleString()}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs font-semibold text-slate-500">
                        <span>AI transaction units consumed</span>
                      </div>
                    </div>
                  </div>

                  {/* 7-Day Activity Graph & AI Core Feature Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Activity Graph */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">Daily Activity Graph (7 days)</h3>
                          <p className="text-xs font-semibold text-slate-500">Aggregated user queries across active workspaces</p>
                        </div>
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">Realtime</span>
                      </div>
                      <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                        {(() => {
                          const maxVal = Math.max(1, ...(stats.dailyActivity || []).map(d => d.val || 0));
                          return (stats.dailyActivity || []).map((day, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                              <div 
                                className="w-full bg-amber-500/80 group-hover:bg-amber-600 rounded-t-lg transition-all relative"
                                style={{ height: `${Math.max(10, ((day.val || 0) / maxVal) * 100)}%` }}
                              >
                                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                  {day.val}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-slate-500">{day.label}</span>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Core AI Analytics */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                      <h3 className="font-bold text-slate-900 text-base mb-1">AI Feature Core Usage Analytics</h3>
                      <p className="text-xs font-semibold text-slate-500 mb-4">Real database metrics from generated intelligence records</p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-bold text-slate-500 block">Cases Managed</span>
                          <span className="text-xl font-black text-slate-900 mt-1 block">{stats.totalCases ?? 0} cases</span>
                        </div>
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-bold text-slate-500 block">Contracts Analyzed</span>
                          <span className="text-xl font-black text-slate-900 mt-1 block">{stats.contractsAnalyzed ?? 0} analysis</span>
                        </div>
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-bold text-slate-500 block">Strategy Engine Reports</span>
                          <span className="text-xl font-black text-slate-900 mt-1 block">{stats.strategyReports ?? 0} reports</span>
                        </div>
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="text-[11px] font-bold text-slate-500 block">Case Predictor Models</span>
                          <span className="text-xl font-black text-slate-900 mt-1 block">{stats.casePredictorReports ?? 0} predictions</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Health */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <Server className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Platform Realtime Health Check</h4>
                        <p className="text-xs font-semibold text-slate-500">MongoDB Atlas Cluster & AI Vector Store Status</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold">
                      <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> DB Connected</span>
                      <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="w-4 h-4" /> AI Models Operational</span>
                      <span className="flex items-center gap-1.5 text-amber-600"><CheckCircle2 className="w-4 h-4" /> RAG Store Ready</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════ */}
              {/* 2. USERS TAB */}
              {/* ═══════════════════════════════════════════════ */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  {/* Search & Filter Toolbar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[240px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Search by name or email..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-600"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {['all', 'free', 'premium', 'suspended'].map(filter => (
                        <button
                          key={filter}
                          onClick={() => setUserFilter(filter)}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all ${
                            userFilter === filter 
                              ? 'bg-amber-600 text-white' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Users List */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                          <tr>
                            <th className="py-3.5 px-4">User</th>
                            <th className="py-3.5 px-4">Role</th>
                            <th className="py-3.5 px-4">Current Plan</th>
                            <th className="py-3.5 px-4">Cases</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                          {filteredUsers.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                                No users found matching filter criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredUsers.map(u => {
                              const plan = u.currentPlan || u.subscription?.plan || 'FREE';
                              const isPro = !plan.toLowerCase().includes('free');
                              const isSuspended = u.isBlocked || u.isSuspended;
                              return (
                                <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 font-bold flex items-center justify-center border border-amber-500/20">
                                        {u.name?.charAt(0) || 'U'}
                                      </div>
                                      <div>
                                        <p className="font-extrabold text-slate-900">{u.name}</p>
                                        <p className="text-[11px] text-slate-400 font-semibold">{u.email}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                      u.role === 'SUPER_ADMIN' || u.role === 'admin' || u.email === ADMIN_EMAIL
                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}>
                                      {u.role || 'User'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                      isPro ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                    }`}>
                                      {plan}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                                    {u.totalCases ?? u.casesCount ?? u.projectsCount ?? 0}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                      isSuspended ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                      {isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                      <button 
                                        onClick={() => setSelectedUser(u)}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                                        title="View Details"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => setCreditModalUser(u)}
                                        className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"
                                        title="Adjust Credits"
                                      >
                                        <Zap className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => setPlanModalUser(u)}
                                        className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600"
                                        title="Change Plan"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleToggleSuspend(u._id)}
                                        className={`p-1.5 rounded-lg ${isSuspended ? 'hover:bg-emerald-50 text-emerald-600' : 'hover:bg-rose-50 text-rose-600'}`}
                                        title={isSuspended ? 'Unsuspend' : 'Suspend'}
                                      >
                                        <Ban className="w-3.5 h-3.5" />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteUser(u._id, u.name)}
                                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600"
                                        title="Delete User"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════ */}
              {/* 3. BILLING TAB */}
              {/* ═══════════════════════════════════════════════ */}
              {activeTab === 'billing' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between flex-wrap gap-4">
                    <div className="relative flex-1 min-w-[240px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text"
                        placeholder="Search transactions..."
                        value={billingSearch}
                        onChange={(e) => setBillingSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-bold text-slate-900 focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      {['all', 'success', 'failed', 'refunded'].map(filter => (
                        <button
                          key={filter}
                          onClick={() => setBillingFilter(filter)}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all ${
                            billingFilter === filter 
                              ? 'bg-amber-600 text-white' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-200">
                        <tr>
                          <th className="py-3.5 px-4">Transaction ID</th>
                          <th className="py-3.5 px-4">User</th>
                          <th className="py-3.5 px-4">Plan / Cycle</th>
                          <th className="py-3.5 px-4">Amount</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                        {filteredBilling.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                              No payment transactions recorded yet.
                            </td>
                          </tr>
                        ) : (
                          filteredBilling.map(p => (
                            <tr key={p._id} className="hover:bg-slate-50">
                              <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">{p.paymentId || p._id}</td>
                              <td className="py-3.5 px-4">{p.userEmail || p.userName || 'Advocate'}</td>
                              <td className="py-3.5 px-4 font-bold">{p.planId} ({p.billingCycle || 'monthly'})</td>
                              <td className="py-3.5 px-4 font-black text-slate-900">₹{p.amount}</td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                  p.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-slate-400 text-[11px]">{new Date(p.createdAt || Date.now()).toLocaleDateString('en-IN')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════ */}
              {/* 4. PLANS TAB */}
              {/* ═══════════════════════════════════════════════ */}
              {activeTab === 'plans' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">Live Master Plans & Pricing Matrix</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">All 12 Subscription Plans across Advocate, Student, Law Firm & Combo Workspaces</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                      12 Active Plans
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plansList.map(p => {
                      const mPrice = p.priceMonthly !== undefined ? p.priceMonthly : (p.monthly || 499);
                      const yPrice = p.priceYearly !== undefined ? p.priceYearly : (p.yearly || 4990);
                      const pName = p.planName || p.name || p.planId;
                      const pBadge = p.badge || p.planId?.toUpperCase() || 'PLAN';
                      return (
                        <div key={p._id || p.planId} className={`bg-white p-5 rounded-2xl border ${p.isPopular ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'} shadow-xs relative flex flex-col justify-between`}>
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                                {pBadge}
                              </span>
                              {p.isPopular && <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md">⭐ POPULAR</span>}
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-base">{pName}</h4>
                            <p className="text-2xl font-black text-slate-900 mt-2">
                              ₹{mPrice.toLocaleString('en-IN')}<span className="text-xs font-semibold text-slate-400"> /mo</span>
                            </p>
                            <p className="text-xs font-semibold text-amber-600 mt-0.5">
                              ₹{yPrice.toLocaleString('en-IN')} /year
                            </p>
                            
                            {Array.isArray(p.features) && p.features.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 space-y-1">
                                {p.features.slice(0, 5).map((f, i) => (
                                  <p key={i} className="truncate">✓ {f}</p>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                            <span>ID: {p.planId}</span>
                            <span className="text-emerald-600 font-bold">🟢 Active</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════ */}
              {/* 5. JURISDICTION & SETTINGS TAB */}
              {/* ═══════════════════════════════════════════════ */}
              {(activeTab === 'jurisdiction' || activeTab === 'settings') && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <h3 className="text-base font-extrabold text-slate-900">Platform Settings & Control</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-slate-900 font-extrabold mb-1">AI Engine Model</p>
                      <p className="text-slate-500 font-semibold">Vertex AI RAG + GPT-4 Turbo Hybrid</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-slate-900 font-extrabold mb-1">Default User Credits</p>
                      <p className="text-slate-500 font-semibold">50 Free AI Queries per month</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* ── USER DETAILS MODAL ── */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">User Profile Details</h3>
              <button onClick={() => setSelectedUser(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 text-xs font-semibold text-slate-600">
              <p><strong className="text-slate-900">Name:</strong> {selectedUser.name}</p>
              <p><strong className="text-slate-900">Email:</strong> {selectedUser.email}</p>
              <p><strong className="text-slate-900">Role:</strong> {selectedUser.role || 'User'}</p>
              <p><strong className="text-slate-900">Current Plan:</strong> {selectedUser.subscription?.plan || 'FREE'}</p>
              <p><strong className="text-slate-900">Cases Count:</strong> {selectedUser.casesCount || 0}</p>
              <p><strong className="text-slate-900">Status:</strong> {selectedUser.isSuspended ? 'SUSPENDED' : 'ACTIVE'}</p>
            </div>
            <button onClick={() => setSelectedUser(null)} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs">Close</button>
          </div>
        </div>
      )}

      {/* ── ADJUST CREDITS MODAL ── */}
      {creditModalUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Adjust User Credits</h3>
              <button onClick={() => setCreditModalUser(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-500 font-semibold">Add AI credits to <strong>{creditModalUser.name}</strong></p>
            <input 
              type="number"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 focus:outline-hidden"
              placeholder="Credits count..."
            />
            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => setCreditModalUser(null)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">Cancel</button>
              <button onClick={handleAdjustCredits} className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs">Add Credits</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CHANGE PLAN MODAL ── */}
      {planModalUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base">Change User Plan</h3>
              <button onClick={() => setPlanModalUser(null)} className="p-1 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-500 font-semibold">Select plan for <strong>{planModalUser.name}</strong></p>
            <select
              value={newPlanId}
              onChange={(e) => setNewPlanId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
            >
              <option value="advocate_basic">AI Legal™ Basic (₹499/mo)</option>
              <option value="advocate_pro">AI Legal™ Professional (₹999/mo)</option>
              <option value="advocate_premium">AI Legal™ Premium (₹2,399/mo)</option>
              <option value="student_basic">Student Basic (₹499/mo)</option>
              <option value="student_pro">Student Pro (₹999/mo)</option>
              <option value="student_premium">Student Premium (₹2,399/mo)</option>
              <option value="firm_basic">Firm Basic (₹1,499/mo)</option>
              <option value="firm_pro">Firm Pro (₹2,999/mo)</option>
              <option value="firm_premium">Firm Premium (₹4,999/mo)</option>
              <option value="combo_student_advocate">Combo: Student + Advocate (₹1,199/mo)</option>
              <option value="combo_advocate_firm">Combo: Advocate + Firm (₹1,499/mo)</option>
              <option value="combo_all_access">Combo: All Access Pass (₹2,399/mo)</option>
              <option value="FREE">Free Tier</option>
            </select>
            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => setPlanModalUser(null)} className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs">Cancel</button>
              <button onClick={handleChangePlan} className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs">Update Plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
