import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, FileText, Scale, Binary, FileCheck, 
  Brain, Gavel, GraduationCap, Building2, MessageSquare, 
  BookOpen, Award, ArrowRight, ShieldAlert, CheckCircle2,
  Mic, Users, BookMarked, HelpCircle, FileCheck2, ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ALL_TOOLS = [
  // Core Litigation & Drafting
  {
    id: 'draft-maker',
    title: 'Draft Maker',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'Architect FIRs, Affidavits, Petitions, Plaints, Bail Applications, Commercial Agreements & Legal Notices under BNS/CPC.',
    highlights: ['FIR & Petitions', 'Order VII CPC', 'PDF/Word Export'],
    icon: FileText,
    badge: 'Core Tool',
    path: '/dashboard/tools/draft-maker',
  },
  {
    id: 'argument-builder',
    title: 'Argument Builder',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'Hearing intelligence, 5-point oral submissions, opposition counter-pleas, judge profiling & submission checklist.',
    highlights: ['Oral Submissions', 'Counter-Rebuttals', 'Judge Profiling'],
    icon: Gavel,
    badge: 'Popular',
    path: '/dashboard/tools/argument-builder',
  },
  {
    id: 'legal-precedents',
    title: 'Legal Precedents',
    category: 'research',
    roleTarget: 'all',
    description: 'Search Supreme Court & High Court landmark judgments with auto-citations, ratio decidendi & SCC/AIR citation format.',
    highlights: ['Supreme Court & HCs', 'Ratio Decidendi', 'AIR/SCC Citations'],
    icon: BookOpen,
    badge: 'Precedents',
    path: '/dashboard/tools/legal-precedents',
  },
  {
    id: 'evidence-analyst',
    title: 'Evidence Analyst',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'OCR exhibit scanning, admissibility score dial (0-100%), witness deposition contradiction table & missing proof alerts.',
    highlights: ['Sec 65B BSA OCR', 'Admissibility Gauge', 'Deposition Contradictions'],
    icon: Binary,
    badge: 'Forensics',
    path: '/dashboard/tools/evidence-analyst',
  },
  {
    id: 'contract-analyzer',
    title: 'Contract Analyzer',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'Clause risk audit cards, executive risk rating (Low/Med/High/Critical), redline replacement suggestions & missing indemnity alerts.',
    highlights: ['Clause Audit', 'Redline Suggestions', 'Risk Rating Badge'],
    icon: FileCheck,
    badge: 'Audit',
    path: '/dashboard/tools/contract-analyzer',
  },
  {
    id: 'case-predictor',
    title: 'Case Predictor',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'Statistical success probability dial, judicial trend analysis, litigation duration forecast & settlement value range.',
    highlights: ['Win Probability %', 'Judicial Bench Trends', 'Settlement Range'],
    icon: Scale,
    badge: 'Analytics',
    path: '/dashboard/tools/case-predictor',
  },
  {
    id: 'strategy-engine',
    title: 'Strategy Engine',
    category: 'litigation',
    roleTarget: 'advocate',
    description: 'Custom tactical litigation roadmap under BNS/CrPC/CPC, cross-examination question builder & interim relief timing.',
    highlights: ['Tactical Roadmap', 'Cross-Exam Questions', 'Interim Reliefs'],
    icon: Brain,
    badge: 'AI Engine',
    path: '/dashboard/tools/strategy-engine',
  },
  {
    id: 'mock-courtroom',
    title: 'AI Mock Courtroom',
    category: 'interactive',
    roleTarget: 'advocate',
    description: 'Interactive voice & text courtroom practice with simulated AI Judge, opposing counsel objections & trial scoring.',
    highlights: ['Voice AI Judge', 'Objection Handling', 'Courtroom Score'],
    icon: Mic,
    badge: 'Voice AI',
    path: '/dashboard/tools/mock-courtroom',
  },
  {
    id: 'client-connect',
    title: 'AI Client Connect',
    category: 'firm',
    roleTarget: 'advocate',
    description: 'Automated client WhatsApp/SMS hearing reminders, legal fee follow-up drafter & client communication history.',
    highlights: ['WhatsApp Reminders', 'Client CRM', 'Status Broadcasts'],
    icon: MessageSquare,
    badge: 'Client CRM',
    path: '/dashboard/tools/client-connect',
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
      navigate('/dashboard/tools/draft-maker');
    } else if (tool.id === 'argument-builder') {
      navigate('/dashboard/tools/argument-builder');
    } else if (tool.id === 'legal-precedents') {
      navigate('/dashboard/tools/legal-precedents');
    } else if (tool.id === 'evidence-analyst') {
      navigate('/dashboard/tools/evidence-analyst');
    } else if (tool.id === 'contract-analyzer') {
      navigate('/dashboard/tools/contract-analyzer');
    } else if (tool.id === 'case-predictor') {
      navigate('/dashboard/tools/case-predictor');
    } else if (tool.id === 'strategy-engine') {
      navigate('/dashboard/tools/strategy-engine');
    } else if (tool.id === 'mock-courtroom') {
      navigate('/dashboard/tools/mock-courtroom');
    } else if (tool.id === 'client-connect') {
      navigate('/dashboard/tools/client-connect');
    } else {
      navigate(tool.path);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-[#111111] pt-4 md:pt-6 pb-12 px-4 md:px-12 max-w-7xl mx-auto text-[#111111] dark:text-white font-sans space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 p-5 md:p-6 rounded-xl bg-white dark:bg-[#1E293B] border border-[#C8A34D]/30 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C8A34D]/10 border border-[#C8A34D]/30 text-[#C8A34D] text-[11px] font-semibold">
            <Zap className="w-3.5 h-3.5 text-[#C8A34D]" />
            <span>Advocate Enterprise AI Suite • Rolex Minimalist Theme</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#0F172A] dark:text-white">
            Advocate AI Tools Suite ⚡
          </h1>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-snug">
            Empower your litigation, courtroom argument building, evidence forensics, contract risk auditing, case outcome prediction, and legal drafting with Soft Gold enterprise AI tools.
          </p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_TOOLS.map((t) => {
          const IconComp = t.icon;
          return (
            <motion.div
              key={t.id}
              whileHover={{ y: -3 }}
              onClick={() => handleLaunchTool(t)}
              className="group p-4 sm:p-5 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 hover:border-[#C8A34D]/60 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="p-2.5 rounded-lg bg-[#C8A34D]/10 border border-[#C8A34D]/25 text-[#C8A34D]">
                    <IconComp className="w-5 h-5 text-[#C8A34D]" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#111111] dark:text-white group-hover:text-[#C8A34D] transition-colors leading-tight">
                  {t.title}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-snug line-clamp-2">
                  {t.description}
                </p>

                {/* Spec Highlights */}
                {t.highlights && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {t.highlights.map((h, i) => (
                      <span key={i} className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#111111] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        • {h}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-[#C8A34D]">
                <span>Start</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
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

