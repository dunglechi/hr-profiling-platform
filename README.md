---
SDLC_VERSION: "4.7.0"
DOCUMENT_TYPE: "Business"
COMPONENT: "HR-Platform"
STATUS: "ACTIVE"
AUTHORITY: "CTO Approved"
LAST_UPDATED: "2025-10-11"
---

# HR Profiling & Assessment Platform

A comprehensive full-stack web application for HR personnel profiling and assessment using multiple scientific methodologies including DISC assessment, MBTI personality testing, modern numerology analysis, and AI-powered CV analysis.

## 🚀 Features

### Core Assessment Methods
- **DISC Analysis** - Behavioral style assessment (Dominance, Influence, Steadiness, Conscientiousness)
- **MBTI Testing** - 16 personality types evaluation (Myers-Briggs Type Indicator)
- **Modern Numerology** - Life path and destiny number analysis
- **AI-Powered CV Analysis** - Intelligent parsing and behavioral indicator extraction

### Platform Capabilities
- **Job Matching Algorithm** - Multi-factor scoring system (0-100 scale)
- **Admin Dashboard** - Comprehensive management interface
- **Candidate Portal** - User-friendly assessment interface
- **Reporting System** - Detailed analytics and visualizations
- **Behavioral Compatibility Analysis** - Job fit assessment
- **Skills Gap Identification** - Performance optimization insights

## 🏗️ Technical Architecture

### Backend
- **Framework**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcrypt
- **File Processing**: Multer for CV uploads
- **AI Integration**: OpenAI API for intelligent analysis

### Frontend
- **Framework**: React.js + TypeScript
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router
- **State Management**: React Hooks
- **Build Tool**: Vite

### Database Schema
```sql
-- Core entities
Users (authentication & roles)
Candidates (personal profiles)
JobPositions (role requirements)
Assessments (evaluation sessions)

-- Test results
DISCResults (behavioral analysis)
MBTIResults (personality types)
NumerologyResults (numerological analysis)
CVAnalysis (AI-powered insights)
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v13 or higher)
- npm or yarn package manager

### Quick Start

1. **Clone and Install Dependencies**
   ```bash
   git clone <repository-url>
   cd hr-profiling-platform
   npm run install:all
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb hr_profiling_db
   
   # Configure environment variables
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials
   
   # Initialize database schema
   cd backend
   npx prisma db push
   npx prisma generate
   ```

3. **Environment Configuration**
   
   Create `backend/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/hr_profiling_db"
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"
   OPENAI_API_KEY="your-openai-api-key"
   PORT=5000
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:3000"
   ```

4. **Start Development Servers**
   ```bash
   # Start both frontend and backend concurrently
   npm run dev
   
   # Or start individually:
   # Backend: npm run dev:backend
   # Frontend: npm run dev:frontend
   ```

5. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/health

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Candidates
- `GET /api/candidates` - List all candidates
- `GET /api/candidates/:id` - Get candidate profile
- `PUT /api/candidates/:id` - Update candidate

### Assessments
- `GET /api/assessments` - List assessments
- `POST /api/assessments` - Create new assessment
- `GET /api/assessments/:id` - Get assessment details
- `POST /api/assessments/:id/disc` - Submit DISC results
- `POST /api/assessments/:id/mbti` - Submit MBTI results

### Job Positions
- `GET /api/job-positions` - List job positions
- `POST /api/job-positions` - Create job position
- `GET /api/job-positions/:id` - Get job position
- `PUT /api/job-positions/:id` - Update job position

## 🔍 Assessment Workflow

1. **Registration**: Candidate creates account with personal details
2. **Assessment Creation**: HR manager assigns candidate to job position
3. **DISC Test**: Behavioral style assessment (15-20 minutes)
4. **MBTI Evaluation**: Personality type identification (20-25 minutes)
5. **Numerology Analysis**: Birth date-based calculations (automatic)
6. **CV Upload**: AI-powered document analysis
7. **Score Calculation**: Multi-factor algorithm generates job fit score
8. **Report Generation**: Comprehensive assessment report

## 🎯 Scoring Algorithm

The platform uses a weighted scoring system combining:
- **DISC Compatibility** (25%)
- **MBTI Job Fit** (25%)
- **Numerology Alignment** (15%)
- **CV Skills Match** (25%)
- **Experience Level** (10%)

Final score: 0-100 scale with recommendations.

## 📈 Future Enhancements

- [ ] Video interview analysis
- [ ] Team compatibility assessment
- [ ] Predictive performance modeling
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Advanced reporting dashboards
- [ ] Integration with popular ATS systems

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions, issues, or feature requests:
- Create an issue on GitHub
- Contact the development team
- Check documentation wiki

---

**Built with ❤️ for modern HR teams**