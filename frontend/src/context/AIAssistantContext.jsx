import { createContext, useState, useContext } from 'react';

const AIAssistantContext = createContext(null);

export const AIAssistantProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState('');

  const openWithDocument = (docId) => {
    setSelectedDocumentId(docId);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  return (
    <AIAssistantContext.Provider value={{ isOpen, setIsOpen, selectedDocumentId, setSelectedDocumentId, openWithDocument, close }}>
      {children}
    </AIAssistantContext.Provider>
  );
};

export const useAIAssistant = () => useContext(AIAssistantContext);
