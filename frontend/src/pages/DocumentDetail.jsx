import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDocument, updateDocumentResult, deleteDocument } from '../services/documentService';
import { FileText, CheckCircle2, AlertTriangle, AlertCircle, Edit3, Trash2, Save, Eye, File, DownloadCloud } from 'lucide-react';

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [document, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchDoc = async () => {
    try {
      setLoading(true);
      const data = await getDocument(id);
      setDoc(data);
      
      const resData = Array.isArray(data.document_results) ? data.document_results[0] : data.document_results;
      if (resData && resData.extracted_data && resData.extracted_data.fields) {
        setEditForm(resData.extracted_data.fields);
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
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 rounded-2xl shadow-inner border border-white">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 truncate max-w-lg">{document.original_filename}</h1>
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
        <div className="bg-red-50 border border-red-100 p-10 rounded-3xl text-center shadow-sm max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-3">AI Processing Failed</h2>
          <p className="text-red-700 mb-6">We encountered an error while trying to analyze this document.</p>
          <div className="bg-white p-5 rounded-2xl border border-red-100 text-left font-mono text-sm shadow-sm overflow-x-auto text-red-600">
            {document.processing_error || 'An unknown internal error occurred.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Data */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Extracted Fields */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><FileText size={18} /></div>
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
              <div className="p-6 bg-gray-50/30">
                {resData?.extracted_data?.fields ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-8">
                    {Object.entries(resData.extracted_data.fields).map(([key, value]) => {
                      // format camelCase to Title Case
                      const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                      const capitalizedKey = formattedKey.charAt(0).toUpperCase() + formattedKey.slice(1);
                      
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
                              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                            />
                          ) : (
                            <div className="text-sm font-medium text-gray-900 bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
                              {value !== null && value !== '' ? String(value) : <span className="text-gray-400 italic">Not found</span>}
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

            {/* AI Insights */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 bg-white">
                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                   <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><Eye size={18} /></div>
                   AI Insights
                 </h3>
               </div>
               <div className="p-6 bg-gray-50/30">
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
            
            {/* Validation */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 bg-white">
                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                   {resData?.validation_status === 'valid' ? (
                     <div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><CheckCircle2 size={18} /></div>
                   ) : (
                     <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={18} /></div>
                   )}
                   Validation
                 </h3>
               </div>
               <div className="p-6 bg-gray-50/30">
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
                         <li key={idx} className="flex items-start gap-3 text-sm font-medium text-gray-700">
                           <span className="mt-2 w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0" />
                           {issue}
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}
               </div>
            </div>

            {/* Original File Preview */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
               <div className="p-6 border-b border-gray-100 bg-white flex justify-between items-center shrink-0">
                 <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2.5">
                   <div className="p-1.5 bg-gray-100 text-gray-600 rounded-lg"><File size={18} /></div>
                   Original File
                 </h3>
                 <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors bg-gray-50 border border-gray-200 hover:border-blue-200 shadow-sm" title="Download Original">
                   <DownloadCloud size={18} />
                 </a>
               </div>
               <div className="flex-1 bg-gray-100 flex items-center justify-center p-4 overflow-hidden relative border-t border-gray-200 shadow-inner">
                 {isImage ? (
                   <img src={document.file_url} alt="Original Document" className="max-w-full max-h-full object-contain rounded-lg shadow-sm border border-gray-200 bg-white" />
                 ) : isPdf ? (
                   <iframe src={`${document.file_url}#toolbar=0`} className="w-full h-full rounded-lg bg-white shadow-sm border border-gray-200" title="PDF Preview" />
                 ) : (
                   <div className="text-center text-gray-500 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                     <File size={48} className="mx-auto mb-3 opacity-30" />
                     <p className="text-sm font-medium">Preview not available for this format</p>
                     <a href={document.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-bold text-sm hover:underline mt-2 inline-block">Download instead</a>
                   </div>
                 )}
               </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentDetail;
