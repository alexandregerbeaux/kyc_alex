"""Flask API for KYC workflow prototype"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from mock_data import CASES, POLICIES, WORKFLOW
import copy
import os
import base64
import random
import datetime
from werkzeug.utils import secure_filename
import os
import json
from pydantic import BaseModel, Field
from mistralai import Mistral
from mistralai import Mistral, DocumentURLChunk, ImageURLChunk, ResponseFormat
from mistralai.extra import response_format_from_pydantic_model

# Initialize Flask app
app = Flask(__name__)

# Enable CORS for the Vite dev server (allow both common ports)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174"])

# Configure upload settings
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max file size

# Create upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# In-memory storage (copy to avoid modifying original mock data)
cases_store = copy.deepcopy(CASES)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def classify_document_type(file_path, file_type):
    """
    Classify document type using Mistral VLM
    This is a placeholder for your Mistral VLM implementation
    """
    # TODO: Implement your Mistral VLM classification here
    # This is dummy code as requested
    
    import random
    
    # Dummy classification logic - replace with your Mistral VLM implementation
    document_types = [
        "Employment Pass",
        "Passport", 
        "Bank Statement",
        "Billing Form",
        "Employment Letter"
    ]
    api_key = 'ZjM0pTT7sc11IrX80ZSXrXrrwI97fSGG'

    client = Mistral(api_key=api_key)

    uploaded_pdf = client.files.upload(
        file={
            "file_name": file_path,
            "content": open(file_path, "rb"),
        },
        purpose="ocr"
    )  

    signed_url = client.files.get_signed_url(file_id=uploaded_pdf.id)

    model = "mistral-small-latest"


    # Define the messages for the chat
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": f"What is the type of this document? Response in a JSON format with key as document_type and a value between {document_types}"
                },
                {
                    "type": "image_url",
                    "image_url": signed_url.url
                }
            ]
        }
    ]

    # Get the chat response
    chat_response = client.chat.complete(
        model=model,
        messages=messages,
        response_format=      {
            "type": "json_object"
        }
    )

    document_type = json.loads(chat_response.choices[0].message.content)['document_type']

    # Simulate classification with confidence scores
    classification_result = {
        "document_type": document_type,
        "confidence": round(random.uniform(0.85, 0.99), 2),
        "alternative_types": [
            {
                "type": document_type,
                "confidence": round(random.uniform(0.10, 0.30), 2)
            }
        ],
        "classification_status": "completed"
    }
    
    print(f"Document classified as: {classification_result['document_type']} with confidence: {classification_result['confidence']}")
    
    return classification_result


def process_document_with_ocr(file_path, file_type):
    """
    Process document with OCR using Mistral API
    This is a placeholder for Mistral API integration
    """
    # TODO: Implement Mistral API call here
    # For now, return mock OCR results

    
    # Here you would:
    # 1. Read the file content
    # 2. Convert to base64 if needed for API
    # 3. Call Mistral API endpoint
    # 4. Process and return results




    api_key = 'ZjM0pTT7sc11IrX80ZSXrXrrwI97fSGG'

    client = Mistral(api_key=api_key)

    uploaded_pdf = client.files.upload(
        file={
            "file_name": file_path,
            "content": open(file_path, "rb"),
        },
        purpose="ocr"
    )  

    signed_url = client.files.get_signed_url(file_id=uploaded_pdf.id)



    # Document Annotation response format
    class Document(BaseModel):
        Name: str
        Occupation: str
        FIN: str
        date_of_application: str
        date_of_issue: str
        date_of_expiry: str

    class Image(BaseModel):
        image_type: str = Field(..., description="The type of the image.")
        smiling: str = Field(..., description="Whether the person on the image smiling or not")
        fraud: str = Field(..., description="Whether the document looks like it has been forged.")


    # Client call
    response = client.ocr.process(
        model="mistral-ocr-latest",
        pages=list(range(8)),
        document={
            "type": "document_url",
            "document_url": signed_url.url,
        },
        bbox_annotation_format=response_format_from_pydantic_model(Image),
        document_annotation_format=response_format_from_pydantic_model(Document),
        include_image_base64=True
    )

    ocr_result = json.loads(response.document_annotation)

    ocr_result['extracted_text'] = "Mock OCR text extracted from document"
    ocr_result['confidence'] = 0.95
    ocr_result['processing_status'] = "completed"

    print(ocr_result)
    return ocr_result


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
    """Upload a document for a case with actual file handling"""
    # Find the case
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if not case:
        return jsonify({"error": "case_not_found"}), 404
    
    # Check if file is in request
    if 'file' not in request.files:
        return jsonify({"error": "no file provided"}), 400
    
    file = request.files['file']
    
    # Check if file is selected
    if file.filename == '':
        return jsonify({"error": "no file selected"}), 400
    
    # Validate file type
    if not allowed_file(file.filename):
        return jsonify({"error": "file type not allowed"}), 400
    
    # Get form data
    name = request.form.get('name', file.filename)
    doc_type = request.form.get('type', 'Unknown')
    category = request.form.get('category', 'Other')
    size = request.form.get('size', '0')
    
    # Generate unique filename
    doc_id = f"DOC-{random.randint(100, 999)}"
    filename = secure_filename(file.filename)
    file_extension = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{case_id}_{doc_id}.{file_extension}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    
    # Save the file
    file.save(file_path)
    
    # Step 1: Classify document type using Mistral VLM
    classification_result = classify_document_type(file_path, file_extension)
    
    # Step 2: Process with OCR (placeholder for Mistral API)
    ocr_result = process_document_with_ocr(file_path, file_extension)
    
    # Create document entry with classification
    new_doc = {
        "id": doc_id,
        "name": name,
        "type": doc_type,
        "size": int(size),
        "uploadedAt": datetime.datetime.now().isoformat() + 'Z',
        "status": "Pending Review",
        "category": category,
        "file_path": file_path,
        "ocr_result": ocr_result,  # Store OCR results
        "classification": classification_result  # Store classification results
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
        "document": {
            "id": new_doc["id"],
            "name": new_doc["name"],
            "type": new_doc["type"],
            "size": new_doc["size"],
            "uploadedAt": new_doc["uploadedAt"],
            "status": new_doc["status"],
            "category": new_doc["category"],
            "ocr_processed": ocr_result.get("processing_status") == "completed",
            "ocr_metadata": {
                "Name": ocr_result.get("Name", ""),
                "Occupation": ocr_result.get("Occupation", ""),
                "FIN": ocr_result.get("FIN", ""),
                "date_of_application": ocr_result.get("date_of_application", ""),
                "date_of_issue": ocr_result.get("date_of_issue", ""),
                "date_of_expiry": ocr_result.get("date_of_expiry", ""),
                "confidence": ocr_result.get("confidence", 0)
            },
            "classification": {
                "document_type": classification_result.get("document_type", "Unknown"),
                "confidence": classification_result.get("confidence", 0),
                "alternative_types": classification_result.get("alternative_types", [])
            }
        },
        "caseStatus": case['status']
    })


@app.route('/api/cases/<case_id>/documents/<doc_id>', methods=['DELETE'])
def delete_document(case_id, doc_id):
    """Delete a document from a case"""
    # Find the case
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if not case:
        return jsonify({"error": "case_not_found"}), 404
    
    # Find the document to delete
    documents = case.get('documents', [])
    doc_to_delete = next((doc for doc in documents if doc['id'] == doc_id), None)
    
    if not doc_to_delete:
        return jsonify({"error": "document_not_found"}), 404
    
    # Delete the actual file if it exists
    if 'file_path' in doc_to_delete and os.path.exists(doc_to_delete['file_path']):
        try:
            os.remove(doc_to_delete['file_path'])
        except Exception as e:
            print(f"Error deleting file: {e}")
    
    # Remove from documents list
    case['documents'] = [doc for doc in documents if doc['id'] != doc_id]
    
    return jsonify({
        "ok": True,
        "deleted": doc_id
    })


@app.route('/api/cases/<case_id>/documents/<doc_id>/ocr', methods=['GET'])
def get_document_ocr(case_id, doc_id):
    """Get OCR results for a specific document"""
    # Find the case
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if not case:
        return jsonify({"error": "case_not_found"}), 404
    
    # Find the document
    documents = case.get('documents', [])
    document = next((doc for doc in documents if doc['id'] == doc_id), None)
    
    print(documents)

    if not document:
        return jsonify({"error": "document_not_found"}), 404
    
    # Return OCR results if available
    if 'ocr_result' in document:
        return jsonify({
            "ok": True,
            "ocr_result": document['ocr_result']
        })
    else:
        return jsonify({"error": "no_ocr_results"}), 404


@app.route('/api/cases/<case_id>/documents/<doc_id>/preview', methods=['GET'])
def get_document_preview(case_id, doc_id):
    """Get document file for preview"""
    from flask import send_file
    import mimetypes
    
    # Find the case
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if not case:
        return jsonify({"error": "case_not_found"}), 404
    
    # Find the document
    documents = case.get('documents', [])
    document = next((doc for doc in documents if doc['id'] == doc_id), None)
    
    if not document:
        return jsonify({"error": "document_not_found"}), 404
    
    # Check if file exists
    if 'file_path' not in document or not os.path.exists(document['file_path']):
        return jsonify({"error": "file_not_found"}), 404
    
    # Get file mime type
    mime_type, _ = mimetypes.guess_type(document['file_path'])
    if not mime_type:
        mime_type = 'application/octet-stream'
    
    # Send file
    return send_file(
        document['file_path'],
        mimetype=mime_type,
        as_attachment=False,
        download_name=document.get('name', 'document')
    )


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
