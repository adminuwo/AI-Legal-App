import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Search, FileText, Scale, Binary, FileCheck, 
  Brain, Gavel, GraduationCap, Building2, MessageSquare, 
  BookOpen, Award, ArrowRight, ShieldAlert, CheckCircle2,
  Mic, Users, BookMarked, HelpCircle, FileCheck2, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { selectedRoleState } from '../userStore/userData';

const ALL_TOOLS = [
  // Advocate Core Litigation & Drafting (Master Prompt Spec)
  {
    id: 'draft-maker',
    title: 'Legal Draft Maker',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'Architect FIRs, Affidavits, Petitions, Plaints, Bail Applications, Commercial Agreements & Legal Notices under BNS/CPC.',
    highlights: ['FIR & Petitions', 'Order VII CPC', 'PDF/Word Export'],
    icon: FileText,
    badge: 'Core Tool',
    path: '/dashboard/chat/new?tool=legal_draft_maker',
  },
  {
    id: 'argument-builder',
    title: 'Courtroom Argument Builder',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'Hearing intelligence, 5-point oral submissions, opposition counter-pleas, judge profiling & submission checklist.',
    highlights: ['Oral Submissions', 'Counter-Rebuttals', 'Judge Profiling'],
    icon: Gavel,
    badge: 'Popular',
    path: '/dashboard/chat/new?tool=legal_argument_builder',
  },
  {
    id: 'legal-precedents',
    title: 'Precedents Search & Citations',
    category: 'research',
    roleTarget: 'all',
    description: 'Search Supreme Court & High Court landmark judgments with auto-citations, ratio decidendi & SCC/AIR citation format.',
    highlights: ['Supreme Court & HCs', 'Ratio Decidendi', 'AIR/SCC Citations'],
    icon: BookOpen,
    badge: 'Precedents',
    path: '/dashboard/chat/new?tool=legal_precedents',
  },
  {
    id: 'evidence-analyst',
    title: 'Evidence Analyst & Forensics',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'OCR exhibit scanning, admissibility score dial (0-100%), witness deposition contradiction table & missing proof alerts.',
    highlights: ['Sec 65B BSA OCR', 'Admissibility Gauge', 'Deposition Contradictions'],
    icon: Binary,
    badge: 'Forensics',
    path: '/dashboard/chat/new?tool=legal_evidence_checker',
  },
  {
    id: 'contract-analyzer',
    title: 'Contract Review & Risk Audit',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'Clause risk audit cards, executive risk rating (Low/Med/High/Critical), redline replacement suggestions & missing indemnity alerts.',
    highlights: ['Clause Audit', 'Redline Suggestions', 'Risk Rating Badge'],
    icon: FileCheck,
    badge: 'Audit',
    path: '/dashboard/chat/new?tool=legal_contract_analyzer',
  },
  {
    id: 'case-predictor',
    title: 'Case Outcome Predictor',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'Statistical success probability dial, judicial trend analysis, litigation duration forecast & settlement value range.',
    highlights: ['Win Probability %', 'Judicial Bench Trends', 'Settlement Range'],
    icon: Scale,
    badge: 'Analytics',
    path: '/dashboard/chat/new?tool=legal_case_predictor',
  },
  {
    id: 'strategy-engine',
    title: 'Legal Strategy Engine',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'Custom tactical litigation roadmap under BNS/CrPC/CPC, cross-examination question builder & interim relief timing.',
    highlights: ['Tactical Roadmap', 'Cross-Exam Questions', 'Interim Reliefs'],
    icon: Brain,
    badge: 'AI Engine',
    path: '/dashboard/chat/new?tool=legal_strategy_engine',
  },
  {
    id: 'mock-courtroom',
    title: 'AI Mock Courtroom Simulator',
    category: 'interactive',
    roleTarget: 'advocate',
    description: 'Interactive voice & text courtroom practice with simulated AI Judge, opposing counsel objections & trial scoring.',
    highlights: ['Voice AI Judge', 'Objection Handling', 'Courtroom Score'],
    icon: Mic,
    badge: 'Voice AI',
    path: '/dashboard/chat/new?prompt=Start%20AI%20Mock%20Courtroom%20Practice',
  },
  {
    id: 'client-connect',
    title: 'AI Client Connect™',
    category: 'firm',
    roleTarget: 'advocate',
    description: 'Automated client WhatsApp/SMS hearing reminders, legal fee follow-up drafter & client communication history.',
    highlights: ['WhatsApp Reminders', 'Client CRM', 'Status Broadcasts'],
    icon: MessageSquare,
    badge: 'Client CRM',
    path: '/dashboard/chat/new?prompt=Generate%20Client%20Hearing%20Reminder%20Message',
  },

  // Additional Academic & Firm Management Tools
  {
    id: 'research-assistant',
    title: 'AI Legal Research Assistant',
    category: 'research',
    roleTarget: 'all',
    description: 'Comprehensive research across Indian Constitution, Bare Acts, Statutes & Regulations.',
    highlights: ['Bare Acts & Statutes', 'Constitutional Law', 'Act Comparison'],
    icon: Search,
    badge: 'Research',
    path: '/dashboard/chat/new?tool=legal_research_assistant',
  },
  {
    id: 'quiz-practice',
    title: 'Judiciary & Bar Exam Quiz Prep',
    category: 'interactive',
    roleTarget: 'student',
    description: 'Judiciary, AIBE & CLAT exam prep with topic MCQs, mock tests and detailed explanations.',
    highlights: ['AIBE & Judiciary MCQs', 'Mock Tests', 'Explanations'],
    icon: GraduationCap,
    badge: 'Exam Prep',
    path: '/dashboard/chat/new?prompt=Generate%20Judiciary%20MCQ%20Quiz%20on%20BNS%20and%20IPC',
  },
  {
    id: 'notes-maker',
    title: 'Legal Notes & Digest Maker',
    category: 'interactive',
    roleTarget: 'student',
    description: 'Synthesize case laws, client files, and legal transcripts into structured briefing notes.',
    highlights: ['Briefing Notes', 'Case Digest', 'Exam Notes'],
    icon: FileCheck2,
    badge: 'Productivity',
    path: '/dashboard/chat/new?tool=notes_maker',
  },
  {
    id: 'client-communication',
    title: 'Client Communication & Consultations',
    category: 'firm',
    roleTarget: 'law_firm',
    description: 'Draft professional legal opinions, advice letters, and client consultation summaries.',
    highlights: ['Legal Opinions', 'Advice Letters', 'Consultations'],
    icon: ShieldCheck,
    badge: 'Advice',
    path: '/dashboard/chat/new?tool=client_communication',
  },
  {
    id: 'case-assignment',
    title: 'Case & Task Assignment',
    category: 'firm',
    roleTarget: 'law_firm',
    description: 'Assign case matters, track associate deadlines, and allocate firm workload.',
    highlights: ['Associate Allocation', 'Deadline Tracker', 'Firm Workload'],
    icon: Users,
    badge: 'Team Workload',
    path: '/dashboard/cases',
  },
];

