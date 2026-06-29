import { Briefcase } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

const LegalWorkspaceWelcome = ({ currentCase }) => {
  const { tLegal } = useLanguage();
  if (!currentCase) return null;
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in zoom-in duration-500 min-h-[400px]">
      <div className="pointer-events-auto flex flex-col items-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-sm shadow-indigo-500/20">
          <Briefcase className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 ] mb-3 tracking-tight">
          {currentCase.name} <span className="text-indigo-600">{tLegal('workspaceTitle')}</span>
        </h2>
        <p className="max-w-md text-subtext font-medium leading-relaxed mb-8">
          {tLegal('caseIsNowActive')}
        </p>
      </div>
    </div>
  );
};

export default LegalWorkspaceWelcome;
