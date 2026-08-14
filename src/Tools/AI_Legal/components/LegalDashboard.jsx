import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Edit2, Trash2, Archive, ChevronRight, ArrowLeft, Search, LayoutGrid, List
} from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';
import { apiService } from '../../../services/apiService';
import toast from 'react-hot-toast';

const LegalDashboard = ({
  legalCases,
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
  const [viewMode, setViewMode] = useState('list'); // DEFAULT TO list AS REQUESTED

  // Active menu dropdown tracking
  const [activeMenuCaseId, setActiveMenuCaseId] = useState(null);

  // Distinct case types and courts for filter
  const caseTypes = Array.from(new Set(legalCases.map(c => c.caseType).filter(Boolean)));
  const courts = Array.from(new Set(legalCases.map(c => c.courtName).filter(Boolean)));

  // Archive toggle handler
  const handleToggleArchive = async (e, c) => {
    e.stopPropagation();
    const newStatus = c.status === 'Archived' ? 'Active' : 'Archived';
    const tid = toast.loading(newStatus === 'Archived' ? "Archiving case..." : "Restoring case...");
    try {
      await apiService.updateProject(c._id, { status: newStatus });
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
    const nameMatch = c.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const clientMatch = c.clientName?.toLowerCase().includes(searchQuery.toLowerCase());
    const opponentMatch = (c.opponentName || c.accused || '').toLowerCase().includes(searchQuery.toLowerCase());
    const courtMatch = (c.courtName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const typeMatch = c.caseType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || clientMatch || opponentMatch || courtMatch || typeMatch;

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
    if (!c.hearings || c.hearings.length === 0) return 'None';
    const upcoming = c.hearings.filter(h => h.status === 'Upcoming' && h.date);
    if (upcoming.length === 0) return 'None';
    
    // Find earliest upcoming hearing
    const sorted = upcoming.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (isNaN(dateA) || isNaN(dateB)) return 0;
      return dateA - dateB;
    });
    return sorted[0].date;
  };

  const renderStatusPill = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#137333] shrink-0" />
            Active
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F3F4] text-[#3C4043] border border-[#E8EAED] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3C4043] shrink-0" />
            Closed
          </span>
        );
      case 'Archived':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF7E0] text-[#B06000] border border-[#FFE0B2] whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B06000] shrink-0" />
            Archived
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full min-h-0 overflow-hidden bg-[#FFFFFF] relative font-sans text-[#111827]">
      {/* Dashboard Header - Sticky */}
      <div className="w-full px-6 sm:px-10 pt-8 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0 border-b border-[#ECECEC] bg-white">
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="p-2 hover:bg-slate-50 border border-[#ECECEC] rounded-xl transition-colors"
          >
            <ArrowLeft size={18} className="text-[#6B7280]" />
          </motion.button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
              My Matters
            </h1>
            <p className="text-xs text-[#6B7280] font-medium mt-1">
              Browse, search, sort, and manage all your litigation case folders.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingCaseId(null);
              setNewCaseForm({ clientName: '', caseType: '', otherCaseType: '', accused: '', summary: '' });
              setIsNewCaseModalOpen(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] rounded-xl font-black text-xs sm:text-sm transition-all shadow-md active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Case</span>
          </button>
        </div>
      </div>

      {/* Control Bar - Filters & Search */}
      <div className="w-full px-6 sm:px-10 py-5 border-b border-[#ECECEC] bg-white flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center shrink-0">
        {/* ─── BAR 2: Search Input (100% Width) ─── */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-[#C8A34D] absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by case name, client, opponent, court, or case type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#ECECEC] dark:border-slate-800 rounded-xl text-sm placeholder-[#9CA3AF] focus:outline-none focus:border-[#C8A34D] focus:ring-1 focus:ring-[#C8A34D] bg-white dark:bg-[#111111] text-[#111111] dark:text-white transition-all shadow-sm"
          />
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-[#ECECEC] rounded-xl px-3.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-xs font-medium text-[#6B7280]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-[#111827] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Closed">Closed</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Court Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-[#ECECEC] rounded-xl px-3.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-xs font-medium text-[#6B7280]">
            <span>Court:</span>
            <select
              value={courtFilter}
              onChange={(e) => setCourtFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-[#111827] cursor-pointer max-w-[150px] truncate"
            >
              <option value="All">All Courts</option>
              {courts.map(court => (
                <option key={court} value={court}>{court}</option>
              ))}
            </select>
          </div>

          {/* Sorting Option */}
          <div className="flex items-center gap-1.5 bg-white border border-[#ECECEC] rounded-xl px-3.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-xs font-medium text-[#6B7280]">
            <span>Sort by:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-transparent border-none outline-none font-bold text-[#111827] cursor-pointer"
            >
              <option value="lastUpdated">Last Updated</option>
              <option value="createdDate">Date Created</option>
              <option value="name">Case Name</option>
            </select>
          </div>

          {/* Grid/List Toggle */}
          <div className="flex items-center border border-[#ECECEC] dark:border-slate-800 bg-white dark:bg-[#111111] rounded-xl p-1 shadow-sm gap-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#111111] dark:bg-[#222222] text-[#C8A34D]' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#111111] dark:bg-[#222222] text-[#C8A34D]' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Case Listing Area */}
      <div
        className="flex-1 overflow-y-auto custom-scrollbar px-6 sm:px-10 py-8 bg-slate-50/20 dark:bg-[#111111]"
        style={{ scrollBehavior: 'smooth' }}
      >
        {sortedCases.length > 0 ? (
          viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCases.map((c) => {
                const hearingDate = getNextHearingDate(c);
                return (
                  <div
                    key={c._id}
                    className="relative bg-white dark:bg-[#222222] border border-[#ECECEC] dark:border-slate-800 rounded-2xl p-8 shadow-sm transition-all hover:border-[#C8A34D] hover:shadow-md flex flex-col justify-between min-h-[360px] group"
                  >
                    {/* Top Section */}
                    <div className="flex-1 flex flex-col space-y-6">
                      {/* Header with Title and Three-dot Menu */}
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="text-[22px] font-bold text-[#111111] dark:text-white leading-tight flex items-start gap-2.5">
                          <span className="shrink-0">📁</span>
                          <span className="hover:text-[#C8A34D] transition-colors cursor-pointer" onClick={() => handleOpenCase(c)}>
                            {c.name}
                          </span>
                        </h3>
                        
                        {/* Three-dot Action Menu */}
                        <div className="relative shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuCaseId(activeMenuCaseId === c._id ? null : c._id);
                            }}
                            className="p-1.5 hover:bg-slate-50 border border-transparent hover:border-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                            title="Actions"
                          >
                            <span className="text-xl font-bold leading-none">⋮</span>
                          </button>
                          {activeMenuCaseId === c._id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuCaseId(null); }} />
                              <div className="absolute right-0 top-8 w-40 bg-white dark:bg-[#111111] border border-[#ECECEC] dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50 text-left" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => {
                                    handleOpenEditModal(c);
                                    setActiveMenuCaseId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#222222] text-xs font-semibold text-[#111827] dark:text-white flex items-center gap-2 transition-colors"
                                >
                                  <Edit2 size={13} />
                                  Edit Case
                                </button>
                                <button
                                  onClick={(e) => {
                                    handleToggleArchive(e, c);
                                    setActiveMenuCaseId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#222222] text-xs font-semibold text-[#111827] dark:text-white flex items-center gap-2 transition-colors"
                                >
                                  <Archive size={13} />
                                  {c.status === 'Archived' ? 'Restore' : 'Archive'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteCase(c._id);
                                    setActiveMenuCaseId(null);
                                  }}
                                  className="w-full px-4 py-2 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-2 transition-colors border-t border-[#ECECEC]/60"
                                >
                                  <Trash2 size={13} />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Case Type */}
                      <div className="text-base text-slate-500 dark:text-slate-400 font-medium leading-normal">
                        {c.caseType || 'General Dispute'}
                      </div>

                      {/* Court Name */}
                      <div className="text-sm text-slate-500 dark:text-slate-400 font-normal leading-normal">
                        {c.courtName || 'District Court'}
                      </div>

                      {/* Next Hearing */}
                      <div className="text-sm text-slate-500 dark:text-slate-400 font-normal leading-normal flex items-center gap-1.5">
                        <span>🗓</span>
                        <span>{hearingDate !== 'None' ? hearingDate : 'No upcoming hearings'}</span>
                      </div>

                      {/* Status Badge */}
                      <div className="pt-1">
                        {renderStatusPill(c.status)}
                      </div>
                    </div>

                    {/* Divider and Open Case Action */}
                    <div className="mt-6">
                      <div className="border-t border-[#ECECEC] dark:border-slate-800 w-full my-4" />
                      <button
                        onClick={() => handleOpenCase(c)}
                        className="text-[#C8A34D] hover:text-[#b08d3b] text-sm font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Open Workspace →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="w-full bg-white dark:bg-[#222222] border border-[#ECECEC] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto min-h-[280px]">
                <table className="w-full border-collapse text-left text-sm text-slate-500">
                  <thead className="bg-slate-50 dark:bg-[#111111] text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-[#ECECEC] dark:border-slate-800">
                    <tr>
                      <th scope="col" className="w-[30%] px-4 py-3 whitespace-nowrap">Case Name</th>
                      <th scope="col" className="w-[15%] px-4 py-3 whitespace-nowrap">Case Type</th>
                      <th scope="col" className="w-[15%] px-4 py-3 whitespace-nowrap">Court</th>
                      <th scope="col" className="w-[15%] px-4 py-3 whitespace-nowrap">Next Hearing</th>
                      <th scope="col" className="w-[10%] px-4 py-3 whitespace-nowrap">Status</th>
                      <th scope="col" className="w-[5%] px-4 py-3 text-center whitespace-nowrap">Actions</th>
                      <th scope="col" className="w-[10%] px-4 py-3 text-right whitespace-nowrap">Open Workspace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECECEC] dark:divide-slate-800 bg-white dark:bg-[#222222]">
                    {sortedCases.map((c) => {
                      const hearingDate = getNextHearingDate(c);
                      return (
                        <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-[#111111] transition-colors group">
                          <td className="px-4 py-3 font-semibold text-[#111111] dark:text-white text-base whitespace-nowrap">
                            <span className="flex items-center gap-2 whitespace-nowrap">
                              <span className="shrink-0">📁</span>
                              <span className="hover:text-[#C8A34D] transition-colors cursor-pointer" onClick={() => handleOpenCase(c)}>
                                {c.name}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">{c.caseType || 'General Dispute'}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">{c.courtName || 'District Court'}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-sm font-medium whitespace-nowrap">
                            {hearingDate !== 'None' ? `🗓 ${hearingDate}` : 'None'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">{renderStatusPill(c.status)}</td>
                          <td className="px-4 py-3 text-center relative whitespace-nowrap">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuCaseId(activeMenuCaseId === c._id ? null : c._id);
                              }}
                              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors inline-block cursor-pointer"
                            >
                              <span className="text-xl font-bold leading-none">⋮</span>
                            </button>
                            {activeMenuCaseId === c._id && (
                              <>
                                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveMenuCaseId(null); }} />
                                <div className="absolute right-6 top-8 w-40 bg-white dark:bg-[#111111] border border-[#ECECEC] dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50 text-left" onClick={(e) => e.stopPropagation()}>
                                  <button
                                    onClick={() => {
                                      handleOpenEditModal(c);
                                      setActiveMenuCaseId(null);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#222222] text-xs font-semibold text-[#111827] dark:text-white flex items-center gap-2 transition-colors"
                                  >
                                    <Edit2 size={13} />
                                    Edit Case
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      handleToggleArchive(e, c);
                                      setActiveMenuCaseId(null);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-slate-50 dark:hover:bg-[#222222] text-xs font-semibold text-[#111827] dark:text-white flex items-center gap-2 transition-colors"
                                  >
                                    <Archive size={13} />
                                    {c.status === 'Archived' ? 'Restore' : 'Archive'}
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleDeleteCase(c._id);
                                      setActiveMenuCaseId(null);
                                    }}
                                    className="w-full px-4 py-2 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-2 transition-colors border-t border-[#ECECEC]/60"
                                  >
                                    <Trash2 size={13} />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                            <button
                              onClick={() => handleOpenCase(c)}
                              className="text-[#C8A34D] hover:text-[#b08d3b] hover:translate-x-0.5 transition-all text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                            >
                              Open Workspace <ChevronRight size={14} />
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
        ) : (
          /* Empty Case List */
          <div className="flex flex-col items-center justify-center h-full min-h-[450px] text-center space-y-6 max-w-lg mx-auto bg-white dark:bg-[#222222] border border-[#ECECEC] dark:border-slate-800 rounded-2xl p-10 shadow-sm">
            <span className="text-6xl text-[#C8A34D]">📁</span>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-[#111111] dark:text-white">No Cases Yet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Create your first case to start managing litigation, research, evidence and AI-powered legal drafting.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCaseId(null);
                setNewCaseForm({ clientName: '', caseType: '', otherCaseType: '', accused: '', summary: '' });
                setIsNewCaseModalOpen(true);
              }}
              className="px-6 py-3 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] font-black rounded-xl text-sm transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Create New Case</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalDashboard;
