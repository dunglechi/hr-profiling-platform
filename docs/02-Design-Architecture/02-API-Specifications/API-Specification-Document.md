# SDLC 4.7 - API Specification Document
## Project: HR Profiling Platform - RESTful API Design
### Document ID: API-SPEC-001
### Version: 1.0.0
### Date: October 11, 2025
### Status: ACTIVE

---

## 1. API Overview

### 1.1 API Design Principles
- **RESTful Architecture**: Resource-based URL design with HTTP verbs
- **OpenAPI 3.0 Specification**: Comprehensive API documentation
- **Versioning Strategy**: URL-based versioning (e.g., `/api/v1/`)
- **Consistent Response Format**: Standardized JSON response structure
- **Cultural Sensitivity**: Vietnamese cultural context in data models
- **Security First**: JWT authentication and RBAC authorization

### 1.2 Base Configuration
```yaml
openapi: 3.0.3
info:
  title: HR Profiling Platform API
  description: Comprehensive API for psychological profiling with Vietnamese cultural intelligence
  version: 1.0.0
  contact:
    name: API Support
    email: api-support@hrprofiling.vn
servers:
  - url: https://api.hrprofiling.vn/v1
    description: Production server
  - url: https://staging-api.hrprofiling.vn/v1
    description: Staging server
  - url: http://localhost:5000/api/v1
    description: Development server
```

### 1.3 Global Response Format
```json
{
  "success": boolean,
  "data": object | array | null,
  "message": string,
  "errors": array,
  "meta": {
    "timestamp": "ISO 8601 datetime",
    "requestId": "unique-request-id",
    "version": "api-version",
    "culturalContext": "vietnamese | international"
  }
}
```

## 2. Authentication & Authorization APIs

### 2.1 Authentication Endpoints

#### 2.1.1 User Registration
```yaml
/auth/register:
  post:
    summary: Register new user account
    tags: [Authentication]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password, fullName, culturalPreferences]
            properties:
              email:
                type: string
                format: email
                example: "nguyen.van.a@company.com"
              password:
                type: string
                minLength: 8
                pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]"
              fullName:
                type: object
                properties:
                  firstName: 
                    type: string
                    example: "Văn"
                  lastName: 
                    type: string
                    example: "Nguyễn"
                  middleName: 
                    type: string
                    example: "A"
              culturalPreferences:
                type: object
                properties:
                  language: 
                    type: string
                    enum: ["vi", "en"]
                    default: "vi"
                  numerologyEnabled: 
                    type: boolean
                    default: true
                  culturalDepth: 
                    type: string
                    enum: ["basic", "detailed", "expert"]
                    default: "detailed"
    responses:
      201:
        description: User successfully registered
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AuthResponse'
      400:
        $ref: '#/components/responses/BadRequest'
      409:
        $ref: '#/components/responses/Conflict'
```

#### 2.1.2 User Login
```yaml
/auth/login:
  post:
    summary: Authenticate user and return JWT token
    tags: [Authentication]
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [email, password]
            properties:
              email:
                type: string
                format: email
              password:
                type: string
              rememberMe:
                type: boolean
                default: false
              culturalContext:
                type: string
                enum: ["vietnamese", "international"]
                default: "vietnamese"
    responses:
      200:
        description: Authentication successful
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      type: object
                      properties:
                        user:
                          $ref: '#/components/schemas/User'
                        tokens:
                          type: object
                          properties:
                            accessToken:
                              type: string
                            refreshToken:
                              type: string
                            expiresIn:
                              type: integer
                              example: 3600
      401:
        $ref: '#/components/responses/Unauthorized'
```

## 3. User Management APIs

### 3.1 User Profile Endpoints

#### 3.1.1 Get User Profile
```yaml
/users/{userId}/profile:
  get:
    summary: Retrieve comprehensive user profile
    tags: [User Management]
    security:
      - bearerAuth: []
    parameters:
      - name: userId
        in: path
        required: true
        schema:
          type: string
          format: uuid
      - name: includeCultural
        in: query
        schema:
          type: boolean
          default: true
      - name: includeAssessments
        in: query
        schema:
          type: boolean
          default: false
    responses:
      200:
        description: User profile retrieved successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/UserProfile'
```

#### 3.1.2 Update User Profile
```yaml
/users/{userId}/profile:
  put:
    summary: Update user profile information
    tags: [User Management]
    security:
      - bearerAuth: []
    parameters:
      - name: userId
        in: path
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/UserProfileUpdate'
    responses:
      200:
        description: Profile updated successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/UserProfile'
```

## 4. Assessment APIs

### 4.1 DISC Assessment Endpoints

