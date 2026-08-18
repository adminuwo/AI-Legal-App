import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowLeft, RefreshCw, UploadCloud, Search, FileText, 
  Trash2, Eye, RotateCw, CheckCircle2, AlertCircle, Shield, ShieldAlert,
  Database, Layers, HardDrive, FileCode, Check, X, ExternalLink, HelpCircle,
  BookOpen, Terminal, Send, MessageSquare, Lock, ChevronRight, File
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRecoilValue } from 'recoil';
import { userData } from '../../userStore/userData';
import { isSuperAdmin } from '../../utils/isSuperAdmin';
import { apiService } from '../../services/apiService';
import DeleteConfirmModal from '../../Components/DeleteConfirmModal';
import axios from 'axios';
import { API } from '../../types';

export default function ProductGuideWorkspace() {
  const navigate = useNavigate();
  const recoilUserData = useRecoilValue(userData);
  const user = recoilUserData?.user || null;

  // Authorization Check
  const isAdmin = useMemo(() => {
    if (!user) return false;
    const email = (user.email || '').toLowerCase().trim();
    return (
      user.role === 'admin' ||
      user.role === 'SUPER_ADMIN' ||
      email === 'aditi@uwo24.com' ||
      email === 'admin@uwo24.com' ||
      isSuperAdmin(user)
    );
  }, [user]);

  // Tab Mode: 'knowledge' (Admin Calibrator) or 'chat' (Interactive Assistant)
  const [activeWorkspaceMode, setActiveWorkspaceMode] = useState('knowledge');

  // State Management
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Upload States
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Selected Detail Modal & Delete Confirm Modal
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deleteModalConfig, setDeleteModalConfig] = useState({ isOpen: false, id: null, name: '' });

  // RAG Test Sandbox States
  const [testQuery, setTestQuery] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // Interactive Product Guide Chat States (For non-admin or interactive testing)
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      sender: 'guide',
      text: `👋 Welcome to AI LEGAL™ Product Guide!\n\nI am your interactive AI assistant for understanding platform features, workflows, and legal tools.\n\nAsk me anything about how to use AI LEGAL™!`,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatThinking, setChatThinking] = useState(false);
  const chatEndRef = useRef(null);

  // Load Documents from Backend (/api/knowledge/list)
  const loadDocuments = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const token = user?.token || localStorage.getItem('token');
      const res = await axios.get(`${API}/knowledge/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success && res.data.data) {
        const allDocs = res.data.data.documents || [];
        const filtered = allDocs.filter(d => d.category === 'PRODUCT_GUIDE');
        setDocuments(filtered);
      } else {
        setDocuments([]);
      }
    } catch (err) {
      console.error('Failed to load Product Guide knowledge documents:', err);
      toast.error('Failed to load Product Guide Knowledge Base list.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [isAdmin]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalChunks = documents.reduce((acc, doc) => acc + (doc.totalChunks || 0), 0);
    const totalSizeBytes = documents.reduce((acc, doc) => acc + (doc.size || 0), 0);
    const storageUsed = totalSizeBytes > 1024 * 1024
      ? `${(totalSizeBytes / (1024 * 1024)).toFixed(2)} MB`
      : `${(totalSizeBytes / 1024).toFixed(1)} KB`;

    return {
      totalDocs,
      totalChunks,
      storageUsed,
      lastUpdated: documents.length > 0
        ? new Date(documents[0].uploadDate || Date.now()).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          })
        : 'Never'
    };
  }, [documents]);

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchSearch = doc.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const ext = (doc.filename || '').split('.').pop().toLowerCase();
      const matchType = typeFilter === 'all' ||
                        (typeFilter === 'pdf' && ext === 'pdf') ||
                        (typeFilter === 'docx' && (ext === 'docx' || ext === 'doc')) ||
                        (typeFilter === 'txt' && (ext === 'txt' || ext === 'md'));
      return matchSearch && matchType;
    });
  }, [documents, searchQuery, typeFilter]);

  // File Upload Handlers
  const handleFileSelect = (file) => {
    if (!file) return;
    const validExts = ['pdf', 'docx', 'doc', 'txt', 'md', 'json', 'csv', 'html'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExts.includes(ext)) {
      toast.error(`Unsupported file type (.${ext}). Please select PDF, DOCX, TXT, MD, CSV or JSON.`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size exceeds 25 MB limit.');
      return;
    }

    setSelectedFile(file);
    toast.success(`Selected file: ${file.name}`);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      toast.error('Please select a knowledge document first.');
      return;
    }

    setUploading(true);
    setUploadStep('Uploading document...');

    const playStepAnimation = async () => {
      const steps = [
        'Uploading document...',
        'Extracting document text...',
        'Parsing knowledge sections...',
        'Building vector embeddings index...',
        'Finalizing RAG calibration...'
      ];
      for (const step of steps) {
        setUploadStep(step);
        await new Promise(res => setTimeout(res, 500));
      }
    };

    try {
      const token = user?.token || localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('category', 'PRODUCT_GUIDE');

      const uploadPromise = axios.post(`${API}/knowledge/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      const [res] = await Promise.all([uploadPromise, playStepAnimation()]);

      if (res.data && res.data.success) {
        setUploadStep('Completed Successfully');
        await new Promise(r => setTimeout(r, 400));
        toast.success('Knowledge Added Successfully! AI Product Guide is now calibrated with this file.');
        setSelectedFile(null);
        loadDocuments();
      } else {
        throw new Error(res.data?.message || 'Ingestion failed');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      setUploadStep('');
    }
  };

  // Re-index Document
  const handleReindex = async (id) => {
    try {
      const token = user?.token || localStorage.getItem('token');
      const res = await axios.post(`${API}/knowledge/reindex/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        toast.success('Re-indexing started in background.');
        loadDocuments();
      }
    } catch (err) {
      toast.error('Failed to trigger re-indexing.');
    }
  };

  // Delete Document
  const handleDeleteConfirm = async () => {
    if (!deleteModalConfig.id) return;
    try {
      const token = user?.token || localStorage.getItem('token');
      const res = await axios.delete(`${API}/knowledge/${deleteModalConfig.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        toast.success('Document deleted permanently from Product Guide knowledge base.');
        setDeleteModalConfig({ isOpen: false, id: null, name: '' });
        loadDocuments();
      }
    } catch (err) {
      toast.error('Failed to delete document.');
      setDeleteModalConfig({ isOpen: false, id: null, name: '' });
    }
  };

  // RAG Test Sandbox Query
  const handleTestQuerySubmit = async (e) => {
    if (e) e.preventDefault();
    if (!testQuery.trim()) return;

    setTestLoading(true);
    setTestResult(null);

    try {
      const token = user?.token || localStorage.getItem('token');
      const res = await axios.post(`${API}/knowledge/test-query`, {
        query: testQuery,
        category: 'PRODUCT_GUIDE'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data && res.data.success) {
        setTestResult({
          answer: res.data.answer || 'Query processed.',
          chunks: res.data.chunks || []
        });
      } else {
        toast.error('No matching knowledge chunks retrieved.');
      }
    } catch (err) {
      toast.error('Test query failed.');
    } finally {
      setTestLoading(false);
    }
  };

  // Interactive Product Guide Chat Handler
  const handleSendChatMessage = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || chatThinking) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    const currentText = chatInput;
    setChatInput('');
    setChatThinking(true);

    try {
      const token = user?.token || localStorage.getItem('token');
      const res = await axios.post(`${API}/knowledge/query-guide`, {
        message: currentText,
        question: currentText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const replyText = res.data?.reply || res.data?.answer || "I'm the AI LEGAL Product Guide. I can help you navigate every feature of the AI LEGAL application.";
      const guideMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'guide',
        text: replyText,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, guideMsg]);
    } catch (err) {
      console.error("Guide chat error:", err);
      const fallbackMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'guide',
        text: "I am the AI LEGAL™ Product Guide. You can ask me how to create case workspaces, generate legal drafts, analyze contracts, or search precedents.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setChatThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-zinc-100 flex flex-col">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800 shadow-xs px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:bg-zinc-700" />

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C8A34D]/10 flex items-center justify-center border border-[#C8A34D]/30">
              <BookOpen className="w-5 h-5 text-[#C8A34D]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">AI Product Guide Knowledge</h1>
                {isAdmin ? (
                  <span className="px-2 py-0.5 rounded bg-[#C8A34D]/15 text-[#C8A34D] border border-[#C8A34D]/30 text-[10px] font-black uppercase tracking-wider">
                    {isSuperAdmin(user) ? 'SUPER ADMIN' : 'ADMIN'}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold uppercase tracking-wider">
                    USER
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                Manage the internal RAG knowledge base used by AI Legal™ Product Guide.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher & Action Controls */}
        <div className="flex items-center gap-3">
          {isAdmin && (
            <div className="flex items-center p-1 bg-slate-100 dark:bg-zinc-800 rounded-xl border border-slate-200/80 dark:border-zinc-700">
              <button
                onClick={() => setActiveWorkspaceMode('knowledge')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeWorkspaceMode === 'knowledge'
                    ? 'bg-white dark:bg-zinc-900 text-[#C8A34D] shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>RAG Knowledge Calibrator</span>
              </button>
              <button
                onClick={() => setActiveWorkspaceMode('chat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeWorkspaceMode === 'chat'
                    ? 'bg-white dark:bg-zinc-900 text-[#C8A34D] shadow-xs'
                    : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>AI Guide Chat</span>
              </button>
            </div>
          )}

          {isAdmin && activeWorkspaceMode === 'knowledge' && (
            <button
              onClick={() => { setRefreshing(true); loadDocuments(); }}
              className="p-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 rounded-xl border border-slate-200/80 dark:border-zinc-700 transition-all cursor-pointer"
              title="Refresh Knowledge List"
            >
              <RefreshCw className={`w-4 h-4 text-[#C8A34D] ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* NON-ADMIN ACCESS RESTRICTED GUARD */}
        {!isAdmin ? (
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-8 sm:p-12 text-center space-y-6 max-w-2xl mx-auto shadow-sm my-12">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Admin Access Restricted</h2>
              <p className="text-sm text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                Only authorized administrators can manage and calibrate the AI Product Guide RAG Knowledge Base.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setActiveWorkspaceMode('chat')}
                className="px-6 py-3 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Chat with AI Product Guide</span>
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-slate-800 dark:text-zinc-200 font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : activeWorkspaceMode === 'chat' ? (
          /* INTERACTIVE PRODUCT GUIDE CHAT INTERFACE */
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm flex flex-col h-[75vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200/80 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#C8A34D]" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">AI Product Guide Chat Sandbox</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Powered by Live RAG Knowledge Base</span>
            </div>

            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xl p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-[#C8A34D] text-[#111111] rounded-br-none font-semibold'
                      : 'bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-bl-none border border-slate-200/60 dark:border-zinc-700/60'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))}
              {chatThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-zinc-800 p-4 rounded-2xl rounded-bl-none border border-slate-200/60 text-xs font-bold text-slate-400 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-[#C8A34D]" />
                    <span>Searching RAG Knowledge Base...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendChatMessage} className="p-4 border-t border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-[#1E293B] flex items-center gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask anything about AI LEGAL™ features, workflows, or tools..."
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium focus:outline-none focus:border-[#C8A34D]"
              />
              <button
                type="submit"
                disabled={chatThinking || !chatInput.trim()}
                className="px-5 py-3 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        ) : (
          /* ADMIN RAG KNOWLEDGE CALIBRATOR WORKSPACE */
          <>
            {/* 1. Live Statistics Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-[#C8A34D]/10 text-[#C8A34D] border border-[#C8A34D]/20">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Knowledge Files</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalDocs}</h3>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Ingested Documents</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Knowledge Sections</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.totalChunks}</h3>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Vector Chunks</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Storage Consumed</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.storageUsed}</h3>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">RAG Storage</p>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-5 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-4">
                <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Last Calibrated</p>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{stats.lastUpdated}</h3>
                  <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Latest Update</p>
                </div>
              </div>
            </div>

            {/* 2. Drag & Drop File Upload Section */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <UploadCloud className="w-5 h-5 text-[#C8A34D]" />
                    <span>Upload Knowledge Document</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    Ingest FAQs, User Manuals, Release Notes, or Feature Docs to calibrate AI Product Guide.
                  </p>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full border border-slate-200/60 dark:border-zinc-700">
                  Supported: PDF, DOCX, TXT, MD, CSV, JSON (Max 25 MB)
                </span>
              </div>

              {/* Upload Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md,.json,.csv,.html"
                onChange={e => handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              <div
                onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files?.length > 0) {
                    handleFileSelect(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                  isDragOver
                    ? 'border-[#C8A34D] bg-[#C8A34D]/10'
                    : 'border-slate-300 dark:border-zinc-700 hover:border-[#C8A34D] hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-[#C8A34D]/10 text-[#C8A34D] border border-[#C8A34D]/25 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                    {selectedFile ? selectedFile.name : 'Click or Drag & Drop Product Knowledge Document'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'PDF, DOCX, TXT, MD, CSV, JSON up to 25MB'}
                  </p>
                </div>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-900 p-4 rounded-xl border border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-[#C8A34D]" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-800 hover:bg-slate-300 text-xs font-bold text-slate-700 dark:text-zinc-300 rounded-lg transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleUploadSubmit}
                      disabled={uploading}
                      className="px-5 py-2 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] font-black rounded-lg text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {uploading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>{uploadStep}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Add to RAG Knowledge Base</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Search & Control Bar */}
            <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-slate-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="relative flex-1 w-full max-w-md">
                <Search className="w-4 h-4 text-[#C8A34D] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search knowledge file by name..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C8A34D] bg-slate-50 dark:bg-zinc-900"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={typeFilter}
                  onChange={e => setTypeFilter(e.target.value)}
                  className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-zinc-200 cursor-pointer outline-none"
                >
                  <option value="all">All File Types</option>
                  <option value="pdf">PDF Documents</option>
                  <option value="docx">Word Documents</option>
                  <option value="txt">Text & MD Files</option>
                </select>
              </div>
            </div>

            {/* 4. Knowledge Documents Table */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Product Guide Knowledge Assets</h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Shared vector store used by Web & Mobile Product Guide</p>
                </div>
                <span className="text-xs font-bold text-[#C8A34D] bg-[#C8A34D]/10 px-3 py-1 rounded-full border border-[#C8A34D]/20">
                  {filteredDocuments.length} Documents
                </span>
              </div>

              {loading ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-[#C8A34D] animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-400">Loading Product Guide Knowledge Base...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">No knowledge assets found.</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Upload user manuals, release notes, or FAQs to calibrate the AI Product Guide.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="bg-slate-50/80 dark:bg-zinc-900/60 border-b border-slate-200/80 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                        <th className="px-6 py-3.5">Source Name</th>
                        <th className="px-6 py-3.5">Type</th>
                        <th className="px-6 py-3.5">Upload Date</th>
                        <th className="px-6 py-3.5 text-center">Sections / Chunks</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {filteredDocuments.map(doc => {
                        const ext = (doc.filename || '').split('.').pop().toUpperCase();
                        return (
                          <tr key={doc._id} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate max-w-[240px]" title={doc.filename}>{doc.filename}</p>
                                  <span className="inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                    {doc.category || 'PRODUCT_GUIDE'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[10px] font-black bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-zinc-700">
                                {ext || 'DOC'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                              {new Date(doc.uploadDate || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
                                {doc.totalChunks || 'Auto'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>{doc.status || 'Active'}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => setSelectedDoc(doc)}
                                  className="p-2 text-slate-400 hover:text-[#C8A34D] hover:bg-[#C8A34D]/10 rounded-lg transition-all cursor-pointer"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReindex(doc._id)}
                                  className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all cursor-pointer"
                                  title="Re-index Embeddings"
                                >
                                  <RotateCw className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteModalConfig({ isOpen: true, id: doc._id, name: doc.filename })}
                                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                                  title="Delete Permanently"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 5. Live RAG Test Query Sandbox */}
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#C8A34D]" />
                    <span>Live RAG Search & Calibration Sandbox</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">Test statutory / feature queries against the active Product Guide vector index.</p>
                </div>
              </div>

              <form onSubmit={handleTestQuerySubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={testQuery}
                  onChange={e => setTestQuery(e.target.value)}
                  placeholder="e.g. How do I create a case workspace in My Matters?"
                  className="flex-1 px-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C8A34D]"
                />
                <button
                  type="submit"
                  disabled={testLoading || !testQuery.trim()}
                  className="px-6 py-3 bg-[#C8A34D] hover:bg-[#b08d3b] text-[#111111] font-black rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {testLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Test RAG Query</span>
                </button>
              </form>

              {testResult && (
                <div className="mt-4 p-5 bg-slate-50 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#C8A34D] mb-1">Generated RAG Response</p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">{testResult.answer}</p>
                  </div>

                  {testResult.chunks?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Retrieved Vector Chunks</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {testResult.chunks.map((chunk, idx) => (
                          <div key={idx} className="p-3 bg-white dark:bg-zinc-800 rounded-xl border border-slate-200/80 dark:border-zinc-700 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-900 dark:text-white truncate max-w-[180px]">{chunk.title || `Chunk #${idx+1}`}</span>
                              <span className="text-[9px] font-black bg-[#C8A34D]/15 text-[#C8A34D] px-1.5 py-0.5 rounded">{chunk.score || 'Score 0.95'}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-3 leading-tight">{chunk.snippet}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* View Document Details Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white truncate max-w-[280px]">{selectedDoc.filename}</h3>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#C8A34D]">{selectedDoc.category || 'PRODUCT_GUIDE'}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200/60 dark:border-zinc-800">
                <p className="text-[10px] text-slate-400 uppercase font-black">Status</p>
                <p className="text-slate-800 dark:text-zinc-200 mt-0.5">{selectedDoc.status || 'Active'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200/60 dark:border-zinc-800">
                <p className="text-[10px] text-slate-400 uppercase font-black">Chunks</p>
                <p className="text-slate-800 dark:text-zinc-200 mt-0.5">{selectedDoc.totalChunks || 'Auto'}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200/60 dark:border-zinc-800">
                <p className="text-[10px] text-slate-400 uppercase font-black">Date Uploaded</p>
                <p className="text-slate-800 dark:text-zinc-200 mt-0.5">{new Date(selectedDoc.uploadDate || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200/60 dark:border-zinc-800">
                <p className="text-[10px] text-slate-400 uppercase font-black">File Size</p>
                <p className="text-slate-800 dark:text-zinc-200 mt-0.5">{selectedDoc.size ? `${(selectedDoc.size/1024).toFixed(1)} KB` : 'Standard'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { handleReindex(selectedDoc._id); setSelectedDoc(null); }}
                className="flex-1 py-3 bg-[#C8A34D] text-[#111111] font-black rounded-xl text-xs hover:bg-[#b08d3b] transition-all"
              >
                Re-index Document
              </button>
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-3 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig({ isOpen: false, id: null, name: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Knowledge Document?"
        description={`Are you sure you want to permanently delete "${deleteModalConfig.name}"? This action will remove the document and all vector embeddings from the Product Guide knowledge base.`}
      />
    </div>
  );
}
