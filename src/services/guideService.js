/**
 * AI LEGAL™ – Web Product Guide Service
 * Handles feature lookup, step-by-step parsing, dynamic suggestions, and AI responses.
 */

import axios from 'axios';
import { apis } from '../types';
import { getUserData } from '../userStore/userData';
import { getDeviceFingerprint } from '../utils/fingerprint';

export const APP_CONTEXTS = [
  { id: 'General', label: '🌐 General Overview' },
  { id: 'Dashboard', label: '📊 Dashboard & Quick Actions' },
  { id: 'My Matters', label: '📁 My Matters & Cases' },
  { id: 'Case Workspace', label: '💼 Case Workspace' },
  { id: 'Evidence Vault', label: '📎 Evidence Vault & Analyst' },
  { id: 'Draft Maker', label: '📝 Draft Maker' },
  { id: 'Contract Analyzer', label: '📄 Contract Analyzer' },
  { id: 'Timeline', label: '⏱ Case Timeline' },
  { id: 'OCR Scanner', label: '🔤 OCR & Document Scanner' },
  { id: 'Settings', label: '⚙ Settings & Preferences' }
];

export const QUICK_ACTIONS = [
  { label: 'Create New Case', icon: '🚀', query: 'How do I create a case in My Matters?' },
  { label: 'Upload Evidence', icon: '📎', query: 'How do I upload evidence in Evidence Analyst?' },
  { label: 'Generate Draft', icon: '📝', query: 'How do I use Draft Maker to generate legal notices?' },
  { label: 'Analyze Contract', icon: '📄', query: 'How does Contract Analyzer identify legal risks?' },
  { label: 'Research Case Law', icon: '📚', query: 'How do I research precedents in Legal Precedents?' },
  { label: 'View Timeline', icon: '⏱', query: 'How does Case Timeline extract facts chronologically?' },
  { label: 'Manage Hearings', icon: '🔔', query: 'How do I add court hearings and reminders?' },
  { label: 'Open Settings', icon: '⚙', query: 'How do I manage my settings and language preferences?' }
];

const WEB_ROUTES_MAP = {
  'My Matters': '/dashboard/cases',
  'Case Creation': '/dashboard/cases',
  'Draft Maker': '/dashboard/tools/draft-maker',
  'Argument Builder': '/dashboard/tools/argument-builder',
  'Legal Precedents': '/dashboard/tools/legal-precedents',
  'Evidence Analyst': '/dashboard/tools/evidence-analyst',
  'Contract Analyzer': '/dashboard/tools/contract-analyzer',
  'Case Predictor': '/dashboard/tools/case-predictor',
  'Strategy Engine': '/dashboard/tools/strategy-engine',
  'AI Mock Courtroom': '/dashboard/tools/mock-courtroom',
  'AI Client Connect': '/dashboard/tools/client-connect',
  'AI Legal Assistant': '/dashboard/chat',
  'Settings': '/dashboard/settings',
  'Dashboard': '/dashboard'
};

