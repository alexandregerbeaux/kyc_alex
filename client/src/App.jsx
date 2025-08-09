import React, { useState, useRef } from 'react';
import CaseList from './components/CaseList';
import CaseDetail from './components/CaseDetail';
import WorkflowCanvas from './components/WorkflowCanvas';
import { searchPolicies } from './api';

function App() {
  const [selectedCaseId, setSelectedCaseId] = useState(null);
  const [selectedCaseStatus, setSelectedCaseStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [policyResults, setPolicyResults] = useState([]);
  const [showPolicyResults, setShowPolicyResults] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const caseListRef = useRef(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setPolicyResults([]);
      setShowPolicyResults(false);
      return;
    }

    try {
      setSearchError(null);
      const results = await searchPolicies(searchQuery);
      setPolicyResults(results);
      setShowPolicyResults(true);
    } catch (err) {
      setSearchError('Failed to search policies');
      console.error(err);
    }
  }

  function handleSelectCase(caseId) {
    setSelectedCaseId(caseId);
    // We'll get the status from the CaseDetail component
  }

  function handleCaseUpdate() {
    // Trigger refresh of case list
    if (caseListRef.current) {
      caseListRef.current.loadCases();
    }
  }

  function handleClickOutside() {
    setShowPolicyResults(false);
  }

  return (
    <div id="app" onClick={handleClickOutside}>
      <header className="header">
        <h1>KYC Workflow</h1>
        <div className="search-container" onClick={(e) => e.stopPropagation()}>
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              className="search-input"
              placeholder="Search policies (e.g., 'PEP', 'due diligence', 'risk')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>
          {showPolicyResults && policyResults.length > 0 && (
            <div className="policy-results">
              {policyResults.map(policy => (
                <div key={policy.id} className="policy-item">
                  <div className="policy-title">{policy.title}</div>
                  <div className="policy-clause">{policy.clause}</div>
                </div>
              ))}
            </div>
          )}
          {showPolicyResults && policyResults.length === 0 && searchQuery && (
            <div className="policy-results">
              <div className="policy-item">
                <div className="policy-clause">No policies found matching "{searchQuery}"</div>
              </div>
            </div>
          )}
          {searchError && (
            <div className="policy-results">
              <div className="policy-item">
                <div className="policy-clause" style={{ color: '#ff9999' }}>{searchError}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="main-container">
        <div className="left-panel">
          <CaseList
            ref={caseListRef}
            selectedCaseId={selectedCaseId}
            onSelectCase={handleSelectCase}
          />
        </div>

        <div className="right-column">
          <WorkflowCanvas currentStatus={selectedCaseStatus} />
          <CaseDetail
            selectedCaseId={selectedCaseId}
            onCaseUpdate={handleCaseUpdate}
            onStatusChange={setSelectedCaseStatus}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
