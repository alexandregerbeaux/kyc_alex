"""Mock data for KYC workflow prototype"""

# Sample cases with various statuses and risk profiles
CASES = [
    {
        "id": "C-1001",
        "customer": {
            "name": "John Smith",
            "dob": "1985-03-15",
            "address": "123 Main St, New York, NY 10001",
            "tier": "Standard"
        },
        "status": "Screening",
        "checks": [
            {
                "type": "Identity Verification",
                "result": "Pass",
                "confidence": 0.95,
                "details": "Document verified successfully"
            },
            {
                "type": "Address Verification",
                "result": "Pass",
                "confidence": 0.88,
                "details": "Address confirmed via utility bill"
            },
            {
                "type": "PEP Screening",
                "result": "Pending",
                "details": "Awaiting database response"
            }
        ],
        "riskScore": 0.25,
        "createdAt": "2025-01-08T10:30:00Z"
    },
    {
        "id": "C-1002",
        "customer": {
            "name": "Sarah Johnson",
            "dob": "1990-07-22",
            "address": "456 Oak Ave, Los Angeles, CA 90001",
            "tier": "Premium"
        },
        "status": "Decision",
        "checks": [
            {
                "type": "Identity Verification",
                "result": "Pass",
                "confidence": 0.98,
                "details": "Biometric match confirmed"
            },
            {
                "type": "Address Verification",
                "result": "Pass",
                "confidence": 0.92,
                "details": "Address verified through bank statement"
            },
            {
                "type": "PEP Screening",
                "result": "Clear",
                "confidence": 0.99,
                "details": "No matches found"
            },
            {
                "type": "Sanctions Screening",
                "result": "Clear",
                "confidence": 0.99,
                "details": "No sanctions matches"
            }
        ],
        "riskScore": 0.15,
        "createdAt": "2025-01-07T14:20:00Z"
    },
    {
        "id": "C-1003",
        "customer": {
            "name": "Michael Chen",
            "dob": "1978-11-30",
            "address": "789 Pine St, San Francisco, CA 94102",
            "tier": "VIP"
        },
        "status": "Monitoring",
        "checks": [
            {
                "type": "Identity Verification",
                "result": "Pass",
                "confidence": 0.96,
                "details": "Identity confirmed"
            },
            {
                "type": "Address Verification",
                "result": "Pass",
                "confidence": 0.90,
                "details": "Verified via credit report"
            },
            {
                "type": "PEP Screening",
                "result": "Clear",
                "confidence": 0.97,
                "details": "No PEP matches"
            },
            {
                "type": "Transaction Monitoring",
                "result": "Normal",
                "confidence": 0.85,
                "details": "Transaction patterns within normal range"
            }
        ],
        "riskScore": 0.20,
        "createdAt": "2025-01-05T09:15:00Z"
    },
    {
        "id": "C-1004",
        "customer": {
            "name": "Emma Wilson",
            "dob": "1995-05-18",
            "address": "321 Elm St, Chicago, IL 60601",
            "tier": "Standard"
        },
        "status": "Intake",
        "checks": [],
        "riskScore": 0.0,
        "createdAt": "2025-01-09T08:00:00Z"
    },
    {
        "id": "C-1005",
        "customer": {
            "name": "Robert Martinez",
            "dob": "1982-09-08",
            "address": "555 Market St, Miami, FL 33101",
            "tier": "Premium"
        },
        "status": "Identity",
        "checks": [
            {
                "type": "Identity Verification",
                "result": "Review",
                "confidence": 0.72,
                "details": "Manual review required - document quality issue"
            }
        ],
        "riskScore": 0.45,
        "createdAt": "2025-01-08T16:45:00Z"
    }
]

# Sample compliance policies
POLICIES = [
    {
        "id": "POL-001",
        "title": "Customer Due Diligence Requirements",
        "clause": "All customers must undergo identity verification including government-issued ID validation and address confirmation within 30 days of account opening."
    },
    {
        "id": "POL-002",
        "title": "Enhanced Due Diligence for High-Risk Customers",
        "clause": "Customers classified as high-risk (risk score > 0.7) require enhanced due diligence including source of funds verification and senior management approval."
    },
    {
        "id": "POL-003",
        "title": "PEP Screening Protocol",
        "clause": "All customers must be screened against Politically Exposed Persons (PEP) databases. Positive matches require additional review and ongoing monitoring."
    },
    {
        "id": "POL-004",
        "title": "Transaction Monitoring Thresholds",
        "clause": "Transactions exceeding $10,000 or cumulative transactions exceeding $50,000 within 30 days trigger automatic review and potential SAR filing."
    },
    {
        "id": "POL-005",
        "title": "Periodic Review Requirements",
        "clause": "Customer profiles must be reviewed annually for standard tier, semi-annually for premium tier, and quarterly for VIP tier customers."
    }
]

# Workflow definition
WORKFLOW = {
    "nodes": [
        {"id": "intake", "label": "Intake"},
        {"id": "idv", "label": "Identity Verification"},
        {"id": "screen", "label": "Screening"},
        {"id": "decision", "label": "Decision"},
        {"id": "monitor", "label": "Monitoring"}
    ],
    "edges": [
        {"from": "intake", "to": "idv"},
        {"from": "idv", "to": "screen"},
        {"from": "screen", "to": "decision"},
        {"from": "decision", "to": "monitor"}
    ]
}
