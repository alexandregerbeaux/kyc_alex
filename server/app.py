"""Flask API for KYC workflow prototype"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from mock_data import CASES, POLICIES, WORKFLOW
import copy

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for the Vite dev server (allow both common ports)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174"])

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


@app.route('/api/cases/<case_id>/bank-statements/<statement_id>/review', methods=['POST'])
def review_bank_statement(case_id, statement_id):
    """Review a bank statement for a case"""
    # Find the case
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if not case:
        return jsonify({"error": "case_not_found"}), 404
    
    # Find the bank statement
    statement = None
    if 'bankStatements' in case:
        statement = next((s for s in case['bankStatements'] if s['id'] == statement_id), None)
    
    if not statement:
        return jsonify({"error": "statement_not_found"}), 404
    
    # Get review data from request body
    data = request.get_json()
    if not data or 'reviewStatus' not in data:
        return jsonify({"error": "reviewStatus required"}), 400
    
    review_status = data.get('reviewStatus')
    reviewer = data.get('reviewedBy', 'System')
    notes = data.get('notes', '')
    
    # Validate review status
    if review_status not in ['Approved', 'Rejected', 'Under Review', 'Pending Review']:
        return jsonify({"error": "invalid reviewStatus"}), 400
    
    # Update the bank statement review
    statement['reviewStatus'] = review_status
    statement['reviewedBy'] = reviewer
    statement['reviewDate'] = data.get('reviewDate', '2025-01-09T12:00:00Z')
    if notes:
        statement['notes'] = notes
    
    return jsonify({
        "ok": True,
        "caseId": case_id,
        "statementId": statement_id,
        "reviewStatus": review_status,
        "reviewedBy": reviewer
    })


@app.route('/api/cases/<case_id>/occupation-form/review', methods=['POST'])
def review_occupation_form(case_id):
    """Review the occupation form for a wealth customer"""
    # Find the case
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if not case:
        return jsonify({"error": "case_not_found"}), 404
    
    # Check if case has an occupation form
    if not case.get('occupationForm'):
        return jsonify({"error": "no_occupation_form"}), 404
    
    # Get review data from request body
    data = request.get_json()
    if not data or 'reviewStatus' not in data:
        return jsonify({"error": "reviewStatus required"}), 400
    
    review_status = data.get('reviewStatus')
    reviewer = data.get('reviewedBy', 'System')
    verification_docs = data.get('verificationDocuments', [])
    
    # Validate review status
    if review_status not in ['Approved', 'Rejected', 'Pending Review', 'Additional Info Required']:
        return jsonify({"error": "invalid reviewStatus"}), 400
    
    # Update the occupation form review
    case['occupationForm']['reviewStatus'] = review_status
    case['occupationForm']['reviewedBy'] = reviewer
    case['occupationForm']['reviewDate'] = data.get('reviewDate', '2025-01-09T12:00:00Z')
    
    if verification_docs:
        case['occupationForm']['verificationDocuments'] = verification_docs
    
    return jsonify({
        "ok": True,
        "caseId": case_id,
        "reviewStatus": review_status,
        "reviewedBy": reviewer
    })


@app.route('/api/cases/<case_id>/documents', methods=['GET'])
def get_documents(case_id):
    """Get all documents for a case"""
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if not case:
        return jsonify({"error": "case_not_found"}), 404
    
    documents = case.get('documents', [])
    return jsonify(documents)


@app.route('/api/cases/<case_id>/documents', methods=['POST'])
def upload_document(case_id):
    """Upload a document for a case (simulated)"""
    # Find the case
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if not case:
        return jsonify({"error": "case_not_found"}), 404
    
    # Get document data from request body
    print(request)
    data = request.get_json()
    print(data)
    if not data or 'name' not in data:
        return jsonify({"error": "document name required"}), 400
    
    # Create new document entry
    import random
    import datetime
    
    new_doc = {
        "id": f"DOC-{random.randint(100, 999)}",
        "name": data.get('name'),
        "type": data.get('type', 'Unknown'),
        "size": data.get('size', 0),
        "uploadedAt": datetime.datetime.now().isoformat() + 'Z',
        "status": "Pending Review",
        "category": data.get('category', 'Other')
    }
    
    # Initialize documents array if it doesn't exist
    if 'documents' not in case:
        case['documents'] = []
    
    # Add the new document
    case['documents'].append(new_doc)
    
    # Update case status if it's in Ingestion phase and has enough documents
    if case['status'] == 'Ingestion' and len(case['documents']) >= 2:
        case['status'] = 'Intake'
    
    return jsonify({
        "ok": True,
        "document": new_doc,
        "caseStatus": case['status']
    })


@app.route('/api/cases/<case_id>/documents/<doc_id>', methods=['DELETE'])
def delete_document(case_id, doc_id):
    """Delete a document from a case"""
    # Find the case
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if not case:
        return jsonify({"error": "case_not_found"}), 404
    
    # Find and remove the document
    documents = case.get('documents', [])
    original_count = len(documents)
    case['documents'] = [doc for doc in documents if doc['id'] != doc_id]
    
    if len(case['documents']) == original_count:
        return jsonify({"error": "document_not_found"}), 404
    
    return jsonify({
        "ok": True,
        "deleted": doc_id
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