#### 4.1.1 Create DISC Assessment
```yaml
/assessments/disc:
  post:
    summary: Create new DISC assessment
    tags: [Assessments, DISC]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [userId, culturalAdaptation]
            properties:
              userId:
                type: string
                format: uuid
              culturalAdaptation:
                type: boolean
                description: "Adapt assessment for Vietnamese culture"
                default: true
              assessmentConfig:
                type: object
                properties:
                  timeLimit:
                    type: integer
                    description: "Time limit in minutes"
                    default: 15
                  questionOrder:
                    type: string
                    enum: ["sequential", "randomized"]
                    default: "sequential"
                  culturalDepth:
                    type: string
                    enum: ["basic", "detailed", "expert"]
                    default: "detailed"
    responses:
      201:
        description: DISC assessment created successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/DISCAssessment'
```

#### 4.1.2 Get DISC Questions
```yaml
/assessments/disc/{assessmentId}/questions:
  get:
    summary: Retrieve DISC assessment questions
    tags: [Assessments, DISC]
    security:
      - bearerAuth: []
    parameters:
      - name: assessmentId
        in: path
        required: true
        schema:
          type: string
          format: uuid
      - name: culturalContext
        in: query
        schema:
          type: string
          enum: ["vietnamese", "international"]
          default: "vietnamese"
    responses:
      200:
        description: DISC questions retrieved successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      type: object
                      properties:
                        questions:
                          type: array
                          items:
                            $ref: '#/components/schemas/DISCQuestion'
                        totalQuestions:
                          type: integer
                          example: 24
                        culturalNotes:
                          type: array
                          items:
                            type: string
```

#### 4.1.3 Submit DISC Answers
```yaml
/assessments/disc/{assessmentId}/submit:
  post:
    summary: Submit DISC assessment answers
    tags: [Assessments, DISC]
    security:
      - bearerAuth: []
    parameters:
      - name: assessmentId
        in: path
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [answers]
            properties:
              answers:
                type: array
                items:
                  type: object
                  required: [questionId, selectedOptions]
                  properties:
                    questionId:
                      type: string
                    selectedOptions:
                      type: array
                      items:
                        type: string
              completionTime:
                type: integer
                description: "Time taken in seconds"
              culturalFeedback:
                type: object
                properties:
                  culturalDifficulty:
                    type: integer
                    minimum: 1
                    maximum: 5
                  culturalRelevance:
                    type: integer
                    minimum: 1
                    maximum: 5
                  comments:
                    type: string
    responses:
      200:
        description: Answers submitted successfully, processing results
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      type: object
                      properties:
                        submissionId:
                          type: string
                        status:
                          type: string
                          enum: ["processing", "completed"]
                        estimatedProcessingTime:
                          type: integer
                          description: "Estimated time in seconds"
```

#### 4.1.4 Get DISC Results
```yaml
/assessments/disc/{assessmentId}/results:
  get:
    summary: Retrieve DISC assessment results
    tags: [Assessments, DISC]
    security:
      - bearerAuth: []
    parameters:
      - name: assessmentId
        in: path
        required: true
        schema:
          type: string
          format: uuid
      - name: includeCultural
        in: query
        schema:
          type: boolean
          default: true
      - name: includeCareerSuggestions
        in: query
        schema:
          type: boolean
          default: true
    responses:
      200:
        description: DISC results retrieved successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/DISCResults'
```

### 4.2 MBTI Assessment Endpoints

#### 4.2.1 Create MBTI Assessment
```yaml
/assessments/mbti:
  post:
    summary: Create new MBTI assessment
    tags: [Assessments, MBTI]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [userId]
            properties:
              userId:
                type: string
                format: uuid
              culturalAdaptation:
                type: boolean
                default: true
              assessmentVersion:
                type: string
                enum: ["standard", "vietnamese-adapted"]
                default: "vietnamese-adapted"
    responses:
      201:
        description: MBTI assessment created successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/MBTIAssessment'
```

### 4.3 Numerology Assessment Endpoints

#### 4.3.1 Calculate Numerology Profile
```yaml
/numerology/calculate:
  post:
    summary: Calculate comprehensive numerology profile
    tags: [Numerology]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [userId, birthDate, fullName]
            properties:
              userId:
                type: string
                format: uuid
              birthDate:
                type: string
                format: date
                example: "1990-05-15"
              fullName:
                type: object
                required: [firstName, lastName]
                properties:
                  firstName:
                    type: string
                    example: "Văn"
                  lastName:
                    type: string
                    example: "Nguyễn"
                  middleName:
                    type: string
                    example: "A"
              culturalDepth:
                type: string
                enum: ["basic", "detailed", "expert"]
                default: "detailed"
              includeCareerGuidance:
                type: boolean
                default: true
    responses:
      200:
        description: Numerology profile calculated successfully
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/NumerologyProfile'
```

## 5. CV Analysis APIs

### 5.1 CV Upload and Analysis

