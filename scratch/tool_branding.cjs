const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Workspace', 'LegalWorkspace.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Define getToolDetails helper function with all the tool configs
const getToolDetailsFunction = `
  const getToolDetails = (toolId) => {
    const tools = {
      legal_draft_maker: {
        title: "Draft Maker",
        emoji: "✍️",
        icon: FileText,
        desc: "Professional legal draft generation workspace. Create high-quality notices, agreements, petitions, affidavits, and FIRs.",
        placeholder: "Enter details for the legal draft you want to generate...",
        chips: [
          { label: "Tenant Agreement", text: "Create a residential tenant agreement draft for..." },
          { label: "Legal Notice", text: "Draft a legal notice for non-payment of dues..." },
          { label: "Partnership Deed", text: "Draft a partnership deed between two partners..." },
          { label: "FIR Draft", text: "Draft a first information report (FIR) for theft..." },
          { label: "Power of Attorney", text: "Draft a general power of attorney..." }
        ]
      },
      legal_research_assistant: {
        title: "Legal Research",
        emoji: "🔍",
        icon: Search,
        desc: "Advanced AI legal research workspace. Search for matching acts, sections, judgments, and legal precedents.",
        placeholder: "Enter a legal topic, act, or section to research...",
        chips: [
          { label: "Section 138 NI Act", text: "Research landmark judgments under Section 138 of NI Act..." },
          { label: "Consumer Protection", text: "Search precedents on consumer protection liability for..." },
          { label: "Bail Application", text: "Research legal grounds and case law for bail in..." },
          { label: "RTI Scope", text: "Research the scope of Right to Information Act regarding..." },
          { label: "CPC Order 39", text: "Find case law on temporary injunctions under Order 39 CPC..." }
        ]
      },
      legal_contract_analyzer: {
        title: "Contract Analyzer",
        emoji: "📄",
        icon: FileCheck,
        desc: "Intelligent contract analysis and review workspace. Detect risks, analyze clauses, and generate recommendations.",
        placeholder: "Describe the contract clauses to analyze or upload a contract...",
        chips: [
          { label: "Indemnity Clause", text: "Analyze the indemnity clause in this agreement..." },
          { label: "Termination Risk", text: "Check this termination clause for unilateral risks..." },
          { label: "Arbitration Ground", text: "Draft a standard arbitration clause for India jurisdiction..." },
          { label: "Non-Compete Validity", text: "Research enforceability of non-compete clauses in employment..." },
          { label: "Force Majeure", text: "Analyze the force majeure clause in commercial leases..." }
        ]
      },
      legal_evidence_checker: {
        title: "Evidence Analyst",
        emoji: "🕵️",
        icon: Binary,
        desc: "Evidence analysis and admissibility workspace. Analyze case strength, flag inconsistencies, and verify evidence chains.",
        placeholder: "Describe the evidence details or upload documents to analyze...",
        chips: [
          { label: "Verify Admissibility", text: "Analyze the admissibility of electronic evidence under Section 65B..." },
          { label: "Flag Contradictions", text: "Compare witness statements and flag key inconsistencies..." },
          { label: "Chain of Custody", text: "Check the chain of custody checklist for this physical evidence..." },
          { label: "Digital Hash Verification", text: "Explain how to verify digital signature hashes in court..." },
          { label: "Call Records (CDR)", text: "Research admissibility standards for mobile CDR records..." }
        ]
      },
      legal_argument_builder: {
        title: "Argument Builder",
        emoji: "🗣️",
        icon: Gavel,
        desc: "Courtroom strategy and argument builder. Construct strong petitioner/respondent submissions, cross-examinations, and rebuttals.",
        placeholder: "Enter the legal issue or facts to build arguments for...",
        chips: [
          { label: "Petitioner Points", text: "Build petitioner arguments for breach of contract..." },
          { label: "Respondent Defense", text: "Draft respondent defense points against injunction..." },
          { label: "Cross-Exam Questions", text: "Generate cross-examination questions for witness on..." },
          { label: "Rebuttal Strategy", text: "Formulate rebuttals against claims of delay/laches..." },
          { label: "Opening Statement", text: "Draft an opening statement for a suit involving..." }
        ]
      },
      legal_case_predictor: {
        title: "Case Predictor",
        emoji: "📊",
        icon: Scale,
        desc: "AI case predictor and outcome estimator. Calculate probability scores, risk distributions, and judge query responses.",
        placeholder: "Enter case facts and precedents to predict outcome probability...",
        chips: [
          { label: "Injunction Probability", text: "Predict success probability of temporary injunction suit for..." },
          { label: "Default Risk Score", text: "Analyze case default risks given the following facts..." },
          { label: "Damages Estimation", text: "Estimate potential quantum of damages for..." },
          { label: "Objection Scenarios", text: "Predict likely opponent objections and judge queries on..." },
          { label: "Success Factors", text: "Identify key success factors for a writ petition regarding..." }
        ]
      },
      legal_strategy_engine: {
        title: "Strategy Engine",
        emoji: "🧠",
        icon: Brain,
        desc: "Litigation strategy and timeline planner. Design case lifecycles, schedule strategic milestones, and plan procedural tracks.",
        placeholder: "Describe the case situation to build a strategic litigation roadmap...",
        chips: [
          { label: "Suit Timeline", text: "Create a procedural suit timeline from filing to decree for..." },
          { label: "Pre-litigation Steps", text: "Plan pre-litigation notice and mediation strategy for..." },
          { label: "Limitation Period", text: "Calculate the limitation period and exceptions for..." },
          { label: "Appeal Strategy", text: "Design an appellate track strategy against a decree of..." },
          { label: "Interim Reliefs", text: "List strategic interim reliefs to apply for in a suit on..." }
        ]
      }
    };

    // Default fallback: AI Legal Copilot
    return tools[toolId] || {
      title: "AI Legal Copilot",
      emoji: "⚖️",
      icon: Scale,
      desc: "Your AI-powered general legal assistant for research, drafting, evidence analysis, and case intelligence.",
      placeholder: "Ask anything about your legal matter...",
      chips: [
        { label: "Draft Notice", text: "Draft a legal notice for..." },
        { label: "Research Law", text: "Research the law regarding..." },
        { label: "Analyze Contract", text: "Analyze this contract for..." },
        { label: "Find Case Law", text: "Find landmark Supreme Court precedents on..." },
        { label: "Summarize Documents", text: "Summarize the uploaded legal document..." }
      ]
    };
  };
`;

