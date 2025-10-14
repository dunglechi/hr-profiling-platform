/**
 * Job Matching Service - Thuật toán ghép job thông minh
 * Tích hợp tất cả kết quả đánh giá (MBTI, DISC, Numerology, CV) để đưa ra khuyến nghị việc làm tối ưu
 */

import { userService, AssessmentHistory } from './userService';

export interface JobPosition {
  id: string;
  title: string;
  company: string;
  department: string;
  level: 'entry' | 'junior' | 'senior' | 'lead' | 'manager' | 'director' | 'executive';
  location: string;
  salary_range: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: {
    technical_skills: string[];
    soft_skills: string[];
    experience_years: number;
    education_level: string;
    certifications?: string[];
  };
  ideal_personality: {
    mbti_types: string[];
    disc_profile: {
      d: number; // Dominance (0-100)
      i: number; // Influence (0-100)  
      s: number; // Steadiness (0-100)
      c: number; // Conscientiousness (0-100)
    };
    numerology_traits: string[];
  };
  work_environment: {
    team_size: string;
    remote_friendly: boolean;
    travel_required: boolean;
    stress_level: 'low' | 'medium' | 'high';
    innovation_level: 'low' | 'medium' | 'high';
  };
  growth_opportunities: string[];
  posted_date: string;
  application_deadline?: string;
  status: 'active' | 'inactive' | 'filled';
}

export interface MatchScore {
  overall_score: number; // 0-100
  breakdown: {
    personality_fit: number; // MBTI + DISC compatibility
    skills_match: number; // Technical + Soft skills alignment  
    experience_fit: number; // Years and level compatibility
    cultural_fit: number; // Work environment + growth alignment
    numerology_harmony: number; // Life path compatibility
  };
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  confidence_level: number; // 0-100
}

export interface JobMatch {
  job: JobPosition;
  match_score: MatchScore;
  application_tips: string[];
  interview_preparation: string[];
  salary_negotiation_points: string[];
}

