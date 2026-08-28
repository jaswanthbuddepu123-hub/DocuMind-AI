const supabase = require('../services/supabase/supabaseClient');
const { chatWithDocument } = require('../services/gemini/geminiService');

const handleChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { documentId, message } = req.body;

    if (!documentId || !message) {
      return res.status(400).json({ error: 'Missing documentId or message' });
    }

    // Verify ownership and get file_url
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', userId)
      .single();

    if (error || !document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Download file buffer
    const urlParts = document.file_url.split('/documents/');
    if (urlParts.length < 2) return res.status(400).json({ error: 'Invalid file URL format' });
    const storagePath = decodeURIComponent(urlParts[1].split('?')[0]);

    const { data: fileData, error: downloadError } = await supabase.storage.from('documents').download(storagePath);
    if (downloadError || !fileData) return res.status(500).json({ error: 'Failed to access document for chat' });
    
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Save user message
    await supabase.from('chat_messages').insert([{
      document_id: documentId,
      user_id: userId,
      role: 'user',
      content: message
    }]);

    // Fetch recent history
    const { data: historyData } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
      
    // Reverse to chronological order
    const history = (historyData || []).reverse();

    // Call Gemini
    const result = await chatWithDocument(fileBuffer, document.mime_type, message, history);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    const aiMessageContent = JSON.stringify(result.data);

    // Save AI message
    await supabase.from('chat_messages').insert([{
      document_id: documentId,
      user_id: userId,
      role: 'assistant',
      content: aiMessageContent
    }]);

    return res.json(result.data); // Return the structured JSON directly
  } catch (error) {
    console.error('Chat error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { documentId } = req.params;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    // Parse the JSON strings from assistant responses
    const formattedHistory = data.map(msg => {
      let parsedContent = msg.content;
      if (msg.role === 'assistant') {
        try { parsedContent = JSON.parse(msg.content); } catch (e) {}
      }
      return { ...msg, content: parsedContent };
    });

    return res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleChat,
  getChatHistory
};
