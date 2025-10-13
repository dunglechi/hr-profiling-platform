# SDLC 4.7 - OpenAPI Integration Guide
## Project: HR Profiling Platform - API Integration Implementation
### Document ID: API-INTEGRATION-001
### Version: 1.0.0
### Date: October 12, 2025
### Status: ACTIVE

---

## 1. OpenAPI Implementation Overview

### 1.1 OpenAPI 3.0 Configuration
```yaml
# swagger.config.js
const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'HR Profiling Platform API',
      version: '1.0.0',
      description: 'Comprehensive API for psychological profiling with Vietnamese cultural intelligence',
      termsOfService: 'https://hrprofiling.vn/terms',
      contact: {
        name: 'API Support Team',
        email: 'api-support@hrprofiling.vn',
        url: 'https://hrprofiling.vn/support'
      },
      license: {
        name: 'Proprietary',
        url: 'https://hrprofiling.vn/license'
      }
    },
    servers: [
      {
        url: 'https://api.hrprofiling.vn/v1',
        description: 'Production server'
      },
      {
        url: 'https://staging-api.hrprofiling.vn/v1',
        description: 'Staging server'
      },
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './models/*.js']
};
```

### 1.2 Express.js Integration
```javascript
// app.js
const express = require('express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const cors = require('cors');

const app = express();

// Swagger Documentation Setup
const specs = swaggerJSDoc(swaggerOptions);

// Swagger UI Options with Vietnamese Support
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'HR Profiling Platform API Documentation',
  customfavIcon: '/assets/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
    docExpansion: 'list',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2
  }
};

// API Documentation Route
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// API Documentation JSON
app.get('/api/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});
```

## 2. Route Documentation Examples

### 2.1 Authentication Routes
```javascript
// routes/auth.js
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "nguyen.van.a@company.com"
 *         password:
 *           type: string
 *           minLength: 8
 *           example: "SecurePass123!"
 *         rememberMe:
 *           type: boolean
 *           default: false
 *         culturalContext:
 *           type: string
 *           enum: ["vietnamese", "international"]
 *           default: "vietnamese"
 *     
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               $ref: '#/components/schemas/User'
 *             tokens:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 expiresIn:
 *                   type: integer
 *                   example: 3600
 *         message:
 *           type: string
 *           example: "Đăng nhập thành công"
 *         meta:
 *           $ref: '#/components/schemas/ResponseMeta'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Xác thực người dùng và trả về JWT token
 *     description: Endpoint để đăng nhập người dùng với hỗ trợ văn hóa Việt Nam
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             vietnameseUser:
 *               summary: Vietnamese user login
 *               value:
 *                 email: "nguyen.van.a@company.com"
 *                 password: "SecurePass123!"
 *                 culturalContext: "vietnamese"
 *             internationalUser:
 *               summary: International user login
 *               value:
 *                 email: "john.doe@company.com"
 *                 password: "SecurePass123!"
 *                 culturalContext: "international"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Thông tin đăng nhập không chính xác
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidCredentials:
 *                 summary: Invalid credentials
 *                 value:
 *                   success: false
 *                   message: "Email hoặc mật khẩu không chính xác"
 *                   errors: []
 *       429:
 *         description: Quá nhiều lần thử đăng nhập
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', validateLoginRequest, authController.login);
```

