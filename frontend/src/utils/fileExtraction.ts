/**
 * File text extraction utilities for CV analysis
 * Supports PDF, DOCX, DOC, and TXT files
 */

// Mock PDF text extraction (in production, would use PDF.js)
export const extractPDFText = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    // Simulate PDF text extraction
    setTimeout(() => {
      const mockText = `
NGUYEN VAN AN
Software Developer
+84 123 456 789 | nguyen.an@email.com | Ho Chi Minh City

PROFESSIONAL SUMMARY
Experienced Full-Stack Developer with 5+ years of expertise in React, Node.js, and PostgreSQL. 
Proven track record of leading development teams and delivering scalable web applications.

WORK EXPERIENCE

Senior Software Developer | Tech Solutions Co.
March 2021 - Present (4 years)
• Led a team of 5 developers in building enterprise web applications
• Implemented CI/CD pipelines reducing deployment time by 60%
• Developed microservices architecture serving 100k+ daily users
• Technologies: React, TypeScript, Node.js, PostgreSQL, AWS, Docker

Software Developer | Innovation Startup
June 2019 - February 2021 (1 year 8 months)
• Built responsive web applications using React and Material-UI
• Developed RESTful APIs with Node.js and Express
• Collaborated with cross-functional teams using Agile methodology
• Technologies: JavaScript, Python, Django, MySQL

Junior Developer | Digital Agency
January 2018 - May 2019 (1 year 4 months)
• Created client websites using HTML, CSS, JavaScript
• Maintained WordPress sites and custom PHP applications
• Provided technical support and bug fixes
• Technologies: HTML5, CSS3, JavaScript, PHP, WordPress

EDUCATION

Bachelor of Computer Science
Ho Chi Minh City University of Technology
2014 - 2018
GPA: 3.7/4.0

CERTIFICATIONS
• AWS Certified Developer Associate (2023)
• Scrum Master Certified (2022)
• Google Analytics Certified (2021)

TECHNICAL SKILLS
Programming Languages: JavaScript, TypeScript, Python, PHP, SQL
Frontend: React, Vue.js, HTML5, CSS3, Material-UI, Bootstrap
Backend: Node.js, Express, Django, FastAPI
Databases: PostgreSQL, MySQL, MongoDB, Redis
Cloud & DevOps: AWS, Docker, Jenkins, Git, CI/CD
Tools: VS Code, Postman, Figma, Jira, Slack

SOFT SKILLS
• Team Leadership
• Project Management
• Problem Solving
• Communication
• Adaptability
• Time Management

PROJECTS

HR Profiling Platform (2023)
• Built comprehensive assessment platform with React and Supabase
• Implemented MBTI, DISC, and Numerology assessment tools
• Integrated AI-powered CV analysis using OpenAI API
• Tech Stack: React, TypeScript, Supabase, Material-UI

E-commerce Platform (2022)
• Developed full-stack e-commerce solution
• Implemented payment integration and inventory management
• Served 10k+ users with 99.9% uptime
• Tech Stack: React, Node.js, PostgreSQL, Stripe API

LANGUAGES
• Vietnamese: Native
• English: Professional Working Proficiency
• Mandarin: Basic Conversational

ACHIEVEMENTS
• Employee of the Year 2023 at Tech Solutions Co.
• Led team that won "Best Innovation" award at company hackathon
• Contributed to 3 open-source projects with 500+ GitHub stars
• Mentored 8 junior developers throughout career
      `.trim();
      
      resolve(mockText);
    }, 1000);
  });
};

