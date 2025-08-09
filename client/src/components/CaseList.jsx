import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { fetchCases } from '../api';

// Helper function to get risk level from score
function getRiskLevel(score) {
  if (score <= 0.3) return 'low';
  if (score <= 0.6) return 'medium';
  return 'high';
}

// Helper function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

const CaseList = forwardRef(({ selectedCaseId, onSelectCase }, ref) => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCases();
  }, []);

  async function loadCases() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCases();
      setCases(data);
    } catch (err) {
      setError('Failed to load cases');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Expose loadCases method to parent component
  useImperativeHandle(ref, () => ({
    loadCases
  }));

  if (loading) {
    return <div className="loading">Loading cases...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="case-list">
      <div className="panel-title">Cases</div>
      {cases.map(caseItem => (
        <div
          key={caseItem.id}
          className={`list-item ${selectedCaseId === caseItem.id ? 'selected' : ''}`}
          onClick={() => onSelectCase(caseItem.id)}
        >
          <div className="list-item-header">
            <span className="list-item-name">
              {caseItem.customer.name}
              {caseItem.customer.isWealthCustomer && (
                <span style={{ marginLeft: '0.5rem', color: '#ffd700' }} title="Wealth Customer">💎</span>
              )}
            </span>
            <span className={`badge badge-${caseItem.status.toLowerCase()}`}>
              {caseItem.status}
            </span>
          </div>
          <div className="list-item-meta">
            <span>ID: {caseItem.id}</span>
            <span>Tier: {caseItem.customer.tier}</span>
            <span className={`badge badge-risk-${getRiskLevel(caseItem.riskScore)}`}>
              Risk: {(caseItem.riskScore * 100).toFixed(0)}%
            </span>
          </div>
          <div className="list-item-meta">
            <span>Created: {formatDate(caseItem.createdAt)}</span>
            {caseItem.bankStatements && caseItem.bankStatements.length > 0 && (
              <span style={{ color: '#4a9eff' }}>📊 {caseItem.bankStatements.length} statements</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
});

export default CaseList;
