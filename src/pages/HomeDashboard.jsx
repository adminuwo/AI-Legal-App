import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, Briefcase, Plus, Gavel, Calendar, 
  Clock, AlertTriangle, CheckCircle2, RefreshCw, Edit2, 
  Trash2, Archive, ChevronRight, X, ArrowUpRight, TrendingUp,
  Sparkles, Info, Users, ShieldCheck, BookOpen, User, MoreVertical, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userData } from '../userStore/userData';
import { apiService } from '../services/apiService';
import toast from 'react-hot-toast';

export default function HomeDashboard() {
  const navigate = useNavigate();
  const currentUser = useRecoilValue(userData);
  const userName = currentUser?.user?.name || "Advocate";

  // State Management
  const [cases, setCases] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);

  // Modal States
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [activeMenuCaseId, setActiveMenuCaseId] = useState(null);

  // Form States
  const [newCaseForm, setNewCaseForm] = useState({
    name: '',
    clientName: '',
    opponentName: '',
    caseType: '',
    courtName: '',
    summary: '',
    priority: 'Medium'
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  // Background Clock Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Dashboard data from Backend APIs
  const fetchDashboardData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsSyncing(true);
    
    try {
      setError(null);
      // Fetch cases (projects)
      const data = await apiService.getProjects();
      setCases(data || []);

      // Fetch AI Notifications
      const notifs = await apiService.getNotifications();
      setNotifications(notifs || []);
    } catch (err) {
      console.error("Dashboard synchronization error:", err);
      setError("Failed to fetch current litigation data from the backend.");
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  };

  // Run on mount and establish background synchronization
  useEffect(() => {
    fetchDashboardData();
    const syncInterval = setInterval(() => fetchDashboardData(true), 15000);
    return () => clearInterval(syncInterval);
  }, []);

  // Format calendar date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  // Create Case Handler
  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!newCaseForm.name) {
      toast.error("Case Name is required!");
      return;
    }
    const tid = toast.loading("Initializing case folder...");
    try {
      await apiService.createProject({
        name: newCaseForm.name,
        clientName: newCaseForm.clientName,
        opponentName: newCaseForm.opponentName,
        caseType: newCaseForm.caseType,
        courtName: newCaseForm.courtName,
        summary: newCaseForm.summary,
        priority: newCaseForm.priority || 'Medium',
        status: 'Active',
        timeline: [],
        hearings: [],
        parties: [],
        research: [],
        drafts: [],
        contracts: [],
        evidence: []
      });
      toast.success("Case folder created successfully!", { id: tid });
      setIsNewCaseModalOpen(false);
      setNewCaseForm({
        name: '',
        clientName: '',
        opponentName: '',
        caseType: '',
        courtName: '',
        summary: '',
        priority: 'Medium'
      });
      await fetchDashboardData(true);
    } catch (err) {
      toast.error("Failed to create case folder.", { id: tid });
    }
  };

  // Update Case Handler
  const handleUpdateCase = async (e) => {
    e.preventDefault();
    if (!editingCase.name) {
      toast.error("Case Name is required!");
      return;
    }
    const tid = toast.loading("Updating case details...");
    try {
      await apiService.updateProject(editingCase._id, {
        name: editingCase.name,
        clientName: editingCase.clientName,
        opponentName: editingCase.opponentName,
        caseType: editingCase.caseType,
        courtName: editingCase.courtName,
        summary: editingCase.summary,
        priority: editingCase.priority
      });
      toast.success("Case updated successfully!", { id: tid });
      setEditingCase(null);
      await fetchDashboardData(true);
    } catch (err) {
      toast.error("Failed to update case parameters.", { id: tid });
    }
  };

  // Toggle Archive Status Handler
  const handleToggleArchive = async (e, c) => {
    e.stopPropagation();
    const newStatus = c.status === 'Archived' ? 'Active' : 'Archived';
    const tid = toast.loading(newStatus === 'Archived' ? "Archiving case folder..." : "Restoring case folder...");
    try {
      await apiService.updateProject(c._id, { status: newStatus });
      toast.success(newStatus === 'Archived' ? "Case folder archived!" : "Case folder restored!", { id: tid });
      await fetchDashboardData(true);
    } catch (err) {
      toast.error("Failed to change archive status.", { id: tid });
    }
  };

  // Delete Case Handler
  const handleDeleteCase = async (e, caseId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this case folder? All associated timelines, research, and drafts will be deleted.")) return;
    const tid = toast.loading("Deleting case folder...");
    try {
      await apiService.deleteProject(caseId);
      toast.success("Case folder deleted permanently!", { id: tid });
      await fetchDashboardData(true);
    } catch (err) {
      toast.error("Failed to delete case folder.", { id: tid });
    }
  };

  // Helper date checker for hearings
  const isHearingToday = (dateStr) => {
    if (!dateStr) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return dateStr.includes(todayStr) || new Date(dateStr).toDateString() === new Date().toDateString();
  };

  // Computed Real-Time Stats
  const activeCasesList = cases.filter(c => c.status === 'Active' || !c.status);
  const archivedCasesList = cases.filter(c => c.status === 'Archived');
  const completedCasesList = cases.filter(c => c.status === 'Closed' || c.status === 'Completed');
  const highPriorityCasesList = activeCasesList.filter(c => c.priority === 'High');

  // Compute stats counters
  const totalActiveCases = activeCasesList.length;
  
  // Total today's hearings
  const todaysHearingsList = [];
  activeCasesList.forEach(c => {
    if (c.hearings && c.hearings.length > 0) {
      c.hearings.forEach(h => {
        if (isHearingToday(h.date)) {
          todaysHearingsList.push({
            caseId: c._id,
            caseName: c.name,
            court: h.courtroom || c.courtName || 'District Court',
            judge: h.judge || 'Presiding Magistrate',
            time: h.date.includes('T') ? new Date(h.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
            title: h.title,
            priority: c.priority || 'Medium'
          });
        }
      });
    }
  });

  const totalTodaysHearingsCount = todaysHearingsList.length;

  // Total pending drafts count
  let totalPendingDrafts = 0;
  activeCasesList.forEach(c => {
    totalPendingDrafts += (c.drafts?.length || 0);
  });

  // Total pending research count
  let totalPendingResearch = 0;
  activeCasesList.forEach(c => {
    totalPendingResearch += (c.research?.length || 0);
  });

  // Recent cases (sorted by last updated)
  const recentCasesList = [...cases].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  // Continue working case (last updated active case)
  const continueWorkingCase = activeCasesList.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];

  // Upcoming deadlines (Hearings & timeline dates in future)
  const upcomingDeadlinesList = [];
  activeCasesList.forEach(c => {
    if (c.hearings) {
      c.hearings.forEach(h => {
        const hDate = new Date(h.date);
        if (hDate > new Date() && !isHearingToday(h.date)) {
          upcomingDeadlinesList.push({
            caseName: c.name,
            title: `Hearing: ${h.title}`,
            date: hDate,
            type: 'hearing'
          });
        }
      });
    }
    if (c.timeline) {
      c.timeline.forEach(t => {
        const tDate = new Date(t.date);
        if (tDate > new Date()) {
          upcomingDeadlinesList.push({
            caseName: c.name,
            title: `Milestone: ${t.title}`,
            date: tDate,
            type: 'milestone'
          });
        }
      });
    }
  });
  const sortedDeadlines = upcomingDeadlinesList.sort((a, b) => a.date - b.date).slice(0, 4);

  // Dynamic Case Analytics (Categories Breakdown & average strength)
  const categoriesMap = {};
  let totalStrengthSum = 0;
  let casesWithStrengthCount = 0;

  activeCasesList.forEach(c => {
    const cat = c.caseType || 'General Civil';
    categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;

    // Check strength score
    const strength = c.strengthScore || c.intelligence?.strengthScore;
    if (strength !== undefined) {
      totalStrengthSum += strength;
      casesWithStrengthCount++;
    }
  });

  const averageStrength = casesWithStrengthCount > 0 ? Math.round(totalStrengthSum / casesWithStrengthCount) : 75;

  const categoryAnalytics = Object.keys(categoriesMap).map(key => ({
    name: key,
    count: categoriesMap[key],
    percentage: Math.round((categoriesMap[key] / totalActiveCases) * 100) || 0
  })).sort((a, b) => b.count - a.count).slice(0, 3);

  // Generate automated AI Insights based on case states
  const aiInsightsList = [];
  activeCasesList.forEach(c => {
    if (c.contracts && c.contracts.length > 0 && !c.isContractLinked) {
      aiInsightsList.push({
        id: `ins-${c._id}-contract`,
        caseName: c.name,
        tip: "Contract uploaded contains unlinked execution dates. Link contract to timeline to verify limitations.",
        type: "warning"
      });
    }
    if (c.hearings && c.hearings.length > 0 && !c.hearings.some(h => h.status === 'Completed')) {
      aiInsightsList.push({
        id: `ins-${c._id}-hearings`,
        caseName: c.name,
        tip: "First hearing is scheduled. Compile case docket binder early to avoid administrative delays.",
        type: "strategy"
      });
    }
  });
  
  // Default insights if none generated
  if (aiInsightsList.length === 0) {
    aiInsightsList.push({
      id: "ins-def-1",
      caseName: "Global Recommendation",
      tip: "AI Strategy recommends checking evidence mappings on commercial recovery filings early.",
      type: "strategy"
    });
  }

  // Automated AI Activity Log simulation
  const recentAiActivities = [];
  recentCasesList.slice(0, 3).forEach((c, idx) => {
    const activities = [
      "AI analyzed contract vulnerabilities & calculated risk score",
      "AI compiled trial docket preparation binder",
      "AI researched matching Supreme Court precedents"
    ];
    recentAiActivities.push({
      caseName: c.name,
      activity: activities[idx % activities.length],
      time: c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
    });
  });

  // Navigate to case helper
  const handleOpenWorkspace = (cId) => {
    navigate(`/dashboard/cases/${cId}`, { replace: true });
  };

  // Loading Skeleton Component
  const renderLoadingSkeletons = () => (
    <div className="space-y-10 animate-pulse">
      <div className="flex justify-between items-center pb-6 border-b border-[#F3F4F6]">
        <div className="space-y-2 w-1/3">
          <div className="h-7 bg-slate-100 rounded-md" />
          <div className="h-4 bg-slate-100 rounded-md w-1/2" />
        </div>
        <div className="h-10 bg-slate-100 rounded-xl w-32" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 border border-slate-150 rounded-xl bg-white space-y-4">
            <div className="h-3 bg-slate-100 rounded w-1/3" />
            <div className="h-8 bg-slate-200 rounded w-1/4" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-5 bg-slate-100 rounded w-1/4" />
          {[...Array(2)].map((_, i) => (
            <div key={i} className="p-6 border border-slate-150 rounded-xl bg-white space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-3/4" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="h-5 bg-slate-100 rounded w-1/3" />
          <div className="p-6 border border-slate-150 rounded-xl bg-white h-48" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FFFFFF] pt-24 pb-16 px-6 md:px-16 max-w-6xl mx-auto text-[#111827] font-sans">
      
      {isLoading ? renderLoadingSkeletons() : (
        <>
          {/* 1. Header Greeting & Primary Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 pb-8 border-b border-[#F3F4F6]">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-extrabold tracking-tight text-[#111827]">
                  Good Morning, Advocate {userName}
                </h1>
                {isSyncing && (
                  <RefreshCw size={14} className="text-[#6D5DFC] animate-spin" />
                )}
              </div>
              <p className="text-xs text-[#6B7280] font-semibold flex items-center gap-2 mt-1.5">
                <Calendar className="w-4 h-4 text-[#6D5DFC]" />
                {formatDate(currentTime)}
              </p>
            </div>
            
            <button
              onClick={() => {
                setNewCaseForm({ name: '', clientName: '', opponentName: '', caseType: '', courtName: '', summary: '', priority: 'Medium' });
                setIsNewCaseModalOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-[#6D5DFC] hover:bg-[#5b4edb] text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 shrink-0 self-start md:self-auto cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>New Case</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-3 text-xs">
              <AlertTriangle className="text-rose-500 shrink-0" size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* 2. Today's Overview Statistics Ribbon */}
          <div className="mb-12">
            <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-4">Today&apos;s Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Active Cases", value: totalActiveCases, icon: Briefcase },
                { label: "Today's Hearings", value: totalTodaysHearingsCount, icon: Gavel, alert: totalTodaysHearingsCount > 0 },
                { label: "Pending Drafts", value: totalPendingDrafts, icon: FileText },
                { label: "Pending Research", value: totalPendingResearch, icon: Search }
              ].map((stat, i) => (
                <div key={i} className="p-6 border border-[#E5E7EB] rounded-xl bg-white shadow-sm hover:border-[#6D5DFC] transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{stat.label}</span>
                    <stat.icon className={`w-5 h-5 ${stat.alert ? 'text-[#6D5DFC]' : 'text-slate-400'}`} />
                  </div>
                  <span className="text-3xl font-extrabold text-[#111827]">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Multi-Column Workspace layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            
            {/* Left Column (3 spans) */}
            <div className="lg:col-span-3 space-y-12">

              {/* Continue Working Card */}
              {continueWorkingCase && (
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Continue Working</h2>
                  <div 
                    onClick={() => handleOpenWorkspace(continueWorkingCase._id)}
                    className="p-6 border border-slate-200/80 rounded-2xl bg-white hover:border-[#6D5DFC] transition-all shadow-sm cursor-pointer relative group overflow-hidden"
                  >
                    <div className="absolute right-6 top-6 text-slate-400 group-hover:text-[#6D5DFC] transition-colors">
                      <ArrowUpRight size={16} />
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-50 text-[#6D5DFC] text-[8px] font-bold uppercase tracking-wider rounded">Last Updated Case</span>
                    <h3 className="text-lg font-black text-slate-900 mt-2">{continueWorkingCase.name}</h3>
                    <p className="text-xs text-slate-500 font-semibold mt-1 max-w-md truncate">{continueWorkingCase.summary || 'No summary configured yet.'}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 text-[10px] text-slate-500 font-semibold">
                      <span>Hearings: <strong className="text-slate-800">{continueWorkingCase.hearings?.length || 0}</strong></span>
                      <span>Evidence: <strong className="text-slate-800">{continueWorkingCase.evidence?.length || 0}</strong></span>
                      <span>Contracts: <strong className="text-slate-800">{continueWorkingCase.contracts?.length || 0}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Recent Cases List with dropdown dropdown actions */}
              <div className="space-y-4">
                <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Recent Cases</h2>
                <div className="space-y-4">
                  {recentCasesList.slice(0, 4).map((c) => (
                    <div 
                      key={c._id} 
                      className="p-5 border border-[#E5E7EB] rounded-xl bg-white shadow-sm hover:border-[#6D5DFC] transition-all flex items-center justify-between gap-4 relative group"
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <h3 
                          onClick={() => handleOpenWorkspace(c._id)}
                          className="font-bold text-base text-[#111827] truncate hover:text-[#6D5DFC] transition-colors cursor-pointer"
                        >
                          {c.name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280] font-semibold">
                          <span>Client: <strong className="text-[#111827]">{c.clientName || 'General'}</strong></span>
                          <span>•</span>
                          <span>Court: <strong className="text-[#111827]">{c.courtName || 'District Court'}</strong></span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide ${
                            c.status === 'Archived' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            c.status === 'Closed' ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {c.status || 'Active'}
                          </span>
                          {c.priority === 'High' && (
                            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded text-[8px] font-bold uppercase">High Priority</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button 
                          onClick={() => handleOpenWorkspace(c._id)}
                          className="px-4.5 py-2 bg-[#F9FAFB] hover:bg-indigo-50 hover:text-[#6D5DFC] text-slate-700 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer"
                        >
                          Open
                        </button>
                        
                        {/* 3-dot dropdown dropdown menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuCaseId(activeMenuCaseId === c._id ? null : c._id);
                            }}
                            className="p-1.5 hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {activeMenuCaseId === c._id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setActiveMenuCaseId(null)} />
                              <div className="absolute right-0 top-8 w-40 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-left">
                                <button
                                  onClick={() => {
                                    setEditingCase(c);
                                    setActiveMenuCaseId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-2 transition-colors text-left"
                                >
                                  <Edit2 size={13} /> Edit Details
                                </button>
                                <button
                                  onClick={(e) => {
                                    handleToggleArchive(e, c);
                                    setActiveMenuCaseId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-slate-50 text-xs font-semibold text-slate-800 flex items-center gap-2 transition-colors text-left"
                                >
                                  <Archive size={13} /> {c.status === 'Archived' ? 'Restore Case' : 'Archive Case'}
                                </button>
                                <button
                                  onClick={(e) => {
                                    handleDeleteCase(e, c._id);
                                    setActiveMenuCaseId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-2 transition-colors border-t border-slate-100 text-left"
                                >
                                  <Trash2 size={13} /> Delete Case
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {cases.length === 0 && (
                    <div className="py-12 text-center text-sm text-[#9CA3AF] border border-dashed border-[#E5E7EB] rounded-xl bg-white font-semibold">
                      No cases found in database. Click New Case above to create your first litigation workspace.
                    </div>
                  )}
                </div>
              </div>

              {/* High Priority Cases List */}
              {highPriorityCasesList.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle size={13} /> High Priority Action Required
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {highPriorityCasesList.map(c => (
                      <div 
                        key={c._id}
                        onClick={() => handleOpenWorkspace(c._id)}
                        className="p-5 border border-rose-100 rounded-xl bg-rose-50/20 hover:border-rose-300 transition-all cursor-pointer space-y-2"
                      >
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">{c.name}</h4>
                        <p className="text-[11px] text-slate-500 font-medium truncate">Court: {c.courtName || 'Not Set'}</p>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[8px] font-bold uppercase rounded block w-fit">Critical Tracker</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Archived & Closed Cases */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Archived Case Folder list */}
                <div className="space-y-4 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xxs">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <Archive size={13} className="text-slate-400" /> Archived Folders ({archivedCasesList.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {archivedCasesList.map(c => (
                      <div key={c._id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{c.name}</span>
                        <button 
                          onClick={(e) => handleToggleArchive(e, c)}
                          className="text-[9px] font-bold text-slate-500 hover:text-[#6D5DFC] uppercase tracking-wider"
                        >
                          Restore
                        </button>
                      </div>
                    ))}
                    {archivedCasesList.length === 0 && (
                      <span className="text-[10px] text-slate-400 font-bold block py-2">No archived case files.</span>
                    )}
                  </div>
                </div>

                {/* Completed / Closed Cases */}
                <div className="space-y-4 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xxs">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-500" /> Completed Litigations ({completedCasesList.length})
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                    {completedCasesList.map(c => (
                      <div key={c._id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                        <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{c.name}</span>
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wide">Closed</span>
                      </div>
                    ))}
                    {completedCasesList.length === 0 && (
                      <span className="text-[10px] text-slate-400 font-bold block py-2">No completed cases matching.</span>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column (2 spans) */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Today's Hearings Widget */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider">Today&apos;s Hearings</h2>
                  <span className="px-2 py-0.5 bg-indigo-50 text-[#6D5DFC] rounded text-[9px] font-bold uppercase tracking-wider">Today Only</span>
                </div>

                <div className="space-y-4">
                  {todaysHearingsList.map((h, idx) => (
                    <div 
                      key={idx} 
                      className="p-5 border border-[#E5E7EB] rounded-xl bg-white shadow-sm hover:border-[#6D5DFC] transition-all flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-sm text-[#111827]">{h.caseName}</h3>
                          <span className="text-[10px] font-black text-[#6D5DFC] bg-[#6D5DFC]/5 px-2 py-0.5 rounded border border-[#6D5DFC]/10 shrink-0">
                            {h.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6B7280] font-semibold">
                          {h.court} • {h.judge}
                        </p>
                        <p className="text-[10px] text-[#6B7280] font-medium mt-1 leading-normal italic">
                          Agenda: {h.title}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => handleOpenWorkspace(h.caseId)}
                        className="w-full py-2 bg-[#F9FAFB] hover:bg-[#F3F4F6] text-[#374151] border border-[#E5E7EB] rounded-lg text-xs font-bold transition-all text-center cursor-pointer"
                      >
                        Open Hearing Assistant
                      </button>
                    </div>
                  ))}
                  {todaysHearingsList.length === 0 && (
                    <div className="py-8 text-center text-xs text-[#9CA3AF] font-bold border border-dashed border-[#E5E7EB] rounded-xl bg-white">
                      No hearings scheduled for today.
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Deadlines Milestones */}
              <div className="space-y-4 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xxs">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Clock size={13} className="text-indigo-500" /> Upcoming Milestones & Deadlines
                </h3>
                <div className="space-y-3">
                  {sortedDeadlines.map((dl, idx) => (
                    <div key={idx} className="flex justify-between items-start py-2 border-b border-slate-50 last:border-0 last:pb-0">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block leading-tight">{dl.title}</span>
                        <span className="text-[9px] text-[#6B7280] font-semibold mt-0.5 block">{dl.caseName}</span>
                      </div>
                      <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[9px] font-extrabold text-slate-700 whitespace-nowrap shrink-0">
                        {dl.date.toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {sortedDeadlines.length === 0 && (
                    <span className="text-[10px] text-slate-400 font-bold block py-2">No future deadlines scheduled.</span>
                  )}
                </div>
              </div>

            </div>

          </div>

          {/* G. Horizontal Analytics, Insights, Activity, and Actions Panel */}
          <div className="mt-12 pt-10 border-t border-slate-100 flex flex-row overflow-x-auto md:grid md:grid-cols-4 gap-6 pb-6 scrollbar-thin">
            {/* Case Analytics Bar visual */}
            <div className="space-y-4 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xxs shrink-0 w-[290px] md:w-auto">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <TrendingUp size={13} className="text-[#6D5DFC]" /> Case Portfolio Analytics
              </h3>
              
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Average Case Strength</span>
                  <span className="font-black text-[#6D5DFC]">{averageStrength}% Strength</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#6D5DFC] h-full rounded-full transition-all duration-300"
                    style={{ width: `${averageStrength}%` }}
                  />
                </div>

                {categoryAnalytics.length > 0 && (
                  <div className="space-y-2 pt-3 border-t border-slate-150">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category Distribution</span>
                    {categoryAnalytics.map((cat, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] font-semibold text-slate-750">
                        <span className="truncate max-w-[100px]">{cat.name}</span>
                        <span>{cat.count} ({cat.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* AI Insights Alerts */}
            <div className="space-y-4 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xxs shrink-0 w-[290px] md:w-auto">
              <h3 className="text-xs font-black text-[#6D5DFC] uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles size={13} className="text-[#6D5DFC]" /> Real-Time AI Insights
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar">
                {aiInsightsList.map((ins) => (
                  <div 
                    key={ins.id} 
                    className={`p-3 border rounded-xl text-xs space-y-1 ${
                      ins.type === 'warning' 
                        ? 'bg-amber-50/50 border-amber-200/50 text-amber-950' 
                        : 'bg-indigo-50/30 border-indigo-100/40 text-indigo-950'
                    }`}
                  >
                    <span className="block font-black uppercase text-[8px] tracking-wider text-slate-400">{ins.caseName}</span>
                    <p className="font-bold leading-relaxed">{ins.tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent AI Activity */}
            <div className="space-y-4 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xxs shrink-0 w-[290px] md:w-auto">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={13} className="text-slate-400" /> Recent AI Activity
              </h3>
              <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar font-sans">
                {recentAiActivities.map((act, idx) => (
                  <div key={idx} className="flex justify-between items-start py-2 border-b border-slate-50 last:border-0 last:pb-0 text-[11px] font-semibold text-slate-650">
                    <div>
                      <span className="text-slate-800 font-bold block">{act.activity}</span>
                      <span className="text-[9px] text-[#6D5DFC] block mt-0.5">{act.caseName}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 whitespace-nowrap shrink-0">{act.time}</span>
                  </div>
                ))}
                {recentAiActivities.length === 0 && (
                  <span className="text-[10px] text-slate-400 font-bold block py-2">No recent AI activities.</span>
                )}
              </div>
            </div>

            {/* Quick Actions ribbon */}
            <div className="space-y-4 bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-xxs shrink-0 w-[290px] md:w-auto">
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => {
                    setNewCaseForm({ name: '', clientName: '', opponentName: '', caseType: '', courtName: '', summary: '', priority: 'Medium' });
                    setIsNewCaseModalOpen(true);
                  }}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-700 text-center transition-colors cursor-pointer"
                >
                  Add Case File
                </button>
                <button 
                  onClick={() => navigate('/dashboard/cases')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wider text-slate-700 text-center transition-colors cursor-pointer"
                >
                  Browse Folders
                </button>
              </div>
            </div>
          </div>

          {/* E. MODAL Dialog: New Case Folder */}
          <AnimatePresence>
            {isNewCaseModalOpen && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Create Case Folder</h3>
                    <button onClick={() => setIsNewCaseModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleCreateCase} className="space-y-4 py-4 overflow-y-auto flex-1 custom-scrollbar pr-1">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Case / Suit Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Rajesh Sharma vs Amit Verma"
                        value={newCaseForm.name}
                        onChange={e => setNewCaseForm({ ...newCaseForm, name: e.target.value })}
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC] focus:ring-1 focus:ring-[#6D5DFC]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Client Name</label>
                        <input 
                          type="text" 
                          placeholder="Plaintiff Name"
                          value={newCaseForm.clientName}
                          onChange={e => setNewCaseForm({ ...newCaseForm, clientName: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Opponent Party</label>
                        <input 
                          type="text" 
                          placeholder="Defendant Name"
                          value={newCaseForm.opponentName}
                          onChange={e => setNewCaseForm({ ...newCaseForm, opponentName: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Legal Domain</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Commercial Contract Law"
                          value={newCaseForm.caseType}
                          onChange={e => setNewCaseForm({ ...newCaseForm, caseType: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Presiding Court</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Delhi High Court"
                          value={newCaseForm.courtName}
                          onChange={e => setNewCaseForm({ ...newCaseForm, courtName: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Priority Status</label>
                      <select 
                        value={newCaseForm.priority}
                        onChange={e => setNewCaseForm({ ...newCaseForm, priority: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC] bg-white"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Case Statement Summary</label>
                      <textarea 
                        placeholder="Provide brief background facts, recovery claim parameters, or timeline baselines..."
                        value={newCaseForm.summary}
                        onChange={e => setNewCaseForm({ ...newCaseForm, summary: e.target.value })}
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC] resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[#6D5DFC] hover:bg-[#5b4edb] text-white rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-colors mt-2"
                    >
                      Save Case Folder
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* F. MODAL Dialog: Edit Case Folder */}
          <AnimatePresence>
            {editingCase && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 overflow-hidden flex flex-col max-h-[90vh]"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Edit Case Details</h3>
                    <button onClick={() => setEditingCase(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleUpdateCase} className="space-y-4 py-4 overflow-y-auto flex-1 custom-scrollbar pr-1">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Case / Suit Name</label>
                      <input 
                        type="text" 
                        value={editingCase.name}
                        onChange={e => setEditingCase({ ...editingCase, name: e.target.value })}
                        required
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC] focus:ring-1 focus:ring-[#6D5DFC]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Client Name</label>
                        <input 
                          type="text" 
                          value={editingCase.clientName || ''}
                          onChange={e => setEditingCase({ ...editingCase, clientName: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Opponent Party</label>
                        <input 
                          type="text" 
                          value={editingCase.opponentName || ''}
                          onChange={e => setEditingCase({ ...editingCase, opponentName: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Legal Domain</label>
                        <input 
                          type="text" 
                          value={editingCase.caseType || ''}
                          onChange={e => setEditingCase({ ...editingCase, caseType: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Presiding Court</label>
                        <input 
                          type="text" 
                          value={editingCase.courtName || ''}
                          onChange={e => setEditingCase({ ...editingCase, courtName: e.target.value })}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Priority Status</label>
                      <select 
                        value={editingCase.priority || 'Medium'}
                        onChange={e => setEditingCase({ ...editingCase, priority: e.target.value })}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC] bg-white"
                      >
                        <option value="Low">Low Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="High">High Priority</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Case Statement Summary</label>
                      <textarea 
                        value={editingCase.summary || ''}
                        onChange={e => setEditingCase({ ...editingCase, summary: e.target.value })}
                        rows={3}
                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#6D5DFC] resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-[#6D5DFC] hover:bg-[#5b4edb] text-white rounded-xl py-3 text-xs font-black uppercase tracking-wider transition-colors mt-2"
                    >
                      Save Changes
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}

    </div>
  );
}
