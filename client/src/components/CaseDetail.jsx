import React, { useState, useEffect } from 'react';
import { fetchCase, postDecision, reviewBankStatement, reviewOccupationForm, uploadDocument, deleteDocument } from '../api';
import DocumentUpload from './DocumentUpload';

// Helper function to format check result
function getCheckResultClass(result) {
  const resultLower = result?.toLowerCase() || '';
  if (resultLower === 'pass') return 'check-result-pass';
  if (resultLower === 'pending') return 'check-result-pending';
  if (resultLower === 'review') return 'check-result-review';
  if (resultLower === 'clear') return 'check-result-clear';
  if (resultLower === 'normal') return 'check-result-normal';
  return '';
}

function CaseDetail({ selectedCaseId, onCaseUpdate, onStatusChange }) {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bankReviewNotes, setBankReviewNotes] = useState({});
  const [occupationReviewNote, setOccupationReviewNote] = useState('');

  useEffect(() => {
    if (selectedCaseId) {
      loadCase(selectedCaseId);
    } else {
      setCaseData(null);
      if (onStatusChange) {
        onStatusChange(null);
      }
    }
  }, [selectedCaseId]);

  async function loadCase(id) {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCase(id);
      setCaseData(data);
      setDecisionNote('');
      setBankReviewNotes({});
      setOccupationReviewNote('');
      if (onStatusChange) {
        onStatusChange(data.status);
      }
    } catch (err) {
      setError('Failed to load case details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDocumentUpload(documentData, file) {
    if (!caseData) return;

    try {
      // Pass both metadata and file to the API
      const result = await uploadDocument(caseData.id, documentData, file);
      
      // Update local state
      setCaseData(prev => ({
        ...prev,
        documents: [...(prev.documents || []), result.document],
        status: result.caseStatus || prev.status
      }));
      
      // Update status in parent if changed
      if (result.caseStatus && onStatusChange) {
        onStatusChange(result.caseStatus);
      }
      
      // Notify parent to refresh
      if (onCaseUpdate) {
        onCaseUpdate();
      }
    } catch (err) {
      setError('Failed to upload document');
      console.error(err);
    }
  }

  async function handleDocumentDelete(documentId) {
    if (!caseData) return;

    try {
      await deleteDocument(caseData.id, documentId);
      
      // Update local state
      setCaseData(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== documentId)
      }));
      
      // Notify parent to refresh
      if (onCaseUpdate) {
        onCaseUpdate();
      }
    } catch (err) {
      setError('Failed to delete document');
      console.error(err);
    }
  }

  async function handleDecision(decision) {
    if (!caseData) return;

    try {
      setSubmitting(true);
      setError(null);
      const result = await postDecision(caseData.id, {
        decision,
        note: decisionNote
      });
      
      // Update local state optimistically
      setCaseData(prev => ({
        ...prev,
        status: result.status,
        decisionNote: result.note
      }));
      
      setDecisionNote('');
      
      // Update status in parent
      if (onStatusChange) {
        onStatusChange(result.status);
      }
      
      // Notify parent to refresh case list
      if (onCaseUpdate) {
        onCaseUpdate();
      }
    } catch (err) {
      setError('Failed to submit decision');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleBankStatementReview(statementId, reviewStatus) {
    if (!caseData) return;

    try {
      setSubmitting(true);
      setError(null);
      const result = await reviewBankStatement(caseData.id, statementId, {
        reviewStatus,
        reviewedBy: 'Current User',
        notes: bankReviewNotes[statementId] || ''
      });
      
      // Update local state
      setCaseData(prev => ({
        ...prev,
        bankStatements: prev.bankStatements.map(stmt => 
          stmt.id === statementId 
            ? { ...stmt, reviewStatus, reviewedBy: result.reviewedBy, reviewDate: new Date().toISOString() }
            : stmt
        )
      }));
      
      // Clear notes for this statement
      setBankReviewNotes(prev => ({ ...prev, [statementId]: '' }));
      
      // Notify parent to refresh
      if (onCaseUpdate) {
        onCaseUpdate();
      }
    } catch (err) {
      setError('Failed to review bank statement');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleOccupationFormReview(reviewStatus) {
    if (!caseData || !caseData.occupationForm) return;

    try {
      setSubmitting(true);
      setError(null);
      const result = await reviewOccupationForm(caseData.id, {
        reviewStatus,
        reviewedBy: 'Current User'
      });
      
      // Update local state
      setCaseData(prev => ({
        ...prev,
        occupationForm: {
          ...prev.occupationForm,
          reviewStatus,
          reviewedBy: result.reviewedBy,
          reviewDate: new Date().toISOString()
        }
      }));
      
      setOccupationReviewNote('');
      
      // Notify parent to refresh
      if (onCaseUpdate) {
        onCaseUpdate();
      }
    } catch (err) {
      setError('Failed to review occupation form');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  function getReviewStatusClass(status) {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'approved') return 'badge-success';
    if (statusLower === 'rejected') return 'badge-danger';
    if (statusLower === 'under review') return 'badge-warning';
    if (statusLower === 'pending review') return 'badge-secondary';
    return 'badge-secondary';
  }

  if (!selectedCaseId) {
    return (
      <div className="case-detail">
        <div className="case-detail-placeholder">
          Select a case to view details
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="case-detail">
        <div className="loading">Loading case details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="case-detail">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!caseData) {
    return null;
  }

  const canMakeDecision = !['Approved', 'Rejected'].includes(caseData.status);

  return (
    <div className="case-detail">
      <div className="section">
        <h2 className="section-title">Customer Information</h2>
        <div className="kv">
          <div className="kv-key">Name</div>
          <div className="kv-value">{caseData.customer.name}</div>
          <div className="kv-key">Date of Birth</div>
          <div className="kv-value">{caseData.customer.dob}</div>
          <div className="kv-key">Address</div>
          <div className="kv-value">{caseData.customer.address}</div>
          <div className="kv-key">Tier</div>
          <div className="kv-value">{caseData.customer.tier}</div>
          <div className="kv-key">Status</div>
          <div className="kv-value">
            <span className={`badge badge-${caseData.status.toLowerCase()}`}>
              {caseData.status}
            </span>
          </div>
          <div className="kv-key">Risk Score</div>
          <div className="kv-value">{(caseData.riskScore * 100).toFixed(0)}%</div>
        </div>
      </div>

      {/* Document Upload Section - Show for cases in Ingestion or early stages */}
      {['Ingestion', 'Intake', 'Identity'].includes(caseData.status) && (
        <div className="section">
          <DocumentUpload
            caseId={caseData.id}
            documents={caseData.documents || []}
            onDocumentUpload={handleDocumentUpload}
            onDocumentDelete={handleDocumentDelete}
          />
        </div>
      )}

      {/* Show uploaded documents for other statuses */}
      {!['Ingestion', 'Intake', 'Identity'].includes(caseData.status) && caseData.documents && caseData.documents.length > 0 && (
        <div className="section">
          <h2 className="section-title">Uploaded Documents</h2>
          <div className="documents-grid">
            {caseData.documents.map((doc) => (
              <div key={doc.id} className="document-card">
                <div className="document-card-icon">
                  {doc.category === 'Primary ID' ? '🪪' :
                   doc.category === 'Address Verification' ? '🏠' :
                   doc.category === 'Bank Statement' ? '🏦' :
                   doc.category === 'Income Proof' ? '💰' :
                   doc.category === 'Business Verification' ? '🏢' :
                   doc.category === 'Wealth Verification' ? '💎' : '📄'}
                </div>
                <div className="document-card-name">{doc.name}</div>
                <div className="document-card-type">{doc.type}</div>
                <span className={`badge ${
                  doc.status === 'Verified' ? 'badge-success' :
                  doc.status === 'Pending Review' ? 'badge-warning' :
                  doc.status === 'Under Review' ? 'badge-warning' :
                  doc.status === 'Rejected' ? 'badge-danger' : 'badge-secondary'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {caseData.checks && caseData.checks.length > 0 && (
        <div className="section">
          <h2 className="section-title">Verification Checks</h2>
          <table className="checks-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Result</th>
                <th>Confidence</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {caseData.checks.map((check, index) => (
                <tr key={index}>
                  <td>{check.type}</td>
                  <td>
                    <span className={getCheckResultClass(check.result)}>
                      {check.result}
                    </span>
                  </td>
                  <td>
                    {check.confidence ? 
                      `${(check.confidence * 100).toFixed(0)}%` : 
                      '-'
                    }
                  </td>
                  <td>{check.details || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canMakeDecision && (
        <div className="section">
          <h2 className="section-title">Decision</h2>
          <div className="decision-form">
            <div className="form-group">
              <label className="form-label" htmlFor="decision-note">
                Decision Note (Optional)
              </label>
              <textarea
                id="decision-note"
                className="form-textarea"
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="Add any relevant notes about this decision..."
                disabled={submitting}
              />
            </div>
            <div className="form-actions">
              <button
                className="btn btn-success"
                onClick={() => handleDecision('Approve')}
                disabled={submitting}
              >
                Approve
              </button>
              <button
                className="btn btn-danger"
                onClick={() => handleDecision('Reject')}
                disabled={submitting}
              >
                Reject
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleDecision('Pending')}
                disabled={submitting}
              >
                Mark as Pending
              </button>
            </div>
          </div>
        </div>
      )}

      {caseData.decisionNote && (
        <div className="section">
          <h2 className="section-title">Decision Note</h2>
          <p>{caseData.decisionNote}</p>
        </div>
      )}

      {caseData.bankStatements && caseData.bankStatements.length > 0 && (
        <div className="section">
          <h2 className="section-title">Bank Statements Review</h2>
          {caseData.bankStatements.map((statement) => (
            <div key={statement.id} className="bank-statement-card">
              <div className="statement-header">
                <h3>{statement.bank} - {statement.accountType}</h3>
                <span className={`badge ${getReviewStatusClass(statement.reviewStatus)}`}>
                  {statement.reviewStatus}
                </span>
              </div>
              <div className="statement-details">
                <div className="kv">
                  <div className="kv-key">Period</div>
                  <div className="kv-value">{statement.period}</div>
                  <div className="kv-key">Average Balance</div>
                  <div className="kv-value">{formatCurrency(statement.averageBalance)}</div>
                  <div className="kv-key">Monthly Income</div>
                  <div className="kv-value">{formatCurrency(statement.monthlyIncome)}</div>
                  <div className="kv-key">Flagged Transactions</div>
                  <div className="kv-value">
                    <span className={statement.flaggedTransactions > 0 ? 'text-warning' : 'text-success'}>
                      {statement.flaggedTransactions}
                    </span>
                  </div>
                  {statement.reviewedBy && (
                    <>
                      <div className="kv-key">Reviewed By</div>
                      <div className="kv-value">{statement.reviewedBy}</div>
                    </>
                  )}
                  {statement.notes && (
                    <>
                      <div className="kv-key">Notes</div>
                      <div className="kv-value">{statement.notes}</div>
                    </>
                  )}
                </div>
              </div>
              {statement.reviewStatus === 'Pending Review' && (
                <div className="review-actions">
                  <div className="form-group">
                    <label className="form-label">Review Notes</label>
                    <textarea
                      className="form-textarea"
                      value={bankReviewNotes[statement.id] || ''}
                      onChange={(e) => setBankReviewNotes(prev => ({ ...prev, [statement.id]: e.target.value }))}
                      placeholder="Add review notes..."
                      disabled={submitting}
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleBankStatementReview(statement.id, 'Approved')}
                      disabled={submitting}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleBankStatementReview(statement.id, 'Under Review')}
                      disabled={submitting}
                    >
                      Mark Under Review
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleBankStatementReview(statement.id, 'Rejected')}
                      disabled={submitting}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {caseData.customer.isWealthCustomer && caseData.occupationForm && (
        <div className="section">
          <h2 className="section-title">Wealth Customer - Occupation Form</h2>
          <div className="occupation-form-card">
            <div className="form-header">
              <h3>Employment & Wealth Information</h3>
              <span className={`badge ${getReviewStatusClass(caseData.occupationForm.reviewStatus)}`}>
                {caseData.occupationForm.reviewStatus}
              </span>
            </div>
            <div className="form-details">
              <div className="kv">
                <div className="kv-key">Occupation</div>
                <div className="kv-value">{caseData.occupationForm.occupation}</div>
                <div className="kv-key">Employer</div>
                <div className="kv-value">{caseData.occupationForm.employer}</div>
                <div className="kv-key">Employment Status</div>
                <div className="kv-value">{caseData.occupationForm.employmentStatus}</div>
                <div className="kv-key">Years Employed</div>
                <div className="kv-value">{caseData.occupationForm.yearsEmployed} years</div>
                <div className="kv-key">Annual Income</div>
                <div className="kv-value">{formatCurrency(caseData.occupationForm.annualIncome)}</div>
                <div className="kv-key">Net Worth</div>
                <div className="kv-value">{formatCurrency(caseData.occupationForm.netWorth)}</div>
                <div className="kv-key">Source of Wealth</div>
                <div className="kv-value">{caseData.occupationForm.sourceOfWealth}</div>
                <div className="kv-key">Expected Account Activity</div>
                <div className="kv-value">{caseData.occupationForm.expectedAccountActivity}</div>
                <div className="kv-key">Political Exposure</div>
                <div className="kv-value">
                  <span className={caseData.occupationForm.politicalExposure ? 'text-danger' : 'text-success'}>
                    {caseData.occupationForm.politicalExposure ? 'Yes' : 'No'}
                  </span>
                </div>
                {caseData.occupationForm.verificationDocuments && caseData.occupationForm.verificationDocuments.length > 0 && (
                  <>
                    <div className="kv-key">Verification Documents</div>
                    <div className="kv-value">
                      <ul className="doc-list">
                        {caseData.occupationForm.verificationDocuments.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
                {caseData.occupationForm.reviewedBy && (
                  <>
                    <div className="kv-key">Reviewed By</div>
                    <div className="kv-value">{caseData.occupationForm.reviewedBy}</div>
                  </>
                )}
              </div>
            </div>
            {caseData.occupationForm.reviewStatus === 'Pending Review' && (
              <div className="review-actions">
                <div className="form-actions">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleOccupationFormReview('Approved')}
                    disabled={submitting}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleOccupationFormReview('Additional Info Required')}
                    disabled={submitting}
                  >
                    Request More Info
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleOccupationFormReview('Rejected')}
                    disabled={submitting}
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CaseDetail;
