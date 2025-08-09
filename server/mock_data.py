"""Mock data for KYC workflow prototype"""

# Sample cases with various statuses and risk profiles
CASES = [
    {
        "id": "C-1001",
        "customer": {
            "name": "John Smith",
            "dob": "1985-03-15",
            "address": "123 Main St, New York, NY 10001",
            "tier": "Standard",
            "isWealthCustomer": False
        },
        "status": "Screening",
        "documents": [
            {
                "id": "DOC-001",
                "name": "passport.pdf",
                "type": "Identity Document",
                "size": 2048576,
                "uploadedAt": "2025-01-07T09:00:00Z",
                "status": "Verified",
                "category": "Primary ID"
            },
            {
                "id": "DOC-002",
                "name": "utility_bill.pdf",
                "type": "Address Proof",
                "size": 512000,
                "uploadedAt": "2025-01-07T09:05:00Z",
                "status": "Verified",
                "category": "Address Verification"
            }
        ],
        "bankStatements": [
            {
                "id": "BS-001",
                "period": "2024-10 to 2024-12",
                "bank": "Chase Bank",
                "accountType": "Checking",
                "averageBalance": 15000,
                "monthlyIncome": 8500,
                "flaggedTransactions": 0,
                "reviewStatus": "Approved",
                "reviewedBy": "System",
                "reviewDate": "2025-01-07T10:00:00Z",
                "notes": "Regular salary deposits, normal spending patterns"
            }
        ],
        "occupationForm": None,
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
            "tier": "Premium",
            "isWealthCustomer": True
        },
        "status": "Decision",
        "documents": [
            {
                "id": "DOC-003",
                "name": "drivers_license.pdf",
                "type": "Identity Document",
                "size": 1536000,
                "uploadedAt": "2025-01-06T10:00:00Z",
                "status": "Verified",
                "category": "Primary ID"
            },
            {
                "id": "DOC-004",
                "name": "bank_statement_jan.pdf",
                "type": "Financial Document",
                "size": 768000,
                "uploadedAt": "2025-01-06T10:15:00Z",
                "status": "Verified",
                "category": "Bank Statement"
            },
            {
                "id": "DOC-005",
                "name": "employment_letter.pdf",
                "type": "Employment Verification",
                "size": 256000,
                "uploadedAt": "2025-01-06T10:20:00Z",
                "status": "Verified",
                "category": "Income Proof"
            },
            {
                "id": "DOC-006",
                "name": "tax_returns_2024.pdf",
                "type": "Tax Document",
                "size": 3072000,
                "uploadedAt": "2025-01-06T10:30:00Z",
                "status": "Under Review",
                "category": "Income Proof"
            }
        ],
        "bankStatements": [
            {
                "id": "BS-002",
                "period": "2024-09 to 2024-12",
                "bank": "Bank of America",
                "accountType": "Savings",
                "averageBalance": 250000,
                "monthlyIncome": 35000,
                "flaggedTransactions": 2,
                "reviewStatus": "Under Review",
                "reviewedBy": "John Analyst",
                "reviewDate": "2025-01-08T14:00:00Z",
                "notes": "Large wire transfers require additional verification"
            },
            {
                "id": "BS-003",
                "period": "2024-09 to 2024-12",
                "bank": "Wells Fargo",
                "accountType": "Investment",
                "averageBalance": 1500000,
                "monthlyIncome": 45000,
                "flaggedTransactions": 0,
                "reviewStatus": "Approved",
                "reviewedBy": "Senior Analyst",
                "reviewDate": "2025-01-08T15:00:00Z",
                "notes": "Investment income from dividends and capital gains"
            }
        ],
        "occupationForm": {
            "id": "OF-001",
            "occupation": "Chief Technology Officer",
            "employer": "Tech Innovations Inc.",
            "employmentStatus": "Full-time",
            "yearsEmployed": 5,
            "annualIncome": 450000,
            "sourceOfWealth": "Salary, Stock Options, Investment Returns",
            "netWorth": 3500000,
            "expectedAccountActivity": "High-value transfers, investment transactions",
            "politicalExposure": False,
            "reviewStatus": "Approved",
            "reviewedBy": "Wealth Management Team",
            "reviewDate": "2025-01-07T16:00:00Z",
            "verificationDocuments": ["Employment Letter", "Tax Returns", "Stock Option Agreement"]
        },
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
            "tier": "VIP",
            "isWealthCustomer": True
        },
        "status": "Monitoring",
        "documents": [
            {
                "id": "DOC-007",
                "name": "passport.pdf",
                "type": "Identity Document",
                "size": 2560000,
                "uploadedAt": "2025-01-04T08:00:00Z",
                "status": "Verified",
                "category": "Primary ID"
            },
            {
                "id": "DOC-008",
                "name": "business_registration.pdf",
                "type": "Business Document",
                "size": 1024000,
                "uploadedAt": "2025-01-04T08:10:00Z",
                "status": "Verified",
                "category": "Business Verification"
            },
            {
                "id": "DOC-009",
                "name": "property_deed.pdf",
                "type": "Asset Document",
                "size": 4096000,
                "uploadedAt": "2025-01-04T08:20:00Z",
                "status": "Verified",
                "category": "Wealth Verification"
            }
        ],
        "bankStatements": [
            {
                "id": "BS-004",
                "period": "2024-10 to 2024-12",
                "bank": "Goldman Sachs",
                "accountType": "Private Banking",
                "averageBalance": 5000000,
                "monthlyIncome": 150000,
                "flaggedTransactions": 1,
                "reviewStatus": "Approved",
                "reviewedBy": "Private Banking Team",
                "reviewDate": "2025-01-05T09:00:00Z",
                "notes": "International wire transfer verified - business acquisition"
            }
        ],
        "occupationForm": {
            "id": "OF-002",
            "occupation": "Founder & CEO",
            "employer": "Chen Ventures LLC",
            "employmentStatus": "Self-employed",
            "yearsEmployed": 12,
            "annualIncome": 2000000,
            "sourceOfWealth": "Business ownership, Real estate, Private equity",
            "netWorth": 25000000,
            "expectedAccountActivity": "Large business transactions, international transfers",
            "politicalExposure": False,
            "reviewStatus": "Approved",
            "reviewedBy": "Senior Wealth Manager",
            "reviewDate": "2025-01-04T11:00:00Z",
            "verificationDocuments": ["Business Registration", "Financial Statements", "Property Deeds"]
        },
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
            "name": "JaeHee Lim",
            "dob": "1991-0-18",
            "address": "321 Elm St, Chicago, IL 60601",
            "tier": "Standard",
            "isWealthCustomer": False
        },
        "status": "Ingestion",
        "documents": [],
        "bankStatements": [],
        "occupationForm": None,
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
            "tier": "Premium",
            "isWealthCustomer": True
        },
        "status": "Identity",
        "documents": [
            {
                "id": "DOC-010",
                "name": "drivers_license.jpg",
                "type": "Identity Document",
                "size": 512000,
                "uploadedAt": "2025-01-08T15:00:00Z",
                "status": "Pending Review",
                "category": "Primary ID"
            },
            {
                "id": "DOC-011",
                "name": "business_license.pdf",
                "type": "Business Document",
                "size": 768000,
                "uploadedAt": "2025-01-08T15:10:00Z",
                "status": "Pending Review",
                "category": "Business Verification"
            }
        ],
        "bankStatements": [
            {
                "id": "BS-005",
                "period": "2024-11 to 2024-12",
                "bank": "Citibank",
                "accountType": "Checking",
                "averageBalance": 75000,
                "monthlyIncome": 18000,
                "flaggedTransactions": 3,
                "reviewStatus": "Pending Review",
                "reviewedBy": None,
                "reviewDate": None,
                "notes": "Multiple cash deposits require verification"
            }
        ],
        "occupationForm": {
            "id": "OF-003",
            "occupation": "Real Estate Developer",
            "employer": "Martinez Properties Group",
            "employmentStatus": "Self-employed",
            "yearsEmployed": 8,
            "annualIncome": 350000,
            "sourceOfWealth": "Real estate development, Property rentals",
            "netWorth": 2800000,
            "expectedAccountActivity": "Property transactions, rental income",
            "politicalExposure": False,
            "reviewStatus": "Pending Review",
            "reviewedBy": None,
            "reviewDate": None,
            "verificationDocuments": ["Business License", "Property Portfolio"]
        },
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
        {"id": "ingestion", "label": "Document Ingestion"},
        {"id": "intake", "label": "Intake"},
        {"id": "idv", "label": "Identity Verification"},
        {"id": "screen", "label": "Screening"},
        {"id": "decision", "label": "Decision"},
        {"id": "monitor", "label": "Monitoring"}
    ],
    "edges": [
        {"from": "ingestion", "to": "intake"},
        {"from": "intake", "to": "idv"},
        {"from": "idv", "to": "screen"},
        {"from": "screen", "to": "decision"},
        {"from": "decision", "to": "monitor"}
    ]
}
