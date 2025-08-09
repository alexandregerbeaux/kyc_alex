import React, { useState, useEffect } from 'react';
import { fetchCase, postDecision } from '../api';

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
    </div>
  );
}

export default CaseDetail;
