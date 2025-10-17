// frontend/src/types/cv.ts

export interface CVData {
    candidateId: string;
    name: string;
    email: string;
    phone: string;
    linkedin?: string;
    sourceFile: string;
    aiUsed: boolean;
    summary: string;
    experience: Array<{
      title: string;
      company: string;
      duration: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
    }>;
    skills: string[];
    warnings?: string[];
  }
  