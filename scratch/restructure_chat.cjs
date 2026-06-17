const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'pages', 'Workspace', 'LegalWorkspace.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Let's define the renderInputForm function content.
// We will extract the form content from line 8159 to 9298.
// Let's find the start of the form in the file.
const formStartText = '<form\n                  onSubmit={handleSendMessage}\n                  className="relative w-full flex flex-col transition-all duration-300 p-1 z-[1002] aisa-chat-input-wrapper bg-white ] border border-slate-200/60 rounded-[28px] sm:rounded-[32px] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] overflow-visible"';
const formEndText = '</form>';

const formStartIndex = content.indexOf(formStartText);
if (formStartIndex === -1) {
  console.error("Form start not found!");
  process.exit(1);
}

// Find the corresponding closing form tag after the form start
let formEndIndex = -1;
let openTags = 0;
let currentIndex = formStartIndex;
while (currentIndex < content.length) {
  if (content.substring(currentIndex, currentIndex + 5) === '<form') {
    openTags++;
  } else if (content.substring(currentIndex, currentIndex + 7) === '</form>') {
    openTags--;
    if (openTags === 0) {
      formEndIndex = currentIndex + 7;
      break;
    }
  }
  currentIndex++;
}

if (formEndIndex === -1) {
  console.error("Form end not found!");
  process.exit(1);
}

const formContent = content.substring(formStartIndex, formEndIndex);
console.log("Successfully extracted form content. Length:", formContent.length);

// Remove the absolute padding pb-64 md:pb-72 from chatgpt-container styling class
const oldChatClass = '`overflow-y-auto ${showFloatingNavbar ? \'pt-[72px] sm:mt-0 sm:pt-24\' : (currentMode === \'LEGAL_TOOLKIT\' || location.pathname === \'/dashboard/cases\' ? \'pt-4\' : \'pt-[72px] sm:mt-0 sm:pt-[76px]\')} lg:pt-6 pb-64 md:pb-72`';
const newChatClass = '`overflow-y-auto ${showFloatingNavbar ? \'pt-[72px] sm:mt-0 sm:pt-24\' : (currentMode === \'LEGAL_TOOLKIT\' || location.pathname === \'/dashboard/cases\' ? \'pt-4\' : \'pt-[72px] sm:mt-0 sm:pt-[76px]\')} lg:pt-6 pb-6`';

if (content.indexOf(oldChatClass) === -1) {
  console.warn("oldChatClass class string not found precisely, trying alternative...");
} else {
  content = content.replace(oldChatClass, newChatClass);
  console.log("Updated chatgpt-container class string.");
}

// 2. Define renderInputForm helper function in the file
const renderInputFormDefinition = `
  const renderInputForm = () => {
    return (
      ${formContent}
    );
  };
`;

const insertionPointText = "  const showWelcomeScreen = messages.length === 0";
const insertionPointIndex = content.indexOf(insertionPointText);
if (insertionPointIndex === -1) {
  console.error("Insertion point not found!");
  process.exit(1);
}

content = content.substring(0, insertionPointIndex) + renderInputFormDefinition + "\n" + content.substring(insertionPointIndex);
console.log("Inserted renderInputForm definition.");

// 3. Update messages.length === 0 screen rendering inside renderChatStream
const oldWelcomeBlock = `                {messages.length === 0 && !isSessionLoading && !isHydrating && currentCase && selectedLegalTool?.id === 'legal_my_case' && location.pathname !== '/dashboard/cases' && (
                  <LegalWorkspaceWelcome currentCase={currentCase} />
                )}

                {messages.length === 0 && !inputValue && !isSessionLoading && !isHydrating && (currentMode === 'LEGAL_TOOLKIT' || new URLSearchParams(window.location.search).get('tool')?.startsWith('legal_')) && (selectedLegalTool || PREMIUM_TOOLS.find(t => t.id === new URLSearchParams(window.location.search).get('tool'))) && LEGAL_TOOL_WELCOME_MESSAGES[selectedLegalTool?.id || new URLSearchParams(window.location.search).get('tool')] && (
                  <ToolActivationMessage
                    title={LEGAL_TOOL_WELCOME_MESSAGES[selectedLegalTool?.id || new URLSearchParams(window.location.search).get('tool')]?.title}
                    desc={LEGAL_TOOL_WELCOME_MESSAGES[selectedLegalTool?.id || new URLSearchParams(window.location.search).get('tool')]?.desc}
                  />
                )}`;

