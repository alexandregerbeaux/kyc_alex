import React, { useState, useEffect } from 'react';

function DocumentPreview({ isOpen, onClose, caseId, document }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && document) {
      loadPreview();
    }
    return () => {
      // Cleanup blob URL when component unmounts or modal closes
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, document]);

  const loadPreview = async () => {
    if (!document || !caseId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const API = import.meta.env.VITE_API_BASE || "http://localhost:5001";
      const response = await fetch(`${API}/api/cases/${caseId}/documents/${document.id}/preview`);
      
      if (!response.ok) {
        throw new Error('Failed to load document preview');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Error loading preview:', err);
      setError('Failed to load document preview');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isImage = document?.name?.match(/\.(jpg|jpeg|png|gif)$/i);
  const isPDF = document?.name?.match(/\.pdf$/i);

  return (
    <div className="preview-modal-overlay" onClick={onClose}>
      <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <div className="preview-title">
            <span className="preview-icon">👁️</span>
            <span>{document?.name || 'Document Preview'}</span>
          </div>
          <button className="preview-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="preview-content">
          {loading && (
            <div className="preview-loading">
              <div className="loading-spinner"></div>
              <p>Loading document...</p>
            </div>
          )}
          
          {error && (
            <div className="preview-error">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
            </div>
          )}
          
          {!loading && !error && previewUrl && (
            <>
              {isImage && (
                <img 
                  src={previewUrl} 
                  alt={document.name}
                  className="preview-image"
                />
              )}
              
              {isPDF && (
                <iframe
                  src={previewUrl}
                  className="preview-pdf"
                  title={document.name}
                />
              )}
              
              {!isImage && !isPDF && (
                <div className="preview-unsupported">
                  <span className="unsupported-icon">📄</span>
                  <p>Preview not available for this file type</p>
                  <a 
                    href={previewUrl} 
                    download={document.name}
                    className="btn btn-primary"
                  >
                    Download File
                  </a>
                </div>
              )}
            </>
          )}
        </div>
        
        {document && (
          <div className="preview-info">
            <div className="info-item">
              <span className="info-label">Type:</span>
              <span className="info-value">{document.type}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Category:</span>
              <span className="info-value">{document.category}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className={`badge ${
                document.status === 'Verified' ? 'badge-success' :
                document.status === 'Pending Review' ? 'badge-warning' :
                document.status === 'Rejected' ? 'badge-danger' : 'badge-secondary'
              }`}>
                {document.status}
              </span>
            </div>
            {document.classification && (
              <div className="info-item">
                <span className="info-label">AI Classification:</span>
                <span className="info-value">
                  {document.classification.document_type} 
                  ({(document.classification.confidence * 100).toFixed(0)}%)
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentPreview;
