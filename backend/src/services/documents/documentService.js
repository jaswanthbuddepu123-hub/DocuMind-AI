const fs = require('fs');
const crypto = require('crypto');
const supabase = require('../supabase/supabaseClient');
const { validateFile } = require('../../utils/fileSecurity');

const uploadDocument = async (userId, file) => {
  try {
    // 1. Validate file securely
    const sanitizedFilename = validateFile(file);
    
    // 2. Upload to Supabase Storage bucket 'documents'
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    
    if (!buckets.some(b => b.name === 'documents')) {
      const { error: createError } = await supabase.storage.createBucket('documents', { public: false });
      if (createError) throw createError;
    }

    const uuid = crypto.randomUUID();
    const storagePath = `${userId}/${uuid}-${sanitizedFilename}`;
    
    const fileBuffer = fs.readFileSync(file.path);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(storagePath, fileBuffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(storagePath);
    const fileUrl = urlData.publicUrl;

    // 3. Insert into documents table
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert([{
        user_id: userId,
        original_filename: sanitizedFilename,
        document_type: null,
        mime_type: file.mimetype,
        file_size: file.size,
        file_url: fileUrl,
        status: 'uploaded'
      }])
      .select()
      .single();

    if (dbError) throw dbError;

    // 4. Delete temp file
    fs.unlinkSync(file.path);

    return document;
  } catch (error) {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

module.exports = {
  uploadDocument
};
