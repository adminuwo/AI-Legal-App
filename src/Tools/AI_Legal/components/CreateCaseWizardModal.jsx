import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Building, Phone, Mail, MapPin, Scale, Gavel, Users, FileText, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, Shield, AlertCircle, Plus, Trash2,
  Mic, MicOff, Edit2, Calendar, Briefcase
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../../services/apiService';

const CATEGORIES = [
  'Civil', 'Criminal', 'Consumer', 'Family', 'Property', 
  'Corporate', 'Labour', 'Tax', 'Banking', 'Arbitration', 'Miscellaneous'
];

const CLIENT_TYPES = ['Individual', 'Company', 'Government', 'NGO', 'Startup', 'Partnership'];

const OPPONENT_ROLES = ['Defendant', 'Respondent', 'Opposite Party', 'Accused', 'Appellant', 'Other'];

const ADDITIONAL_PARTY_ROLES = ['Co-Petitioner', 'Co-Plaintiff', 'Co-Respondent', 'Co-Defendant', 'Witness', 'Other'];

const COURT_TYPES = ['District Court', 'High Court', 'Supreme Court', 'Consumer Forum', 'Tribunal', 'Family Court', 'Labour Court', 'Other'];

export const CreateCaseWizardModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Voice AI Dictation State
  const [isRecording, setIsRecording] = useState(false);

  // STEP 1: Client Information
  const [clientType, setClientType] = useState('Individual');
  const [clientName, setClientName] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientMobile, setClientMobile] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCity, setClientCity] = useState('');
  const [clientState, setClientState] = useState('');
  const [clientPinCode, setClientPinCode] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // STEP 2: Case Information
  const [caseTitle, setCaseTitle] = useState('');
  const [caseCategory, setCaseCategory] = useState('Civil');
  const [priority, setPriority] = useState('High');
  const [status, setStatus] = useState('Active');
  const [caseOverview, setCaseOverview] = useState('');
  const [leadAdvocate, setLeadAdvocate] = useState('Firm Partner (Owner)');

  // STEP 3: Opponent & Parties
  const [oppositeParty, setOppositeParty] = useState('');
  const [opponentRole, setOpponentRole] = useState('Defendant');
  const [opponentMobile, setOpponentMobile] = useState('');
  const [opponentEmail, setOpponentEmail] = useState('');
  const [opponentAddress, setOpponentAddress] = useState('');
  const [oppositeAdvocate, setOppositeAdvocate] = useState('');
  const [oppositeLawFirm, setOppositeLawFirm] = useState('');
  const [oppositeAdvocateContact, setOppositeAdvocateContact] = useState('');

  // Additional Parties
  const [additionalParties, setAdditionalParties] = useState([]);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyRole, setNewPartyRole] = useState('Co-Plaintiff');
  const [newPartyContact, setNewPartyContact] = useState('');

  // STEP 4: Court & Jurisdiction
  const [courtType, setCourtType] = useState('District Court');
  const [courtState, setCourtState] = useState('');
  const [courtDistrict, setCourtDistrict] = useState('');
  const [courtName, setCourtName] = useState('');
  const [cnrNumber, setCnrNumber] = useState('');
  const [caseNumber, setCaseNumber] = useState('');
  const [courtNumber, setCourtNumber] = useState('');
  const [benchNumber, setBenchNumber] = useState('');
  const [judgeName, setJudgeName] = useState('');

  // STEP 5: Dates & Case Brief
  const [incidentDate, setIncidentDate] = useState('');
  const [filingDate, setFilingDate] = useState('');
  const [noticeDate, setNoticeDate] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [factsSummary, setFactsSummary] = useState('');
  const [reliefSought, setReliefSought] = useState('');

  // Criminal Specific Fields (Only when caseCategory === 'Criminal')
  const [policeStation, setPoliceStation] = useState('');
  const [firNumber, setFirNumber] = useState('');
  const [firYear, setFirYear] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  // Pre-fill existing case details when editing
  useEffect(() => {
    if (isOpen && initialData) {
      setClientType(initialData.clientInfo?.clientType || 'Individual');
      setClientName(initialData.clientName || initialData.clientInfo?.name || '');
      setClientCompany(initialData.clientInfo?.company || '');
      setClientMobile(initialData.clientInfo?.mobile || initialData.clientPhone || '');
      setClientEmail(initialData.clientInfo?.email || initialData.clientEmail || '');
      setClientCity(initialData.clientInfo?.city || initialData.city || '');
      setClientState(initialData.clientInfo?.state || initialData.stateName || '');
      setClientPinCode(initialData.clientInfo?.pinCode || '');
      setClientNotes(initialData.clientInfo?.notes || '');

      setCaseTitle(initialData.name || initialData.title || '');
      setCaseCategory(initialData.caseType || initialData.category || 'Civil');
      setPriority(initialData.priority || 'High');
      setStatus(initialData.status || 'Active');
      setCaseOverview(initialData.summary || initialData.caseSummary || '');

      setOppositeParty(initialData.opponentName || initialData.accused || initialData.oppositeParty || '');
      setOpponentRole(initialData.opponentRole || 'Defendant');
      setOpponentMobile(initialData.opponentPhone || initialData.clientInfo?.opponentMobile || '');
      setOpponentEmail(initialData.opponentEmail || '');
      setOpponentAddress(initialData.opponentAddress || '');
      setOppositeAdvocate(initialData.oppositeAdvocate || '');
      setOppositeLawFirm(initialData.oppositeLawFirm || '');
      setOppositeAdvocateContact(initialData.oppositeAdvocateContact || '');
      setAdditionalParties(initialData.additionalParties || []);

      setCourtType(initialData.courtType || 'District Court');
      setCourtState(initialData.stateName || '');
      setCourtDistrict(initialData.district || '');
      setCourtName(initialData.courtName || '');
      setCnrNumber(initialData.cnrNumber || '');
      setCaseNumber(initialData.caseNumber || '');
      setCourtNumber(initialData.courtNumber || '');
      setBenchNumber(initialData.benchNumber || '');
      setJudgeName(initialData.judgeName || '');

      setIncidentDate(initialData.incidentDate || '');
      setFilingDate(initialData.filingDate || '');
      setNoticeDate(initialData.noticeDate || '');
      setNextHearingDate(initialData.nextHearingDate || '');
      setFactsSummary(initialData.summary || '');
      setReliefSought(initialData.reliefSought || '');
      setPoliceStation(initialData.policeStation || '');
      setFirNumber(initialData.firNumber || '');
      setFirYear(initialData.firYear || '');
      setReferenceNumber(initialData.referenceNumber || '');
    } else if (isOpen && !initialData) {
      resetForm();
    }
  }, [isOpen, initialData]);

  // Per-step Validation Errors State
  const [errors, setErrors] = useState({});

  const handleAddParty = () => {
    if (!newPartyName.trim()) return;
    setAdditionalParties(prev => [
      ...prev,
      { id: Date.now().toString(), name: newPartyName.trim(), role: newPartyRole, contact: newPartyContact.trim() }
    ]);
    setNewPartyName('');
    setNewPartyContact('');
  };

  const handleRemoveParty = (id) => {
    setAdditionalParties(prev => prev.filter(p => p.id !== id));
  };

  // Voice AI Intake Dictation
  const handleToggleVoiceDictation = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice dictation is not supported in this browser. Please use Chrome/Edge.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN'; // Supports English/Hindi dictation

      recognition.onstart = () => {
        setIsRecording(true);
        toast.success('🎙️ Listening... Speak case details clearly.');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          toast.success('✨ Dictation processed!');
          // Append recognized speech to Case Overview or Facts
          if (step === 1 && !clientName) {
            setClientName(transcript);
          } else if (step === 2 && !caseTitle) {
            setCaseTitle(transcript);
          } else if (step === 5) {
            setFactsSummary(prev => prev ? `${prev}\n${transcript}` : transcript);
          } else {
            setCaseOverview(prev => prev ? `${prev}\n${transcript}` : transcript);
          }
        }
      };

      recognition.onerror = (e) => {
        console.error('[Voice Dictation Error]', e);
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          toast.error('🎙️ Microphone access blocked. Please click the mic icon in your browser address bar to allow microphone access.');
        } else {
          toast.error('Voice dictation error. Please try again.');
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition fail', err);
      setIsRecording(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setErrors({});
    setClientType('Individual');
    setClientName('');
    setClientCompany('');
    setClientMobile('');
    setClientEmail('');
    setClientCity('');
    setClientState('');
    setClientPinCode('');
    setClientNotes('');
    setCaseTitle('');
    setCaseCategory('Civil');
    setPriority('High');
    setStatus('Active');
    setCaseOverview('');
    setOppositeParty('');
    setOpponentRole('Defendant');
    setOpponentMobile('');
    setOpponentEmail('');
    setOpponentAddress('');
    setOppositeAdvocate('');
    setOppositeLawFirm('');
    setOppositeAdvocateContact('');
    setAdditionalParties([]);
    setCourtType('District Court');
    setCourtState('');
    setCourtDistrict('');
    setCourtName('');
    setCnrNumber('');
    setCaseNumber('');
    setCourtNumber('');
    setBenchNumber('');
    setJudgeName('');
    setIncidentDate('');
    setFilingDate('');
    setNoticeDate('');
    setNextHearingDate('');
    setFactsSummary('');
    setReliefSought('');
    setPoliceStation('');
    setFirNumber('');
    setFirYear('');
    setReferenceNumber('');
  };

  // Step Validation Logic (Flexible & non-blocking)
  const validateStep = (currentStep) => {
    const newErrors = {};
    setErrors(newErrors);
    return true;
  };

  const handleNextStep = () => {
    setStep(prev => Math.min(prev + 1, 6));
  };

  const handleSubmit = async () => {
    const isEditing = Boolean(initialData && (initialData._id || initialData.id));
    const targetId = initialData?._id || initialData?.id;

    const finalClientName = clientName.trim() || 'Client Profile';
    const finalCaseTitle = caseTitle.trim() || (oppositeParty.trim() ? `${finalClientName} vs ${oppositeParty.trim()}` : 'Unspecified Case');

    const activeRole = localStorage.getItem('user_selected_role') || 'advocate';
    const workspaceType = activeRole === 'law_firm' ? 'law_firm' : activeRole === 'student' ? 'student' : 'personal';

    const payload = {
      name: finalCaseTitle,
      clientName: finalClientName,
      role: activeRole,
      workspaceType,
      caseType: caseCategory,
      subType: caseCategory,
      courtName: courtName.trim() || 'District Court',
      courtType,
      stateName: courtState.trim(),
      district: courtDistrict.trim(),
      cnrNumber: cnrNumber.trim(),
      caseNumber: caseNumber.trim(),
      courtNumber: courtNumber.trim(),
      benchNumber: benchNumber.trim(),
      judgeName: judgeName.trim(),
      policeStation: policeStation.trim(),
      firNumber: firNumber.trim(),
      firYear: firYear.trim(),
      referenceNumber: referenceNumber.trim(),
      accused: oppositeParty.trim(),
      opponentName: oppositeParty.trim(),
      opponentRole,
      opponentPhone: opponentMobile.trim(),
      opponentEmail: opponentEmail.trim(),
      opponentAddress: opponentAddress.trim(),
      oppositeAdvocate: oppositeAdvocate.trim(),
      oppositeLawFirm: oppositeLawFirm.trim(),
      oppositeAdvocateContact: oppositeAdvocateContact.trim(),
      additionalParties,
      priority,
      status,
      summary: factsSummary.trim() || caseOverview.trim(),
      reliefSought: reliefSought.trim(),
      incidentDate,
      filingDate,
      noticeDate,
      nextHearingDate,
      isLegalCase: true,
      clientInfo: {
        name: finalClientName,
        mobile: clientMobile.trim(),
        email: clientEmail.trim(),
        company: clientCompany.trim(),
        city: clientCity.trim(),
        state: clientState.trim(),
        pinCode: clientPinCode.trim(),
        address: `${clientCompany ? clientCompany + ', ' : ''}${clientCity} ${clientState} ${clientPinCode}`.trim(),
        clientType,
        notes: clientNotes.trim()
      }
    };

    const tid = toast.loading(isEditing ? 'Updating Case Folder...' : 'Creating Case Folder...');
    setIsSubmitting(true);

    try {
      let result;
      if (isEditing) {
        result = await apiService.updateProject(targetId, payload);
        toast.success('✨ Case Folder Updated Successfully!', { id: tid });
      } else {
        result = await apiService.createProject(payload);
        toast.success('✨ Case Folder Created Successfully!', { id: tid });
      }
      resetForm();
      onClose();
      if (onSuccess) {
        onSuccess(result || payload);
      }
    } catch (err) {
      console.error('[Case Wizard] Submit failed:', err);
      toast.error(err?.response?.data?.message || 'Failed to save case folder.', { id: tid });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const STEP_TITLES = {
    1: 'Client Information',
    2: 'Case Overview',
    3: 'Opposite Party',
    4: 'Court & Jurisdiction',
    5: 'Timeline, Facts & Relief'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[200000] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#181818]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#111111] text-[#C8A34D] border border-[#C8A34D]/30 flex items-center justify-center font-black text-lg">
              <Scale size={20} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#111111] dark:text-white flex items-center gap-2">
                <span>{initialData ? 'Edit Case Workspace' : 'Create Case Workspace'}</span>
                {(localStorage.getItem('user_selected_role') || 'advocate') === 'law_firm' && (
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    🏛️ Law Firm
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Step {step} of 5 — {STEP_TITLES[step]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice Dictation Button */}
            <button
              type="button"
              onClick={handleToggleVoiceDictation}
              className={`p-2 rounded-full border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                isRecording 
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#C8A34D]'
              }`}
              title="Voice AI Dictation (English/Hindi)"
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              <span className="hidden sm:inline">{isRecording ? 'Listening...' : 'Voice Dictate'}</span>
            </button>

            <button 
              onClick={() => { resetForm(); onClose(); }} 
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
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
          
          {/* STEP 1: CLIENT INFORMATION */}
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
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                    Client Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Chandra Agrawal"
                    value={clientName}
                    onChange={e => {
                      setClientName(e.target.value);
                      if (errors.clientName) setErrors(prev => ({ ...prev, clientName: null }));
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111] ${
                      errors.clientName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {errors.clientName && <span className="text-[10px] font-bold text-rose-500 block">{errors.clientName}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Company / Organization Name</label>
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
                    onChange={e => {
                      setClientMobile(e.target.value);
                      if (errors.clientMobile) setErrors(prev => ({ ...prev, clientMobile: null }));
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111] ${
                      errors.clientMobile ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {errors.clientMobile && <span className="text-[10px] font-bold text-rose-500 block">{errors.clientMobile}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Email Address</label>
                  <input
                    type="email"
                    placeholder="client@company.com"
                    value={clientEmail}
                    onChange={e => {
                      setClientEmail(e.target.value);
                      if (errors.clientEmail) setErrors(prev => ({ ...prev, clientEmail: null }));
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111] ${
                      errors.clientEmail ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {errors.clientEmail && <span className="text-[10px] font-bold text-rose-500 block">{errors.clientEmail}</span>}
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
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">PIN Code</label>
                  <input
                    type="text"
                    placeholder="110001"
                    value={clientPinCode}
                    onChange={e => {
                      setClientPinCode(e.target.value);
                      if (errors.clientPinCode) setErrors(prev => ({ ...prev, clientPinCode: null }));
                    }}
                    className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111] ${
                      errors.clientPinCode ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {errors.clientPinCode && <span className="text-[10px] font-bold text-rose-500 block">{errors.clientPinCode}</span>}
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

          {/* STEP 2: CASE INFORMATION */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                  Case Title / Case Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Chandra Agrawal vs Apex Logistics Pvt Ltd"
                  value={caseTitle}
                  onChange={e => {
                    setCaseTitle(e.target.value);
                    if (errors.caseTitle) setErrors(prev => ({ ...prev, caseTitle: null }));
                  }}
                  className={`w-full border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111] ${
                    errors.caseTitle ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                {errors.caseTitle && <span className="text-[10px] font-bold text-rose-500 block">{errors.caseTitle}</span>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Case Category / Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCaseCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Priority Level</label>
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

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Case Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  >
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              {(localStorage.getItem('user_selected_role') || 'advocate') === 'law_firm' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block flex items-center gap-1">
                    <User size={12} className="text-[#C8A34D]" /> Lead Advocate / Assigned Lawyer
                  </label>
                  <select
                    value={leadAdvocate}
                    onChange={e => setLeadAdvocate(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  >
                    <option value="Firm Partner (Owner)">Firm Partner (Owner)</option>
                    <option value="Adv. Rajesh Verma">Adv. Rajesh Verma (Senior Litigation Counsel)</option>
                    <option value="Priya Sharma">Priya Sharma (Associate Advocate)</option>
                    <option value="Amitabh Sen">Amitabh Sen (Legal Researcher)</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Case Description / Short Overview</label>
                <textarea
                  rows={3}
                  placeholder="Concise overview of the legal dispute or background..."
                  value={caseOverview}
                  onChange={e => setCaseOverview(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] resize-none text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 3: OPPONENT & PARTIES */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                    Primary Opponent Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Apex Logistics Pvt Ltd"
                    value={oppositeParty}
                    onChange={e => {
                      setOppositeParty(e.target.value);
                      if (errors.oppositeParty) setErrors(prev => ({ ...prev, oppositeParty: null }));
                    }}
                    className={`w-full border rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111] ${
                      errors.oppositeParty ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {errors.oppositeParty && <span className="text-[10px] font-bold text-rose-500 block">{errors.oppositeParty}</span>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Opponent Role</label>
                  <select
                    value={opponentRole}
                    onChange={e => setOpponentRole(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  >
                    {OPPONENT_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Opponent Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Opponent Mobile</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={opponentMobile}
                    onChange={e => setOpponentMobile(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Opponent Email</label>
                  <input
                    type="email"
                    placeholder="opponent@domain.com"
                    value={opponentEmail}
                    onChange={e => setOpponentEmail(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Opponent Address</label>
                  <input
                    type="text"
                    placeholder="City / Area"
                    value={opponentAddress}
                    onChange={e => setOpponentAddress(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
              </div>

              {/* Opposing Counsel Section */}
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/60 dark:bg-[#181818] space-y-3">
                <h4 className="text-xs font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">Opposing Counsel Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Advocate Name"
                    value={oppositeAdvocate}
                    onChange={e => setOppositeAdvocate(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                  <input
                    type="text"
                    placeholder="Law Firm / Organization"
                    value={oppositeLawFirm}
                    onChange={e => setOppositeLawFirm(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                  <input
                    type="text"
                    placeholder="Counsel Contact Info"
                    value={oppositeAdvocateContact}
                    onChange={e => setOppositeAdvocateContact(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
              </div>

              {/* Additional Parties Section */}
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/60 dark:bg-[#181818] space-y-3">
                <h4 className="text-xs font-extrabold text-[#111111] dark:text-white uppercase tracking-wider">Add Additional Parties / Witnesses</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Party / Witness Name"
                    value={newPartyName}
                    onChange={e => setNewPartyName(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                  <select
                    value={newPartyRole}
                    onChange={e => setNewPartyRole(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  >
                    {ADDITIONAL_PARTY_ROLES.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Contact / Mobile"
                    value={newPartyContact}
                    onChange={e => setNewPartyContact(e.target.value)}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddParty}
                  className="px-4 py-2 bg-[#111111] text-[#C8A34D] border border-[#C8A34D]/40 rounded-xl font-bold text-xs hover:bg-[#222222] transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Plus size={14} /> Add Party Entry
                </button>
              </div>

              {/* Dynamic Added Additional Parties List */}
              {additionalParties.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Added Additional Parties ({additionalParties.length})</label>
                  <div className="space-y-2">
                    {additionalParties.map(p => (
                      <div key={p.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#181818] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-[#C8A34D]" />
                          <div>
                            <div className="text-xs font-extrabold text-[#111111] dark:text-white">{p.name}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{p.role} {p.contact ? `• ${p.contact}` : ''}</div>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveParty(p.id)} className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 4: COURT & JURISDICTION */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Court Type</label>
                  <select
                    value={courtType}
                    onChange={e => setCourtType(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  >
                    {COURT_TYPES.map(ct => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">State</label>
                  <input
                    type="text"
                    placeholder="Delhi / Maharashtra"
                    value={courtState}
                    onChange={e => setCourtState(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">District</label>
                  <input
                    type="text"
                    placeholder="New Delhi / Mumbai"
                    value={courtDistrict}
                    onChange={e => setCourtDistrict(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Court Name</label>
                <input
                  type="text"
                  placeholder="e.g. High Court of Delhi / Patiala House District Court"
                  value={courtName}
                  onChange={e => setCourtName(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">CNR Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DLHC01-004321-2024"
                    value={cnrNumber}
                    onChange={e => setCnrNumber(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Case Number</label>
                  <input
                    type="text"
                    placeholder="e.g. CS(COMM) 142/2024"
                    value={caseNumber}
                    onChange={e => setCaseNumber(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Court Hall / Room No.</label>
                  <input
                    type="text"
                    placeholder="Courtroom 302"
                    value={courtNumber}
                    onChange={e => setCourtNumber(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Bench Number</label>
                  <input
                    type="text"
                    placeholder="Bench III"
                    value={benchNumber}
                    onChange={e => setBenchNumber(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Judge / Presiding Officer</label>
                  <input
                    type="text"
                    placeholder="Hon'ble Justice Ramesh Verma"
                    value={judgeName}
                    onChange={e => setJudgeName(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: DATES & CASE BRIEF */}
          {step === 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Cause of Action Date</label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={e => setIncidentDate(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Filing Date</label>
                  <input
                    type="date"
                    value={filingDate}
                    onChange={e => setFilingDate(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Notice Date</label>
                  <input
                    type="date"
                    value={noticeDate}
                    onChange={e => setNoticeDate(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Next Hearing Date</label>
                  <input
                    type="date"
                    value={nextHearingDate}
                    onChange={e => setNextHearingDate(e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Case Summary & Key Facts</label>
                <textarea
                  rows={3}
                  placeholder="Enter detailed factual background and key facts of the matter..."
                  value={factsSummary}
                  onChange={e => setFactsSummary(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] resize-none text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Relief Sought / Claim</label>
                <textarea
                  rows={2}
                  placeholder="Specify the prayer, remedy, or relief requested from the court..."
                  value={reliefSought}
                  onChange={e => setReliefSought(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] resize-none text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                />
              </div>

              {/* Conditional Criminal Case Section */}
              {caseCategory === 'Criminal' && (
                <div className="p-4 border border-rose-200 dark:border-rose-900/50 rounded-2xl bg-rose-50/40 dark:bg-rose-950/20 space-y-3">
                  <h4 className="text-xs font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={14} /> Criminal Case & FIR Parameters
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        placeholder="FIR No. 0421"
                        value={firNumber}
                        onChange={e => setFirNumber(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">FIR Year</label>
                      <input
                        type="text"
                        placeholder="2024"
                        value={firYear}
                        onChange={e => setFirYear(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Office / Reference Number</label>
                      <input
                        type="text"
                        placeholder="Ref # CRM/2024/09"
                        value={referenceNumber}
                        onChange={e => setReferenceNumber(e.target.value)}
                        className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#C8A34D] text-[#111111] dark:text-white bg-white dark:bg-[#111111]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 6: REVIEW & CREATE */}
          {step === 6 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/60 dark:bg-[#181818] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h4 className="text-xs font-black text-[#111111] dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={16} className="text-[#C8A34D]" /> Final Review & Case Dossier Summary
                  </h4>
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-[#111111] text-[#C8A34D] uppercase border border-[#C8A34D]/30">
                    {priority} Priority
                  </span>
                </div>

                {/* 1. Client Review Card */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#C8A34D] tracking-wider">1. Client Information</span>
                    <button onClick={() => setStep(1)} className="text-[11px] font-bold text-slate-500 hover:text-[#C8A34D] flex items-center gap-1 cursor-pointer transition-colors">
                      <Edit2 size={11} /> Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-slate-600 dark:text-slate-300 font-medium">
                    <div>Client Name: <strong className="text-[#111111] dark:text-white font-extrabold">{clientName || 'N/A'}</strong> ({clientType})</div>
                    <div>Mobile / Email: <strong className="text-[#111111] dark:text-white font-extrabold">{clientMobile || 'N/A'}</strong> {clientEmail ? `• ${clientEmail}` : ''}</div>
                    {clientCompany && <div>Company: <strong className="text-[#111111] dark:text-white font-extrabold">{clientCompany}</strong></div>}
                    {(clientCity || clientState) && <div>Location: <strong className="text-[#111111] dark:text-white font-extrabold">{clientCity} {clientState} {clientPinCode}</strong></div>}
                  </div>
                </div>

                {/* 2. Case Details Review Card */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#C8A34D] tracking-wider">2. Case Information</span>
                    <button onClick={() => setStep(2)} className="text-[11px] font-bold text-slate-500 hover:text-[#C8A34D] flex items-center gap-1 cursor-pointer transition-colors">
                      <Edit2 size={11} /> Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-slate-600 dark:text-slate-300 font-medium">
                    <div>Title: <strong className="text-[#111111] dark:text-white font-extrabold">{caseTitle || 'N/A'}</strong></div>
                    <div>Category / Status: <strong className="text-[#111111] dark:text-white font-extrabold">{caseCategory}</strong> ({status})</div>
                  </div>
                  {caseOverview && <div className="text-slate-500 text-[11px] pt-1">Overview: {caseOverview}</div>}
                </div>

                {/* 3. Parties Review Card */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#C8A34D] tracking-wider">3. Opponent & Parties</span>
                    <button onClick={() => setStep(3)} className="text-[11px] font-bold text-slate-500 hover:text-[#C8A34D] flex items-center gap-1 cursor-pointer transition-colors">
                      <Edit2 size={11} /> Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-slate-600 dark:text-slate-300 font-medium">
                    <div>Primary Opponent: <strong className="text-[#111111] dark:text-white font-extrabold">{oppositeParty || 'N/A'}</strong> ({opponentRole})</div>
                    <div>Opposing Counsel: <strong className="text-[#111111] dark:text-white font-extrabold">{oppositeAdvocate || 'N/A'}</strong> {oppositeLawFirm ? `(${oppositeLawFirm})` : ''}</div>
                  </div>
                  {additionalParties.length > 0 && (
                    <div className="text-[11px] text-slate-500 pt-1">
                      Additional Parties: {additionalParties.map(p => `${p.name} (${p.role})`).join(', ')}
                    </div>
                  )}
                </div>

                {/* 4. Court Review Card */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#C8A34D] tracking-wider">4. Court & Jurisdiction</span>
                    <button onClick={() => setStep(4)} className="text-[11px] font-bold text-slate-500 hover:text-[#C8A34D] flex items-center gap-1 cursor-pointer transition-colors">
                      <Edit2 size={11} /> Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-slate-600 dark:text-slate-300 font-medium">
                    <div>Court: <strong className="text-[#111111] dark:text-white font-extrabold">{courtName || courtType}</strong></div>
                    <div>CNR / Case No: <strong className="text-[#111111] dark:text-white font-extrabold">{cnrNumber || caseNumber || 'N/A'}</strong></div>
                    <div>Location: <strong className="text-[#111111] dark:text-white font-extrabold">{courtDistrict} {courtState}</strong></div>
                    <div>Judge / Room: <strong className="text-[#111111] dark:text-white font-extrabold">{judgeName || courtNumber || 'N/A'}</strong></div>
                  </div>
                </div>

                {/* 5. Dates & Brief Review Card */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#111111] border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#C8A34D] tracking-wider">5. Dates & Case Brief</span>
                    <button onClick={() => setStep(5)} className="text-[11px] font-bold text-slate-500 hover:text-[#C8A34D] flex items-center gap-1 cursor-pointer transition-colors">
                      <Edit2 size={11} /> Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5 text-slate-600 dark:text-slate-300 font-medium">
                    <div>Filing / Incident Date: <strong className="text-[#111111] dark:text-white font-extrabold">{filingDate || incidentDate || 'N/A'}</strong></div>
                    <div>Next Hearing: <strong className="text-[#C8A34D] font-extrabold">{nextHearingDate || 'No upcoming hearing'}</strong></div>
                  </div>
                  {factsSummary && <div className="text-slate-600 dark:text-slate-300 text-[11px] pt-1">Facts: {factsSummary}</div>}
                  {reliefSought && <div className="text-slate-600 dark:text-slate-300 text-[11px] pt-1">Relief: {reliefSought}</div>}
                  {caseCategory === 'Criminal' && (policeStation || firNumber) && (
                    <div className="text-rose-600 dark:text-rose-400 text-[11px] pt-1 font-bold">
                      FIR Details: {firNumber ? `FIR ${firNumber}` : ''} {firYear ? `(${firYear})` : ''} {policeStation ? `@ ${policeStation}` : ''}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Modal Controls Bar */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-[#181818]">
          <button
            type="button"
            disabled={step === 1 || isSubmitting}
            onClick={() => setStep(prev => Math.max(prev - 1, 1))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              step === 1 ? 'opacity-40 cursor-not-allowed text-slate-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
            }`}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Quick Save' : 'Save Draft'}
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
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
                  <span>{initialData ? 'Saving Changes...' : 'Creating Case...'}</span>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>{initialData ? 'Save Changes' : 'CREATE CASE'}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateCaseWizardModal;