### 2.2 DISC Assessment Routes
```javascript
// routes/assessments/disc.js
/**
 * @swagger
 * components:
 *   schemas:
 *     DISCAssessmentConfig:
 *       type: object
 *       properties:
 *         timeLimit:
 *           type: integer
 *           description: "Thời gian giới hạn (phút)"
 *           default: 15
 *           minimum: 5
 *           maximum: 60
 *         questionOrder:
 *           type: string
 *           enum: ["sequential", "randomized"]
 *           default: "sequential"
 *           description: "Thứ tự câu hỏi"
 *         culturalDepth:
 *           type: string
 *           enum: ["basic", "detailed", "expert"]
 *           default: "detailed"
 *           description: "Mức độ phân tích văn hóa"
 *         adaptForVietnamese:
 *           type: boolean
 *           default: true
 *           description: "Điều chỉnh cho văn hóa Việt Nam"
 *     
 *     DISCQuestion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         questionNumber:
 *           type: integer
 *           example: 1
 *         statement:
 *           type: string
 *           example: "Tôi thường là người quyết đoán trong nhóm"
 *         options:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               text:
 *                 type: string
 *               value:
 *                 type: string
 *                 enum: ["D", "I", "S", "C"]
 *         culturalNote:
 *           type: string
 *           example: "Trong văn hóa Việt Nam, tính quyết đoán cần được cân bằng với tôn trọng ý kiến tập thể"
 *         required:
 *           type: boolean
 *           default: true
 */

/**
 * @swagger
 * /assessments/disc:
 *   post:
 *     summary: Tạo bài đánh giá DISC mới
 *     description: Tạo một bài đánh giá DISC với tùy chỉnh cho văn hóa Việt Nam
 *     tags: [Assessments, DISC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               culturalAdaptation:
 *                 type: boolean
 *                 default: true
 *                 description: "Điều chỉnh bài đánh giá cho văn hóa Việt Nam"
 *               assessmentConfig:
 *                 $ref: '#/components/schemas/DISCAssessmentConfig'
 *           examples:
 *             standard:
 *               summary: Standard Vietnamese DISC Assessment
 *               value:
 *                 userId: "123e4567-e89b-12d3-a456-426614174000"
 *                 culturalAdaptation: true
 *                 assessmentConfig:
 *                   timeLimit: 15
 *                   questionOrder: "sequential"
 *                   culturalDepth: "detailed"
 *             expert:
 *               summary: Expert Level Cultural Assessment
 *               value:
 *                 userId: "123e4567-e89b-12d3-a456-426614174000"
 *                 culturalAdaptation: true
 *                 assessmentConfig:
 *                   timeLimit: 25
 *                   questionOrder: "randomized"
 *                   culturalDepth: "expert"
 *     responses:
 *       201:
 *         description: Bài đánh giá DISC được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         assessmentId:
 *                           type: string
 *                           format: uuid
 *                         status:
 *                           type: string
 *                           enum: ["created", "ready"]
 *                         totalQuestions:
 *                           type: integer
 *                           example: 24
 *                         estimatedDuration:
 *                           type: integer
 *                           example: 15
 *                         culturalFeatures:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["vietnamese-context", "cultural-interpretation", "career-guidance"]
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.post('/', validateDISCCreation, discController.createAssessment);
```