// Mock DOCX text extraction (in production, would use mammoth.js)
export const extractDOCXText = async (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      // For demo purposes, return mock text
      // In production, use mammoth.js to extract from DOCX
      const mockText = `
TRAN THI MINH
Product Manager
+84 987 654 321 | tran.minh@email.com | Hanoi, Vietnam

PROFESSIONAL SUMMARY
Strategic Product Manager with 6+ years of experience driving product development 
from conception to launch. Expert in user research, data analysis, and cross-functional 
team leadership. Proven track record of launching successful products that increased 
revenue by 40%+ and user engagement by 60%+.

WORK EXPERIENCE

Senior Product Manager | FinTech Startup
April 2022 - Present (2 years 8 months)
• Led product strategy for mobile banking app with 500k+ active users
• Increased user retention by 45% through data-driven feature optimization
• Managed product roadmap and coordinated releases across iOS, Android, and Web
• Collaborated with engineering, design, and marketing teams
• Key Achievements: Launched payment feature that generated $2M+ monthly GMV

Product Manager | E-commerce Platform
September 2019 - March 2022 (2 years 6 months)
• Owned checkout and payment experience for platform processing $50M+ annually
• Reduced cart abandonment by 25% through UX improvements
• Conducted user research and A/B testing to optimize conversion rates
• Worked closely with engineering team using Agile/Scrum methodology
• Technologies: Mixpanel, Amplitude, Figma, Jira, Confluence

Associate Product Manager | Tech Consulting
June 2018 - August 2019 (1 year 2 months)
• Supported 3 product managers in managing client projects
• Conducted market research and competitive analysis
• Created product requirement documents and user stories
• Assisted in client presentations and stakeholder meetings

EDUCATION

Master of Business Administration (MBA)
Foreign Trade University, Hanoi
2016 - 2018
Concentration: Digital Marketing and Innovation

Bachelor of Economics
National Economics University
2012 - 2016
Magna Cum Laude, GPA: 3.8/4.0

CERTIFICATIONS
• Certified Scrum Product Owner (CSPO) - 2023
• Google Analytics Individual Qualification - 2022
• Product Management Certificate - Stanford Continuing Studies - 2021
• Digital Marketing Certificate - Google - 2020

CORE COMPETENCIES

Product Strategy & Vision
• Product roadmap development
• Market research and analysis
• Competitive intelligence
• Product positioning

User Experience & Research
• User interviews and surveys
• A/B testing and experimentation
• Data analysis and insights
• User journey mapping

Technical Collaboration
• Agile/Scrum methodology
• API and technical requirement definition
• Cross-platform development coordination
• SQL for data analysis

Leadership & Communication
• Cross-functional team leadership
• Stakeholder management
• Presentation and public speaking
• Conflict resolution

TECHNICAL SKILLS
Analytics Tools: Google Analytics, Mixpanel, Amplitude, Hotjar
Design Tools: Figma, Sketch, Adobe Creative Suite
Project Management: Jira, Asana, Trello, Notion
Data Analysis: SQL, Excel, Tableau, Python (basic)
Prototyping: Figma, InVision, Marvel

ACHIEVEMENTS
• Launched 5 major product features that collectively increased revenue by $3M+
• Led team that won "Innovation Award" at company annual conference
• Increased product adoption rate from 15% to 67% over 18 months
• Successfully managed $5M+ annual product budget
• Mentored 6 junior product managers and analysts

LANGUAGES
• Vietnamese: Native
• English: Fluent (IELTS 7.5)
• Japanese: Intermediate (JLPT N3)

INTERESTS
• Technology trends and innovation
• UX/UI design
• Travel and cultural exploration
• Photography
• Volunteer work with local startups
      `.trim();
      
      resolve(mockText);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Plain text file extraction
export const extractTextFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      resolve(text);
    };
    
    reader.onerror = () => reject(new Error('Failed to read text file'));
    reader.readAsText(file);
  });
};

// Main file text extraction function
export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  
  try {
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return await extractPDFText(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      return await extractDOCXText(file);
    } else if (fileType === 'application/msword' || fileName.endsWith('.doc')) {
      return await extractDOCXText(file); // Use same handler for .doc files
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await extractTextFile(file);
    } else {
      throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error('Không thể trích xuất văn bản từ file. Vui lòng thử file khác.');
  }
};

// Validate file before processing
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain'
  ];
  
  const supportedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
  const fileName = file.name.toLowerCase();
  const hasValidExtension = supportedExtensions.some(ext => fileName.endsWith(ext));
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File quá lớn. Vui lòng chọn file nhỏ hơn 10MB.' };
  }
  
  if (!supportedTypes.includes(file.type) && !hasValidExtension) {
    return { valid: false, error: 'Định dạng file không được hỗ trợ. Chỉ chấp nhận PDF, DOCX, DOC, TXT.' };
  }
  
  return { valid: true };
};

export default {
  extractTextFromFile,
  validateFile,
  extractPDFText,
  extractDOCXText,
  extractTextFile
};