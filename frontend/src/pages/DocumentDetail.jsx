import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDocument, updateDocumentResult, deleteDocument, downloadDocument, retryDocument, transformDocument, renameDocument } from '../services/documentService';
import { FileText, CheckCircle2, AlertTriangle, AlertCircle, Edit3, Trash2, Save, Eye, File, DownloadCloud, RefreshCw, Sparkles, Loader2, UploadCloud, XCircle, Edit2, X } from 'lucide-react';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [document, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [secureUrl, setSecureUrl] = useState(null);
  
  const [transformInstruction, setTransformInstruction] = useState('');
  const [transformImage, setTransformImage] = useState(null);
  const [isTransforming, setIsTransforming] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [transformedDoc, setTransformedDoc] = useState(null);
  const [transformedSecureUrl, setTransformedSecureUrl] = useState(null);

  // Rename state
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const fetchDoc = async () => {
    try {
      setLoading(true);
      const data = await getDocument(id);
      setDoc(data);
      
      const resData = Array.isArray(data.document_results) ? data.document_results[0] : data.document_results;
      if (resData && resData.extracted_data && resData.extracted_data.fields) {
        setEditForm(resData.extracted_data.fields);
      }

      if (data.status !== 'failed') {
        try {
          const dl = await downloadDocument(id);
          setSecureUrl(dl.url);
        } catch (e) {
          console.error("Failed to fetch secure url", e);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load document details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoc();
    setTransformedDoc(null);
    setTransformedSecureUrl(null);
    setTransformImage(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently archive this document?')) {
      try {
        await deleteDocument(id);
        navigate('/app/documents');
      } catch (err) {
        console.error(err);
        alert('Failed to delete document.');
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      setSaving(true);
      await updateDocumentResult(id, { fields: editForm });
      setIsEditing(false);
      await fetchDoc(); // Refetch fresh data
    } catch (err) {
      console.error(err);
      alert('Failed to save edits: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      await retryDocument(id);
      alert('Retry initiated. The document is processing again.');
      navigate('/app/documents');
    } catch (err) {
      console.error(err);
      alert('Failed to retry: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsRetrying(false);
    }
  };

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === document.original_filename) {
      setIsRenaming(false);
      return;
    }
    try {
      setIsSavingName(true);
      await renameDocument(id, newName.trim());
      setDoc({ ...document, original_filename: newName.trim() });
      setIsRenaming(false);
    } catch (err) {
      console.error(err);
      alert('Failed to rename: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleTransform = async () => {
    if (!transformInstruction.trim()) return;
    try {
      setIsTransforming(true);
      const res = await transformDocument(id, transformInstruction, transformImage);
      if (res.document && res.document.id) {
        setTransformedDoc(res.document);
        try {
          const dl = await downloadDocument(res.document.id);
          setTransformedSecureUrl(dl.url);
        } catch (e) {
          console.error("Failed to fetch transformed secure url", e);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to transform: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsTransforming(false);
      setTransformInstruction('');
      setTransformImage(null);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  if (error || !document) return (
    <div className="bg-red-50 text-red-600 p-6 rounded-2xl text-center shadow-sm border border-red-100 max-w-lg mx-auto mt-10">
      <AlertCircle size={48} className="mx-auto mb-4 opacity-80" />
      <h3 className="font-bold text-xl mb-2">Error</h3>
      <p className="mb-6">{error || 'Document not found'}</p>
      <Link to="/app/documents" className="inline-flex items-center justify-center px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-sm">
        Back to Documents
      </Link>
    </div>
  );

  const resData = Array.isArray(document.document_results) ? document.document_results[0] : document.document_results;
  const insights = Array.isArray(document.document_insights) ? document.document_insights : [];
  
  const isImage = document.mime_type && document.mime_type.startsWith('image/');
  const isPdf = document.mime_type === 'application/pdf';

  return (
    <div className="pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-600 dark:text-blue-400 rounded-2xl shadow-inner border border-white dark:border-gray-800">
            <FileText size={32} />
          </div>
          <div className="flex-1 min-w-0">
            {isRenaming ? (
              <div className="flex items-center gap-2 max-w-full">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-lg font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename();
                    if (e.key === 'Escape') setIsRenaming(false);
                  }}
                />
                <button onClick={handleRename} disabled={isSavingName} className="p-1.5 shrink-0 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors">
                   {isSavingName ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                </button>
                <button onClick={() => setIsRenaming(false)} disabled={isSavingName} className="p-1.5 shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                   <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 group min-w-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate" title={document.original_filename}>{document.original_filename}</h1>
                <button 
                  onClick={() => {
                    setNewName(document.original_filename);
                    setIsRenaming(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-2.5 py-1 rounded-md">
                {document.document_type ? document.document_type.replace('_', ' ') : 'Unknown'}
              </span>
              {resData?.confidence && (
                <span className="text-xs font-bold bg-green-50 text-green-700 border border-green-100 px-2.5 py-1 rounded-md">
                  {Math.round(resData.confidence * 100)}% Confidence
                </span>
              )}
              <span className="text-xs font-medium text-gray-400">
                Uploaded {new Date(document.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors border border-red-100/50 hover:border-red-200 shadow-sm shadow-red-100/50">
            <Trash2 size={18} /> Archive
          </button>
        </div>
      </div>

      {document.status === 'failed' ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 p-10 rounded-3xl text-center shadow-sm max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/50 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-400 mb-3">AI Processing Failed</h2>
          <p className="text-red-700 dark:text-red-300 mb-6">We encountered an error while trying to analyze this document.</p>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-red-100 dark:border-red-800/50 text-left font-mono text-sm shadow-sm overflow-x-auto text-red-600 dark:text-red-400 mb-6">
            {document.processing_error || 'An unknown internal error occurred.'}
          </div>
          <button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-medium transition-colors mx-auto shadow-md"
          >
            {isRetrying ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            {isRetrying ? 'Retrying...' : 'Retry Processing'}
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Data */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Extracted Fields */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><FileText size={18} /></div>
                    Extracted Information
                  </h3>
                  {resData?.extracted_data?.fields && (
                    isEditing ? (
                      <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors shadow-sm">
                          Cancel
                        </button>
                        <button onClick={handleSaveEdit} disabled={saving} className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-500/30">
                          {saving ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
                          Save Changes
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-medium transition-colors shadow-sm">
                        <Edit3 size={16} /> Edit Fields
                      </button>
                    )
                  )}
                </div>
                <div className="p-6 bg-gray-50/30 dark:bg-gray-950/50">
                  {resData?.extracted_data?.fields ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                      {Object.entries(resData.extracted_data.fields).map(([key, value]) => {
                        // format camelCase to Title Case
                        const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                        const capitalizedKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);

                        // Fully recursive helper to render any value type nicely
                        const renderValue = (val, depth = 0) => {
                          if (val === null || val === undefined || val === '') {
                            return <span className="text-gray-400 italic">Not found</span>;
                          }
                          if (Array.isArray(val)) {
                            return (
                              <ul className={`list-disc space-y-1 ${depth === 0 ? 'list-inside' : 'list-inside ml-4'}`}>
                                {val.map((item, i) => (
                                  <li key={i} className="text-sm">
                                    {typeof item === 'object' && item !== null
                                      ? renderValue(item, depth + 1)
                                      : String(item)}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          if (typeof val === 'object') {
                            return (
                              <ul className={`space-y-1 ${depth > 0 ? 'ml-4 border-l border-gray-200 dark:border-gray-700 pl-2 mt-1' : ''}`}>
                                {Object.entries(val).map(([k, v]) => (
                                  <li key={k} className="text-sm">
                                    <span className="font-semibold capitalize">{k}:</span>{' '}
                                    {typeof v === 'object' && v !== null
                                      ? renderValue(v, depth + 1)
                                      : String(v)}
                                  </li>
                                ))}
                              </ul>
                            );
                          }
                          return <span>{String(val)}</span>;
                        };
                        
                        return (
                          <div key={key}>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                              {capitalizedKey}
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm[key] || ''}
                                onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900 px-4 py-3 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                {renderValue(value)}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic p-4 text-center border-2 border-dashed border-gray-200 rounded-xl">
                      No structured fields were extracted for this document.
                    </p>
                  )}
                </div>
              </div>
  
              {/* Line Items */}
              {resData?.extracted_data?.lineItems && resData.extracted_data.lineItems.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><FileText size={18} /></div>
                      Line Items
                    </h3>
                  </div>
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800 text-xs uppercase tracking-wider text-gray-500 font-bold">
                          <th className="p-4">Description</th>
                          <th className="p-4 text-right">Qty</th>
                          <th className="p-4 text-right">Unit Price</th>
                          <th className="p-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200">
                        {resData.extracted_data.lineItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/20 transition-colors">
                            <td className="p-4 py-3">{item.description || '-'}</td>
                            <td className="p-4 py-3 text-right text-gray-500">{item.quantity || '-'}</td>
                            <td className="p-4 py-3 text-right text-gray-500">{item.unitPrice !== null ? `$${item.unitPrice}` : '-'}</td>
                            <td className="p-4 py-3 text-right">{item.amount !== null ? `$${item.amount}` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
  
              {/* AI Insights */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                 <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                     <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Eye size={18} /></div>
                     AI Insights
                   </h3>
                 </div>
                 <div className="p-6 bg-gray-50/30 dark:bg-gray-950/50">
                   {insights.length > 0 ? (
                     <ul className="space-y-4">
                       {insights.map((insight, idx) => (
                         <li key={insight.id || idx} className="flex items-start gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                           <div className={`mt-1 shrink-0 w-3 h-3 rounded-full ${
                             insight.severity === 'high' ? 'bg-red-500 shadow-sm shadow-red-500/40' :
                             insight.severity === 'medium' ? 'bg-amber-500 shadow-sm shadow-amber-500/40' : 'bg-gray-400'
                           }`} />
                           <span className="text-sm font-medium text-gray-700 leading-relaxed">{insight.insight_text}</span>
                         </li>
                       ))}
                     </ul>
                   ) : (
                     <p className="text-gray-500 italic text-center p-4">No AI insights generated for this document.</p>
                   )}
                 </div>
              </div>
            </div>
  
            {/* Right Column: Validation & Preview */}
            <div className="space-y-8">
              
              {/* AI Transform */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-sm border border-indigo-500/50 overflow-hidden text-white p-6">
                <h3 className="text-lg font-bold flex items-center gap-2.5 mb-2">
                  <Sparkles size={20} className="text-indigo-200" />
                  Visual PDF Editor
                </h3>
                <p className="text-indigo-100 text-sm mb-4">
                  Draw text, redact areas, or add an uploaded image anywhere on the original document using natural language.
                </p>
                <div className="space-y-3">
                  <textarea
                    value={transformInstruction}
                    onChange={(e) => setTransformInstruction(e.target.value)}
                    placeholder="e.g. Add the uploaded image to the middle of the page. Add text 'Approved' to the top right."
                    className="w-full bg-indigo-900/40 border border-indigo-400/50 text-white placeholder-indigo-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/50 transition-all text-sm resize-none h-24"
                  ></textarea>

                  {/* File Input */}
                  <div className="flex items-center gap-2">
                     <label className="cursor-pointer bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors border border-white/20">
                       <UploadCloud size={14} />
                       {transformImage ? transformImage.name : 'Upload Image (Optional)'}
                       <input type="file" accept="image/png, image/jpeg" className="hidden" onChange={(e) => setTransformImage(e.target.files[0])} />
                     </label>
                     {transformImage && (
                       <button onClick={() => setTransformImage(null)} className="text-white/50 hover:text-white/90">
                         <XCircle size={14} />
                       </button>
                     )}
                  </div>

                  <button
                    onClick={handleTransform}
                    disabled={!transformInstruction.trim() || isTransforming}
                    className="w-full py-2.5 mt-2 bg-white text-indigo-600 hover:bg-indigo-50 disabled:bg-indigo-100 disabled:opacity-70 rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2"
                  >
                    {isTransforming ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                    {isTransforming ? 'Applying Edits...' : 'Apply Visual Edits'}
                  </button>
                </div>
              </div>
  
              {/* Validation */}
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                 <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                     {resData?.validation_status === 'valid' ? (
                       <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={18} /></div>
                     ) : (
                       <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={18} /></div>
                     )}
                     Validation
                   </h3>
                 </div>
                 <div className="p-6 bg-gray-50/30 dark:bg-gray-950/50">
                   {resData?.validation_status === 'valid' ? (
                     <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-2xl border border-green-100">
                       <CheckCircle2 size={24} className="shrink-0" />
                       <span className="text-sm font-semibold">Data is internally consistent.</span>
                     </div>
                   ) : (
                     <div className="space-y-4">
                       <div className="flex items-center gap-3 text-amber-800 bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm">
                         <AlertTriangle size={24} className="shrink-0 text-amber-500" />
                         <span className="text-sm font-bold">Inconsistencies detected</span>
                       </div>
                       <ul className="space-y-3 pl-1">
                         {resData?.extracted_data?.validation?.issues?.map((issue, idx) => (
                           <li key={idx} className="flex items-start gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                             <span className="mt-2 w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                             {issue}
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}
                 </div>
              </div>
  
            </div>
          </div>
  
          {/* Previews Section (Side by Side) */}
          <div className={`grid grid-cols-1 ${transformedDoc ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-8 mt-8`}>
            {/* Original File Preview */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[600px]">
               <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-between items-center shrink-0">
                 <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
                   <div className="p-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg"><File size={18} /></div>
                   Original File
                 </h3>
                 {secureUrl && (
                   <a href={secureUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors bg-gray-50 border border-gray-200 hover:border-blue-200 shadow-sm" title="Download Original">
                     <DownloadCloud size={18} />
                   </a>
                 )}
               </div>
               <div className="flex-1 bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4 overflow-hidden relative border-t border-gray-200 dark:border-gray-800 shadow-inner">
                 {!secureUrl ? (
                   <div className="flex flex-col items-center justify-center text-gray-400">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-4"></div>
                     <p>Loading secure preview...</p>
                   </div>
                 ) : isImage ? (
                   <img src={secureUrl} alt="Original Document" className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-gray-200 bg-white" />
                 ) : isPdf ? (
                   <iframe src={`${secureUrl}#toolbar=0`} className="w-full h-full rounded-lg bg-white shadow-sm border border-gray-200" title="PDF Preview" />
                 ) : (
                   <div className="text-center text-gray-500 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                     <File size={48} className="mx-auto mb-3 opacity-30" />
                     <p className="text-sm font-medium">Preview not available for this format</p>
                     <a href={secureUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm hover:underline mt-2 inline-block">Download instead</a>
                   </div>
                 )}
               </div>
            </div>
  
            {/* Transformed File Preview */}
            {transformedDoc && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-indigo-200 dark:border-indigo-800 overflow-hidden flex flex-col h-[600px] animate-in slide-in-from-right-8 duration-500">
                 <div className="p-6 border-b border-indigo-100 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-900/10 flex justify-between items-center shrink-0">
                   <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-2.5">
                     <div className="p-1.5 bg-indigo-100 dark:bg-indigo-800/50 text-indigo-600 dark:text-indigo-300 rounded-lg"><Sparkles size={18} /></div>
                     New Transformed File
                   </h3>
                   {transformedSecureUrl && (
                     <div className="flex gap-2">
                       <a href={transformedSecureUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-indigo-500 hover:text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors bg-white border border-indigo-200 hover:border-indigo-300 shadow-sm" title="Download Transformed">
                         <DownloadCloud size={18} />
                       </a>
                       <Link to={`/app/documents/${transformedDoc.id}`} className="px-3 py-1.5 flex items-center gap-1 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium shadow-sm transition-colors">
                         View Details
                       </Link>
                     </div>
                   )}
                 </div>
                 <div className="flex-1 bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4 overflow-hidden relative border-t border-gray-200 dark:border-gray-800 shadow-inner">
                   {!transformedSecureUrl ? (
                     <div className="flex flex-col items-center justify-center text-gray-400">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mb-4"></div>
                       <p>Loading transformed preview...</p>
                     </div>
                   ) : transformedDoc.mime_type?.startsWith('image/') ? (
                     <img src={transformedSecureUrl} alt="Transformed Document" className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-gray-200 bg-white" />
                   ) : transformedDoc.mime_type === 'application/pdf' ? (
                     <iframe src={`${transformedSecureUrl}#toolbar=0`} className="w-full h-full rounded-lg bg-white shadow-sm border border-gray-200" title="Transformed PDF Preview" />
                   ) : (
                     <div className="text-center text-gray-500 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                       <File size={48} className="mx-auto mb-3 opacity-30" />
                       <p className="text-sm font-medium">Preview not available for this format</p>
                       <a href={transformedSecureUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold text-sm hover:underline mt-2 inline-block">Download instead</a>
                     </div>
                   )}
                 </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentDetail;
