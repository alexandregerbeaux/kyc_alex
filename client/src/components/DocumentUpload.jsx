import React, { useState, useRef } from 'react';

function DocumentUpload({ caseId, documents = [], onDocumentUpload, onDocumentDelete }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState(new Set());
  const [ocrProcessing, setOcrProcessing] = useState(new Set());
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleFiles = async (files) => {
    setUploadError(null);
    
    for (const file of files) {
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setUploadError(`File type not allowed: ${file.name}`);
        continue;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File too large: ${file.name} (max 10MB)`);
        continue;
      }
      
      // Determine document category based on filename
      const category = determineCategory(file.name);
      const docType = determineDocType(file.name);
      
      // Prepare document metadata
      const documentData = {
        name: file.name,
        type: docType,
        size: file.size,
        category: category
      };
      
      // Show uploading state
      setUploadingFiles(prev => new Set(prev).add(file.name));
      setOcrProcessing(prev => new Set(prev).add(file.name));
      
      try {
        // Pass both metadata and actual file to parent
        if (onDocumentUpload) {
          await onDocumentUpload(documentData, file);
        }
      } finally {
        // Remove from uploading state
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(file.name);
          return newSet;
        });
        
        // Remove from OCR processing after a delay to show completion
        setTimeout(() => {
          setOcrProcessing(prev => {
            const newSet = new Set(prev);
            newSet.delete(file.name);
            return newSet;
          });
        }, 1000);
      }
    }
  };

  const determineCategory = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('passport') || lower.includes('license') || lower.includes('id')) {
      return 'Primary ID';
    }
    if (lower.includes('utility') || lower.includes('bill') || lower.includes('address')) {
      return 'Address Verification';
    }
    if (lower.includes('bank') || lower.includes('statement')) {
      return 'Bank Statement';
    }
    if (lower.includes('tax') || lower.includes('return')) {
      return 'Income Proof';
    }
    if (lower.includes('employment') || lower.includes('letter')) {
      return 'Income Proof';
    }
    if (lower.includes('business') || lower.includes('registration')) {
      return 'Business Verification';
    }
    if (lower.includes('property') || lower.includes('deed')) {
      return 'Wealth Verification';
    }
    return 'Other';
  };

  const determineDocType = (filename) => {
    const lower = filename.toLowerCase();
    if (lower.includes('passport') || lower.includes('license') || lower.includes('id')) {
      return 'Identity Document';
    }
    if (lower.includes('utility') || lower.includes('bill')) {
      return 'Address Proof';
    }
    if (lower.includes('bank') || lower.includes('statement')) {
      return 'Financial Document';
    }
    if (lower.includes('tax')) {
      return 'Tax Document';
    }
    if (lower.includes('employment')) {
      return 'Employment Verification';
    }
    if (lower.includes('business')) {
      return 'Business Document';
    }
    if (lower.includes('property') || lower.includes('deed')) {
      return 'Asset Document';
    }
    return 'Other Document';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'verified') return 'badge-success';
    if (statusLower === 'pending review') return 'badge-warning';
    if (statusLower === 'under review') return 'badge-warning';
    if (statusLower === 'rejected') return 'badge-danger';
    return 'badge-secondary';
  };

  const getFileIcon = (category) => {
    switch (category) {
      case 'Primary ID':
        return '🪪';
      case 'Address Verification':
        return '🏠';
      case 'Bank Statement':
        return '🏦';
      case 'Income Proof':
        return '💰';
      case 'Business Verification':
        return '🏢';
      case 'Wealth Verification':
        return '💎';
      default:
        return '📄';
    }
  };

  return (
    <div className="document-upload-section">
      <h2 className="section-title">Document Ingestion</h2>
      
      {/* Drag and Drop Zone */}
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-zone-content">
          <div className="drop-icon">📁</div>
          <p className="drop-text">
            Drag and drop documents here or click to browse
          </p>
          <p className="drop-hint">
            Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {uploadError && (
        <div className="error-message" style={{ marginTop: '1rem' }}>
          {uploadError}
        </div>
      )}

      {/* OCR Processing Indicator */}
      {(uploadingFiles.size > 0 || ocrProcessing.size > 0) && (
        <div className="ocr-processing-container">
          <div className="ocr-processing-header">
            <span className="ocr-icon">🔍</span>
            <span>Processing Documents with OCR...</span>
          </div>
          {Array.from(new Set([...uploadingFiles, ...ocrProcessing])).map(fileName => (
            <div key={fileName} className="ocr-processing-item">
              <span className="file-name">{fileName}</span>
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${!uploadingFiles.has(fileName) ? 'complete' : ''}`}
                  style={{
                    width: uploadingFiles.has(fileName) ? '60%' : '100%'
                  }}
                />
              </div>
              <span className="status-text">
                {uploadingFiles.has(fileName) ? 'Uploading & Processing...' : 'OCR Complete ✓'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Document Categories Guide */}
      <div className="document-categories">
        <h3>Required Documents by Category:</h3>
        <div className="category-grid">
          <div className="category-item">
            <span className="category-icon">🪪</span>
            <span className="category-name">Identity</span>
            <span className="category-desc">Passport, Driver's License, National ID</span>
          </div>
          <div className="category-item">
            <span className="category-icon">🏠</span>
            <span className="category-name">Address</span>
            <span className="category-desc">Utility Bill, Bank Statement</span>
          </div>
          <div className="category-item">
            <span className="category-icon">💰</span>
            <span className="category-name">Income</span>
            <span className="category-desc">Tax Returns, Employment Letter</span>
          </div>
          <div className="category-item">
            <span className="category-icon">🏦</span>
            <span className="category-name">Financial</span>
            <span className="category-desc">Bank Statements (3 months)</span>
          </div>
        </div>
      </div>

      {/* Uploaded Documents List */}
      {documents && documents.length > 0 && (
        <div className="uploaded-documents">
          <h3>Uploaded Documents ({documents.length})</h3>
          <div className="documents-list">
            {documents.map((doc) => (
              <div key={doc.id} className="document-item">
                <div className="document-icon">
                  {getFileIcon(doc.category)}
                </div>
                <div className="document-info">
                  <div className="document-name">{doc.name}</div>
                  <div className="document-meta">
                    <span className="document-type">{doc.type}</span>
                    <span className="document-size">{formatFileSize(doc.size)}</span>
                    <span className={`badge ${getStatusBadgeClass(doc.status)}`}>
                      {doc.status}
                    </span>
                    {doc.ocr_processed && (
                      <span className="badge badge-info" title="OCR Processed">
                        OCR ✓
                      </span>
                    )}
                  </div>
                  
                  {/* OCR Metadata Display */}
                  {doc.ocr_metadata && (
                    <div className="ocr-metadata">
                      <div className="metadata-title">Extracted Information:</div>
                      <div className="metadata-grid">
                        {doc.ocr_metadata.Name && (
                          <div className="metadata-item">
                            <span className="metadata-label">Name:</span>
                            <span className="metadata-value">{doc.ocr_metadata.Name}</span>
                          </div>
                        )}
                        {doc.ocr_metadata.Occupation && (
                          <div className="metadata-item">
                            <span className="metadata-label">Occupation:</span>
                            <span className="metadata-value">{doc.ocr_metadata.Occupation}</span>
                          </div>
                        )}
                        {doc.ocr_metadata.FIN && (
                          <div className="metadata-item">
                            <span className="metadata-label">FIN:</span>
                            <span className="metadata-value">{doc.ocr_metadata.FIN}</span>
                          </div>
                        )}
                        {doc.ocr_metadata.date_of_issue && (
                          <div className="metadata-item">
                            <span className="metadata-label">Issue Date:</span>
                            <span className="metadata-value">{doc.ocr_metadata.date_of_issue}</span>
                          </div>
                        )}
                        {doc.ocr_metadata.date_of_expiry && (
                          <div className="metadata-item">
                            <span className="metadata-label">Expiry Date:</span>
                            <span className="metadata-value">{doc.ocr_metadata.date_of_expiry}</span>
                          </div>
                        )}
                        {doc.ocr_metadata.confidence > 0 && (
                          <div className="metadata-item">
                            <span className="metadata-label">Confidence:</span>
                            <span className="metadata-value">
                              {(doc.ocr_metadata.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {doc.status === 'Pending Review' && onDocumentDelete && (
                  <button
                    className="document-delete"
                    onClick={() => onDocumentDelete(doc.id)}
                    title="Delete document"
                  >
                    ❌
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Status Summary */}
      {documents && documents.length > 0 && (
        <div className="document-summary">
          <div className="summary-item">
            <span className="summary-label">Total Documents:</span>
            <span className="summary-value">{documents.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Verified:</span>
            <span className="summary-value text-success">
              {documents.filter(d => d.status === 'Verified').length}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Pending Review:</span>
            <span className="summary-value text-warning">
              {documents.filter(d => d.status === 'Pending Review').length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentUpload;