const KNOWLEDGE_BASE = [
  {
    id: 'case_creation',
    topic: 'Case Creation',
    keywords: ['case', 'create', 'new case', 'folder', 'matter', 'bana', 'banae'],
    patterns: [/create.*case/i, /new.*case/i, /case.*creation/i, /add.*case/i],
    reply: `You can initialize case dossiers in My Matters to keep all pleadings, evidence, and hearings organized.
↓
Step 1
Open My Matters from the left sidebar navigation menu.
↓
Step 2
Click the "+ New Case" button in the top header.
↓
Step 3
Enter the mandatory Case Name, Client Name, and select the Legal Domain (Civil, Criminal, Corporate, etc.).
↓
Step 4
Enter opposing party details to run automatic conflict-of-interest checks.
↓
Step 5
Click "Create Case Folder" to initialize your docket.
↓
Tip
• Case folders serve as the central ledger linking documents, evidence, timeline events, and court hearings together.`,
    navRoute: '/dashboard/cases',
    navLabel: 'Open My Matters →',
    suggestions: ['How do I upload evidence?', 'Where is Draft Maker?', 'Explain Case Timeline']
  },
  {
    id: 'draft_maker',
    topic: 'Draft Maker',
    keywords: ['draft', 'maker', 'notice', 'petition', 'agreement', 'affidavit', 'deed', 'generate draft'],
    patterns: [/draft.*maker/i, /generate.*draft/i, /notice/i, /rent.*agreement/i],
    reply: `Draft Maker helps you generate ready-to-use court notices, rent agreements, petitions, and affidavits using AI.
↓
Step 1
Open AI Tools from the sidebar and select Draft Maker.
↓
Step 2
Choose a document template from the library (Legal Notice, Rent Deed, Commercial Contract, Reply, etc.).
↓
Step 3
Select your input source: Choose an Existing Case to prefill client data, upload reference files, or enter details manually.
↓
Step 4
Click "Generate Draft" to produce a professional legal document.
↓
Step 5
Review, edit text inline, and export as Word (DOCX) or PDF.
↓
Tip
• Generated drafts automatically link to the selected case dossier for easy access later.`,
    navRoute: '/dashboard/tools/draft-maker',
    navLabel: 'Open Draft Maker →',
    suggestions: ['Contract Analyzer vs Draft Maker', 'How do I upload evidence?', 'What is Case Predictor?']
  },
  {
    id: 'evidence_analyst',
    topic: 'Evidence Analyst & Vault',
    keywords: ['evidence', 'vault', 'upload', 'analyst', 'ocr', 'pdf', 'scan', 'saboot', 'proof'],
    patterns: [/evidence.*analyst/i, /upload.*evidence/i, /ocr/i, /scan.*document/i],
    reply: `Evidence Analyst allows you to upload, OCR scan, forensic inspect, and run AI analysis on case documents.
↓
Step 1
Go to AI Tools -> Evidence Analyst (or open Evidence Vault inside any Case Workspace).
↓
Step 2
Click "Upload Evidence" and select PDF, DOCX, PNG, JPG, or audio/video files.
↓
Step 3
AI automatically runs background OCR text extraction and indexing.
↓
Step 4
View extracted text, BSA admissibility notes, and key factual timelines.
↓
Tip
• Files up to 20MB are indexed for instant semantic search across your entire case docket.`,
    navRoute: '/dashboard/tools/evidence-analyst',
    navLabel: 'Open Evidence Analyst →',
    suggestions: ['How does Contract Analyzer work?', 'Where is Case Timeline?', 'How do I generate a draft?']
  },
  {
    id: 'contract_analyzer',
    topic: 'Contract Analyzer',
    keywords: ['contract', 'analyzer', 'clause', 'risk', 'obligation', 'indemnity', 'termination'],
    patterns: [/contract.*analyzer/i, /analyze.*contract/i, /contract.*risk/i],
    reply: `Contract Analyzer audits commercial agreements, leases, and contracts to flag risks, liabilities, and missing clauses.
↓
Step 1
Navigate to AI Tools -> Contract Analyzer.
↓
Step 2
Select an active case or upload a PDF/DOCX contract.
↓
Step 3
Click "Run Contract Audit".
↓
Step 4
Inspect the Audit Dashboard: view Risk Severity Scores (Safe, Moderate Risk, Severe Risk), extracted obligations, and redline suggestions.
↓
Tip
• Contract Analyzer highlights indemnities, termination clauses, force majeure, and liability caps automatically.`,
    navRoute: '/dashboard/tools/contract-analyzer',
    navLabel: 'Open Contract Analyzer →',
    suggestions: ['Draft Maker vs Contract Analyzer', 'How do I search case law?', 'What is Strategy Engine?']
  },
  {
    id: 'timeline',
    topic: 'Case Timeline',
    keywords: ['timeline', 'chronology', 'event', 'date', 'milestone', 'history', 'incident'],
    patterns: [/timeline/i, /chronology/i, /milestone/i, /date.*wise/i],
    reply: `Case Timeline organizes factual events, court dates, and evidence milestones chronologically.
↓
Step 1
Open My Matters and enter your target Case Workspace.
↓
Step 2
Click the "Timeline" tab.
↓
Step 3
View dates automatically extracted from uploaded evidence and court filings.
↓
Step 4
Click "+ Add Milestone" to manually log key dates or incident facts.
↓
Tip
• Timeline entries directly sync with your trial briefing notes for court arguments.`,
    navRoute: '/dashboard/cases',
    navLabel: 'Open My Matters →',
    suggestions: ['How do I manage court hearings?', 'How do I upload evidence?', 'Where is Argument Builder?']
  },
  {
    id: 'legal_precedents',
    topic: 'Legal Precedents',
    keywords: ['precedent', 'judgment', 'citation', 'research', 'ratio', 'supreme court', 'case law'],
    patterns: [/precedent/i, /judgment/i, /citation/i, /research.*law/i],
    reply: `Legal Precedents helps you search Supreme Court, High Court, and Tribunal rulings to find binding ratios.
↓
Step 1
Go to AI Tools -> Legal Precedents.
↓
Step 2
Enter search keywords, section numbers, or citation references.
↓
Step 3
Filter results by Court, Year, and Practice Domain.
↓
Step 4
Read AI-summarized ratios, headnotes, and click "Save to Case" to bookmark precedent briefs.
↓
Tip
• Precedents can be directly imported into Argument Builder to construct court submissions.`,
    navRoute: '/dashboard/tools/legal-precedents',
    navLabel: 'Open Legal Precedents →',
    suggestions: ['What is Argument Builder?', 'How do I predict case outcome?', 'Explain Strategy Engine']
  },
  {
    id: 'hearings_reminders',
    topic: 'Hearings & Reminders',
    keywords: ['hearing', 'reminder', 'court date', 'judge', 'alert', 'calendar', 'presider'],
    patterns: [/hearing/i, /reminder/i, /court.*date/i, /judge/i],
    reply: `Log court hearings, judge names, presider details, and receive automated hearing alerts.
↓
Step 1
Open Case Workspace -> Hearings tab.
↓
Step 2
Click "Add Hearing".
↓
Step 3
Enter Court Name, Hearing Date, Judge/Bench, Agenda, and Status.
↓
Step 4
Save to activate automated notifications 24 hours and 2 hours before the scheduled appearance.
↓
Tip
• Hearing logs automatically map to your case docket progress ledger.`,
    navRoute: '/dashboard/cases',
    navLabel: 'Open My Matters →',
    suggestions: ['How do I create a case?', 'Where is Timeline?', 'Open Settings']
  }
];