### 2.3 Numerology Routes
```javascript
// routes/numerology.js
/**
 * @swagger
 * components:
 *   schemas:
 *     VietnameseName:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *       properties:
 *         firstName:
 *           type: string
 *           pattern: "^[a-zA-ZÀ-ỹ\\s]+$"
 *           example: "Văn"
 *           description: "Tên (có dấu tiếng Việt)"
 *         lastName:
 *           type: string
 *           pattern: "^[a-zA-ZÀ-ỹ\\s]+$"
 *           example: "Nguyễn"
 *           description: "Họ (có dấu tiếng Việt)"
 *         middleName:
 *           type: string
 *           pattern: "^[a-zA-ZÀ-ỹ\\s]*$"
 *           example: "A"
 *           description: "Tên đệm (tùy chọn)"
 *     
 *     NumerologyCalculationRequest:
 *       type: object
 *       required:
 *         - userId
 *         - birthDate
 *         - fullName
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         birthDate:
 *           type: string
 *           format: date
 *           example: "1990-05-15"
 *           description: "Ngày sinh (YYYY-MM-DD)"
 *         fullName:
 *           $ref: '#/components/schemas/VietnameseName'
 *         culturalDepth:
 *           type: string
 *           enum: ["basic", "detailed", "expert"]
 *           default: "detailed"
 *           description: "Mức độ phân tích văn hóa"
 *         includeCareerGuidance:
 *           type: boolean
 *           default: true
 *           description: "Bao gồm hướng dẫn nghề nghiệp"
 *         includeLuckyElements:
 *           type: boolean
 *           default: true
 *           description: "Bao gồm yếu tố may mắn (số, màu, hướng)"
 */

/**
 * @swagger
 * /numerology/calculate:
 *   post:
 *     summary: Tính toán hồ sơ thần số học toàn diện
 *     description: Tính toán và phân tích thần số học với bối cảnh văn hóa Việt Nam
 *     tags: [Numerology]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NumerologyCalculationRequest'
 *           examples:
 *             detailed:
 *               summary: Detailed Vietnamese Numerology Analysis
 *               value:
 *                 userId: "123e4567-e89b-12d3-a456-426614174000"
 *                 birthDate: "1990-05-15"
 *                 fullName:
 *                   firstName: "Văn"
 *                   lastName: "Nguyễn"
 *                   middleName: "A"
 *                 culturalDepth: "detailed"
 *                 includeCareerGuidance: true
 *                 includeLuckyElements: true
 *             expert:
 *               summary: Expert Level Cultural Analysis
 *               value:
 *                 userId: "123e4567-e89b-12d3-a456-426614174000"
 *                 birthDate: "1985-12-08"
 *                 fullName:
 *                   firstName: "Thị Minh"
 *                   lastName: "Trần"
 *                 culturalDepth: "expert"
 *                 includeCareerGuidance: true
 *                 includeLuckyElements: true
 *     responses:
 *       200:
 *         description: Hồ sơ thần số học được tính toán thành công
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/BaseResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         profile:
 *                           $ref: '#/components/schemas/NumerologyProfile'
 *                         culturalInsights:
 *                           type: object
 *                           properties:
 *                             vietnameseSignificance:
 *                               type: string
 *                               example: "Số đường đời 5 trong văn hóa Việt Nam thể hiện tính năng động và khả năng thích ứng cao"
 *                             traditionalBelief:
 *                               type: string
 *                               example: "Theo quan niệm truyền thống, con số này mang lại may mắn trong kinh doanh"
 *                             modernInterpretation:
 *                               type: string
 *                               example: "Phù hợp với môi trường làm việc đa quốc gia và công nghệ"
 *                         careerGuidance:
 *                           type: object
 *                           properties:
 *                             suitableFields:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["Kinh doanh quốc tế", "Công nghệ thông tin", "Du lịch"]
 *                             idealRoles:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["Project Manager", "Sales Director", "Marketing Manager"]
 *                             avoidableFields:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["Kế toán chi tiết", "Công việc lặp đi lặp lại"]
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidDate:
 *                 summary: Invalid birth date
 *                 value:
 *                   success: false
 *                   message: "Ngày sinh không hợp lệ"
 *                   errors:
 *                     - field: "birthDate"
 *                       message: "Định dạng ngày phải là YYYY-MM-DD"
 *                       code: "INVALID_DATE_FORMAT"
 *               invalidName:
 *                 summary: Invalid Vietnamese name
 *                 value:
 *                   success: false
 *                   message: "Tên không hợp lệ"
 *                   errors:
 *                     - field: "fullName.firstName"
 *                       message: "Tên chỉ được chứa ký tự tiếng Việt"
 *                       code: "INVALID_VIETNAMESE_NAME"
 */
router.post('/calculate', validateNumerologyRequest, numerologyController.calculateProfile);
```

## 3. Middleware Documentation

### 3.1 Authentication Middleware
```javascript
// middleware/auth.js
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: |
 *         JWT token để xác thực API. Token có thời hạn 1 giờ.
 *         
 *         Để sử dụng:
 *         1. Đăng nhập qua `/auth/login` để nhận token
 *         2. Thêm header: `Authorization: Bearer <your_token>`
 *         
 *         Token chứa thông tin:
 *         - User ID
 *         - Role và permissions
 *         - Cultural preferences
 *         - Expiration time
 */

/**
 * Middleware xác thực JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object  
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token xác thực là bắt buộc',
      errors: [],
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id,
        version: '1.0.0'
      }
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn',
        errors: [],
        meta: {
          timestamp: new Date().toISOString(),
          requestId: req.id,
          version: '1.0.0'
        }
      });
    }
    req.user = user;
    next();
  });
};
```

