import axios from 'axios';

// Use Vite env variables with proper typing
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const numerologyApi = axios.create({
  baseURL: `${API_BASE_URL}/numerology`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface NumerologyCalculationRequest {
  fullName: string;
  birthDate: string; // ISO date string
  assessmentId?: string;
}

export interface QuickCalculationRequest {
  fullName: string;
  birthDate: string; // ISO date string
}

export interface NumerologyResult {
  id?: string;
  lifePathNumber: number;
  destinyNumber: number;
  personalityNumber: number;
  soulUrgeNumber: number;
  attitudeLessonNumber: number;
  birthDayNumber: number;
  challengeNumbers: number[];
  pinnacleNumbers: number[];
  personalYearNumber: number;
  coreTraits: {
    positive: string[];
    negative: string[];
    keywords: string[];
  };
  strengths: string[];
  challenges: string[];
  careerGuidance: {
    suitableCareers: string[];
    workStyle: string;
    leadershipStyle: string;
    teamRole: string;
  };
  relationships: {
    compatibility: string[];
    challenges: string[];
    advice: string[];
  };
  lifeCycle: {
    youthPhase: string;
    adulthoodPhase: string;
    maturityPhase: string;
  };
  analysis: string;
  compatibility: {
    leadership: number;
    teamwork: number;
    communication: number;
    innovation: number;
    analytical: number;
    overall: number;
  };
}

export interface LifePathInfo {
  lifePathNumber: number;
  coreTraits: {
    positive: string[];
    negative: string[];
    keywords: string[];
  };
  careerGuidance: {
    suitableCareers: string[];
    workStyle: string;
    leadershipStyle: string;
    teamRole: string;
  };
  harmonyAnalysis: any; // Harmony of Spheres data
}

export interface JobCompatibility {
  leadership: number;
  teamwork: number;
  communication: number;
  innovation: number;
  analytical: number;
  overall: number;
  recommendations: string[];
}

class NumerologyService {
  /**
   * Calculate numerology and save to database
   */
  async calculateNumerology(request: NumerologyCalculationRequest): Promise<NumerologyResult> {
    try {
      const response = await numerologyApi.post('/calculate', request);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to calculate numerology');
    }
  }

  /**
   * Quick calculation without saving to database
   */
  async quickCalculate(request: QuickCalculationRequest): Promise<NumerologyResult> {
    try {
      const response = await numerologyApi.post('/quick-calculate', request);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to perform quick calculation');
    }
  }

  /**
   * Get numerology result by assessment ID
   */
  async getNumerologyByAssessment(assessmentId: string): Promise<NumerologyResult> {
    try {
      const response = await numerologyApi.get(`/assessment/${assessmentId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get numerology result');
    }
  }

  /**
   * Get life path information
   */
  async getLifePathInfo(lifePathNumber: number): Promise<LifePathInfo> {
    try {
      const response = await numerologyApi.get(`/life-path/${lifePathNumber}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to get life path information');
    }
  }

  /**
   * Calculate job compatibility
   */
  async calculateJobCompatibility(
    lifePath: number,
    destiny: number,
    personality: number,
    masterNumbers: number[] = []
  ): Promise<JobCompatibility> {
    try {
      const params = new URLSearchParams({
        lifePath: lifePath.toString(),
        destiny: destiny.toString(),
        personality: personality.toString(),
        masterNumbers: masterNumbers.join(',')
      });

      const response = await numerologyApi.get(`/compatibility?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to calculate job compatibility');
    }
  }

  /**
   * Format date for API
   */
  formatDateForApi(date: Date): string {
    return date.toISOString();
  }

  /**
   * Parse date from API
   */
  parseDateFromApi(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Validate full name
   */
  validateFullName(fullName: string): { isValid: boolean; error?: string } {
    if (!fullName || !fullName.trim()) {
      return { isValid: false, error: 'Họ và tên không được để trống' };
    }

    if (fullName.trim().length < 2) {
      return { isValid: false, error: 'Họ và tên phải có ít nhất 2 ký tự' };
    }

    if (!/^[a-zA-ZÀ-ỹĐđ\s]+$/.test(fullName.trim())) {
      return { isValid: false, error: 'Họ và tên chỉ được chứa chữ cái và khoảng trắng' };
    }

    return { isValid: true };
  }

  /**
   * Validate birth date
   */
  validateBirthDate(birthDate: Date): { isValid: boolean; error?: string } {
    if (!birthDate) {
      return { isValid: false, error: 'Ngày sinh không được để trống' };
    }

    if (birthDate > new Date()) {
      return { isValid: false, error: 'Ngày sinh không thể trong tương lai' };
    }

    if (birthDate < new Date('1900-01-01')) {
      return { isValid: false, error: 'Ngày sinh không hợp lệ' };
    }

    return { isValid: true };
  }

  /**
   * Get numerology interpretation for display
   */
  getNumberInterpretation(number: number): string {
    const interpretations: { [key: number]: string } = {
      1: 'Người lãnh đạo tự nhiên, độc lập và sáng tạo',
      2: 'Người hòa hợp, hợp tác và nhạy cảm',
      3: 'Người sáng tạo, giao tiếp tốt và lạc quan',
      4: 'Người thực tế, có tổ chức và đáng tin cậy',
      5: 'Người tự do, phiêu lưu và linh hoạt',
      6: 'Người nuôi dưỡng, có trách nhiệm và yêu thương',
      7: 'Người tâm linh, phân tích và trí tuệ',
      8: 'Người thành đạt, quyền lực và vật chất',
      9: 'Người nhân đạo, rộng lượng và trí tuệ',
      11: 'Số Chủ - Trực giác mạnh, tâm linh cao',
      22: 'Số Chủ - Người xây dựng, tầm nhìn lớn',
      33: 'Số Chủ - Thầy dạy, chữa lành và phục vụ'
    };

    return interpretations[number] || `Số ${number} - Đặc điểm riêng biệt`;
  }

  /**
   * Get compatibility level description
   */
  getCompatibilityDescription(score: number): { level: string; color: string; description: string } {
    if (score >= 80) {
      return {
        level: 'Rất Tốt',
        color: 'success',
        description: 'Tương thích cao, rất phù hợp'
      };
    } else if (score >= 60) {
      return {
        level: 'Tốt',
        color: 'info',
        description: 'Tương thích tốt, khá phù hợp'
      };
    } else if (score >= 40) {
      return {
        level: 'Trung Bình',
        color: 'warning',
        description: 'Tương thích trung bình, cần cân nhắc'
      };
    } else {
      return {
        level: 'Thấp',
        color: 'error',
        description: 'Tương thích thấp, ít phù hợp'
      };
    }
  }
}

const numerologyService = new NumerologyService();

export default numerologyService;