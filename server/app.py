"""Flask API for KYC workflow prototype"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from mock_data import CASES, POLICIES, WORKFLOW
import copy

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for the Vite dev server
CORS(app, origins=["http://localhost:5173"])

# In-memory storage (copy to avoid modifying original mock data)
cases_store = copy.deepcopy(CASES)


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"ok": True})


@app.route('/api/workflow', methods=['GET'])
def get_workflow():
    """Get workflow definition"""
    return jsonify(WORKFLOW)


@app.route('/api/cases', methods=['GET'])
def get_cases():
    """Get all cases"""
    return jsonify(cases_store)


@app.route('/api/cases/<case_id>', methods=['GET'])
def get_case(case_id):
    """Get a specific case by ID"""
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if case:
        return jsonify(case)
    return jsonify({"error": "not_found"}), 404


@app.route('/api/policies/search', methods=['GET'])
def search_policies():
    """Search policies by query string"""
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify([])
    
    # Substring match in title or clause
    matching_policies = [
        policy for policy in POLICIES
        if query in policy['title'].lower() or query in policy['clause'].lower()
    ]
    return jsonify(matching_policies)


@app.route('/api/cases/<case_id>/decision', methods=['POST'])
def post_decision(case_id):
    """Post a decision for a case"""
    # Find the case
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if not case:
        return jsonify({"error": "not_found"}), 404
    
    # Get decision from request body
    data = request.get_json()
    if not data or 'decision' not in data:
        return jsonify({"error": "decision required"}), 400
    
    decision = data.get('decision')
    note = data.get('note', '')
    
    # Validate decision
    if decision not in ['Approve', 'Reject', 'Pending']:
        return jsonify({"error": "invalid decision"}), 400
    
    # Update case status based on decision
    if decision == 'Approve':
        case['status'] = 'Approved'
    elif decision == 'Reject':
        case['status'] = 'Rejected'
    # For 'Pending', keep current status
    
    # Store the decision note if provided
    if note:
        case['decisionNote'] = note
    
    return jsonify({
        "ok": True,
        "id": case_id,
        "status": case['status'],
        "note": note
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({"error": "endpoint not found"}), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({"error": "internal server error"}), 500


if __name__ == '__main__':
    # Run the Flask app
    print("Starting KYC Workflow API on http://0.0.0.0:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