### 3.2 Cultural Context Middleware
```javascript
// middleware/cultural.js
/**
 * @swagger
 * components:
 *   parameters:
 *     CulturalContext:
 *       name: X-Cultural-Context
 *       in: header
 *       description: Bối cảnh văn hóa cho API response
 *       schema:
 *         type: string
 *         enum: ["vietnamese", "international"]
 *         default: "vietnamese"
 *       example: "vietnamese"
 *     
 *     Language:
 *       name: Accept-Language
 *       in: header
 *       description: Ngôn ngữ mong muốn cho response
 *       schema:
 *         type: string
 *         enum: ["vi", "en"]
 *         default: "vi"
 *       example: "vi"
 */

/**
 * Middleware xử lý bối cảnh văn hóa
 * Tự động điều chỉnh response theo văn hóa Việt Nam
 */
const culturalContext = (req, res, next) => {
  // Xác định bối cảnh văn hóa từ header hoặc user preferences
  const culturalContext = req.headers['x-cultural-context'] || 
    req.user?.culturalPreferences?.context || 'vietnamese';
  
  // Xác định ngôn ngữ
  const language = req.headers['accept-language']?.split(',')[0] || 
    req.user?.culturalPreferences?.language || 'vi';

  // Thêm thông tin văn hóa vào request
  req.cultural = {
    context: culturalContext,
    language: language,
    adaptForVietnamese: culturalContext === 'vietnamese',
    useTraditionalValues: req.user?.culturalPreferences?.useTraditionalValues || true
  };

  // Thêm văn hóa vào response meta
  const originalJson = res.json;
  res.json = function(data) {
    if (data && typeof data === 'object' && data.meta) {
      data.meta.culturalContext = culturalContext;
      data.meta.language = language;
    }
    return originalJson.call(this, data);
  };

  next();
};
```

## 4. Validation Schemas

### 4.1 Vietnamese-specific Validations
```javascript
// validators/vietnamese.js
/**
 * @swagger
 * components:
 *   schemas:
 *     VietnameseValidation:
 *       type: object
 *       description: Validation rules specific to Vietnamese culture and language
 *       properties:
 *         namePattern:
 *           type: string
 *           pattern: "^[a-zA-ZÀ-ỹ\\s]+$"
 *           description: "Pattern cho tên tiếng Việt có dấu"
 *         phonePattern:
 *           type: string
 *           pattern: "^(\\+84|0)[1-9][0-9]{8}$"
 *           description: "Pattern cho số điện thoại Việt Nam"
 *         idCardPattern:
 *           type: string
 *           pattern: "^[0-9]{9}|[0-9]{12}$"
 *           description: "Pattern cho CMND/CCCD Việt Nam"
 */

const Joi = require('joi');

// Custom validation cho tên tiếng Việt
const vietnameseNameValidator = Joi.string()
  .pattern(/^[a-zA-ZÀ-ỹ\s]+$/)
  .min(2)
  .max(50)
  .messages({
    'string.pattern.base': 'Tên chỉ được chứa ký tự tiếng Việt và khoảng trắng',
    'string.min': 'Tên phải có ít nhất 2 ký tự',
    'string.max': 'Tên không được quá 50 ký tự'
  });

// Validation cho ngày sinh (phù hợp với tuổi lao động Việt Nam)
const vietnameseBirthDateValidator = Joi.date()
  .min('1950-01-01')
  .max(new Date(Date.now() - 16 * 365 * 24 * 60 * 60 * 1000)) // Tối thiểu 16 tuổi
  .messages({
    'date.min': 'Ngày sinh không hợp lệ (quá xa trong quá khứ)',
    'date.max': 'Phải đủ 16 tuổi trở lên'
  });

// Schema validation cho numerology request
const numerologyRequestSchema = Joi.object({
  userId: Joi.string().uuid().required().messages({
    'string.uuid': 'User ID phải là UUID hợp lệ',
    'any.required': 'User ID là bắt buộc'
  }),
  birthDate: vietnameseBirthDateValidator.required(),
  fullName: Joi.object({
    firstName: vietnameseNameValidator.required(),
    lastName: vietnameseNameValidator.required(),
    middleName: vietnameseNameValidator.allow('', null)
  }).required(),
  culturalDepth: Joi.string().valid('basic', 'detailed', 'expert').default('detailed'),
  includeCareerGuidance: Joi.boolean().default(true),
  includeLuckyElements: Joi.boolean().default(true)
});
```

## 5. Error Handling Documentation