const newWelcomeBlock = `                {messages.length === 0 && !isSessionLoading && !isHydrating && (
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

const welcomeBlockIndex = content.indexOf(oldWelcomeBlock);
if (welcomeBlockIndex === -1) {
  console.warn("oldWelcomeBlock not found precisely! Trying regex/alternative...");
} else {
  content = content.replace(oldWelcomeBlock, newWelcomeBlock);
  console.log("Replaced welcome screen blocks in renderChatStream.");
}

// 4. Update welcome overlay and bottom input rendering
// First, disable the ModernDashboard welcome screen overlay by making it never render
content = content.replace('{showWelcomeScreen && (', '{false && (');
console.log("Disabled ModernDashboard absolute overlay.");

// Next, replace the bottom input block with the new clean relative flex bottom container
const oldBottomInputBlock = `        {!showWelcomeScreen && location.pathname !== '/dashboard/cases' && location.pathname !== '/dashboard' && legalView !== 'DASHBOARD' && legalView !== 'PRECEDENTS' && !activeCaseId && (
          <div className={\`absolute bottom-0 left-0 right-0 z-[1001] pointer-events-none aisa-chat-input-container \${(tglState.sidebarOpen && window.innerWidth < 1024) ? 'hidden' : ''}\`}>
            {/* Background solid layer to hide text scrolling behind/below input */}
            <div className="relative z-20 bg-slate-50 ] sm:bg-white sm:]" style={{ padding: '0.5rem 1rem calc(1.75rem + env(safe-area-inset-bottom, 0px)) 1rem' }}>
              <div className="max-w-4xl mx-auto w-full pointer-events-auto">


                ${formContent}
              </div>
            </div>
          </div>
        )}`;

const newBottomInputBlock = `        {location.pathname !== '/dashboard/cases' && location.pathname !== '/dashboard' && legalView !== 'DASHBOARD' && legalView !== 'PRECEDENTS' && !activeCaseId && messages.length > 0 && (
          <div className={\`w-full shrink-0 bg-slate-50 sm:bg-white border-t border-slate-100 px-4 py-4 relative z-[1001] \${(tglState.sidebarOpen && window.innerWidth < 1024) ? 'hidden' : ''}\`}>
            <div className="max-w-4xl mx-auto w-full">
              {renderInputForm()}
            </div>
          </div>
        )}`;

const bottomBlockIndex = content.indexOf(oldBottomInputBlock);
if (bottomBlockIndex === -1) {
  console.warn("oldBottomInputBlock not found precisely! Trying direct string replace...");
  // Let's do a substring replace for safety
  const startToFind = `{!showWelcomeScreen && location.pathname !== '/dashboard/cases'`;
  const startIndex = content.indexOf(startToFind);
  if (startIndex !== -1) {
    // find closing brace of this conditional block after formContent
    const sub = content.substring(startIndex);
    const endOffset = sub.indexOf('        )}');
    if (endOffset !== -1) {
      const fullOldBlock = sub.substring(0, endOffset + 10);
      content = content.replace(fullOldBlock, newBottomInputBlock);
      console.log("Replaced bottom input block using offset.");
    } else {
      console.error("Could not find end of bottom block!");
    }
  } else {
    console.error("Could not find start of bottom block!");
  }
} else {
  content = content.replace(oldBottomInputBlock, newBottomInputBlock);
  console.log("Replaced bottom input container block successfully.");
}

// 5. Add autofocus effect on transitions
const autofocusEffect = `
  useEffect(() => {
    if (messages.length > 0 && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [messages.length]);
`;

// Insert autofocus effect before the main return statement
content = content.replace('  return (', autofocusEffect + '\n  return (');
console.log("Added autofocus transition effect.");

// Save back to file
fs.writeFileSync(filePath, content, 'utf8');
console.log("Restructured file successfully saved!");