// Insert getToolDetailsFunction right above renderInputForm
const renderInputFormIndex = content.indexOf('  const renderInputForm = () => {');
if (renderInputFormIndex === -1) {
  console.error("renderInputForm not found!");
  process.exit(1);
}

content = content.substring(0, renderInputFormIndex) + getToolDetailsFunction + "\n" + content.substring(renderInputFormIndex);
console.log("Inserted getToolDetails definition.");

// 2. Modify renderInputForm to dynamically resolve placeholder text
const oldPlaceholderLine = `placeholder={isLimitReached ? t('limitReached') || "Chat limit reached. Sign in to continue." : (window.innerWidth < 768 ? "Ask anything..." : ((activeTool && TOOL_PLACEHOLDERS[activeTool]) ? TOOL_PLACEHOLDERS[activeTool] : typedPlaceholder))}`;
const newPlaceholderLine = `placeholder={isLimitReached ? t('limitReached') || "Chat limit reached. Sign in to continue." : (window.innerWidth < 768 ? "Ask anything..." : (() => {
  const activeToolId = selectedLegalTool?.id || new URLSearchParams(window.location.search).get('tool');
  const details = getToolDetails(activeToolId);
  return details.placeholder || typedPlaceholder;
})())}`;

content = content.replace(oldPlaceholderLine, newPlaceholderLine);
console.log("Updated input placeholder logic.");

