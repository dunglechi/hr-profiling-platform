# 🏗️ Technical Architecture - Simplified

## System Overview
```
User (Browser) 
    ↓ HTTPS
Frontend (React + Vite)  
    ↓ REST API  
Supabase (PostgreSQL + Auth + API)
    ↓ Real-time  
Dashboard (Live Updates)
```

## Tech Stack (Current)
- **Frontend**: React 18 + TypeScript + Material-UI + Vite
- **Backend**: Supabase (100% serverless)
  - PostgreSQL database with Row Level Security
  - Auto-generated REST API  
  - Real-time subscriptions
  - Built-in authentication
- **Deployment**: Vercel (auto-deploy from GitHub)
- **Domain**: https://hr-profiling-platform.vercel.app

## Key Design Decisions  
1. **Serverless First**: Zero infrastructure management
2. **API Contract**: OpenAPI spec as single source of truth
3. **Component Architecture**: Simple > Enhanced (eliminated complexity)
4. **Data Flow**: Unidirectional with Supabase real-time sync
5. **Environment**: Validated startup, graceful error handling

## API Endpoints (Supabase Auto-Generated)
```typescript
// Numerology
POST /rest/v1/numerology_results
GET  /rest/v1/numerology_results?user_name=eq.{name}

// Assessments  
POST /rest/v1/assessment_results
GET  /rest/v1/assessment_results?user_id=eq.{id}

// Real-time subscriptions
WS   /realtime/v1/websocket
```

## Database Schema
```sql
-- Core Tables
numerology_results (id, user_name, birth_date, calculation_data, created_at)
assessment_results (id, user_id, assessment_type, result_data, created_at)  
users (id, email, full_name, created_at)

-- Row Level Security enabled
-- Real-time triggers configured
```

## Development Workflow
1. **Code**: Local development with Vite HMR
2. **Commit**: Conventional commits + automated validation  
3. **Deploy**: Git push → GitHub → Vercel auto-deploy (2-3 min)
4. **Monitor**: Vercel analytics + Supabase dashboard

## Critical Dependencies
- `@supabase/supabase-js` - Database client
- `@mui/material` - UI components
- `react-router-dom` - Navigation  
- `vite` - Build tool

---
*Architecture Status: ✅ STABLE & PRODUCTION-READY*  
*Last Updated: October 14, 2025*