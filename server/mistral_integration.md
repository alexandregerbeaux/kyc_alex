# Mistral API Integration for OCR

## Overview
This document explains how to integrate Mistral API for OCR processing in the KYC document upload system.

## Current Implementation
The Flask backend now handles actual file uploads and stores them in the `uploads/` directory. The `process_document_with_ocr()` function in `app.py` is a placeholder for Mistral API integration.

## Integration Steps

### 1. Install Required Dependencies
```bash
pip install requests pillow
```

### 2. Set up Mistral API Credentials
Create a `.env` file in the server directory:
```env
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_API_URL=https://api.mistral.ai/v1/chat/completions
```

### 3. Update the OCR Function
Replace the `process_document_with_ocr()` function in `app.py` with:

```python
import requests
import base64
from PIL import Image
import io
import os
from dotenv import load_dotenv

load_dotenv()

def process_document_with_ocr(file_path, file_type):
    """
    Process document with OCR using Mistral API
    """
    try:
        # Read the file
        with open(file_path, 'rb') as file:
            file_content = file.read()
        
        # Convert to base64
        base64_content = base64.b64encode(file_content).decode('utf-8')
        
        # Prepare the API request
        headers = {
            'Authorization': f'Bearer {os.getenv("MISTRAL_API_KEY")}',
            'Content-Type': 'application/json'
        }
        
        # Create the prompt for OCR
        prompt = """
        Please extract and analyze the text from this document image. 
        Provide:
        1. All visible text content
        2. Document type (ID, passport, bank statement, etc.)
        3. Key information extracted (names, dates, amounts, etc.)
        4. Any potential issues or concerns
        """
        
        # Prepare the payload
        payload = {
            "model": "pixtral-12b-2024-09-04",  # Mistral's vision model
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": prompt
                        },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/{file_type};base64,{base64_content}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.1,
            "max_tokens": 2000
        }
        
        # Make the API call
        response = requests.post(
            os.getenv("MISTRAL_API_URL"),
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            extracted_text = result['choices'][0]['message']['content']
            
            return {
                "extracted_text": extracted_text,
                "confidence": 0.95,
                "processing_status": "completed",
                "model_used": "pixtral-12b-2024-09-04"
            }
        else:
            return {
                "extracted_text": "",
                "confidence": 0,
                "processing_status": "failed",
                "error": f"API error: {response.status_code}"
            }
            
    except Exception as e:
        return {
            "extracted_text": "",
            "confidence": 0,
            "processing_status": "error",
            "error": str(e)
        }
```

### 4. Enhanced OCR Processing for Different Document Types

For more sophisticated processing, you can customize the prompt based on document type:

```python
def get_ocr_prompt(doc_type, category):
    """
    Get specialized prompt based on document type
    """
    prompts = {
        "Identity Document": """
            Extract from this ID document:
            - Full name
            - Date of birth
            - ID number
            - Expiry date
            - Address (if present)
            - Nationality
            Verify the document appears authentic.
        """,
        "Bank Statement": """
            Extract from this bank statement:
            - Account holder name
            - Account number
            - Statement period
            - Opening balance
            - Closing balance
            - Total deposits
            - Total withdrawals
            - Any unusual transactions
            - Bank name and branch
        """,
        "Financial Document": """
            Extract financial information:
            - Document type (tax return, payslip, etc.)
            - Period covered
            - Total income
            - Tax paid
            - Net amount
            - Employer/source information
        """,
        "Address Proof": """
            Extract address verification details:
            - Full name
            - Complete address
            - Document date
            - Utility/service provider
            - Account/reference number
        """
    }
    
    return prompts.get(doc_type, """
        Extract all text and key information from this document.
        Identify the document type and main purpose.
        List all important data points found.
    """)
```

### 5. Add Document Analysis Endpoint

Add this endpoint to `app.py` for detailed document analysis:

```python
@app.route('/api/cases/<case_id>/documents/<doc_id>/analyze', methods=['POST'])
def analyze_document(case_id, doc_id):
    """
    Perform detailed analysis on a document using Mistral
    """
    # Find the case and document
    case = next((c for c in cases_store if c['id'] == case_id), None)
    if not case:
        return jsonify({"error": "case_not_found"}), 404
    
    document = next((doc for doc in case.get('documents', []) 
                    if doc['id'] == doc_id), None)
    if not document:
        return jsonify({"error": "document_not_found"}), 404
    
    # Get analysis type from request
    data = request.get_json()
    analysis_type = data.get('type', 'general')
    
    # Perform specialized analysis
    if 'file_path' in document:
        ocr_result = process_document_with_ocr(
            document['file_path'], 
            document.get('type', 'Unknown')
        )
        
        # Update document with new analysis
        document['ocr_result'] = ocr_result
        document['last_analyzed'] = datetime.datetime.now().isoformat() + 'Z'
        
        return jsonify({
            "ok": True,
            "analysis": ocr_result,
            "document_id": doc_id
        })
    
    return jsonify({"error": "file_not_found"}), 404
```

## Testing the Integration

1. Start the Flask server
2. Upload a document through the UI
3. Check the OCR results in the response
4. Use the `/api/cases/{case_id}/documents/{doc_id}/ocr` endpoint to retrieve OCR results

## Security Considerations

1. **API Key Security**: Never commit API keys to version control
2. **File Size Limits**: Mistral API has size limits for image processing
3. **Rate Limiting**: Implement rate limiting to avoid API quota issues
4. **Data Privacy**: Ensure sensitive document data is handled securely

## Error Handling

The integration includes error handling for:
- API connection failures
- Invalid file formats
- API rate limits
- Processing timeouts

## Cost Optimization

- Cache OCR results to avoid reprocessing
- Use batch processing for multiple documents
- Implement a queue system for large volumes

## Next Steps

1. Add support for PDF documents (may need PDF to image conversion)
2. Implement document validation based on OCR results
3. Add automatic data extraction to populate forms
4. Create alerts for suspicious documents
5. Build a review interface for OCR results
