const documentService = require('../services/documents/documentService');
const processingService = require('../services/documents/processingService');
const supabase = require('../services/supabase/supabaseClient');
const { extractionSchema } = require('../schemas/extractionSchema');

const uploadHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const userId = req.user.userId;
    const document = await documentService.uploadDocument(userId, req.file);

    // Synchronously process document
    await processingService.processDocument(document.id);

    // Fetch final document row
    const { data: finalDocument } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document.id)
      .single();

    return res.status(201).json({ message: 'Document processed successfully', document: finalDocument || document });
  } catch (error) {
    console.error('Error uploading document:', error);
    
    if (error.message.includes('not allowed') || error.message.includes('Invalid file content') || error.message.includes('Mismatched')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const listDocuments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { search, status, type, sort = 'desc', page = 1 } = req.query;
    const limit = 20;
    const offset = (Math.max(1, parseInt(page)) - 1) * limit;

    let query = supabase
      .from('documents')
      .select('*, document_results(classification, confidence, validation_status)', { count: 'exact' })
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    } else {
      query = query.neq('status', 'archived');
    }

    if (type) {
      query = query.eq('document_type', type);
    }

    if (search) {
      query = query.ilike('original_filename', `%${search}%`);
    }

    if (sort === 'asc') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return res.status(200).json({ data, count, page: parseInt(page), limit });
  } catch (error) {
    console.error('Error listing documents:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('documents')
      .select('*, document_results(*), document_insights(*)')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Document not found' });
      }
      throw error;
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const updateDocumentResult = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const updates = req.body; 

    const { data: doc, error: docError } = await supabase
      .from('documents')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (docError || !doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { data: currentResult, error: resultError } = await supabase
      .from('document_results')
      .select('*')
      .eq('document_id', id)
      .single();

    if (resultError || !currentResult) {
      return res.status(404).json({ error: 'Document results not found' });
    }

    const newExtractedData = {
      ...currentResult.extracted_data,
      ...updates, 
    };

    if (updates.fields) {
       newExtractedData.fields = { ...currentResult.extracted_data.fields, ...updates.fields };
    }
    if (updates.lineItems) {
       newExtractedData.lineItems = updates.lineItems;
    }

    try {
      if (newExtractedData.fields) {
        extractionSchema.shape.fields.parse(newExtractedData.fields);
      }
      if (newExtractedData.lineItems) {
        extractionSchema.shape.lineItems.parse(newExtractedData.lineItems);
      }
    } catch (validationError) {
      return res.status(400).json({ error: 'Validation failed', details: validationError.errors });
    }

    const { data: updatedResult, error: updateError } = await supabase
      .from('document_results')
      .update({ 
        extracted_data: newExtractedData,
        updated_at: new Date().toISOString()
      })
      .eq('document_id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return res.status(200).json(updatedResult);
  } catch (error) {
    console.error('Error updating document result:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('documents')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
       if (error.code === 'PGRST116') {
         return res.status(404).json({ error: 'Document not found' });
       }
       throw error;
    }

    return res.status(200).json({ message: 'Document archived successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getDocumentStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data, error } = await supabase
      .from('documents')
      .select('status')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: data.filter(d => d.status !== 'archived').length,
      completed: data.filter(d => d.status === 'completed').length,
      processing: data.filter(d => d.status === 'processing').length,
      failed: data.filter(d => d.status === 'failed').length,
    };

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  uploadHandler,
  listDocuments,
  getDocumentById,
  updateDocumentResult,
  deleteDocument,
  getDocumentStats
};
