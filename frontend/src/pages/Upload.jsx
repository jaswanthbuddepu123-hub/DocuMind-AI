import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { uploadDocument } from '../services/documentService';
import { UploadCloud, File, AlertCircle, CheckCircle2, FileText, RefreshCw, ChevronRight, X } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const Upload = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | uploading | processing | success | error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (selectedFile) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type. Only PDF, JPG, and PNG are supported.');
      return false;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File exceeds the 10MB limit.');
      return false;
    }
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setError(null);
    setStatus('uploading');
    setUploadProgress(0);

    try {
      const res = await uploadDocument(file, (progress) => {
        setUploadProgress(progress);
        if (progress === 100) {
          setStatus('processing');
        }
      });

      const finalDocument = res.document;
      if (finalDocument.status === 'failed') {
        throw new Error(finalDocument.processing_error || 'AI Processing failed');
      }

      setResult(finalDocument);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError(err.response?.data?.error || err.message || 'An unexpected error occurred during upload.');
    }
  };

  const resetState = () => {
    setFile(null);
    setError(null);
    setStatus('idle');
    setUploadProgress(0);
    setResult(null);
  };

  return (
    <div className="pb-10 max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-2">Upload Document</h1>
        <p className="text-slate-400">Extract intelligent insights instantly using Gemini AI.</p>
      </div>

      {status === 'idle' && (
        <div className="glass-panel rounded-[2.5rem] p-8 relative overflow-hidden group">
          <div className={`absolute inset-0 bg-indigo-500/5 mix-blend-screen transition-opacity duration-500 pointer-events-none ${dragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
          <div 
            className={`relative border-2 border-dashed rounded-[2rem] p-16 text-center transition-all duration-500 cursor-pointer overflow-hidden ${
              dragActive 
                ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_50px_rgba(99,102,241,0.2)] scale-[1.02]' 
                : 'border-indigo-500/30 hover:border-indigo-400 hover:bg-indigo-500/5 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            {/* Background glowing orb in dropzone */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[50px] transition-opacity duration-500 pointer-events-none ${dragActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
            
            <input 
              ref={inputRef}
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange} 
              className="hidden" 
            />
            
            <div className={`w-24 h-24 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 transition-transform duration-500 shadow-[0_0_30px_rgba(99,102,241,0.2)] ${dragActive ? 'scale-110' : 'group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white'}`}>
              <UploadCloud size={48} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 relative z-10 tracking-tight">
              {dragActive ? 'Drop it here!' : 'Click or drag document here'}
            </h3>
            <p className="text-slate-400 mb-8 font-medium relative z-10">
              Support for PDF, JPG, and PNG (Max 10MB)
            </p>
            <button className="relative z-10 bg-white/10 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-2xl shadow-sm transition-all duration-300 border border-white/10 hover:border-transparent hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]">
              Browse Files
            </button>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {file && (
            <div className="mt-6">
              <div className="flex items-center justify-between p-4 glass-panel rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="glass-card p-3 rounded-lg text-indigo-400 border-none">
                    <File size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-100 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <button 
                onClick={handleUpload}
                className="w-full mt-6 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3.5 px-4 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
              >
                Upload & Analyze
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {(status === 'uploading' || status === 'processing') && (
        <div className="glass-panel rounded-3xl p-12 text-center">
           <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              {status === 'uploading' ? (
                <div 
                  className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"
                ></div>
              ) : (
                <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
              )}
              <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                {status === 'uploading' ? <UploadCloud size={32} /> : <RefreshCw size={32} className="animate-pulse text-indigo-400" />}
              </div>
           </div>
           
           <h3 className="text-xl font-bold text-slate-100 mb-2">
             {status === 'uploading' ? 'Uploading Document...' : 'Processing with AI...'}
           </h3>
           <p className="text-slate-400 max-w-md mx-auto mb-6">
             {status === 'uploading' 
               ? `Transferring secure payload (${uploadProgress}%)` 
               : 'Gemini is classifying the document, extracting fields, and verifying internal consistency.'}
           </p>

           {status === 'uploading' && (
             <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-2 overflow-hidden">
               <div 
                 className="bg-indigo-500 h-full transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                 style={{ width: `${uploadProgress}%` }}
               ></div>
             </div>
           )}
        </div>
      )}

      {status === 'success' && result && (
        <div className="glass-panel rounded-3xl p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-100 mb-2">Analysis Complete!</h3>
          <p className="text-slate-400 mb-8">DocuMind successfully extracted structured data.</p>
          
          <div className="max-w-md mx-auto glass-card rounded-2xl p-6 text-left border-white/10 mb-8">
             <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/10">
               <div className="glass-card p-3 rounded-xl text-indigo-400 border-none">
                 <FileText size={24} />
               </div>
               <div className="min-w-0">
                 <p className="font-semibold text-slate-100 truncate">{result.original_filename}</p>
                 <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">
                   {result.document_type ? result.document_type.replace('_', ' ') : 'Unknown Type'}
                 </p>
               </div>
             </div>
             
             <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Status</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={16} /> Completed
                </span>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to={`/app/documents/${result.id}`}
              className="w-full sm:w-auto bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all text-center hover:-translate-y-0.5"
            >
              View Extracted Details
            </Link>
            <button 
              onClick={resetState}
              className="w-full sm:w-auto glass-panel text-slate-200 hover:bg-white/10 hover:text-white font-medium py-3 px-8 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="glass-panel rounded-3xl p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold text-slate-100 mb-2">Processing Failed</h3>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            {error || 'An unexpected error occurred during processing.'}
          </p>
          
          <button 
            onClick={resetState}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-8 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center gap-2 mx-auto hover:-translate-y-0.5"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Upload;