import LegalDraftMakerModal from '../Components/LegalDraftMakerModal';
import LegalArgumentBuilderModal from '../Components/LegalArgumentBuilderModal';
import LegalPrecedentsModal from '../Components/LegalPrecedentsModal';
import LegalEvidenceAnalystModal from '../Components/LegalEvidenceAnalystModal';
import LegalContractAnalyzerModal from '../Components/LegalContractAnalyzerModal';
import LegalCasePredictorModal from '../Components/LegalCasePredictorModal';
import LegalStrategyEngineModal from '../Components/LegalStrategyEngineModal';
import LegalMockCourtroomModal from '../Components/LegalMockCourtroomModal';

export default function AiToolsPage() {
  const navigate = useNavigate();
  const selectedRole = useRecoilValue(selectedRoleState) || 'advocate';
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeRoleFilter, setActiveRoleFilter] = useState(selectedRole || 'advocate');
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isArgumentModalOpen, setIsArgumentModalOpen] = useState(false);
  const [isPrecedentsModalOpen, setIsPrecedentsModalOpen] = useState(false);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isPredictorModalOpen, setIsPredictorModalOpen] = useState(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] = useState(false);
  const [isCourtroomModalOpen, setIsCourtroomModalOpen] = useState(false);

  const handleLaunchTool = (tool) => {
    if (tool.id === 'draft-maker') {
      setIsDraftModalOpen(true);
    } else if (tool.id === 'argument-builder') {
      setIsArgumentModalOpen(true);
    } else if (tool.id === 'legal-precedents') {
      setIsPrecedentsModalOpen(true);
    } else if (tool.id === 'evidence-analyst') {
      setIsEvidenceModalOpen(true);
    } else if (tool.id === 'contract-analyzer') {
      setIsContractModalOpen(true);
    } else if (tool.id === 'case-predictor') {
      setIsPredictorModalOpen(true);
    } else if (tool.id === 'strategy-engine') {
      setIsStrategyModalOpen(true);
    } else if (tool.id === 'mock-courtroom') {
      setIsCourtroomModalOpen(true);
    } else {
      navigate(tool.path);
    }
  };

  const filteredTools = ALL_TOOLS.filter((tool) => {
    const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || tool.category === activeCategory;
    const matchesRole = activeRoleFilter === 'all' || 
                        tool.roleTarget === 'all' || 
                        tool.roleTarget === activeRoleFilter;
    return matchesSearch && matchesCategory && matchesRole;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#111111] pt-24 pb-16 px-6 md:px-16 max-w-7xl mx-auto text-[#111111] dark:text-white font-sans space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-8 rounded-2xl bg-gradient-to-r from-[#111111] via-[#222222] to-[#111111] border border-[#C8A34D]/30 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C8A34D]/15 border border-[#C8A34D]/30 text-[#C8A34D] text-xs font-semibold">
            <Zap className="w-4 h-4 text-[#C8A34D]" />
            <span>Advocate Enterprise AI Suite • Rolex Minimalist Theme</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
            Advocate AI Tools Suite ⚡
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Empower your litigation, courtroom argument building, evidence forensics, contract risk auditing, case outcome prediction, and legal drafting with Soft Gold enterprise AI tools.
          </p>
        </div>
      </div>

      {/* Role Mode Selector Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-[#222222] p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#C8A34D] px-3 shrink-0">Role Suite:</span>
        {[
          { id: 'advocate', label: '⚖️ Advocate Suite (9)', count: ALL_TOOLS.filter(t => t.roleTarget === 'advocate' || t.roleTarget === 'all').length },
          { id: 'student', label: '🎓 Student Suite (5)', count: ALL_TOOLS.filter(t => t.roleTarget === 'student' || t.roleTarget === 'all').length },
          { id: 'law_firm', label: '🏢 Enterprise Firm (5)', count: ALL_TOOLS.filter(t => t.roleTarget === 'law_firm' || t.roleTarget === 'all').length },
          { id: 'all', label: '🌐 All Suite Tools (16)', count: ALL_TOOLS.length },
        ].map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRoleFilter(role.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeRoleFilter === role.id
                ? 'bg-[#111111] text-[#C8A34D] border border-[#C8A34D]/40 font-black shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{role.label}</span>
          </button>
        ))}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-[#C8A34D]" />
          <input
            type="text"
            placeholder="Search Advocate AI Tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#222222] border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white transition-all shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'litigation', label: 'Litigation & Drafting' },
            { id: 'research', label: 'Research & Precedents' },
            { id: 'interactive', label: 'Courtroom & Practice' },
            { id: 'firm', label: 'Firm & Client CRM' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#C8A34D] text-[#111111] shadow-md shadow-[#C8A34D]/20 font-black'
                  : 'bg-white dark:bg-[#222222] text-slate-600 dark:text-slate-300 hover:text-[#C8A34D] border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((t) => {
          const IconComp = t.icon;
          return (
            <motion.div
              key={t.id}
              whileHover={{ y: -4 }}
              onClick={() => handleLaunchTool(t)}
              className="group p-6 rounded-2xl bg-white dark:bg-[#222222] border border-slate-200 dark:border-slate-800 hover:border-[#C8A34D]/60 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="p-3.5 rounded-xl bg-[#111111] border border-[#C8A34D]/30 text-[#C8A34D]">
                    <IconComp className="w-6 h-6 text-[#C8A34D]" />
                  </div>
                  <div className="flex gap-1.5">
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#111111] text-[#C8A34D] border border-[#C8A34D]/30 uppercase">
                      {t.roleTarget === 'advocate' ? 'ADVOCATE' : t.roleTarget === 'student' ? 'STUDENT' : t.roleTarget === 'law_firm' ? 'LAW FIRM' : 'SHARED'}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#C8A34D]/15 text-[#C8A34D] border border-[#C8A34D]/30 uppercase">
                      {t.badge}
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-[#111111] dark:text-white group-hover:text-[#C8A34D] transition-colors">
                  {t.title}
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {t.description}
                </p>

                {/* Spec Highlights */}
                {t.highlights && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {t.highlights.map((h, i) => (
                      <span key={i} className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#111111] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        • {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-[#C8A34D]">
                <span>Launch Tool</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 6-Step Legal Draft Maker Wizard Modal */}
      <LegalDraftMakerModal 
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
      />

      {/* 4-Step Courtroom Argument Builder Modal */}
      <LegalArgumentBuilderModal
        isOpen={isArgumentModalOpen}
        onClose={() => setIsArgumentModalOpen(false)}
      />

      {/* 4-Step Legal Precedents Search Modal */}
      <LegalPrecedentsModal
        isOpen={isPrecedentsModalOpen}
        onClose={() => setIsPrecedentsModalOpen(false)}
      />

      {/* 4-Step Evidence Analyst & Forensics Modal */}
      <LegalEvidenceAnalystModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
      />

      {/* 4-Step Contract Review & Risk Audit Modal */}
      <LegalContractAnalyzerModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
      />

      {/* 4-Step Case Outcome Predictor Modal */}
      <LegalCasePredictorModal
        isOpen={isPredictorModalOpen}
        onClose={() => setIsPredictorModalOpen(false)}
      />

      {/* 4-Step Legal Strategy Engine Modal */}
      <LegalStrategyEngineModal
        isOpen={isStrategyModalOpen}
        onClose={() => setIsStrategyModalOpen(false)}
      />

      {/* 4-Step AI Mock Courtroom Simulator Modal */}
      <LegalMockCourtroomModal
        isOpen={isCourtroomModalOpen}
        onClose={() => setIsCourtroomModalOpen(false)}
      />
    </div>
  );
}

