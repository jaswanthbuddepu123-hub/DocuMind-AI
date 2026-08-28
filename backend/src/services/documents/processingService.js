const supabase = require('../supabase/supabaseClient');
const geminiService = require('../gemini/geminiService');

const processDocument = async (documentId) => {
  try {
    // 1. Fetch document and set status to processing
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .update({ status: 'processing', processing_error: null })
      .eq('id', documentId)
      .select()
      .single();

    if (fetchError || !document) throw fetchError || new Error('Document not found');

    // 2. Download file from Supabase Storage securely
    const urlParts = document.file_url.split('/documents/');
    if (urlParts.length < 2) throw new Error('Invalid file URL format');
    const storagePath = decodeURIComponent(urlParts[1].split('?')[0]);

    const { data: fileData, error: downloadError } = await supabase.storage.from('documents').download(storagePath);
    if (downloadError || !fileData) throw downloadError || new Error('Failed to download file securely');
    
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 3. Call Gemini
    const result = await geminiService.analyzeDocument(fileBuffer, document.mime_type);

    if (result.success) {
      const data = result.data;
      
      // Insert document_results
      const { error: resultsError } = await supabase
        .from('document_results')
        .insert([{
          document_id: document.id,
          user_id: document.user_id,
          classification: data.documentType,
          confidence: data.confidence,
          extracted_data: { fields: data.fields, lineItems: data.lineItems },
          validation_status: data.validation.isValid ? 'valid' : 'invalid'
        }]);
        
      if (resultsError) throw resultsError;

      // Insert document_insights
      if (data.insights && data.insights.length > 0) {
        const insightsPayload = data.insights.map(insight => ({
          document_id: document.id,
          user_id: document.user_id,
          insight_type: 'general',
          insight_text: insight,
          severity: 'medium'
        }));
        
        const { error: insightsError } = await supabase
          .from('document_insights')
          .insert(insightsPayload);
          
        if (insightsError) throw insightsError;
      }

      // Update document to completed
      await supabase
        .from('documents')
        .update({ 
          status: 'completed', 
          document_type: data.documentType 
        })
        .eq('id', document.id);
        
    } else {
      // Handle AI failure
      await supabase
        .from('documents')
        .update({ status: 'failed', processing_error: result.error })
        .eq('id', document.id);
    }
  } catch (error) {
    console.error('Error in processDocument:', error);
    await supabase
      .from('documents')
      .update({ status: 'failed', processing_error: error.message })
      .eq('id', documentId);
  }
};

module.exports = {
  processDocument
};