// 3. Update the welcome screen layout in LegalWorkspace.jsx
const oldWelcomeLayoutText = `                {messages.length === 0 && !isSessionLoading && !isHydrating && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 sm:px-6 w-full max-w-3xl mx-auto space-y-8 select-text min-h-[60vh]">
                    {/* Header Section */}
                    <div className="text-center space-y-2 select-text">
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-zinc-100 tracking-tight flex items-center justify-center gap-2">
                        <span>⚖️ AI Legal Copilot</span>
                      </h1>
                      <p className="text-sm text-[#6B7280] dark:text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
                        Your AI-powered legal assistant for research, drafting, evidence analysis, and case intelligence.
                      </p>
                    </div>

                    {/* Centered Chat Input Card */}
                    <div className="w-full pointer-events-auto">
                      {renderInputForm()}
                    </div>

                    {/* Quick Action Chips */}
                    <div className="flex flex-wrap justify-center gap-2 w-full max-w-2xl select-text">
                      {[
                        { label: "Draft Notice", text: "Draft a legal notice for..." },
                        { label: "Research Law", text: "Research the law regarding..." },
                        { label: "Analyze Contract", text: "Analyze this contract for..." },
                        { label: "Find Case Law", text: "Find landmark Supreme Court precedents on..." },
                        { label: "Summarize Documents", text: "Summarize the uploaded legal document..." }
                      ].map((chip, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setInputValue(chip.text)}
                          className="px-3.5 py-1.5 bg-[#F9FAFB] hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] rounded-lg border border-[#E5E7EB] transition-all cursor-pointer hover:border-[#6D5DFC]/30"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}`;

const newWelcomeLayoutText = `                {messages.length === 0 && !isSessionLoading && !isHydrating && (() => {
                  const activeToolId = selectedLegalTool?.id || new URLSearchParams(window.location.search).get('tool');
                  const details = getToolDetails(activeToolId);
                  const IconComponent = details.icon;

                  return (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12 px-4 sm:px-6 w-full max-w-3xl mx-auto space-y-8 select-text min-h-[60vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {/* Premium Apple-style Tool Branding Hero Card */}
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-sm shadow-primary/5 transition-transform hover:scale-105 duration-300">
                          <IconComponent className="w-8 h-8 text-primary" strokeWidth={2.5} />
                        </div>
                        <div className="text-center space-y-2 select-text">
                          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111827] dark:text-zinc-100 tracking-tight flex items-center justify-center gap-2">
                            <span>{details.emoji}</span>
                            <span>{details.title}</span>
                          </h1>
                          <p className="text-sm text-[#6B7280] dark:text-zinc-400 font-semibold max-w-md mx-auto leading-relaxed">
                            {details.desc}
                          </p>
                        </div>
                      </div>

                      {/* Tool-specific Relevant Upload Area */}
                      {(activeToolId === 'legal_contract_analyzer' || activeToolId === 'legal_evidence_checker') && (
                        <div 
                          onClick={() => uploadInputRef.current?.click()}
                          className="w-full max-w-lg border border-dashed border-slate-200 hover:border-primary/40 bg-slate-50/50 hover:bg-slate-50 dark:bg-zinc-900/10 dark:hover:bg-zinc-900/30 rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group shadow-xxs"
                        >
                          <Cloud className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors animate-pulse" />
                          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 group-hover:text-primary transition-colors">
                            {activeToolId === 'legal_contract_analyzer' ? 'Upload Contract File to Analyze' : 'Upload Evidence Files (Audio, Video, PDF, Image)'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Drag & drop files here or click to browse</span>
                        </div>
                      )}

                      {/* Centered Chat Input Card */}
                      <div className="w-full pointer-events-auto">
                        {renderInputForm()}
                      </div>

                      {/* Tool-specific Suggested Prompts / Quick Actions */}
                      <div className="flex flex-wrap justify-center gap-2 w-full max-w-2xl select-text">
                        {details.chips.map((chip, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setInputValue(chip.text)}
                            className="px-3.5 py-1.5 bg-[#F9FAFB] hover:bg-[#F3F4F6] text-xs font-semibold text-[#374151] rounded-lg border border-[#E5E7EB] transition-all cursor-pointer hover:border-[#6D5DFC]/30"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}`;

const welcomeIndex = content.indexOf(oldWelcomeLayoutText);
if (welcomeIndex === -1) {
  console.error("oldWelcomeLayoutText not found precisely!");
  process.exit(1);
}

content = content.replace(oldWelcomeLayoutText, newWelcomeLayoutText);
console.log("Updated welcome screen layout to dynamic tool branding hero layout.");

// Save back to file
fs.writeFileSync(filePath, content, 'utf8');
console.log("Branded workspace successfully saved!");