#### 5.1.1 Upload CV
```yaml
/cv/upload:
  post:
    summary: Upload and analyze CV document
    tags: [CV Analysis]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        multipart/form-data:
          schema:
            type: object
            required: [file, userId]
            properties:
              file:
                type: string
                format: binary
                description: "CV file (PDF, DOC, DOCX)"
              userId:
                type: string
                format: uuid
              analysisOptions:
                type: object
                properties:
                  extractSkills:
                    type: boolean
                    default: true
                  matchWithNumerology:
                    type: boolean
                    default: true
                  generateCareerSuggestions:
                    type: boolean
                    default: true
                  culturalAnalysis:
                    type: boolean
                    default: true
    responses:
      202:
        description: CV uploaded and analysis started
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      type: object
                      properties:
                        analysisId:
                          type: string
                          format: uuid
                        status:
                          type: string
                          enum: ["uploaded", "processing"]
                        estimatedCompletionTime:
                          type: integer
                          description: "Estimated time in seconds"
```

## 6. Reporting APIs

### 6.1 Generate Reports

#### 6.1.1 Generate Comprehensive Report
```yaml
/reports/comprehensive:
  post:
    summary: Generate comprehensive assessment report
    tags: [Reports]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [userId, reportType]
            properties:
              userId:
                type: string
                format: uuid
              reportType:
                type: string
                enum: ["individual", "team", "cultural-analysis"]
              includeAssessments:
                type: array
                items:
                  type: string
                  enum: ["disc", "mbti", "numerology", "cv-analysis"]
                default: ["disc", "mbti", "numerology"]
              culturalFocus:
                type: string
                enum: ["vietnamese", "international", "comparative"]
                default: "vietnamese"
              format:
                type: string
                enum: ["pdf", "html", "json"]
                default: "pdf"
              language:
                type: string
                enum: ["vi", "en"]
                default: "vi"
    responses:
      202:
        description: Report generation started
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      type: object
                      properties:
                        reportId:
                          type: string
                          format: uuid
                        status:
                          type: string
                          enum: ["queued", "generating"]
                        estimatedCompletionTime:
                          type: integer
```

## 7. Cultural Intelligence APIs

### 7.1 Cultural Analysis

#### 7.1.1 Analyze Cultural Fit
```yaml
/culture/analyze-fit:
  post:
    summary: Analyze cultural fit for specific role or team
    tags: [Cultural Intelligence]
    security:
      - bearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            required: [userId, analysisType]
            properties:
              userId:
                type: string
                format: uuid
              analysisType:
                type: string
                enum: ["role-fit", "team-fit", "organization-fit"]
              targetContext:
                type: object
                properties:
                  roleId:
                    type: string
                  teamId:
                    type: string
                  organizationCulture:
                    type: object
                    properties:
                      values:
                        type: array
                        items:
                          type: string
                      workStyle:
                        type: string
                      communicationStyle:
                        type: string
              culturalDimensions:
                type: array
                items:
                  type: string
                  enum: ["power-distance", "individualism", "uncertainty-avoidance", "long-term-orientation"]
    responses:
      200:
        description: Cultural fit analysis completed
        content:
          application/json:
            schema:
              allOf:
                - $ref: '#/components/schemas/BaseResponse'
                - type: object
                  properties:
                    data:
                      $ref: '#/components/schemas/CulturalFitAnalysis'
```

## 8. Data Schemas

### 8.1 Core Schemas

