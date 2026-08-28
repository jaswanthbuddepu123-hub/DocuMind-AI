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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Document</h1>
        <p className="text-gray-500">Extract intelligent insights instantly using Gemini AI.</p>
      </div>

      {status === 'idle' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div 
            className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input 
              ref={inputRef}
              type="file" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange} 
              className="hidden" 
            />
            
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              Click or drag document here
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Support for PDF, JPG, and PNG (Max 10MB)
            </p>
            <button className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-2 px-6 rounded-lg shadow-sm transition-colors">
              Browse Files
            </button>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {file && (
            <div className="mt-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white shadow-sm rounded-lg text-blue-600">
                    <File size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
              
              <button 
                onClick={handleUpload}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
              >
                Upload & Analyze
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {(status === 'uploading' || status === 'processing') && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
           <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
              {status === 'uploading' ? (
                <div 
                  className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
                ></div>
              ) : (
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              )}
              <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                {status === 'uploading' ? <UploadCloud size={32} /> : <RefreshCw size={32} className="animate-pulse text-indigo-600" />}
              </div>
           </div>
           
           <h3 className="text-xl font-bold text-gray-900 mb-2">
             {status === 'uploading' ? 'Uploading Document...' : 'Processing with AI...'}
           </h3>
           <p className="text-gray-500 max-w-md mx-auto mb-6">
             {status === 'uploading' 
               ? `Transferring secure payload (${uploadProgress}%)` 
               : 'Gemini is classifying the document, extracting fields, and verifying internal consistency.'}
           </p>

           {status === 'uploading' && (
             <div className="w-full max-w-md mx-auto bg-gray-100 rounded-full h-2 overflow-hidden">
               <div 
                 className="bg-blue-600 h-full transition-all duration-300"
                 style={{ width: `${uploadProgress}%` }}
               ></div>
             </div>
           )}
        </div>
      )}

      {status === 'success' && result && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete!</h3>
          <p className="text-gray-500 mb-8">DocuMind successfully extracted structured data.</p>
          
          <div className="max-w-md mx-auto bg-gray-50 rounded-2xl p-6 text-left border border-gray-200 mb-8">
             <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
               <div className="p-3 bg-white shadow-sm rounded-xl text-blue-600">
                 <FileText size={24} />
               </div>
               <div className="min-w-0">
                 <p className="font-semibold text-gray-900 truncate">{result.original_filename}</p>
                 <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mt-1">
                   {result.document_type ? result.document_type.replace('_', ' ') : 'Unknown Type'}
                 </p>
               </div>
             </div>
             
             <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold text-green-600 flex items-center gap-1">
                  <CheckCircle2 size={16} /> Completed
                </span>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link 
              to={`/app/documents/${result.id}`}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all text-center"
            >
              View Extracted Details
            </Link>
            <button 
              onClick={resetState}
              className="w-full sm:w-auto bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium py-3 px-8 rounded-xl shadow-sm transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Processing Failed</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            {error || 'An unexpected error occurred during processing.'}
          </p>
          
          <button 
            onClick={resetState}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 mx-auto"
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