class JobMatchingService {
  // Mock job database - in production would come from API/database
  private mockJobs: JobPosition[] = [
    {
      id: 'job-001',
      title: 'Senior Full-Stack Developer',
      company: 'TechViet Solutions',
      department: 'Engineering',
      level: 'senior',
      location: 'Ho Chi Minh City',
      salary_range: {
        min: 25000000,
        max: 45000000,
        currency: 'VND'
      },
      description: 'Phát triển ứng dụng web full-stack với React và Node.js. Làm việc trong môi trường Agile, xây dựng các tính năng mới và tối ưu hóa hiệu suất.',
      requirements: {
        technical_skills: ['JavaScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
        soft_skills: ['Team Collaboration', 'Problem Solving', 'Communication', 'Adaptability'],
        experience_years: 4,
        education_level: 'Bachelor',
        certifications: ['AWS Certified Developer']
      },
      ideal_personality: {
        mbti_types: ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
        disc_profile: {
          d: 65,
          i: 45,
          s: 40,
          c: 75
        },
        numerology_traits: ['Analytical', 'Innovative', 'Systematic']
      },
      work_environment: {
        team_size: '5-8 người',
        remote_friendly: true,
        travel_required: false,
        stress_level: 'medium',
        innovation_level: 'high'
      },
      growth_opportunities: ['Tech Lead', 'Solution Architect', 'Engineering Manager'],
      posted_date: '2025-10-01',
      application_deadline: '2025-11-15',
      status: 'active'
    },
    {
      id: 'job-002', 
      title: 'Product Manager',
      company: 'InnovateLab',
      department: 'Product',
      level: 'senior',
      location: 'Hanoi',
      salary_range: {
        min: 30000000,
        max: 50000000,
        currency: 'VND'
      },
      description: 'Quản lý roadmap sản phẩm, làm việc với cross-functional teams, phân tích user feedback và market trends.',
      requirements: {
        technical_skills: ['Product Strategy', 'Data Analysis', 'User Research', 'Agile', 'Figma'],
        soft_skills: ['Leadership', 'Strategic Thinking', 'Communication', 'Stakeholder Management'],
        experience_years: 5,
        education_level: 'Bachelor',
        certifications: ['Certified Scrum Product Owner']
      },
      ideal_personality: {
        mbti_types: ['ENTJ', 'ENFJ', 'ESTJ', 'ENFP'],
        disc_profile: {
          d: 75,
          i: 80,
          s: 30,
          c: 50
        },
        numerology_traits: ['Leadership', 'Strategic', 'Communicative']
      },
      work_environment: {
        team_size: '10-15 người',
        remote_friendly: true,
        travel_required: false,
        stress_level: 'high',
        innovation_level: 'high'
      },
      growth_opportunities: ['Senior Product Manager', 'VP Product', 'CPO'],
      posted_date: '2025-09-28',
      application_deadline: '2025-11-30',
      status: 'active'
    },
    {
      id: 'job-003',
      title: 'Data Scientist',
      company: 'AI Analytics Corp',
      department: 'Data Science',
      level: 'junior',
      location: 'Remote',
      salary_range: {
        min: 20000000,
        max: 35000000,
        currency: 'VND'
      },
      description: 'Phân tích dữ liệu lớn, xây dựng machine learning models, tạo insights cho business decisions.',
      requirements: {
        technical_skills: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'Scikit-learn', 'Tableau'],
        soft_skills: ['Analytical Thinking', 'Attention to Detail', 'Communication', 'Curiosity'],
        experience_years: 2,
        education_level: 'Bachelor',
        certifications: ['Google Analytics', 'AWS Machine Learning']
      },
      ideal_personality: {
        mbti_types: ['INTJ', 'INTP', 'ISTJ', 'ISTP'],
        disc_profile: {
          d: 40,
          i: 25,
          s: 60,
          c: 90
        },
        numerology_traits: ['Analytical', 'Detail-oriented', 'Methodical']
      },
      work_environment: {
        team_size: '3-5 người',
        remote_friendly: true,
        travel_required: false,
        stress_level: 'medium',
        innovation_level: 'high'
      },
      growth_opportunities: ['Senior Data Scientist', 'ML Engineer', 'Data Science Manager'],
      posted_date: '2025-10-05',
      application_deadline: '2025-12-01',
      status: 'active'
    },
    {
      id: 'job-004',
      title: 'Marketing Manager',
      company: 'Creative Agency Plus',
      department: 'Marketing',
      level: 'manager',
      location: 'Ho Chi Minh City',
      salary_range: {
        min: 28000000,
        max: 42000000,
        currency: 'VND'
      },
      description: 'Phát triển và thực hiện chiến lược marketing, quản lý team, campaign management và brand building.',
      requirements: {
        technical_skills: ['Digital Marketing', 'Google Ads', 'Facebook Ads', 'Analytics', 'Content Strategy'],
        soft_skills: ['Creativity', 'Leadership', 'Communication', 'Strategic Thinking'],
        experience_years: 4,
        education_level: 'Bachelor',
        certifications: ['Google Ads Certified', 'Facebook Blueprint']
      },
      ideal_personality: {
        mbti_types: ['ENFP', 'ENFJ', 'ESFP', 'ESFJ'],
        disc_profile: {
          d: 60,
          i: 85,
          s: 45,
          c: 40
        },
        numerology_traits: ['Creative', 'Influential', 'Expressive']
      },
      work_environment: {
        team_size: '6-10 người',
        remote_friendly: false,
        travel_required: true,
        stress_level: 'high',
        innovation_level: 'high'
      },
      growth_opportunities: ['Senior Marketing Manager', 'Marketing Director', 'CMO'],
      posted_date: '2025-10-03',
      application_deadline: '2025-11-20',
      status: 'active'
    },
    {
      id: 'job-005',
      title: 'DevOps Engineer',
      company: 'CloudTech Systems',
      department: 'Infrastructure',
      level: 'senior',
      location: 'Remote',
      salary_range: {
        min: 30000000,
        max: 55000000,
        currency: 'VND'
      },
      description: 'Quản lý infrastructure, CI/CD pipelines, monitoring systems và cloud deployment.',
      requirements: {
        technical_skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'Monitoring'],
        soft_skills: ['Problem Solving', 'Attention to Detail', 'Team Collaboration', 'Continuous Learning'],
        experience_years: 5,
        education_level: 'Bachelor',
        certifications: ['AWS Solutions Architect', 'Kubernetes Administrator']
      },
      ideal_personality: {
        mbti_types: ['ISTJ', 'INTJ', 'ISTP', 'ESTJ'],
        disc_profile: {
          d: 50,
          i: 30,
          s: 70,
          c: 85
        },
        numerology_traits: ['Systematic', 'Reliable', 'Technical']
      },
      work_environment: {
        team_size: '4-6 người',
        remote_friendly: true,
        travel_required: false,
        stress_level: 'high',
        innovation_level: 'medium'
      },
      growth_opportunities: ['Senior DevOps Engineer', 'Platform Engineer', 'Infrastructure Architect'],
      posted_date: '2025-09-30',
      application_deadline: '2025-11-25',
      status: 'active'
    }
  ];

  // Calculate personality compatibility based on MBTI
  private calculateMBTICompatibility(userMBTI: string, idealTypes: string[]): number {
    if (!userMBTI || idealTypes.length === 0) return 50;

    // Direct match gives highest score
    if (idealTypes.includes(userMBTI)) {
      return 95;
    }

    // Check cognitive function compatibility
    const userFunctions = this.getMBTICognitiveFunctions(userMBTI);
    let maxCompatibility = 0;

    for (const idealType of idealTypes) {
      const idealFunctions = this.getMBTICognitiveFunctions(idealType);
      const compatibility = this.calculateCognitiveFunctionSimilarity(userFunctions, idealFunctions);
      maxCompatibility = Math.max(maxCompatibility, compatibility);
    }

    return maxCompatibility;
  }

  private getMBTICognitiveFunctions(type: string): string[] {
    const functionMap: { [key: string]: string[] } = {
      'INTJ': ['Ni', 'Te', 'Fi', 'Se'],
      'INTP': ['Ti', 'Ne', 'Si', 'Fe'],
      'ENTJ': ['Te', 'Ni', 'Se', 'Fi'],
      'ENTP': ['Ne', 'Ti', 'Fe', 'Si'],
      'INFJ': ['Ni', 'Fe', 'Ti', 'Se'],
      'INFP': ['Fi', 'Ne', 'Si', 'Te'],
      'ENFJ': ['Fe', 'Ni', 'Se', 'Ti'],
      'ENFP': ['Ne', 'Fi', 'Te', 'Si'],
      'ISTJ': ['Si', 'Te', 'Fi', 'Ne'],
      'ISFJ': ['Si', 'Fe', 'Ti', 'Ne'],
      'ESTJ': ['Te', 'Si', 'Ne', 'Fi'],
      'ESFJ': ['Fe', 'Si', 'Ne', 'Ti'],
      'ISTP': ['Ti', 'Se', 'Ni', 'Fe'],
      'ISFP': ['Fi', 'Se', 'Ni', 'Te'],
      'ESTP': ['Se', 'Ti', 'Fe', 'Ni'],
      'ESFP': ['Se', 'Fi', 'Te', 'Ni']
    };
    return functionMap[type] || [];
  }

  private calculateCognitiveFunctionSimilarity(functions1: string[], functions2: string[]): number {
    if (functions1.length === 0 || functions2.length === 0) return 50;

    let sharedFunctions = 0;
    let positionScore = 0;

    for (let i = 0; i < Math.min(functions1.length, functions2.length); i++) {
      if (functions1[i] === functions2[i]) {
        positionScore += (4 - i) * 20; // Dom=80, Aux=60, Ter=40, Inf=20
      } else if (functions2.includes(functions1[i])) {
        sharedFunctions += 1;
      }
    }

    return Math.min(95, positionScore + (sharedFunctions * 10));
  }

  // Calculate DISC profile compatibility
  private calculateDISCCompatibility(userDISC: any, idealDISC: any): number {
    if (!userDISC || !idealDISC) return 50;

    const userProfile = {
      d: userDISC.dominance || 50,
      i: userDISC.influence || 50, 
      s: userDISC.steadiness || 50,
      c: userDISC.conscientiousness || 50
    };

    // Calculate distance between profiles
    const distance = Math.sqrt(
      Math.pow(userProfile.d - idealDISC.d, 2) +
      Math.pow(userProfile.i - idealDISC.i, 2) +
      Math.pow(userProfile.s - idealDISC.s, 2) +
      Math.pow(userProfile.c - idealDISC.c, 2)
    );

    // Convert distance to compatibility score (max distance = 200, so invert)
    const maxDistance = 200;
    const compatibility = Math.max(0, 100 - (distance / maxDistance * 100));
    
    return Math.round(compatibility);
  }

  // Calculate skills match percentage
  private calculateSkillsMatch(userSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 100;
    if (userSkills.length === 0) return 0;

    // Normalize skills for comparison (lowercase, remove spaces)
    const normalizeSkill = (skill: string) => skill.toLowerCase().replace(/\s+/g, '');
    const normalizedUserSkills = userSkills.map(normalizeSkill);
    const normalizedRequiredSkills = requiredSkills.map(normalizeSkill);

    let matchedSkills = 0;
    for (const requiredSkill of normalizedRequiredSkills) {
      if (normalizedUserSkills.includes(requiredSkill)) {
        matchedSkills++;
      } else {
        // Check for partial matches (e.g., "JavaScript" matches "JS")
        const partialMatch = normalizedUserSkills.some(userSkill => 
          userSkill.includes(requiredSkill) || requiredSkill.includes(userSkill)
        );
        if (partialMatch) {
          matchedSkills += 0.7; // Partial match counts as 70%
        }
      }
    }

    return Math.round((matchedSkills / normalizedRequiredSkills.length) * 100);
  }

  // Calculate experience level fit
  private calculateExperienceFit(userYears: number, requiredYears: number, jobLevel: string): number {
    if (requiredYears === 0) return 100;

    // Experience level multipliers
    const levelMultipliers: { [key: string]: number } = {
      'entry': 0.8,
      'junior': 1.0,
      'senior': 1.2,
      'lead': 1.4,
      'manager': 1.5,
      'director': 1.8,
      'executive': 2.0
    };

    const adjustedRequired = requiredYears * (levelMultipliers[jobLevel] || 1.0);
    
    if (userYears >= adjustedRequired) {
      // Over-qualified penalty (slight)
      const overQualified = userYears - adjustedRequired;
      return Math.max(75, 100 - (overQualified * 2));
    } else {
      // Under-qualified penalty
      const experienceRatio = userYears / adjustedRequired;
      return Math.round(experienceRatio * 100);
    }
  }

  // Calculate numerology compatibility
  private calculateNumerologyHarmony(userTraits: string[], idealTraits: string[]): number {
    if (idealTraits.length === 0) return 100;
    if (userTraits.length === 0) return 50;

    const matchedTraits = userTraits.filter(trait => 
      idealTraits.some(ideal => 
        trait.toLowerCase().includes(ideal.toLowerCase()) ||
        ideal.toLowerCase().includes(trait.toLowerCase())
      )
    );

    return Math.round((matchedTraits.length / idealTraits.length) * 100);
  }

  // Main job matching algorithm
  async findJobMatches(userId: string, limit: number = 10): Promise<JobMatch[]> {
    try {
      // Get all user assessment data
      const assessmentHistory = await userService.getUserAssessmentHistory(userId);
      
      // Extract latest results for each assessment type
      const latestMBTI = assessmentHistory
        .filter(a => a.assessment_type === 'mbti')
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];
        
      const latestDISC = assessmentHistory
        .filter(a => a.assessment_type === 'disc')
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];
        
      const latestNumerology = assessmentHistory
        .filter(a => a.assessment_type === 'numerology')
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];
        
      const latestCV = assessmentHistory
        .filter(a => a.assessment_type === 'cv_analysis')
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())[0];

      // Calculate matches for each job
      const jobMatches: JobMatch[] = [];
      
      for (const job of this.mockJobs.filter(j => j.status === 'active')) {
        const matchScore = this.calculateJobMatch(job, {
          mbti: latestMBTI?.results,
          disc: latestDISC?.results,
          numerology: latestNumerology?.results,
          cv: latestCV?.results
        });

        const match: JobMatch = {
          job,
          match_score: matchScore,
          application_tips: this.generateApplicationTips(job, matchScore),
          interview_preparation: this.generateInterviewTips(job, matchScore),
          salary_negotiation_points: this.generateSalaryTips(job, matchScore)
        };

        jobMatches.push(match);
      }

      // Sort by overall match score and return top matches
      return jobMatches
        .sort((a, b) => b.match_score.overall_score - a.match_score.overall_score)
        .slice(0, limit);

    } catch (error) {
      console.error('Lỗi tìm job matches:', error);
      return [];
    }
  }

  private calculateJobMatch(job: JobPosition, assessments: any): MatchScore {
    // Calculate individual compatibility scores
    const personalityFit = this.calculatePersonalityCompatibility(job, assessments);
    const skillsMatch = this.calculateSkillsCompatibility(job, assessments);
    const experienceFit = this.calculateExperienceCompatibility(job, assessments);
    const culturalFit = this.calculateCulturalCompatibility(job, assessments);
    const numerologyHarmony = this.calculateNumerologyCompatibility(job, assessments);

    // Weighted overall score
    const weights = {
      personality: 0.25,
      skills: 0.30,
      experience: 0.20,
      cultural: 0.15,
      numerology: 0.10
    };

    const overallScore = Math.round(
      personalityFit * weights.personality +
      skillsMatch * weights.skills +
      experienceFit * weights.experience +
      culturalFit * weights.cultural +
      numerologyHarmony * weights.numerology
    );

    // Generate insights
    const { strengths, concerns, recommendations } = this.generateMatchInsights(
      job, assessments, {
        personality: personalityFit,
        skills: skillsMatch,
        experience: experienceFit,
        cultural: culturalFit,
        numerology: numerologyHarmony
      }
    );

    // Calculate confidence level based on assessment completeness
    const assessmentCount = Object.values(assessments).filter(a => a).length;
    const confidenceLevel = Math.min(100, (assessmentCount / 4) * 100 + 20);

    return {
      overall_score: overallScore,
      breakdown: {
        personality_fit: personalityFit,
        skills_match: skillsMatch,
        experience_fit: experienceFit,
        cultural_fit: culturalFit,
        numerology_harmony: numerologyHarmony
      },
      strengths,
      concerns,
      recommendations,
      confidence_level: confidenceLevel
    };
  }

  private calculatePersonalityCompatibility(job: JobPosition, assessments: any): number {
    let totalScore = 0;
    let factors = 0;

    // MBTI compatibility
    if (assessments.mbti?.personality_type) {
      const mbtiScore = this.calculateMBTICompatibility(
        assessments.mbti.personality_type,
        job.ideal_personality.mbti_types
      );
      totalScore += mbtiScore * 0.6; // 60% weight for MBTI
      factors += 0.6;
    }

    // DISC compatibility  
    if (assessments.disc) {
      const discScore = this.calculateDISCCompatibility(
        assessments.disc,
        job.ideal_personality.disc_profile
      );
      totalScore += discScore * 0.4; // 40% weight for DISC
      factors += 0.4;
    }

    return factors > 0 ? Math.round(totalScore / factors) : 50;
  }

  private calculateSkillsCompatibility(job: JobPosition, assessments: any): number {
    if (!assessments.cv?.skills) return 40; // No CV data available

    const userTechnicalSkills = assessments.cv.skills.technical?.map((s: any) => s.skill) || [];
    const userSoftSkills = assessments.cv.skills.soft?.map((s: any) => s.skill) || [];

    const technicalMatch = this.calculateSkillsMatch(userTechnicalSkills, job.requirements.technical_skills);
    const softSkillsMatch = this.calculateSkillsMatch(userSoftSkills, job.requirements.soft_skills);

    // Weight technical skills more heavily
    return Math.round(technicalMatch * 0.7 + softSkillsMatch * 0.3);
  }

  private calculateExperienceCompatibility(job: JobPosition, assessments: any): number {
    if (!assessments.cv?.experience) return 50;

    const userYears = assessments.cv.experience.totalYears || 0;
    return this.calculateExperienceFit(userYears, job.requirements.experience_years, job.level);
  }

  private calculateCulturalCompatibility(job: JobPosition, assessments: any): number {
    let score = 75; // Base cultural fit score

    // Adjust based on personality traits
    if (assessments.mbti?.personality_type) {
      const type = assessments.mbti.personality_type;
      
      // Remote work preference
      if (job.work_environment.remote_friendly) {
        if (['INTJ', 'INTP', 'INFJ', 'INFP'].includes(type)) score += 10;
      } else {
        if (['ESFJ', 'ENFJ', 'ESFP', 'ENFP'].includes(type)) score += 10;
      }

      // Innovation level fit
      if (job.work_environment.innovation_level === 'high') {
        if (['ENTP', 'ENFP', 'INTP', 'INFP'].includes(type)) score += 15;
      }

      // Stress tolerance
      if (job.work_environment.stress_level === 'high') {
        if (['ENTJ', 'ESTJ', 'ENTP', 'ESTP'].includes(type)) score += 10;
        if (['ISFP', 'INFP', 'ISFJ', 'INFJ'].includes(type)) score -= 10;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateNumerologyCompatibility(job: JobPosition, assessments: any): number {
    if (!assessments.numerology?.traits) return 70;

    const userTraits = assessments.numerology.traits || [];
    return this.calculateNumerologyHarmony(userTraits, job.ideal_personality.numerology_traits);
  }

  private generateMatchInsights(job: JobPosition, assessments: any, scores: any) {
    const strengths: string[] = [];
    const concerns: string[] = [];
    const recommendations: string[] = [];

    // Analyze scores and generate insights
    if (scores.personality >= 80) {
      strengths.push('Tính cách rất phù hợp với vai trò này');
    } else if (scores.personality < 60) {
      concerns.push('Tính cách có thể không hoàn toàn phù hợp với yêu cầu công việc');
      recommendations.push('Tìm hiểu thêm về văn hóa công ty và môi trường làm việc');
    }

    if (scores.skills >= 85) {
      strengths.push('Kỹ năng rất phù hợp với yêu cầu công việc');
    } else if (scores.skills < 70) {
      concerns.push('Một số kỹ năng còn thiếu so với yêu cầu');
      recommendations.push('Học thêm các kỹ năng thiếu hụt hoặc nhấn mạnh kinh nghiệm tương tự');
    }

    if (scores.experience >= 80) {
      strengths.push('Kinh nghiệm phù hợp với level công việc');
    } else if (scores.experience < 60) {
      concerns.push('Kinh nghiệm có thể chưa đủ cho vị trí này');
      recommendations.push('Nhấn mạnh achievement và impact trong CV');
    }

    // Add default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Customize CV và cover letter theo yêu cầu công việc');
      recommendations.push('Chuẩn bị câu trả lời cho các câu hỏi về kinh nghiệm liên quan');
    }

    return { strengths, concerns, recommendations };
  }

  private generateApplicationTips(job: JobPosition, matchScore: MatchScore): string[] {
    const tips: string[] = [];

    // Generic tips
    tips.push(`Nghiên cứu kỹ về ${job.company} và sản phẩm/dịch vụ của họ`);
    tips.push('Customize CV để highlight các kỹ năng và kinh nghiệm liên quan nhất');

    // Score-based tips
    if (matchScore.breakdown.skills_match < 80) {
      tips.push('Nhấn mạnh project và achievement thể hiện khả năng học hỏi nhanh');
      tips.push('Đề cập đến việc đã tự học hoặc có kế hoạch học các kỹ năng còn thiếu');
    }

    if (matchScore.breakdown.experience_fit < 70) {
      tips.push('Focus vào impact và results thay vì chỉ liệt kê responsibilities');
      tips.push('Đưa ra số liệu cụ thể về achievement và contribution');
    }

    tips.push('Viết cover letter ngắn gọn, tập trung vào giá trị bạn mang lại');

    return tips;
  }

  private generateInterviewTips(job: JobPosition, matchScore: MatchScore): string[] {
    const tips: string[] = [];

    tips.push('Chuẩn bị STAR stories cho các situation liên quan đến job requirements');
    tips.push(`Nghiên cứu về team ${job.department} và challenges họ đang gặp phải`);

    // Role-specific tips
    if (job.title.toLowerCase().includes('developer')) {
      tips.push('Chuẩn bị để coding và giải thích technical decisions');
      tips.push('Prepare questions về tech stack và development process');
    }

    if (job.title.toLowerCase().includes('manager')) {
      tips.push('Chuẩn bị examples về leadership và team management');
      tips.push('Thể hiện strategic thinking và decision-making skills');
    }

    tips.push('Chuẩn bị câu hỏi thông minh về company culture và growth opportunities');

    return tips;
  }

  private generateSalaryTips(job: JobPosition, matchScore: MatchScore): string[] {
    const tips: string[] = [];

    const { min, max } = job.salary_range;
    const midPoint = (min + max) / 2;

    if (matchScore.overall_score >= 85) {
      tips.push(`Với match score cao (${matchScore.overall_score}%), có thể negotiate gần mức cao nhất`);
      tips.push(`Target range: ${Math.round(midPoint/1000000)}M - ${Math.round(max/1000000)}M VND`);
    } else if (matchScore.overall_score >= 70) {
      tips.push(`Với match score khá (${matchScore.overall_score}%), có thể negotiate ở mức mid-range`);
      tips.push(`Target range: ${Math.round(min/1000000)}M - ${Math.round(midPoint/1000000)}M VND`);
    } else {
      tips.push('Focus vào learning opportunities và career growth hơn là salary');
      tips.push(`Start với entry-level của range để prove value: ${Math.round(min/1000000)}M VND`);
    }

    tips.push('Research market rate cho position tương tự ở các company khác');
    tips.push('Chuẩn bị justification dựa trên specific value bạn mang lại');

    return tips;
  }

  // Get job recommendations for dashboard
  async getTopJobRecommendations(userId: string, limit: number = 3): Promise<JobMatch[]> {
    return this.findJobMatches(userId, limit);
  }

  // Search jobs with filters
  async searchJobs(filters: {
    level?: string;
    location?: string;
    remoteOnly?: boolean;
    salaryMin?: number;
    keywords?: string[];
  }): Promise<JobPosition[]> {
    let filteredJobs = this.mockJobs.filter(job => job.status === 'active');

    if (filters.level) {
      filteredJobs = filteredJobs.filter(job => job.level === filters.level);
    }

    if (filters.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(filters.location!.toLowerCase()) ||
        job.location.toLowerCase() === 'remote'
      );
    }

    if (filters.remoteOnly) {
      filteredJobs = filteredJobs.filter(job => job.work_environment.remote_friendly);
    }

    if (filters.salaryMin) {
      filteredJobs = filteredJobs.filter(job => job.salary_range.min >= filters.salaryMin!);
    }

    if (filters.keywords && filters.keywords.length > 0) {
      filteredJobs = filteredJobs.filter(job => {
        const searchText = `${job.title} ${job.description} ${job.requirements.technical_skills.join(' ')} ${job.requirements.soft_skills.join(' ')}`.toLowerCase();
        return filters.keywords!.some(keyword => 
          searchText.includes(keyword.toLowerCase())
        );
      });
    }

    return filteredJobs;
  }
}

export const jobMatchingService = new JobMatchingService();
export default jobMatchingService;