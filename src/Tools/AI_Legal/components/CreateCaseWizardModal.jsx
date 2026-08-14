import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Building, Phone, Mail, MapPin, Scale, Gavel, Users, FileText, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Shield, AlertCircle, Plus, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../../services/apiService';

const CATEGORIES = [
  'Civil', 'Criminal', 'Corporate', 'Family', 'Labour', 
  'Consumer', 'Taxation', 'Arbitration', 'Constitutional', 
  'Property', 'Intellectual Property', 'Cyber Crime', 'Banking'
];

const CASE_TYPES = ['Litigation', 'Advisory', 'Consultation', 'Arbitration', 'Appeal'];

const CLIENT_TYPES = ['Individual', 'Company', 'Government', 'NGO', 'Startup', 'Partnership'];

const DOCUMENT_CATEGORIES = [
  'Petition', 'Agreement', 'FIR', 'Evidence', 'Notice', 'Affidavit', 'Order', 'Contract', 'Other'
];

export const CreateCaseWizardModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 1: Client Info
  const [clientType, setClientType] = useState('Individual');
  const [clientName, setClientName] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientState, setClientState] = useState('');
  const [clientPinCode, setClientPinCode] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // STEP 2: Case Details
  const [caseTitle, setCaseTitle] = useState('');
  const [caseCategory, setCaseCategory] = useState('Civil');
  const [caseType, setCaseType] = useState('Litigation');
  const [courtName, setCourtName] = useState('');
  const [courtNumber, setCourtNumber] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [policeStation, setPoliceStation] = useState('');
  const [firNumber, setFirNumber] = useState('');
  const [oppositeParty, setOppositeParty] = useState('');
  const [oppositeAdvocate, setOppositeAdvocate] = useState('');
  const [caseSummary, setCaseSummary] = useState('');
  const [priority, setPriority] = useState('High');
  const [isConfidential, setIsConfidential] = useState(false);

  // STEP 3: Team Assignment
  const [leadAdvocate, setLeadAdvocate] = useState('Adv. Lead Counsel');
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Adv. Senior Associate', role: 'Co-Counsel', checked: true },
    { id: '2', name: 'Adv. Research Associate', role: 'Research & Precedents', checked: false },
    { id: '3', name: 'Adv. Junior Associate', role: 'Drafting Assistant', checked: false }
  ]);

  // STEP 4: Documents
  const [initialDocs, setInitialDocs] = useState([]);
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('Petition');

  const handleAddDocument = () => {
    if (!docName.trim()) return;
    setInitialDocs(prev => [
      ...prev,
      { id: Date.now().toString(), name: docName.trim(), category: docCategory, date: new Date().toLocaleDateString() }
    ]);
    setDocName('');
  };

  const handleRemoveDocument = (id) => {
    setInitialDocs(prev => prev.filter(d => d.id !== id));
  };

  const resetForm = () => {
    setStep(1);
    setClientType('Individual');
    setClientName('');
    setClientMobile('');
    setClientEmail('');
    setClientCompany('');
    setClientAddress('');
    setClientCity('');
    setClientState('');
    setClientPinCode('');
    setClientNotes('');
    setCaseTitle('');
    setCaseCategory('Civil');
    setCaseType('Litigation');
    setCourtName('');
    setCourtNumber('');
    setCaseNumber('');
    setPoliceStation('');
    setFirNumber('');
    setOppositeParty('');
    setOppositeAdvocate('');
    setCaseSummary('');
    setPriority('High');
    setIsConfidential(false);
    setInitialDocs([]);
  };

  const handleSubmit = async () => {
    if (!clientName.trim()) {
      toast.error('Client name is required');
      setStep(1);
      return;
    }

    const titleToUse = caseTitle.trim() 
      ? caseTitle.trim() 
      : oppositeParty.trim() 
        ? `${clientName.trim()} vs ${oppositeParty.trim()}`
        : `${clientName.trim()} Case`;

    const payload = {
      name: titleToUse,
      clientName: clientName.trim(),
      caseType: caseCategory,
      subType: caseType,
      courtName: courtName.trim() || 'District Court',
      courtNumber: courtNumber.trim(),
      caseNumber: caseNumber.trim(),
      policeStation: policeStation.trim(),
      firNumber: firNumber.trim(),
      accused: oppositeParty.trim(),
      opponentName: oppositeParty.trim(),
      oppositeAdvocate: oppositeAdvocate.trim(),
      priority,
      isConfidential,
      summary: caseSummary.trim(),
      isLegalCase: true,
      clientInfo: {
        name: clientName.trim(),
        mobile: clientMobile.trim(),
        email: clientEmail.trim(),
        company: clientCompany.trim(),
        address: `${clientAddress} ${clientCity} ${clientState} ${clientPinCode}`.trim(),
        clientType,
        notes: clientNotes.trim()
      },
      teamInfo: {
        leadAdvocate,
        assignedMembers: teamMembers.filter(m => m.checked).map(m => ({ name: m.name, role: m.role }))
      },
      documents: initialDocs.map(d => ({ name: d.name, category: d.category, date: d.date }))
    };

    const tid = toast.loading('Initializing firm case folder...');
    setIsSubmitting(true);

    try {
      const created = await apiService.createProject(payload);
      toast.success('✨ New Case Folder Created Successfully!', { id: tid });
      resetForm();
      onClose();
      if (onSuccess) {
        onSuccess(created || payload);
      }
    } catch (err) {
      console.error('[Case Wizard] Submit failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to create case folder.', { id: tid });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[200000] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#C8A34D] border border-[#C8A34D]/30 flex items-center justify-center font-black text-lg">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111111] dark:text-white">Create New Case Folder</h3>
              <p className="text-xs text-slate-500 font-medium">Step {step} of 5 — {
                step === 1 ? 'Client Information' :
                step === 2 ? 'Litigation & Court Parameters' :
                step === 3 ? 'Team & Advocate Assignment' :
                step === 4 ? 'Initial Case Filings' : 'Final Review & Save'
              }</p>
            </div>
          </div>
          <button onClick={() => { resetForm(); onClose(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Wizard Step Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 shrink-0">
          <div 
            className="bg-[#C8A34D] h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          
          {/* STEP 1: CLIENT INFO */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Client Category Type</label>
                <div className="flex flex-wrap gap-2">
                  {CLIENT_TYPES.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setClientType(type)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        clientType === type
                          ? 'bg-[#111111] text-[#C8A34D] border border-[#C8A34D]/50 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Client Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Chandra Agrawal"
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    required
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Company / Organization</label>
                  <input
                    type="text"
                    placeholder="e.g. Agrawal Enterprises Pvt Ltd"
                    value={clientCompany}
                    onChange={e => setClientCompany(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Mobile Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={clientMobile}
                    onChange={e => setClientMobile(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@company.com"
                    value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">City</label>
                  <input
                    type="text"
                    placeholder="New Delhi"
                    value={clientCity}
                    onChange={e => setClientCity(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">State</label>
                  <input
                    type="text"
                    placeholder="Delhi"
                    value={clientState}
                    onChange={e => setClientState(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Pin Code</label>
                  <input
                    type="text"
                    placeholder="110001"
                    value={clientPinCode}
                    onChange={e => setClientPinCode(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Client Special Instructions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Important contact preferences or commercial relationship notes..."
                  value={clientNotes}
                  onChange={e => setClientNotes(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] resize-none text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: CASE & LITIGATION DETAILS */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Case / Suit Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra Agrawal vs Apex Logistics Pvt Ltd"
                  value={caseTitle}
                  onChange={e => setCaseTitle(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Legal Domain / Domain Category</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCaseCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        caseCategory === cat
                          ? 'bg-[#111111] text-[#C8A34D] border border-[#C8A34D]/50 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Case Type</label>
                  <select
                    value={caseType}
                    onChange={e => setCaseType(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  >
                    {CASE_TYPES.map(ct => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Priority Status</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Urgent">Urgent Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Presiding Court</label>
                  <input
                    type="text"
                    placeholder="Delhi High Court"
                    value={courtName}
                    onChange={e => setCourtName(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Court / Hall No.</label>
                  <input
                    type="text"
                    placeholder="Courtroom 302"
                    value={courtNumber}
                    onChange={e => setCourtNumber(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">CNR / Case No.</label>
                  <input
                    type="text"
                    placeholder="DLHC01-004321-2024"
                    value={caseNumber}
                    onChange={e => setCaseNumber(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
              </div>

              {caseCategory === 'Criminal' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Police Station</label>
                    <input
                      type="text"
                      placeholder="Connaught Place PS"
                      value={policeStation}
                      onChange={e => setPoliceStation(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">FIR Number</label>
                    <input
                      type="text"
                      placeholder="FIR No. 0421/2024"
                      value={firNumber}
                      onChange={e => setFirNumber(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Opposite Party / Defendant</label>
                  <input
                    type="text"
                    placeholder="Apex Logistics Pvt Ltd"
                    value={oppositeParty}
                    onChange={e => setOppositeParty(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Opposite Advocate Name</label>
                  <input
                    type="text"
                    placeholder="Adv. Suresh Sharma"
                    value={oppositeAdvocate}
                    onChange={e => setOppositeAdvocate(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Case Statement & Key Facts Summary</label>
                <textarea
                  rows={3}
                  placeholder="Recovery claim for breach of commercial contract dated 12th Jan 2023..."
                  value={caseSummary}
                  onChange={e => setCaseSummary(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] resize-none text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="confidentialCheck"
                  checked={isConfidential}
                  onChange={e => setIsConfidential(e.target.checked)}
                  className="w-4 h-4 rounded text-[#C8A34D] focus:ring-[#C8A34D]"
                />
                <label htmlFor="confidentialCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Mark case folder as <strong className="text-[#C8A34D]">Strictly Confidential</strong> (Restricted Firm Visibility)
                </label>
              </div>
            </motion.div>
          )}

          {/* STEP 3: TEAM & ASSOCIATE ASSIGNMENT */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Lead Counsel / Managing Advocate</label>
                <input
                  type="text"
                  value={leadAdvocate}
                  onChange={e => setLeadAdvocate(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Assign Associates & Team Roster</label>
                <div className="space-y-2">
                  {teamMembers.map((m, idx) => (
                    <div 
                      key={m.id}
                      className="p-3 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#181818] flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={m.checked}
                          onChange={e => {
                            const updated = [...teamMembers];
                            updated[idx].checked = e.target.checked;
                            setTeamMembers(updated);
                          }}
                          className="w-4 h-4 rounded text-[#C8A34D] focus:ring-[#C8A34D]"
                        />
                        <div>
                          <div className="text-xs font-extrabold text-[#111111] dark:text-white">{m.name}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{m.role}</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-[#111111] text-[#C8A34D] text-[9px] font-mono font-bold rounded-full border border-[#C8A34D]/30">
                        {m.checked ? 'Assigned' : 'Unassigned'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: INITIAL DOCUMENTS */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-[#181818] space-y-3">
                <h4 className="text-xs font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">Add Initial Document / Filing Record</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Document Title (e.g. Legal Notice Copy)"
                    value={docName}
                    onChange={e => setDocName(e.target.value)}
                    className="sm:col-span-2 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                  <select
                    value={docCategory}
                    onChange={e => setDocCategory(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  >
                    {DOCUMENT_CATEGORIES.map(dc => (
                      <option key={dc} value={dc}>{dc}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddDocument}
                  className="px-4 py-2 bg-[#111111] text-[#C8A34D] border border-[#C8A34D]/40 rounded-xl font-bold text-xs hover:bg-[#222222] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={14} /> Add Document Entry
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Added Initial Documents ({initialDocs.length})</label>
                {initialDocs.length > 0 ? (
                  <div className="space-y-2">
                    {initialDocs.map(doc => (
                      <div key={doc.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#181818] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-[#C8A34D]" />
                          <div>
                            <div className="text-xs font-extrabold text-[#111111] dark:text-white">{doc.name}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{doc.category} • {doc.date}</div>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveDocument(doc.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 font-medium border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No initial documents added yet. You can also upload files after creating the case.
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 5: REVIEW & COMPLETE */}
          {step === 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="p-5 border border-[#C8A34D]/30 rounded-2xl bg-[#111111] text-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="text-sm font-black text-[#C8A34D] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} /> Case Initialization Review
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#C8A34D] text-[#111111] uppercase">
                    {priority} Priority
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Client Name</span>
                    <strong className="text-white font-extrabold">{clientName || 'N/A'}</strong>
                    {clientCompany && <div className="text-slate-400 text-[11px]">{clientCompany}</div>}
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Case Domain & Type</span>
                    <strong className="text-white font-extrabold">{caseCategory} ({caseType})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Presiding Court</span>
                    <strong className="text-white font-extrabold">{courtName || 'District Court'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Opposite Party</span>
                    <strong className="text-white font-extrabold">{oppositeParty || 'N/A'}</strong>
                  </div>
                </div>

                {caseSummary && (
                  <div className="border-t border-slate-800 pt-3">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mb-1">Case Brief</span>
                    <p className="text-xs text-slate-300 line-clamp-3 font-medium">{caseSummary}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

        </div>

        {/* Modal Controls Bar */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#181818]">
          <button
            type="button"
            disabled={step === 1 || isSubmitting}
            onClick={() => setStep(prev => prev - 1)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              step === 1 ? 'opacity-40 cursor-not-allowed text-slate-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
            }`}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !clientName.trim()) {
                  toast.error('Please enter the client name');
                  return;
                }
                setStep(prev => prev + 1);
              }}
              className="px-5 py-2.5 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              Next Step <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] font-black rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Initializing Folder...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Initialize Case Folder</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreateCaseWizardModal;