```yaml
components:
  schemas:
    BaseResponse:
      type: object
      required: [success, message, meta]
      properties:
        success:
          type: boolean
        message:
          type: string
        meta:
          type: object
          properties:
            timestamp:
              type: string
              format: date-time
            requestId:
              type: string
            version:
              type: string
            culturalContext:
              type: string
              enum: ["vietnamese", "international"]

    User:
      type: object
      required: [id, email, fullName, role, culturalPreferences]
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        fullName:
          type: object
          properties:
            firstName:
              type: string
            lastName:
              type: string
            middleName:
              type: string
        role:
          type: string
          enum: ["admin", "hr_manager", "employee", "consultant"]
        culturalPreferences:
          $ref: '#/components/schemas/CulturalPreferences'
        createdAt:
          type: string
          format: date-time
        lastLoginAt:
          type: string
          format: date-time

    CulturalPreferences:
      type: object
      properties:
        language:
          type: string
          enum: ["vi", "en"]
        numerologyEnabled:
          type: boolean
        culturalDepth:
          type: string
          enum: ["basic", "detailed", "expert"]
        preferredCulturalFramework:
          type: string
          enum: ["traditional", "modern", "hybrid"]

    DISCResults:
      type: object
      required: [scores, primaryType, culturalInterpretation]
      properties:
        scores:
          type: object
          properties:
            dominance:
              type: number
              minimum: 0
              maximum: 100
            influence:
              type: number
              minimum: 0
              maximum: 100
            steadiness:
              type: number
              minimum: 0
              maximum: 100
            conscientiousness:
              type: number
              minimum: 0
              maximum: 100
        primaryType:
          type: string
          enum: ["D", "I", "S", "C", "DI", "DS", "DC", "IS", "IC", "SC"]
        culturalInterpretation:
          type: object
          properties:
            vietnameseContext:
              type: string
            careerSuggestions:
              type: array
              items:
                type: string
            teamRoleRecommendations:
              type: array
              items:
                type: string
            culturalStrengths:
              type: array
              items:
                type: string
            developmentAreas:
              type: array
              items:
                type: string

    NumerologyProfile:
      type: object
      required: [lifePathNumber, destinyNumber, culturalInterpretation]
      properties:
        lifePathNumber:
          type: integer
          minimum: 1
          maximum: 9
        destinyNumber:
          type: integer
          minimum: 1
          maximum: 9
        personalityNumber:
          type: integer
          minimum: 1
          maximum: 9
        culturalInterpretation:
          type: object
          properties:
            vietnameseSignificance:
              type: string
            careerGuidance:
              type: object
              properties:
                suitableFields:
                  type: array
                  items:
                    type: string
                avoidableFields:
                  type: array
                  items:
                    type: string
                optimalTimings:
                  type: array
                  items:
                    type: object
                    properties:
                      activity:
                        type: string
                      favorablePeriods:
                        type: array
                        items:
                          type: string
            personalityTraits:
              type: array
              items:
                type: string
            luckyNumbers:
              type: array
              items:
                type: integer
            favorableColors:
              type: array
              items:
                type: string

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  responses:
    BadRequest:
      description: Bad request - invalid input
      content:
        application/json:
          schema:
            allOf:
              - $ref: '#/components/schemas/BaseResponse'
              - type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  errors:
                    type: array
                    items:
                      type: object
                      properties:
                        field:
                          type: string
                        message:
                          type: string
                        code:
                          type: string

    Unauthorized:
      description: Unauthorized - invalid or missing authentication
      content:
        application/json:
          schema:
            allOf:
              - $ref: '#/components/schemas/BaseResponse'
              - type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  message:
                    type: string
                    example: "Authentication required"

    Forbidden:
      description: Forbidden - insufficient permissions
      content:
        application/json:
          schema:
            allOf:
              - $ref: '#/components/schemas/BaseResponse'
              - type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  message:
                    type: string
                    example: "Insufficient permissions"

    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:
            allOf:
              - $ref: '#/components/schemas/BaseResponse'
              - type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  message:
                    type: string
                    example: "Resource not found"

    Conflict:
      description: Conflict - resource already exists
      content:
        application/json:
          schema:
            allOf:
              - $ref: '#/components/schemas/BaseResponse'
              - type: object
                properties:
                  success:
                    type: boolean
                    example: false
                  message:
                    type: string
                    example: "Resource already exists"
```

## 9. Rate Limiting & Quotas

### 9.1 Rate Limiting Rules
```yaml
rateLimiting:
  authentication:
    - endpoint: "/auth/login"
      limit: 5
      window: "15 minutes"
      scope: "ip"
    - endpoint: "/auth/register"
      limit: 3
      window: "1 hour"
      scope: "ip"
  
  assessments:
    - endpoint: "/assessments/*"
      limit: 10
      window: "1 hour"
      scope: "user"
    
  reports:
    - endpoint: "/reports/*"
      limit: 5
      window: "1 hour"
      scope: "user"
  
  cv_analysis:
    - endpoint: "/cv/upload"
      limit: 3
      window: "1 hour"
      scope: "user"
```

## 10. Error Handling

### 10.1 Error Codes
```yaml
errorCodes:
  validation:
    INVALID_EMAIL_FORMAT: "Email format is invalid"
    PASSWORD_TOO_WEAK: "Password does not meet security requirements"
    INVALID_DATE_FORMAT: "Date format must be YYYY-MM-DD"
    CULTURAL_DATA_MISSING: "Vietnamese cultural context data is required"
  
  authentication:
    INVALID_CREDENTIALS: "Email or password is incorrect"
    TOKEN_EXPIRED: "Authentication token has expired"
    TOKEN_INVALID: "Authentication token is invalid"
    ACCOUNT_LOCKED: "Account has been temporarily locked"
  
  business:
    ASSESSMENT_ALREADY_COMPLETED: "Assessment has already been completed"
    INSUFFICIENT_DATA: "Insufficient data for cultural analysis"
    NUMEROLOGY_CALCULATION_ERROR: "Error calculating numerology profile"
    CV_ANALYSIS_FAILED: "Failed to analyze CV document"
```

---

**Document Control:**
- Author: API Architect
- Reviewer: Backend Lead, Security Architect
- Approved By: Technical Director
- Next Review: January 11, 2026
- Classification: INTERNAL USE