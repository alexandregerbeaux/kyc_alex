import React, { useState, useEffect } from 'react';
import { fetchWorkflow } from '../api';

// Mapping from case status to workflow node
const STATUS_TO_NODE_MAP = {
  'Intake': 'intake',
  'Identity': 'idv',
  'Screening': 'screen',
  'Decision': 'decision',
  'Monitoring': 'monitor',
  'Approved': 'monitor',
  'Rejected': 'decision'
};

function WorkflowCanvas({ currentStatus }) {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadWorkflow();
  }, []);

  async function loadWorkflow() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWorkflow();
      setWorkflow(data);
    } catch (err) {
      setError('Failed to load workflow');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="workflow">
        <div className="loading">Loading workflow...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workflow">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!workflow) {
    return null;
  }

  // Get the active node based on current status
  const activeNodeId = currentStatus ? STATUS_TO_NODE_MAP[currentStatus] : null;

  return (
    <div className="workflow">
      {workflow.nodes.map((node, index) => (
        <React.Fragment key={node.id}>
          <div className={`node ${activeNodeId === node.id ? 'active' : ''}`}>
            {node.label}
          </div>
          {index < workflow.nodes.length - 1 && (
            <span className="workflow-arrow">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default WorkflowCanvas;
