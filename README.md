# KYC Workflow Prototype

A minimal, production-ready prototype of an AI-augmented KYC (Know Your Customer) workflow application built with Flask (backend) and React + Vite (frontend).

## Prerequisites

- Python 3.11+
- Node.js 20+
- npm or yarn

## Project Structure

```
kyc-proto/
├── server/          # Flask backend with mocked data
│   ├── app.py       # Main Flask application
│   ├── mock_data.py # Sample KYC cases and policies
│   └── requirements.txt
├── client/          # React frontend with Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── CaseList.jsx
│   │   │   ├── CaseDetail.jsx
│   │   │   └── WorkflowCanvas.jsx
│   │   ├── api.js   # API client functions
│   │   ├── App.jsx  # Main app component
│   │   ├── main.jsx # React entry point
│   │   └── styles.css
│   ├── index.html
│   └── package.json
└── README.md
```

## Setup Instructions

### 1. Backend Setup (Flask)

```bash
# Navigate to server directory
cd server

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```

The backend will start on `http://localhost:5001`

### 2. Frontend Setup (React + Vite)

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. **Open the Application**: Navigate to `http://localhost:5173` in your browser

2. **Search Policies**: Use the header search input to find compliance policies
   - Try searching for terms like "PEP", "due diligence", "risk", or "monitoring"
   - Results appear in a dropdown below the search bar

3. **View Cases**: The left panel displays all KYC cases
   - Click on any case to view its details
   - Cases show customer name, status, risk score, and creation date

4. **Workflow Visualization**: The top-right panel shows the KYC workflow
   - Five stages: Intake → Identity Verification → Screening → Decision → Monitoring
   - The current case's status is highlighted in the workflow

5. **Case Details**: The bottom-right panel shows detailed case information
   - Customer information (name, DOB, address, tier)
   - Verification checks with results and confidence scores
   - Risk score visualization

6. **Make Decisions**: For cases not yet approved/rejected
   - Add optional decision notes
   - Click "Approve", "Reject", or "Mark as Pending"
   - Decisions are persisted in memory until server restart

## API Endpoints

### Health Check
```bash
curl http://localhost:5001/api/health
# Response: {"ok": true}
```

### Get Workflow Definition
```bash
curl http://localhost:5001/api/workflow
# Response: {"nodes": [...], "edges": [...]}
```

### List All Cases
```bash
curl http://localhost:5001/api/cases
# Response: [{"id": "C-1001", "customer": {...}, "status": "...", ...}]
```

### Get Single Case
```bash
curl http://localhost:5001/api/cases/C-1001
# Response: {"id": "C-1001", "customer": {...}, "status": "...", ...}
```

### Search Policies
```bash
curl "http://localhost:5001/api/policies/search?q=PEP"
# Response: [{"id": "POL-003", "title": "...", "clause": "..."}]
```

### Submit Decision
```bash
curl -X POST http://localhost:5001/api/cases/C-1001/decision \
  -H "Content-Type: application/json" \
  -d '{"decision": "Approve", "note": "All checks passed"}'
# Response: {"ok": true, "id": "C-1001", "status": "Approved", "note": "..."}
```

## Features

- **Dark Theme UI**: Clean, professional dark interface
- **Real-time Updates**: Optimistic UI updates for smooth user experience
- **Error Handling**: Graceful error states with user-friendly messages
- **Responsive Design**: Adapts to different screen sizes
- **CORS Enabled**: Backend configured for cross-origin requests from Vite dev server
- **In-Memory Storage**: No database required for this prototype
- **Mock Data**: Pre-populated with sample KYC cases and compliance policies

## Development

### Backend Development
- Flask runs with `debug=True` for auto-reload
- All data is stored in memory and resets on server restart
- CORS is configured for `http://localhost:5173`

### Frontend Development
- Vite provides hot module replacement (HMR)
- Environment variable `VITE_API_BASE` can override the API URL
- No external CSS frameworks - custom styles in `styles.css`

## Technologies Used

### Backend
- Flask 3.0.3
- Flask-CORS 4.0.1
- Python 3.11+

### Frontend
- React 18.2
- Vite 5.0
- No Redux or heavy libraries
- Vanilla CSS for styling

## Notes

- This is a prototype with mocked data - not for production use with real customer data
- Decisions are stored in memory and will be lost when the server restarts
- The workflow visualization uses simple CSS without external graph libraries
- All API responses are JSON formatted
