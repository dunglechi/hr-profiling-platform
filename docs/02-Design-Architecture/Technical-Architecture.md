---
SDLC_VERSION: "4.7.0"
DOCUMENT_TYPE: "Technical"
COMPONENT: "HR-Platform"
STATUS: "ACTIVE"
AUTHORITY: "CTO Approved"
LAST_UPDATED: "2025-10-11"
---

# Technical Architecture - HR Profiling Platform
**Framework**: SDLC 4.7 Compliant

# Technical Architecture Diagram
## HR Profiling & Assessment Platform

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Dashboard] 
        B[Mobile App]
        C[Admin Portal]
    end
    
    subgraph "Application Layer"
        D[React Frontend]
        E[Material-UI Components]
        F[State Management]
    end
    
    subgraph "API Gateway"
        G[Load Balancer]
        H[Rate Limiting]
        I[Authentication]
    end
    
    subgraph "Microservices"
        J[Assessment Service]
        K[User Management Service]
        L[Analytics Service]
        M[AI/ML Service]
        N[Notification Service]
    end
    
    subgraph "Data Processing"
        O[DISC Calculator]
        P[MBTI Analyzer] 
        Q[Numerology Engine]
        R[CV Parser]
        S[Job Matcher]
    end
    
    subgraph "External APIs"
        T[OpenAI GPT-4]
        U[Email Service]
        V[SMS Gateway]
        W[SSO Providers]
    end
    
    subgraph "Data Layer"
        X[(PostgreSQL)]
        Y[(Redis Cache)]
        Z[(Analytics DB)]
        AA[(File Storage)]
    end
    
    A --> D
    B --> D  
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    I --> K
    I --> L
    I --> M
    I --> N
    J --> O
    J --> P
    J --> Q
    M --> R
    L --> S
    M --> T
    N --> U
    N --> V
    I --> W
    J --> X
    K --> X
    L --> Z
    M --> X
    J --> Y
    M --> AA
```

# Data Flow Diagram
## Assessment Process

```mermaid
sequenceDiagram
    participant C as Candidate
    participant F as Frontend
    participant A as API Gateway
    participant AS as Assessment Service
    participant ML as AI/ML Service
    participant DB as Database
    participant EXT as External APIs
    
    C->>F: Start Assessment
    F->>A: Request Questions
    A->>AS: Get Assessment
    AS->>DB: Load Questions
    DB-->>AS: Return Questions
    AS-->>A: Questions Data
    A-->>F: Assessment Form
    F-->>C: Display Questions
    
    C->>F: Submit Responses
    F->>A: POST Responses
    A->>AS: Process Submission
    AS->>ML: Calculate Scores
    ML->>EXT: AI Analysis (if needed)
    EXT-->>ML: Analysis Results
    ML-->>AS: Processed Results
    AS->>DB: Save Results
    DB-->>AS: Confirmation
    AS-->>A: Results Data
    A-->>F: Assessment Results
    F-->>C: Display Results
```

# Database Schema Overview

```mermaid
erDiagram
    USERS {
        string id PK
        string email UK
        string password
        string role
        datetime created_at
        datetime updated_at
    }
    
    CANDIDATES {
        string id PK
        string user_id FK
        string full_name
        date birth_date
        string phone
        string cv_file
        datetime created_at
        datetime updated_at
    }
    
    JOB_POSITIONS {
        string id PK
        string title
        text description
        json requirements
        json weights
        boolean is_active
        datetime created_at
        datetime updated_at
    }
    
    ASSESSMENTS {
        string id PK
        string candidate_id FK
        string job_position_id FK
        float total_score
        string status
        datetime created_at
        datetime updated_at
    }
    
    DISC_RESULTS {
        string id PK
        string assessment_id FK
        int d_score
        int i_score
        int s_score
        int c_score
        string primary_style
        json analysis
        datetime created_at
    }
    
    MBTI_RESULTS {
        string id PK
        string assessment_id FK
        string type
        json dimensions
        json analysis
        datetime created_at
    }
    
    NUMEROLOGY_RESULTS {
        string id PK
        string assessment_id FK
        int life_path_number
        int destiny_number
        int personality_number
        int soul_urge_number
        json analysis
        json compatibility
        datetime created_at
    }
    
    CV_ANALYSIS {
        string id PK
        string assessment_id FK
        json skills
        json experience
        json education
        json behavioral_indicators
        json keyword_matches
        text ai_summary
        datetime created_at
    }
    
    USERS ||--|| CANDIDATES : has
    CANDIDATES ||--o{ ASSESSMENTS : takes
    JOB_POSITIONS ||--o{ ASSESSMENTS : for
    ASSESSMENTS ||--|| DISC_RESULTS : generates
    ASSESSMENTS ||--|| MBTI_RESULTS : generates
    ASSESSMENTS ||--|| NUMEROLOGY_RESULTS : generates
    ASSESSMENTS ||--|| CV_ANALYSIS : generates
```