export class GuideService {
  /**
   * Main response generator for Product Guide
   */
  static async getResponse(query, currentContext = 'General', conversationHistory = []) {
    const cleanQuery = (query || '').trim().toLowerCase();

    // 1. Check for off-scope non-app legal queries (e.g., criminal advice, emergency filing)
    const isOffScope = /(how to murder|bail advice|divorce lawyer fees|sue my neighbor|real crime|police emergency)/i.test(cleanQuery);
    if (isOffScope) {
      return {
        reply: `[GUIDE_LIMITATION] AI LEGAL™ Product Guide explains how to navigate and use the AI LEGAL™ platform features. It does not provide real-world emergency legal representation or outside legal counsel.`,
        suggestions: [
          'How do I create a case?',
          'Where is Draft Maker?',
          'How do I upload evidence?'
        ]
      };
    }

    // 2. Search local knowledge base for exact pattern/keyword matches
    const matchedDoc = KNOWLEDGE_BASE.find(doc => {
      return doc.patterns.some(pattern => pattern.test(cleanQuery)) ||
             doc.keywords.some(kw => cleanQuery.includes(kw));
    });

    if (matchedDoc) {
      return {
        reply: matchedDoc.reply,
        navRoute: matchedDoc.navRoute,
        navLabel: matchedDoc.navLabel,
        suggestions: matchedDoc.suggestions
      };
    }

    // 3. Dynamic AI Fallback via Gemini Chat API
    try {
      const systemInstruction = `You are AI LEGAL™ Product Guide, an interactive AI coach for advocates using the AI LEGAL™ web application.
Your ONLY job is to explain how to use the AI LEGAL™ platform features, screens, and navigation.

Application Navigation Routes:
- Dashboard: /dashboard
- My Matters & Cases: /dashboard/cases
- AI Legal Assistant: /dashboard/chat
- AI Tools: /dashboard/tools
- Draft Maker: /dashboard/tools/draft-maker
- Argument Builder: /dashboard/tools/argument-builder
- Legal Precedents: /dashboard/tools/legal-precedents
- Evidence Analyst: /dashboard/tools/evidence-analyst
- Contract Analyzer: /dashboard/tools/contract-analyzer
- Case Predictor: /dashboard/tools/case-predictor
- Strategy Engine: /dashboard/tools/strategy-engine
- AI Mock Courtroom: /dashboard/tools/mock-courtroom
- AI Client Connect: /dashboard/tools/client-connect
- Settings: /dashboard/settings

Selected Context: ${currentContext}

STRICT OUTPUT RULES:
1. If question is NOT about using AI LEGAL™, start response with:
"[GUIDE_LIMITATION] AI LEGAL™ Product Guide explains how to use the application. It does not provide external legal advice."
2. FORMAT: Format explanations with visual step cards using '↓' divider between steps.
Example:
"To use this feature:
↓
Step 1
Open target module from sidebar.
↓
Step 2
Select your inputs.
↓
Tip
• Keep details clear for best results."
3. Keep answers concise (100-200 words max). Do NOT invent non-existent features.`;

      const token = getUserData()?.token;
      const headers = { 'X-Device-Fingerprint': getDeviceFingerprint() };
      if (token && token !== 'undefined' && token !== 'null') {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await axios.post(apis.chatAgent, {
        content: `[CONTEXT: ${currentContext}] ${query}`,
        history: conversationHistory.slice(-4).map(m => ({
          role: m.sender === 'user' ? 'user' : 'model',
          content: m.text
        })),
        systemInstruction,
        language: 'English',
        skipSession: true
      }, { headers, withCredentials: true, timeout: 15000 });

      const aiReply = res.data?.response || res.data?.message || `I can help you navigate AI LEGAL™! Open the sidebar to access My Matters, AI Legal Assistant, or AI Tools.`;

      // Extract matching route if mentioned in response
      let navRoute = null;
      let navLabel = null;
      for (const [name, route] of Object.entries(WEB_ROUTES_MAP)) {
        if (cleanQuery.includes(name.toLowerCase()) || aiReply.toLowerCase().includes(name.toLowerCase())) {
          navRoute = route;
          navLabel = `Open ${name} →`;
          break;
        }
      }

      return {
        reply: aiReply,
        navRoute,
        navLabel,
        suggestions: [
          'How do I create a case?',
          'Where is Draft Maker?',
          'How do I upload evidence?'
        ]
      };
    } catch (err) {
      console.error("Guide AI API failed, fallback to default:", err);
      return {
        reply: `I can help you learn every feature of AI LEGAL™!
↓
Step 1
Use the left sidebar navigation to switch between Dashboard, My Matters, AI Legal Assistant, and AI Tools.
↓
Step 2
In AI Tools, access Draft Maker, Evidence Analyst, Contract Analyzer, Case Predictor, and Strategy Engine.
↓
Tip
• Select a specific App Context from the top dropdown to calibrate answers for that module.`,
        navRoute: '/dashboard/tools',
        navLabel: 'Explore AI Tools →',
        suggestions: [
          'How do I create a case?',
          'Where is Draft Maker?',
          'How do I upload evidence?'
        ]
      };
    }
  }
}
