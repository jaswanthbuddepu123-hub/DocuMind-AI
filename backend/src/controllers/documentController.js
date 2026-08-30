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

    try {
      // Synchronously process document
      await processingService.processDocument(document.id);
    } catch (processError) {
      console.error('Processing failed during upload:', processError);
      // We don't throw here; we let it fetch the final document which will be marked 'failed'
    }

    // Fetch final document row
    const { data: finalDocument } = await supabase
      .from('documents')
      .select('*')
      .eq('id', document.id)
      .single();

    return res.status(201).json({ message: 'Document processed successfully', document: finalDocument || document });
  } catch (error) {
    console.error('Error uploading document:', error);
    
    if (error.message && (error.message.includes('not allowed') || error.message.includes('Invalid file content') || error.message.includes('Mismatched'))) {
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

    // 1. Fetch document to get file_url
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError || !document) {
      if (fetchError && fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Document not found' });
      }
      throw fetchError;
    }

    // 2. Extract storage path and delete from Supabase Storage
    if (document.file_url) {
      const urlParts = document.file_url.split('/documents/');
      if (urlParts.length >= 2) {
        const storagePath = decodeURIComponent(urlParts[1].split('?')[0]);
        const { error: storageError } = await supabase.storage
          .from('documents')
          .remove([storagePath]);
        
        if (storageError) {
          console.error('Failed to delete file from storage:', storageError);
          // We can proceed to delete the DB record even if storage deletion fails, 
          // or we can halt. Usually, it's better to log it and continue cleaning the DB.
        }
      }
    }

    // 3. Delete child records to prevent foreign key issues (if cascade isn't configured)
    await supabase.from('document_results').delete().eq('document_id', id);
    await supabase.from('document_insights').delete().eq('document_id', id);
    await supabase.from('chat_messages').delete().eq('document_id', id);

    // 4. Delete parent document record
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
       throw deleteError;
    }

    return res.status(200).json({ message: 'Document deleted successfully' });
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

const getGraphStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get documents from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Include today + 6 previous days = 7 days
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('documents')
      .select('created_at, status')
      .eq('user_id', userId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .neq('status', 'archived'); // Ignore archived documents

    if (error) throw error;

    // Initialize an array with the last 7 days
    const chartData = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const name = d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., 'Mon'
      const fullDate = d.toISOString().split('T')[0];
      
      chartData.push({
        name,
        fullDate,
        processed: 0,
        failed: 0,
      });
    }

    // Populate data
    data.forEach(doc => {
      const docDate = new Date(doc.created_at).toISOString().split('T')[0];
      const targetDay = chartData.find(d => d.fullDate === docDate);
      if (targetDay) {
        if (doc.status === 'completed') {
          targetDay.processed += 1;
        } else if (doc.status === 'failed') {
          targetDay.failed += 1;
        }
      }
    });

    return res.status(200).json(chartData);
  } catch (error) {
    console.error('Error fetching graph stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const downloadDocument = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const { data: document, error } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const urlParts = document.file_url.split('/documents/');
    if (urlParts.length < 2) return res.status(400).json({ error: 'Invalid file URL' });
    const storagePath = decodeURIComponent(urlParts[1].split('?')[0]);

    const { data: signedUrl, error: signError } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 60 * 5); // 5 minutes

    if (signError || !signedUrl) {
      return res.status(500).json({ error: 'Failed to generate secure URL' });
    }

    return res.json({ url: signedUrl.signedUrl });
  } catch (error) {
    console.error('Error downloading document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const retryDocument = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Verify ownership and that it is failed
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (document.status !== 'failed') {
      return res.status(400).json({ error: 'Only failed documents can be retried' });
    }

    // Process asynchronously, but return success immediately to start the retry on frontend
    processingService.processDocument(id).catch(err => console.error('Retry processing error:', err));

    return res.status(202).json({ message: 'Document retry initiated' });
  } catch (error) {
    console.error('Error retrying document:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const transformDocument = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { instruction } = req.body;

    if (!instruction) return res.status(400).json({ error: 'Missing instruction' });

    // Verify ownership and get file_url
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !document) return res.status(404).json({ error: 'Document not found' });

    // Download file buffer
    const urlParts = document.file_url.split('/documents/');
    if (urlParts.length < 2) return res.status(400).json({ error: 'Invalid file URL format' });
    const storagePath = decodeURIComponent(urlParts[1].split('?')[0]);

    const { data: fileData, error: downloadError } = await supabase.storage.from('documents').download(storagePath);
    if (downloadError || !fileData) return res.status(500).json({ error: 'Failed to access document for transformation' });
    
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { transformDocumentContent } = require('../services/gemini/geminiService');
    const { applyTransformActions } = require('../services/documents/pdfTransformService');

    const hasImage = !!req.file;

    // 1. Get Transformation JSON actions from Gemini
    const transformResult = await transformDocumentContent(fileBuffer, document.mime_type, instruction, hasImage);
    
    if (!transformResult.success) {
      if (transformResult.error && transformResult.error.includes('limit has been reached')) {
         return res.status(429).json({ error: transformResult.error });
      }
      return res.status(500).json({ error: transformResult.error || 'Failed to transform document' });
    }

    // 2. Apply transformations using pdf-lib on the ORIGINAL PDF buffer
    let imageBuffer = null;
    if (req.file) {
      const fs = require('fs');
      imageBuffer = fs.readFileSync(req.file.path);
      // Clean up the uploaded image from temp storage
      fs.unlinkSync(req.file.path);
    }

    const transformedBuffer = await applyTransformActions(fileBuffer, transformResult.data.actions, imageBuffer);

    // 3. Create a new file in storage
    const filename = `transformed-${Date.now()}.pdf`;
    const newStoragePath = `${userId}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(newStoragePath, transformedBuffer, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) return res.status(500).json({ error: 'Failed to save transformed document' });

    // 4. Create a new document record
    const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(newStoragePath);
    
    const { data: newDocument, error: insertError } = await supabase.from('documents').insert({
      user_id: userId,
      original_filename: `Transformed_${document.original_filename.replace('.pdf', '')}.pdf`,
      file_url: publicUrlData.publicUrl,
      file_size: transformedBuffer.length,
      mime_type: 'application/pdf',
      status: 'processing',
      document_type: 'other'
    }).select().single();

    if (insertError) return res.status(500).json({ error: 'Failed to save transformed metadata' });

    const processingService = require('../services/documents/processingService');
    try {
      // Synchronously process document
      await processingService.processDocument(newDocument.id);
    } catch (processError) {
      console.error('Processing failed during transformation:', processError);
    }

    return res.status(201).json({ message: 'Transformation complete', document: newDocument });
  } catch (error) {
    console.error('Transform error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  uploadHandler,
  listDocuments,
  getDocumentById,
  updateDocumentResult,
  deleteDocument,
  getDocumentStats,
  getGraphStats,
  downloadDocument,
  retryDocument,
  transformDocument
};