### 5.1 Standardized Error Responses
```javascript
// utils/errorHandler.js
/**
 * @swagger
 * components:
 *   schemas:
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *         - errors
 *         - meta
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Yêu cầu không hợp lệ"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "email"
 *               message:
 *                 type: string
 *                 example: "Email không đúng định dạng"
 *               code:
 *                 type: string
 *                 example: "INVALID_EMAIL_FORMAT"
 *               culturalNote:
 *                 type: string
 *                 example: "Trong văn hóa Việt Nam, email thường sử dụng tên không dấu"
 *         meta:
 *           $ref: '#/components/schemas/ResponseMeta'
 *     
 *     ResponseMeta:
 *       type: object
 *       properties:
 *         timestamp:
 *           type: string
 *           format: date-time
 *           example: "2025-10-12T10:30:00Z"
 *         requestId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         version:
 *           type: string
 *           example: "1.0.0"
 *         culturalContext:
 *           type: string
 *           enum: ["vietnamese", "international"]
 *           example: "vietnamese"
 *         language:
 *           type: string
 *           enum: ["vi", "en"]
 *           example: "vi"
 */

// Centralized error messages with Vietnamese localization
const errorMessages = {
  vi: {
    VALIDATION_ERROR: "Dữ liệu đầu vào không hợp lệ",
    AUTHENTICATION_REQUIRED: "Cần đăng nhập để truy cập",
    INSUFFICIENT_PERMISSIONS: "Không có quyền truy cập",
    RESOURCE_NOT_FOUND: "Không tìm thấy tài nguyên",
    INTERNAL_SERVER_ERROR: "Lỗi server nội bộ",
    RATE_LIMIT_EXCEEDED: "Đã vượt quá giới hạn số lần gọi API",
    CULTURAL_DATA_MISSING: "Thiếu dữ liệu văn hóa bắt buộc",
    NUMEROLOGY_CALCULATION_FAILED: "Không thể tính toán thần số học"
  },
  en: {
    VALIDATION_ERROR: "Invalid input data",
    AUTHENTICATION_REQUIRED: "Authentication required",
    INSUFFICIENT_PERMISSIONS: "Insufficient permissions",
    RESOURCE_NOT_FOUND: "Resource not found",
    INTERNAL_SERVER_ERROR: "Internal server error",
    RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
    CULTURAL_DATA_MISSING: "Required cultural data missing",
    NUMEROLOGY_CALCULATION_FAILED: "Failed to calculate numerology"
  }
};
```

## 6. Testing Documentation

### 6.1 API Testing Examples
```javascript
// tests/api/auth.test.js
/**
 * @swagger
 * components:
 *   examples:
 *     AuthTestCases:
 *       summary: Test cases for authentication endpoints
 *       description: |
 *         Các test case để kiểm tra authentication API:
 *         
 *         1. **Đăng nhập thành công với user Việt Nam**
 *         2. **Đăng nhập thất bại với thông tin sai**
 *         3. **Đăng ký user mới với tên tiếng Việt**
 *         4. **Validate cultural preferences**
 *         5. **Token refresh functionality**
 *       
 *       value:
 *         loginSuccess:
 *           endpoint: "POST /auth/login"
 *           payload:
 *             email: "nguyen.van.a@test.com"
 *             password: "TestPass123!"
 *             culturalContext: "vietnamese"
 *           expectedStatus: 200
 *           expectedData:
 *             user:
 *               culturalPreferences:
 *                 language: "vi"
 *                 numerologyEnabled: true
 */

describe('Authentication API', () => {
  describe('POST /auth/login', () => {
    test('should login Vietnamese user successfully', async () => {
      const loginData = {
        email: 'nguyen.van.a@test.com',
        password: 'TestPass123!',
        culturalContext: 'vietnamese'
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.culturalPreferences.language).toBe('vi');
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.meta.culturalContext).toBe('vietnamese');
    });

    test('should handle Vietnamese cultural validation', async () => {
      const registerData = {
        email: 'trần.thị.b@test.com',
        password: 'TestPass123!',
        fullName: {
          firstName: 'Thị B',
          lastName: 'Trần'
        },
        culturalPreferences: {
          language: 'vi',
          numerologyEnabled: true,
          culturalDepth: 'detailed'
        }
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body.data.user.fullName.firstName).toBe('Thị B');
      expect(response.body.data.user.culturalPreferences.numerologyEnabled).toBe(true);
    });
  });
});
```

---

**Document Control:**
- Author: API Integration Specialist
- Reviewer: Backend Lead, DevOps Engineer
- Approved By: Technical Architect
- Next Review: January 12, 2026
- Classification: INTERNAL USE