import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { motion } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Archive, ChevronRight, ArrowLeft, Search, LayoutGrid, List,
  Calendar, FileText, ShieldCheck, Gavel, CheckSquare, Sparkles, FolderOpen, MoreVertical, AlertTriangle,
  UserPlus, Building2, Users, CreditCard, X, Menu as MenuIcon
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { apiService } from '../../../services/apiService';
import toast from 'react-hot-toast';
import { useSubscription } from '../../../context/SubscriptionContext';
import { toggleState } from '../../../userStore/userData';
import CaseOperationsHubModal from './CaseOperationsHubModal';
import InviteTeamMemberModal from './InviteTeamMemberModal';

const LegalDashboard = ({
  legalCases = [],
  currentProjectId,
  handleOpenCase,
  handleOpenEditModal,
  handleDeleteCase,
  isRenamingCase,
  renameValue,
  setRenameValue,
  handleRenameCase,
  setIsRenamingCase,
  setIsNewCaseModalOpen,
  setEditingCaseId,
  setNewCaseForm,
  setActiveLegalToolkit,
  onBack,
  fetchLegalCases
}) => {
  const { tLegal } = useLanguage();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [courtFilter, setCourtFilter] = useState('All');
  const [sortOption, setSortOption] = useState('lastUpdated');
  const [viewMode, setViewMode] = useState('list'); // Default to list view

  // Active menu dropdown tracking
  const [activeMenuCaseId, setActiveMenuCaseId] = useState(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  // On Mount: Always fetch latest cases from backend to guarantee sync with Mobile
  React.useEffect(() => {
    if (fetchLegalCases) {
      fetchLegalCases(true);
    }
  }, []);

  // Law Firm Invite Member State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCaseOperationsHubOpen, setIsCaseOperationsHubOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'Associate Advocate' });

  const handleSendInvite = async (e) => {
    e?.preventDefault();
    if (!inviteForm.email || !inviteForm.email.trim()) {
      toast.error("Valid email address is required!");
      return;
    }

    const activeWsId = localStorage.getItem('AI_LEGAL_LAST_ACTIVE_WORKSPACE_ID') || 'firm_abc_workspace';
    try {
      const tid = toast.loading('Sending team invitation...');
      const res = await apiService.request(`/workspaces/${activeWsId}/invitations`, {
        method: 'POST',
        data: {
          fullName: inviteForm.name || inviteForm.email.split('@')[0],
          email: inviteForm.email.trim(),
          role: inviteForm.role
        }
      });

      if (res && res.success) {
        toast.success(`Invitation sent to ${inviteForm.email}!`, { id: tid });
        setInviteForm({ name: '', email: '', role: 'Associate Advocate' });
        setIsInviteModalOpen(false);
      } else {
        toast.error(res?.error || 'Failed to send invitation.', { id: tid });
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to send invitation.');
    }
  };

  const { cases, plan, triggerUpgradeModal } = useSubscription();

  const renderCasesLimitBadge = () => {
    const used = cases?.used !== undefined ? cases.used : (legalCases?.length || 0);
    const limit = cases?.limit !== undefined ? cases.limit : 3;

    if (plan === 'ENTERPRISE' || plan === 'SUPER_ADMIN' || limit === -1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 shadow-2xs">
          <span>∞ Unlimited</span>
        </span>
      );
    }

    const isReached = limit > 0 && used >= limit;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-2xs border ${
        isReached 
          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40' 
          : 'bg-[#C8A34D]/15 text-[#C8A34D] border-[#C8A34D]/30'
      }`}>
        <span>📁 {used} / {limit} {isReached ? ' • Limit Reached' : 'Free'}</span>
      </span>
    );
  };

  const handleCreateCaseClick = () => {
    const isLawFirm = (localStorage.getItem('user_selected_role') || 'advocate') === 'law_firm';
    if (isLawFirm) {
      setIsCaseOperationsHubOpen(true);
      return;
    }

    if (cases && cases.limit !== -1 && cases.used >= cases.limit) {
      triggerUpgradeModal({
        title: 'Matter Limit Reached',
        message: `You have reached your active case limit of ${cases.limit} cases for your current plan. Upgrade your plan to create more cases.`,
        used: cases.used,
        limit: cases.limit,
        feature: 'cases'
      });
      return;
    }
    if (setEditingCaseId) setEditingCaseId(null);
    if (setNewCaseForm) setNewCaseForm({ clientName: '', caseType: '', otherCaseType: '', accused: '', summary: '' });
    setIsNewCaseModalOpen(true);
  };

  const handleLaunchCreateCaseFromHub = () => {
    if (cases && cases.limit !== -1 && cases.used >= cases.limit) {
      triggerUpgradeModal({
        title: 'Matter Limit Reached',
        message: `You have reached your active case limit of ${cases.limit} cases for your current plan. Upgrade your plan to create more cases.`,
        used: cases.used,
        limit: cases.limit,
        feature: 'cases'
      });
      return;
    }
    if (setEditingCaseId) setEditingCaseId(null);
    if (setNewCaseForm) setNewCaseForm({ clientName: '', caseType: '', otherCaseType: '', accused: '', summary: '' });
    setIsNewCaseModalOpen(true);
  };

  const handleMenuToggle = (e, caseId) => {
    e.stopPropagation();
    if (activeMenuCaseId === caseId) {
      setActiveMenuCaseId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 130;
      const topPos = spaceBelow < menuHeight ? Math.max(10, rect.top - menuHeight) : rect.bottom + 4;
      const leftPos = Math.max(10, rect.right - 160);
      setMenuPos({ top: topPos, left: leftPos });
      setActiveMenuCaseId(caseId);
    }
  };

  // Distinct case types and courts for filter
  const caseTypes = Array.from(new Set(legalCases.map(c => c.caseType).filter(Boolean)));
  const courts = Array.from(new Set(legalCases.map(c => c.courtName).filter(Boolean)));

  // Archive toggle handler
  const handleToggleArchive = async (e, c) => {
    e.stopPropagation();
    const newStatus = c.status === 'Archived' ? 'Active' : 'Archived';
    const tid = toast.loading(newStatus === 'Archived' ? "Archiving case..." : "Restoring case...");
    try {
      await apiService.updateProject(c._id || c.id, { status: newStatus });
      toast.success(newStatus === 'Archived' ? "Case archived successfully!" : "Case restored successfully!", { id: tid });
      if (fetchLegalCases) {
        fetchLegalCases(true);
      }
    } catch (err) {
      toast.error("Failed to update status", { id: tid });
    }
  };

  // Filter & Sort
  const filteredCases = legalCases.filter(c => {
    const q = searchQuery.toLowerCase();
    const nameMatch = c.name?.toLowerCase().includes(q);
    const clientMatch = c.clientName?.toLowerCase().includes(q);
    const opponentMatch = (c.opponentName || c.accused || '').toLowerCase().includes(q);
    const courtMatch = (c.courtName || '').toLowerCase().includes(q);
    const caseNumMatch = (c.caseNumber || c.number || '').toLowerCase().includes(q);
    const firMatch = (c.firNumber || '').toLowerCase().includes(q);
    const typeMatch = c.caseType?.toLowerCase().includes(q);
    const stageMatch = c.stage?.toLowerCase().includes(q);
    const descMatch = (c.summary || c.description || '').toLowerCase().includes(q);
    
    const matchesSearch = nameMatch || clientMatch || opponentMatch || courtMatch || caseNumMatch || firMatch || typeMatch || stageMatch || descMatch;

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    const matchesType = typeFilter === 'All' || c.caseType === typeFilter;
    const matchesCourt = courtFilter === 'All' || c.courtName === courtFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesCourt;
  });

  const sortedCases = [...filteredCases].sort((a, b) => {
    if (sortOption === 'name') {
      return (a.name || '').localeCompare(b.name || '');
    } else if (sortOption === 'createdDate') {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else {
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    }
  });

  // Next hearing getter
  const getNextHearingDate = (c) => {
    if (!c.hearings || c.hearings.length === 0) return 'No upcoming hearing';
    const upcoming = c.hearings.filter(h => h.status === 'Upcoming' && h.date);
    if (upcoming.length === 0) return 'No upcoming hearing';
    
    // Find earliest upcoming hearing
    const sorted = [...upcoming].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateA - dateB;
    });
    
    try {
      return new Date(sorted[0].date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return sorted[0].date;
    }
  };

  // Case readiness score helper
  const getCaseReadinessScore = (c) => {
    let score = 30; // base initialization
    if (c.clientName) score += 10;
    if (c.opponentName || c.accused) score += 10;
    if (c.courtName) score += 10;
    if (c.caseNumber || c.number || c.firNumber) score += 10;
    if (c.documents && c.documents.length > 0) score += 10;
    if (c.evidence && c.evidence.length > 0) score += 10;
    if (c.hearings && c.hearings.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const renderStatusPill = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            Active
          </span>
        );
      case 'Disposed':
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            {status}
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Pending
          </span>
        );
      case 'Archived':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            Archived
          </span>
        );
    }
  };

  const renderPriorityPill = (priority) => {
    if (!priority) return null;
    switch (priority) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 whitespace-nowrap">
            <AlertTriangle className="w-2.5 h-2.5 text-rose-500" />
            Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50/60 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 whitespace-nowrap">
            High Priority
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-50/60 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 whitespace-nowrap">
            Medium Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
            Low Priority
          </span>
        );
    }
  };

  const navigate = useNavigate();
  const setTglState = useSetRecoilState(toggleState);

  return (
    <div className="flex-1 flex flex-col w-full min-h-0 overflow-hidden bg-[#FFFFFF] dark:bg-[#0F172A] relative font-sans text-[#111827] dark:text-white">
      {/* 1. Main Header Area */}
      <div className="w-full px-3.5 sm:px-8 py-3.5 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shrink-0 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B]">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (onBack) onBack();
              else navigate(-1);
            }}
            className="p-2 sm:p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Go Back"
          >
            <ArrowLeft size={16} className="text-slate-600 dark:text-slate-300" />
          </motion.button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-2xl font-black tracking-tight text-[#111111] dark:text-white truncate">
                {(localStorage.getItem('user_selected_role') || 'advocate') === 'law_firm'
                  ? 'FIRM WORKSPACE'
                  : (localStorage.getItem('user_selected_role') || 'advocate') === 'student'
                  ? 'MY ACADEMIC MATTERS & MOOTS'
                  : 'MY MATTERS'}
              </h1>
              {renderCasesLimitBadge()}
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">
              {(localStorage.getItem('user_selected_role') || 'advocate') === 'law_firm'
                ? "Your firm's litigation repository and legal workspaces."
                : (localStorage.getItem('user_selected_role') || 'advocate') === 'student'
                ? "Your student moot court memorials and case studies."
                : "Your litigation case repository and legal workspaces."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCreateCaseClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] rounded-xl font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Matter</span>
          </button>
        </div>
      </div>

      {/* 2. Control Bar — Search, Filters & Sorting */}
      <div className="w-full px-3.5 sm:px-8 py-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0F172A] flex flex-col lg:flex-row gap-2.5 justify-between items-stretch lg:items-center shrink-0">
        {/* Search Input */}
        <div className="relative flex-1 max-w-full lg:max-w-xl">
          <Search className="w-4 h-4 text-[#C8A34D] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by case name, client, opponent, court, case number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-semibold placeholder-slate-400 focus:outline-none focus:border-[#C8A34D] focus:ring-1 focus:ring-[#C8A34D] bg-white dark:bg-[#1E293B] text-[#111111] dark:text-white transition-all shadow-2xs"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full shrink-0">
          {/* Status Filter */}
          <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-[#111111] dark:text-white text-xs cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Disposed">Disposed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-[#111111] dark:text-white text-xs cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Court Filter */}
          <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Court:</span>
            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-[#111111] dark:text-white text-xs cursor-pointer max-w-[120px] truncate"
            >
              <option value="All">All Courts</option>
              {courts.map(court => (
                <option key={court} value={court}>{court}</option>
              ))}
            </select>
          </div>

          {/* Case Type Filter */}
          <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-[#111111] dark:text-white text-xs cursor-pointer max-w-[120px] truncate"
            >
              <option value="All">All Types</option>
              {caseTypes.map(ct => (
                <option key={ct} value={ct}>{ct}</option>
              ))}
            </select>
          </div>

          {/* Sorting Option */}
          <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-xl px-2.5 py-1.5 shadow-2xs text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-[#111111] dark:text-white text-xs cursor-pointer"
            >
              <option value="lastUpdated">Last Updated</option>
              <option value="createdDate">Date Created</option>
              <option value="name">Case Name (A-Z)</option>
            </select>
          </div>

          {/* Grid/List Toggle */}
          <div className="shrink-0 flex items-center border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1E293B] rounded-xl p-1 shadow-2xs gap-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#111111] dark:bg-[#333333] text-[#C8A34D]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-[#111111] dark:bg-[#333333] text-[#C8A34D]' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Case Listing Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3.5 sm:px-8 py-4 sm:py-6 bg-slate-50/30 dark:bg-[#0F172A]">
        {sortedCases.length > 0 ? (
          viewMode === 'grid' ? (
            /* 3A. Premium Grid View — Rich Case Dossier Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedCases.map((c) => {
                const hearingDate = getNextHearingDate(c);

                return (
                  <div
                    key={c._id || c.id}
                    className="relative bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:border-[#C8A34D] hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Case Type & Priority */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#C8A34D]/10 text-[#C8A34D] text-[10px] font-black uppercase tracking-wider border border-[#C8A34D]/25">
                          {c.caseType || 'General Litigation'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {renderPriorityPill(c.priority)}
                          <div className="relative">
                            <button
                              onClick={(e) => handleMenuToggle(e, c._id || c.id)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              title="Case Options"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {activeMenuCaseId === (c._id || c.id) && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuCaseId(null); }} />
                                <div 
                                  className="fixed w-40 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 text-left" 
                                  style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => {
                                      handleOpenEditModal(c);
                                      setActiveMenuCaseId(null);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <Edit2 size={13} />
                                    Edit Case
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      handleToggleArchive(e, c);
                                      setActiveMenuCaseId(null);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <Archive size={13} />
                                    {c.status === 'Archived' ? 'Restore Case' : 'Archive Case'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteCase(c._id || c.id);
                                      setActiveMenuCaseId(null);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2 transition-colors border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                    Delete Case
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Case Title */}
                      <div>
                        <h3 
                          onClick={() => handleOpenCase(c)}
                          className="font-extrabold text-sm sm:text-base text-[#111111] dark:text-white line-clamp-2 hover:text-[#C8A34D] transition-colors cursor-pointer"
                        >
                          {c.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1 flex items-center gap-1.5">
                          <span>{c.clientName || 'Not Set'}</span>
                          <span className="text-[#C8A34D] font-black text-[10px]">vs</span>
                          <span>{c.opponentName || c.accused || 'Not Set'}</span>
                        </p>
                      </div>

                      {/* Details Box */}
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Court:</span>
                          <span className="font-semibold truncate max-w-[150px]">{c.courtName || 'District Court'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Next Hearing:</span>
                          <span className="font-bold text-[#C8A34D]">{hearingDate}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Status:</span>
                          <span>{renderStatusPill(c.status)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Primary Action Button: Open Workspace */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
                      <button
                        onClick={() => handleOpenCase(c)}
                        className="w-full py-2 bg-slate-50 hover:bg-[#111111] dark:bg-[#0F172A] dark:hover:bg-[#333333] border border-slate-200/80 dark:border-slate-800 hover:border-[#C8A34D] text-[#111111] dark:text-white hover:text-[#C8A34D] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Open Workspace</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* 3B. Professional Table — List View */
            <div className="w-full bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto custom-scrollbar w-full">
                <table className="w-full min-w-[850px] border-collapse text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 dark:bg-[#0F172A] text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200/80 dark:border-slate-800 whitespace-nowrap">
                    <tr>
                      <th className="px-4 py-3 whitespace-nowrap">Case Name</th>
                      <th className="px-4 py-3 whitespace-nowrap">Parties</th>
                      <th className="px-4 py-3 whitespace-nowrap">Type</th>
                      <th className="px-4 py-3 whitespace-nowrap">Court</th>
                      <th className="px-4 py-3 whitespace-nowrap">Next Hearing</th>
                      <th className="px-4 py-3 whitespace-nowrap">Stage</th>
                      <th className="px-4 py-3 whitespace-nowrap">Status</th>
                      <th className="px-4 py-3 whitespace-nowrap">Priority</th>
                      <th className="px-4 py-3 text-center whitespace-nowrap">Actions</th>
                      <th className="px-4 py-3 text-right whitespace-nowrap">Open Workspace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-[#1E293B]">
                    {sortedCases.map((c) => {
                      const hearingDate = getNextHearingDate(c);
                      return (
                        <tr key={c._id || c.id} className="hover:bg-slate-50/50 dark:hover:bg-[#0F172A]/50 transition-colors">
                          <td className="px-4 py-3.5 font-extrabold text-[#111111] dark:text-white whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="w-4 h-4 text-[#C8A34D] shrink-0" />
                              <span 
                                onClick={() => handleOpenCase(c)}
                                className="hover:text-[#C8A34D] transition-colors cursor-pointer"
                              >
                                {c.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                            <div>{c.clientName || 'Not set'} <span className="text-[#C8A34D] font-black text-[10px]">vs</span> {c.opponentName || c.accused || 'Not set'}</div>
                          </td>
                          <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{c.caseType || 'Civil'}</td>
                          <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">{c.courtName || 'District Court'}</td>
                          <td className="px-4 py-3.5 font-bold text-[#C8A34D] whitespace-nowrap">{hearingDate}</td>
                          <td className="px-4 py-3.5 font-semibold text-slate-500 whitespace-nowrap">{c.stage || 'Pre-litigation'}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">{renderStatusPill(c.status)}</td>
                          <td className="px-4 py-3.5 whitespace-nowrap">{renderPriorityPill(c.priority)}</td>
                          <td className="px-4 py-3.5 text-center relative whitespace-nowrap">
                            <button
                              onClick={(e) => handleMenuToggle(e, c._id || c.id)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              title="Actions"
                            >
                              <MoreVertical size={15} />
                            </button>
                            {activeMenuCaseId === (c._id || c.id) && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuCaseId(null); }} />
                                <div 
                                  className="fixed w-40 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 text-left" 
                                  style={{ top: `${menuPos.top}px`, left: `${menuPos.left}px` }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => {
                                      handleOpenEditModal(c);
                                      setActiveMenuCaseId(null);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <Edit2 size={13} />
                                    Edit Case
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      handleToggleArchive(e, c);
                                      setActiveMenuCaseId(null);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <Archive size={13} />
                                    {c.status === 'Archived' ? 'Restore Case' : 'Archive Case'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteCase(c._id || c.id);
                                      setActiveMenuCaseId(null);
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2 transition-colors border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                                  >
                                    <Trash2 size={13} />
                                    Delete Case
                                  </button>
                                </div>
                              </>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold whitespace-nowrap">
                            <button
                              onClick={() => handleOpenCase(c)}
                              className="text-[#C8A34D] hover:text-[#b08d3b] text-xs font-black inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Open Workspace</span>
                              <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : searchQuery ? (
          /* 3C. Search No Results State */
          <div className="flex flex-col items-center justify-center min-h-[350px] text-center space-y-4 max-w-md mx-auto bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 shadow-xs">
            <Search className="w-12 h-12 text-[#C8A34D]" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#111111] dark:text-white">No cases match your search</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Try a different case name, client, court or case number.
              </p>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl transition-all cursor-pointer"
            >
              Clear Search Query
            </button>
          </div>
        ) : (
          /* 3D. Empty Case Dossier State */
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-5 max-w-lg mx-auto bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-10 shadow-xs">
            <div className="p-4 rounded-2xl bg-[#C8A34D]/10 text-[#C8A34D] border border-[#C8A34D]/25">
              <FolderOpen className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#111111] dark:text-white">
                {(localStorage.getItem('user_selected_role') || 'advocate') === 'law_firm'
                  ? 'No Firm Litigation Matters Yet'
                  : (localStorage.getItem('user_selected_role') || 'advocate') === 'student'
                  ? 'No Student Moot Cases Yet'
                  : 'No Matters Created Yet'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium max-w-sm">
                Create your first case matter to organize filings, court hearings, evidence, notes, and AI legal copilots.
              </p>
            </div>
            <button
              onClick={handleCreateCaseClick}
              className="px-6 py-2.5 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] rounded-xl font-black text-xs sm:text-sm flex items-center gap-2 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Matter</span>
            </button>
          </div>
        )}
      </div>

      {/* Invite Team Member Modal */}
      <InviteTeamMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={() => {
          if (fetchLegalCases) fetchLegalCases(true);
        }}
      />

      {/* Case Operations Hub Modal */}
      <CaseOperationsHubModal
        isOpen={isCaseOperationsHubOpen}
        onClose={() => setIsCaseOperationsHubOpen(false)}
        onLaunchCreateCase={handleLaunchCreateCaseFromHub}
        onLaunchInviteTeam={() => setIsInviteModalOpen(true)}
        cases={legalCases}
      />
    </div>
  );
};

export default LegalDashboard;
