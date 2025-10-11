import { format, isValid } from 'date-fns';

export interface NumerologyCalculation {
  // Core Numbers (Pythagorean Tetractys)
  lifePathNumber: number;
  destinyNumber: number;
  personalityNumber: number;
  soulUrgeNumber: number;
  attitudeLessonNumber: number;
  birthDayNumber: number;
  
  // Advanced Numbers
  challengeNumbers: number[];
  pinnacleNumbers: number[];
  personalYearNumber: number;
  maturityNumber: number;
  karmicLessons: number[];
  karmicDebt: number[];
  masterNumbers: number[];
  
  // Pythagorean Analysis
  coreTraits: string[];
  strengths: string[];
  challenges: string[];
  careerGuidance: string[];
  relationships: string[];
  lifeCycle: LifeCyclePhase[];
  harmonyAnalysis: HarmonyOfSpheres;
  tetractysMapping: TetractysMapping;
  
  // Comprehensive Analysis
  analysis: string;
  compatibility: JobCompatibility;
}

export interface LifeCyclePhase {
  phase: string;
  age: string;
  description: string;
  focus: string;
  pinnacleNumber?: number;
  challengeNumber?: number;
}

export interface HarmonyOfSpheres {
  lifePathTone: string;
  personalFrequency: number;
  cosmicResonance: string;
  planetaryInfluence: string;
  musicalCorrespondence: string;
  colorVibration: string;
}

export interface TetractysMapping {
  monad: number;    // 1 - Life Path
  dyad: number;     // 2 - Expression/Personality
  triad: number;    // 3 - Soul Urge
  tetrad: number;   // 4 - Birthday/Foundation
  decad: number;    // 10 - Maturity/Integration
}

export interface JobCompatibility {
  overall: number;
  leadership: number;
  teamwork: number;
  creativity: number;
  analytical: number;
  communication: number;
  spiritualWork: number;
  practicalSkills: number;
}

class NumerologyService {
  // Pythagorean Letter Values (A=1, B=2, ... Z=26, then reduce)
  private getLetterValue(letter: string): number {
    const upperLetter = letter.toUpperCase();
    if (upperLetter < 'A' || upperLetter > 'Z') return 0;
    return upperLetter.charCodeAt(0) - 64;
  }

  // Reduce to single digit except Master Numbers (11, 22, 33)
  private reduceToSingleDigit(num: number): number {
    while (num > 9 && ![11, 22, 33].includes(num)) {
      num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
  }

  // Calculate name number from full name
  private calculateNameNumber(name: string): number {
    return name.replace(/[^A-Za-z]/g, '')
      .split('')
      .reduce((sum, letter) => sum + this.getLetterValue(letter), 0);
  }

  // Calculate vowel number (Soul Urge)
  private calculateVowelNumber(name: string): number {
    const vowels = 'AEIOU';
    return name.replace(/[^A-Za-z]/g, '')
      .split('')
      .filter(letter => vowels.includes(letter.toUpperCase()))
      .reduce((sum, vowel) => sum + this.getLetterValue(vowel), 0);
  }

  // Calculate consonant number (Personality)
  private calculateConsonantNumber(name: string): number {
    const vowels = 'AEIOU';
    return name.replace(/[^A-Za-z]/g, '')
      .split('')
      .filter(letter => !vowels.includes(letter.toUpperCase()))
      .reduce((sum, consonant) => sum + this.getLetterValue(consonant), 0);
  }

  // Life Path Number - Core journey of the soul
  calculateLifePathNumber(birthDate: Date): number {
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    const year = birthDate.getFullYear();
    
    // Calculate each component separately to detect master numbers
    const dayReduced = this.reduceToSingleDigit(day);
    const monthReduced = this.reduceToSingleDigit(month);
    const yearReduced = this.reduceToSingleDigit(year);
    
    const sum = dayReduced + monthReduced + yearReduced;
    return this.reduceToSingleDigit(sum);
  }

  // Destiny/Expression Number - Life mission
  calculateDestinyNumber(fullName: string): number {
    const nameSum = this.calculateNameNumber(fullName);
    return this.reduceToSingleDigit(nameSum);
  }

  // Personality Number - External expression
  calculatePersonalityNumber(fullName: string): number {
    const consonantSum = this.calculateConsonantNumber(fullName);
    return this.reduceToSingleDigit(consonantSum);
  }

  // Soul Urge Number - Inner desires
  calculateSoulUrgeNumber(fullName: string): number {
    const vowelSum = this.calculateVowelNumber(fullName);
    return this.reduceToSingleDigit(vowelSum);
  }

  // Attitude/Lesson Number
  calculateAttitudeLessonNumber(birthDate: Date): number {
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    return this.reduceToSingleDigit(day + month);
  }

  // Birth Day Number
  calculateBirthDayNumber(birthDate: Date): number {
    return this.reduceToSingleDigit(birthDate.getDate());
  }

  // Maturity Number (Life Path + Destiny)
  calculateMaturityNumber(lifePathNumber: number, destinyNumber: number): number {
    return this.reduceToSingleDigit(lifePathNumber + destinyNumber);
  }

  // Challenge Numbers - Life lessons to overcome
  calculateChallengeNumbers(birthDate: Date): number[] {
    const day = this.reduceToSingleDigit(birthDate.getDate());
    const month = this.reduceToSingleDigit(birthDate.getMonth() + 1);
    const year = this.reduceToSingleDigit(birthDate.getFullYear());
    
    const challenge1 = Math.abs(day - month);
    const challenge2 = Math.abs(day - year);
    const challenge3 = Math.abs(challenge1 - challenge2);
    const challenge4 = Math.abs(month - year);
    
    return [challenge1, challenge2, challenge3, challenge4];
  }

  // Pinnacle Numbers - Life achievement periods
  calculatePinnacleNumbers(birthDate: Date): number[] {
    const day = this.reduceToSingleDigit(birthDate.getDate());
    const month = this.reduceToSingleDigit(birthDate.getMonth() + 1);
    const year = this.reduceToSingleDigit(birthDate.getFullYear());
    
    const pinnacle1 = this.reduceToSingleDigit(day + month);
    const pinnacle2 = this.reduceToSingleDigit(day + year);
    const pinnacle3 = this.reduceToSingleDigit(pinnacle1 + pinnacle2);
    const pinnacle4 = this.reduceToSingleDigit(month + year);
    
    return [pinnacle1, pinnacle2, pinnacle3, pinnacle4];
  }

  // Personal Year Number
  calculatePersonalYearNumber(birthDate: Date): number {
    const currentYear = new Date().getFullYear();
    const day = this.reduceToSingleDigit(birthDate.getDate());
    const month = this.reduceToSingleDigit(birthDate.getMonth() + 1);
    
    return this.reduceToSingleDigit(day + month + currentYear);
  }

  // Karmic Lessons - Missing numbers in full name
  calculateKarmicLessons(fullName: string): number[] {
    const presentNumbers = new Set<number>();
    const cleanName = fullName.replace(/[^A-Za-z]/g, '');
    
    for (const letter of cleanName) {
      const value = this.reduceToSingleDigit(this.getLetterValue(letter));
      presentNumbers.add(value);
    }
    
    const karmicLessons: number[] = [];
    for (let i = 1; i <= 9; i++) {
      if (!presentNumbers.has(i)) {
        karmicLessons.push(i);
      }
    }
    
    return karmicLessons;
  }

  // Karmic Debt Numbers (13, 14, 16, 19)
  calculateKarmicDebt(birthDate: Date, fullName: string): number[] {
    const karmicDebtNumbers = [13, 14, 16, 19];
    const foundDebtNumbers: number[] = [];
    
    // Check in name calculation
    const nameSum = this.calculateNameNumber(fullName);
    if (karmicDebtNumbers.includes(nameSum)) {
      foundDebtNumbers.push(nameSum);
    }
    
    // Check in birth date components
    const day = birthDate.getDate();
    const month = birthDate.getMonth() + 1;
    const year = birthDate.getFullYear();
    
    [day, month, year].forEach(component => {
      if (karmicDebtNumbers.includes(component)) {
        foundDebtNumbers.push(component);
      }
    });
    
    return [...new Set(foundDebtNumbers)]; // Remove duplicates
  }

  // Master Numbers detection
  calculateMasterNumbers(birthDate: Date, fullName: string): number[] {
    const masterNumbers: number[] = [];
    
    // Check Life Path for master numbers
    const daySum = birthDate.getDate();
    const monthSum = birthDate.getMonth() + 1;
    const yearSum = birthDate.getFullYear().toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    
    [daySum, monthSum, yearSum].forEach(sum => {
      if ([11, 22, 33].includes(sum)) {
        masterNumbers.push(sum);
      }
    });
    
    // Check name numbers
    const nameSum = this.calculateNameNumber(fullName);
    if ([11, 22, 33].includes(nameSum)) {
      masterNumbers.push(nameSum);
    }
    
    return [...new Set(masterNumbers)];
  }

  // Pythagorean Core Traits based on Life Path
  getCoreTraits(lifePathNumber: number): string[] {
    const traits: { [key: number]: string[] } = {
      1: ["Tiên phong", "Độc lập", "Lãnh đạo", "Sáng tạo", "Quyết đoán", "Tham vọng"],
      2: ["Hợp tác", "Nhạy cảm", "Hòa giải", "Kiên nhẫn", "Hỗ trợ", "Trực giác"],
      3: ["Sáng tạo nghệ thuật", "Giao tiếp", "Lạc quan", "Biểu đạt", "Xã hội", "Cảm hứng"],
      4: ["Thực tế", "Có tổ chức", "Chăm chỉ", "Đáng tin cậy", "Kỷ luật", "Xây dựng"],
      5: ["Tự do", "Phiêu lưu", "Linh hoạt", "Tò mò", "Năng động", "Đa năng"],
      6: ["Chăm sóc", "Có trách nhiệm", "Yêu thương", "Cân bằng", "Hòa hợp", "Chữa lành"],
      7: ["Phân tích", "Tâm linh", "Sâu sắc", "Hoàn hảo", "Trí tuệ", "Huyền bí"],
      8: ["Thành công vật chất", "Tổ chức", "Quyền lực", "Kinh doanh", "Thực tế", "Tham vọng"],
      9: ["Nhân đạo", "Rộng lượng", "Lý tưởng", "Phục vụ", "Toàn cầu", "Từ bi"],
      11: ["Trực giác cao", "Tâm linh", "Cảm hứng", "Lãnh đạo tâm linh", "Nhạy cảm", "Sứ mệnh"],
      22: ["Chủ mộng", "Xây dựng lớn", "Tầm nhìn", "Thực tế cao", "Kiến tạo", "Thành tựu lớn"],
      33: ["Thầy giáo tâm linh", "Chữa lành", "Yêu thương vô điều kiện", "Phục vụ nhân loại", "Cống hiến", "Thương xót"]
    };
    return traits[lifePathNumber] || ["Cần khám phá thêm"];
  }

  // Harmony of Spheres - Pythagorean musical correspondence
  getHarmonyOfSpheres(lifePathNumber: number, birthDate: Date): HarmonyOfSpheres {
    const toneMapping: { [key: number]: string } = {
      1: "Đô (C) - Tần số căn bản, khởi đầu",
      2: "Rê (D) - Cảm xúc, phản chiếu", 
      3: "Mi (E) - Biểu đạt, sáng tạo",
      4: "Fa (F) - Cấu trúc, trật tự",
      5: "Sol (G) - Tự do, chuyển hóa",
      6: "La (A) - Hòa hợp, cộng đồng",
      7: "Si (B) - Minh triết, trực giác",
      8: "Đô cao (C') - Quyền lực, thành tựu",
      9: "Rê cao (D') - Phóng sinh, từ bi",
      11: "Fa# - Tần số thầy giáo, cảm hứng",
      22: "Si♭ - Tần số kiến tạo vĩ đại",
      33: "Mi♭ - Tần số chữa lành, yêu thương"
    };

    const planetMapping: { [key: number]: string } = {
      1: "Mặt Trời - Năng lượng sống, ý chí",
      2: "Mặt Trăng - Cảm xúc, trực giác",
      3: "Sao Mộc - Mở rộng, sáng tạo",
      4: "Sao Thổ - Kỷ luật, cấu trúc",
      5: "Sao Thủy - Giao tiếp, linh hoạt",
      6: "Sao Kim - Tình yêu, hòa hợp",
      7: "Sao Hải Vương - Tâm linh, huyền bí",
      8: "Sao Thổ - Thành tựu, quyền lực",
      9: "Sao Hỏa - Hành động, dũng cảm"
    };

    const colorMapping: { [key: number]: string } = {
      1: "Đỏ - Năng lượng, hành động",
      2: "Cam - Sáng tạo, cảm xúc",
      3: "Vàng - Trí tuệ, giao tiếp",
      4: "Xanh lá - Tăng trưởng, ổn định",
      5: "Xanh dương - Tự do, mở rộng",
      6: "Chàm - Trực giác, trách nhiệm",
      7: "Tím - Tâm linh, huyền bí",
      8: "Hồng - Quyền lực, vật chất",
      9: "Trắng vàng - Hoàn thiện, từ bi"
    };

    // Calculate personal frequency based on birth date
    const totalDate = birthDate.getDate() + (birthDate.getMonth() + 1) + birthDate.getFullYear();
    const personalFrequency = 432 * (lifePathNumber / 9); // Based on sacred 432Hz

    return {
      lifePathTone: toneMapping[lifePathNumber] || "Tần số đặc biệt",
      personalFrequency: Math.round(personalFrequency * 100) / 100,
      cosmicResonance: `Cộng hưởng với tần số vũ trụ ${lifePathNumber}/9`,
      planetaryInfluence: planetMapping[lifePathNumber] || "Ảnh hưởng đặc biệt",
      musicalCorrespondence: toneMapping[lifePathNumber] || "Âm thanh độc đáo",
      colorVibration: colorMapping[lifePathNumber] || "Màu sắc đặc biệt"
    };
  }

  // Tetractys Mapping - Sacred geometry correspondence
  getTetractysMapping(lifePathNumber: number, destinyNumber: number, soulUrgeNumber: number, birthDayNumber: number, maturityNumber: number): TetractysMapping {
    return {
      monad: lifePathNumber,      // 1 - Unity, Source
      dyad: destinyNumber,        // 2 - Duality, Expression  
      triad: soulUrgeNumber,      // 3 - Trinity, Soul
      tetrad: birthDayNumber,     // 4 - Foundation, Material
      decad: maturityNumber       // 10 - Completion, Integration
    };
  }

  // Enhanced Career Guidance based on Pythagorean principles
  getCareerGuidance(lifePathNumber: number, destinyNumber: number, masterNumbers: number[]): string[] {
    const careers: { [key: number]: string[] } = {
      1: ["CEO/Giám đốc điều hành", "Doanh nhân", "Nhà lãnh đạo chính trị", "Khởi nghiệp", "Quản lý cấp cao", "Nhà phát minh"],
      2: ["Nhân sự", "Tư vấn tâm lý", "Ngoại giao", "Công tác xã hội", "Hòa giải", "Trợ lý điều hành"],
      3: ["Nghệ sĩ", "Nhà văn", "Diễn viên", "Marketing sáng tạo", "Giáo viên", "MC/Presenter"],
      4: ["Kỹ sư", "Kế toán", "Xây dựng", "Quản lý dự án", "Ngân hàng", "Kiến trúc sư"],
      5: ["Du lịch", "Báo chí", "Bán hàng", "Vận chuyển", "Freelancer", "Nhà thám hiểm"],
      6: ["Y tế", "Giáo dục", "Tư vấn gia đình", "Thiết kế nội thất", "Đầu bếp", "Dịch vụ chăm sóc"],
      7: ["Nghiên cứu khoa học", "IT/Công nghệ", "Tâm lý học", "Triết học", "Tâm linh", "Phân tích dữ liệu"],
      8: ["Tài chính", "Luật sư", "Bất động sản", "Quản lý ngân hàng", "Kinh doanh lớn", "Đầu tư"],
      9: ["Tổ chức phi lợi nhuận", "Bác sĩ", "Giáo viên", "Nhà trị liệu", "Hoạt động xã hội", "Từ thiện"],
      11: ["Nghệ thuật tâm linh", "Huấn luyện viên life coach", "Tư vấn tâm linh", "Nhà phát minh", "Giáo viên yoga"],
      22: ["Kiến trúc sư lớn", "Kỹ sư trưởng", "Nhà tổ chức quốc tế", "Chính trị gia", "Nhà đầu tư lớn"],
      33: ["Giáo viên tâm linh", "Nhà trị liệu", "Tư vấn tâm lý sâu", "Hoạt động xã hội", "Y tá chăm sóc đặc biệt"]
    };
    
    let guidance = careers[lifePathNumber] || ["Cần khám phá định hướng phù hợp"];
    
    // Add master number influences
    if (masterNumbers.includes(11)) {
      guidance.push("Công việc liên quan đến cảm hứng và dẫn dắt tinh thần");
    }
    if (masterNumbers.includes(22)) {
      guidance.push("Các dự án xây dựng tầm cỡ quốc tế");
    }
    if (masterNumbers.includes(33)) {
      guidance.push("Sứ mệnh chữa lành và giảng dạy");
    }
    
    return guidance;
  }

  // Enhanced Life Cycle with Pinnacles and Challenges
  getLifeCycleAnalysis(birthDate: Date, lifePathNumber: number, pinnacleNumbers: number[], challengeNumbers: number[]): LifeCyclePhase[] {
    const currentYear = new Date().getFullYear();
    const birthYear = birthDate.getFullYear();
    const age = currentYear - birthYear;
    
    // Calculate cycle periods based on Life Path Number
    const firstCycleEnd = 36 - lifePathNumber;
    const secondCycleEnd = firstCycleEnd + 9;
    const thirdCycleEnd = secondCycleEnd + 9;

    return [
      {
        phase: `Giai đoạn Hình thành (0-${firstCycleEnd} tuổi)`,
        age: age <= firstCycleEnd ? "Hiện tại" : "Đã qua",
        description: "Thời kỳ học hỏi, khám phá bản thân và hình thành tính cách cơ bản",
        focus: "Giáo dục, kỹ năng cơ bản, mối quan hệ gia đình",
        pinnacleNumber: pinnacleNumbers[0],
        challengeNumber: challengeNumbers[0]
      },
      {
        phase: `Giai đoạn Phát triển (${firstCycleEnd + 1}-${secondCycleEnd} tuổi)`,
        age: age >= firstCycleEnd + 1 && age <= secondCycleEnd ? "Hiện tại" : age < firstCycleEnd + 1 ? "Sắp tới" : "Đã qua",
        description: "Thời kỳ xây dựng sự nghiệp, tình yêu và thành tựu cá nhân",
        focus: "Sự nghiệp, hôn nhân, thành công vật chất",
        pinnacleNumber: pinnacleNumbers[1],
        challengeNumber: challengeNumbers[1]
      },
      {
        phase: `Giai đoạn Thành tựu (${secondCycleEnd + 1}-${thirdCycleEnd} tuổi)`,
        age: age >= secondCycleEnd + 1 && age <= thirdCycleEnd ? "Hiện tại" : age < secondCycleEnd + 1 ? "Sắp tới" : "Đã qua",
        description: "Thời kỳ gặt hái thành quả và đạt đến đỉnh cao trong lĩnh vực của mình",
        focus: "Thành tựu nghề nghiệp, ảnh hưởng xã hội, di sản",
        pinnacleNumber: pinnacleNumbers[2],
        challengeNumber: challengeNumbers[2]
      },
      {
        phase: `Giai đoạn Trưởng thành (${thirdCycleEnd + 1}+ tuổi)`,
        age: age >= thirdCycleEnd + 1 ? "Hiện tại" : "Tương lai",
        description: "Thời kỳ chia sẻ trí tuệ, phục vụ cộng đồng và chuẩn bị cho hành trình tiếp theo",
        focus: "Chia sẻ kiến thức, di sản tinh thần, cống hiến xã hội",
        pinnacleNumber: pinnacleNumbers[3],
        challengeNumber: challengeNumbers[3]
      }
    ];
  }

  // Enhanced Job Compatibility with spiritual aspects
  calculateJobCompatibility(
    lifePathNumber: number,
    destinyNumber: number,
    personalityNumber: number,
    masterNumbers: number[]
  ): JobCompatibility {
    let leadership = 50;
    let teamwork = 50;
    let creativity = 50;
    let analytical = 50;
    let communication = 50;
    let spiritualWork = 50;
    let practicalSkills = 50;
    
    // Leadership scoring
    if ([1, 8, 11, 22].includes(lifePathNumber)) leadership += 30;
    if ([2, 6, 9].includes(lifePathNumber)) leadership += 10;
    if ([4, 7].includes(lifePathNumber)) leadership += 5;
    
    // Teamwork scoring
    if ([2, 6, 9].includes(lifePathNumber)) teamwork += 30;
    if ([3, 4].includes(lifePathNumber)) teamwork += 20;
    if ([1, 5, 7].includes(lifePathNumber)) teamwork -= 10;
    
    // Creativity scoring
    if ([3, 5, 11].includes(lifePathNumber)) creativity += 30;
    if ([1, 7, 9].includes(lifePathNumber)) creativity += 15;
    if ([4, 8].includes(lifePathNumber)) creativity -= 5;
    
    // Analytical scoring
    if ([4, 7, 8].includes(lifePathNumber)) analytical += 30;
    if ([1, 22].includes(lifePathNumber)) analytical += 15;
    if ([3, 5, 6].includes(lifePathNumber)) analytical -= 5;
    
    // Communication scoring
    if ([3, 5, 11].includes(lifePathNumber)) communication += 30;
    if ([1, 6, 9].includes(lifePathNumber)) communication += 15;
    if ([4, 7, 8].includes(lifePathNumber)) communication -= 5;
    
    // Spiritual work scoring
    if ([7, 9, 11, 33].includes(lifePathNumber)) spiritualWork += 35;
    if ([2, 6].includes(lifePathNumber)) spiritualWork += 20;
    if ([1, 8].includes(lifePathNumber)) spiritualWork -= 10;
    
    // Practical skills scoring
    if ([4, 8, 22].includes(lifePathNumber)) practicalSkills += 30;
    if ([1, 6].includes(lifePathNumber)) practicalSkills += 15;
    if ([3, 5, 7].includes(lifePathNumber)) practicalSkills -= 5;
    
    // Master number bonuses
    if (masterNumbers.includes(11)) {
      spiritualWork += 20;
      creativity += 15;
    }
    if (masterNumbers.includes(22)) {
      leadership += 20;
      practicalSkills += 25;
    }
    if (masterNumbers.includes(33)) {
      spiritualWork += 25;
      teamwork += 20;
    }
    
    // Normalize scores to 0-100 range
    const normalize = (score: number) => Math.max(0, Math.min(100, score));
    
    const scores = {
      leadership: normalize(leadership),
      teamwork: normalize(teamwork),
      creativity: normalize(creativity),
      analytical: normalize(analytical),
      communication: normalize(communication),
      spiritualWork: normalize(spiritualWork),
      practicalSkills: normalize(practicalSkills)
    };
    
    const overall = Object.values(scores).reduce((sum, score) => sum + score, 0) / 7;
    
    return { ...scores, overall: Math.round(overall) };
  }

  // Get strengths based on numbers combination
  getStrengths(lifePathNumber: number, destinyNumber: number, masterNumbers: number[]): string[] {
    const strengths: string[] = [];
    
    // Add Life Path strengths
    if (lifePathNumber === 1 || lifePathNumber === 8) strengths.push("Khả năng lãnh đạo mạnh mẽ và quyết đoán");
    if (lifePathNumber === 2 || lifePathNumber === 6) strengths.push("Kỹ năng làm việc nhóm và hợp tác xuất sắc");
    if (lifePathNumber === 3 || lifePathNumber === 5) strengths.push("Sáng tạo, giao tiếp và thể hiện bản thân tốt");
    if (lifePathNumber === 4 || lifePathNumber === 8) strengths.push("Tổ chức, quản lý và thực hiện hiệu quả");
    if (lifePathNumber === 7 || lifePathNumber === 11) strengths.push("Tư duy phân tích sâu sắc và trực giác mạnh");
    if (lifePathNumber === 9 || lifePathNumber === 33) strengths.push("Tinh thần phục vụ, đồng cảm và nhân đạo");
    
    // Add Destiny number influence
    if (destinyNumber === 1) strengths.push("Định hướng sự nghiệp rõ ràng và tầm nhìn xa");
    if (destinyNumber === 3) strengths.push("Khả năng truyền cảm hứng và động viên người khác");
    if (destinyNumber === 5) strengths.push("Thích ứng nhanh với thay đổi và môi trường mới");
    if (destinyNumber === 22) strengths.push("Khả năng biến ước mơ thành hiện thực quy mô lớn");
    
    // Master number bonuses
    if (masterNumbers.includes(11)) strengths.push("Trực giác và cảm hứng tâm linh đặc biệt");
    if (masterNumbers.includes(22)) strengths.push("Khả năng kiến tạo và xây dựng tầm cỡ quốc tế");
    if (masterNumbers.includes(33)) strengths.push("Sứ mệnh chữa lành và giảng dạy thiêng liêng");
    
    return strengths.length > 0 ? strengths : ["Nhiều tiềm năng đặc biệt chưa được khai phá"];
  }

  // Get challenges based on numbers
  getChallenges(challengeNumbers: number[], lifePathNumber: number, karmicDebt: number[]): string[] {
    const challenges: string[] = [];
    
    challengeNumbers.forEach(challenge => {
      switch (challenge) {
        case 0: challenges.push("Cần học cách tự tin và khẳng định bản thân"); break;
        case 1: challenges.push("Cần cân bằng giữa độc lập và hợp tác với người khác"); break;
        case 2: challenges.push("Cần vượt qua sự nhạy cảm quá mức và thiếu tự tin"); break;
        case 3: challenges.push("Cần tập trung năng lượng sáng tạo và tránh phân tán"); break;
        case 4: challenges.push("Cần linh hoạt hơn và tránh quá cứng nhắc"); break;
        case 5: challenges.push("Cần kiểm soát ham muốn tự do và học cách cam kết"); break;
        case 6: challenges.push("Cần cân bằng giữa cho đi và nhận lại"); break;
        case 7: challenges.push("Cần mở lòng với người khác và chia sẻ cảm xúc"); break;
        case 8: challenges.push("Cần cân bằng giữa thành công vật chất và tinh thần"); break;
      }
    });
    
    // Add karmic debt challenges
    karmicDebt.forEach(debt => {
      switch (debt) {
        case 13: challenges.push("Karmic Debt 13: Cần học sự kiên nhẫn và chăm chỉ"); break;
        case 14: challenges.push("Karmic Debt 14: Cần kiểm soát ham muốn và thái độ"); break;
        case 16: challenges.push("Karmic Debt 16: Cần học tính khiêm tốn và sự chân thành"); break;
        case 19: challenges.push("Karmic Debt 19: Cần học sự độc lập và không ích kỷ"); break;
      }
    });
    
    return challenges.length > 0 ? challenges : ["Ít thử thách lớn, con đường phát triển tương đối thuận lợi"];
  }

  // Get relationship patterns
  getRelationshipPatterns(lifePathNumber: number, soulUrgeNumber: number): string[] {
    const patterns: string[] = [];
    
    // Life Path relationship patterns
    switch (lifePathNumber) {
      case 1: patterns.push("Cần đối tác hiểu và hỗ trợ tính độc lập, tham vọng"); break;
      case 2: patterns.push("Tìm kiếm sự hòa hợp, cân bằng và hỗ trợ lẫn nhau"); break;
      case 3: patterns.push("Cần không gian để thể hiện bản thân và sáng tạo"); break;
      case 4: patterns.push("Đánh giá cao sự ổn định, cam kết và xây dựng lâu dài"); break;
      case 5: patterns.push("Cần tự do, không gian cá nhân và sự đa dạng"); break;
      case 6: patterns.push("Có xu hướng chăm sóc, bảo vệ và yêu thương sâu sắc"); break;
      case 7: patterns.push("Cần thời gian riêng tư để suy ngẫm và tìm hiểu sâu"); break;
      case 8: patterns.push("Tìm kiếm đối tác có tham vọng và mục tiêu tương đồng"); break;
      case 9: patterns.push("Quan tâm đến các giá trị nhân văn và mục đích cao cả chung"); break;
      case 11: patterns.push("Cần đối tác hiểu được tính nhạy cảm và trực giác cao"); break;
      case 22: patterns.push("Tìm kiếm đối tác chia sẻ tầm nhìn lớn và ước mơ cao"); break;
      case 33: patterns.push("Mối quan hệ dựa trên sự chữa lành và phục vụ chung"); break;
    }
    
    // Soul Urge influence
    if (soulUrgeNumber === 1) patterns.push("Khao khát được công nhận và dẫn dắt trong mối quan hệ");
    if (soulUrgeNumber === 2) patterns.push("Mong muốn hòa hợp và kết nối cảm xúc sâu sắc");
    if (soulUrgeNumber === 3) patterns.push("Cần sự vui vẻ, sáng tạo và biểu đạt trong tình cảm");
    if (soulUrgeNumber === 7) patterns.push("Tìm kiếm sự thấu hiểu sâu sắc và kết nối tâm linh");
    if (soulUrgeNumber === 9) patterns.push("Mong muốn phục vụ và cống hiến cùng nhau");
    
    return patterns;
  }

  // Main calculation method
  calculateNumerology(fullName: string, birthDate: Date): NumerologyCalculation {
    if (!isValid(birthDate)) {
      throw new Error('Ngày sinh không hợp lệ');
    }
    
    // Calculate core numbers
    const lifePathNumber = this.calculateLifePathNumber(birthDate);
    const destinyNumber = this.calculateDestinyNumber(fullName);
    const personalityNumber = this.calculatePersonalityNumber(fullName);
    const soulUrgeNumber = this.calculateSoulUrgeNumber(fullName);
    const attitudeLessonNumber = this.calculateAttitudeLessonNumber(birthDate);
    const birthDayNumber = this.calculateBirthDayNumber(birthDate);
    const maturityNumber = this.calculateMaturityNumber(lifePathNumber, destinyNumber);
    
    // Calculate advanced numbers
    const challengeNumbers = this.calculateChallengeNumbers(birthDate);
    const pinnacleNumbers = this.calculatePinnacleNumbers(birthDate);
    const personalYearNumber = this.calculatePersonalYearNumber(birthDate);
    const karmicLessons = this.calculateKarmicLessons(fullName);
    const karmicDebt = this.calculateKarmicDebt(birthDate, fullName);
    const masterNumbers = this.calculateMasterNumbers(birthDate, fullName);
    
    // Generate analysis
    const coreTraits = this.getCoreTraits(lifePathNumber);
    const strengths = this.getStrengths(lifePathNumber, destinyNumber, masterNumbers);
    const challenges = this.getChallenges(challengeNumbers, lifePathNumber, karmicDebt);
    const careerGuidance = this.getCareerGuidance(lifePathNumber, destinyNumber, masterNumbers);
    const relationships = this.getRelationshipPatterns(lifePathNumber, soulUrgeNumber);
    const lifeCycle = this.getLifeCycleAnalysis(birthDate, lifePathNumber, pinnacleNumbers, challengeNumbers);
    const harmonyAnalysis = this.getHarmonyOfSpheres(lifePathNumber, birthDate);
    const tetractysMapping = this.getTetractysMapping(lifePathNumber, destinyNumber, soulUrgeNumber, birthDayNumber, maturityNumber);
    const compatibility = this.calculateJobCompatibility(lifePathNumber, destinyNumber, personalityNumber, masterNumbers);
    
    const analysis = this.generateDetailedAnalysis({
      fullName,
      birthDate,
      lifePathNumber,
      destinyNumber,
      personalityNumber,
      soulUrgeNumber,
      maturityNumber,
      masterNumbers,
      coreTraits,
      strengths,
      challenges,
      careerGuidance,
      harmonyAnalysis,
      tetractysMapping
    });
    
    return {
      lifePathNumber,
      destinyNumber,
      personalityNumber,
      soulUrgeNumber,
      attitudeLessonNumber,
      birthDayNumber,
      maturityNumber,
      challengeNumbers,
      pinnacleNumbers,
      personalYearNumber,
      karmicLessons,
      karmicDebt,
      masterNumbers,
      coreTraits,
      strengths,
      challenges,
      careerGuidance,
      relationships,
      lifeCycle,
      harmonyAnalysis,
      tetractysMapping,
      analysis,
      compatibility
    };
  }

  private generateDetailedAnalysis(data: any): string {
    const masterNumberText = data.masterNumbers.length > 0 ? 
      `\n=== SỐ CHỦ ĐẠO (MASTER NUMBERS) ===\n${data.masterNumbers.map((num: number) => `• ${num} - Sứ mệnh đặc biệt`).join('\n')}\n` : '';
    
    const harmonyText = `\n=== HÒA ÂM VŨ TRỤ (HARMONY OF SPHERES) ===\n• ${data.harmonyAnalysis.lifePathTone}\n• Tần số cá nhân: ${data.harmonyAnalysis.personalFrequency}Hz\n• ${data.harmonyAnalysis.planetaryInfluence}\n• ${data.harmonyAnalysis.colorVibration}`;
    
    const tetractysText = `\n=== TETRACTYS - HÌNH HỌC THIÊNG ===\n• Monad (Nguồn): ${data.tetractysMapping.monad}\n• Dyad (Biểu hiện): ${data.tetractysMapping.dyad}\n• Triad (Linh hồn): ${data.tetractysMapping.triad}\n• Tetrad (Nền tảng): ${data.tetractysMapping.tetrad}\n• Decad (Hoàn thành): ${data.tetractysMapping.decad}`;

    return `
PHÂN TÍCH THẦN SỐ HỌC PYTHAGOREAN CHO ${data.fullName.toUpperCase()}
Ngày sinh: ${format(data.birthDate, 'dd/MM/yyyy')}
"Số là nguyên lý của mọi sự vật" - Pythagoras

=== CÁC SỐ CHÍNH (CORE NUMBERS) ===
• Số đường đời (Life Path): ${data.lifePathNumber} - Con đường tiến hóa của linh hồn
• Số định mệnh (Destiny): ${data.destinyNumber} - Sứ mệnh và biểu hiện ra thế giới
• Số cá tính (Personality): ${data.personalityNumber} - Cách thể hiện bên ngoài
• Số khát vọng tâm hồn (Soul Urge): ${data.soulUrgeNumber} - Động lực nội tâm sâu thẳm
• Số trưởng thành (Maturity): ${data.maturityNumber} - Hội tụ năng lượng ở tuổi trưởng thành
${masterNumberText}
=== ĐẶC ĐIỂM CỐT LÕI (PYTHAGOREAN TRAITS) ===
${data.coreTraits.map((trait: string) => `• ${trait}`).join('\n')}

=== ĐIỂM MẠNH TỰ NHIÊN ===
${data.strengths.map((strength: string) => `• ${strength}`).join('\n')}

=== THÁCH THỨC CẦN VƯỢT QUA ===
${data.challenges.map((challenge: string) => `• ${challenge}`).join('\n')}

=== HƯỚNG NGHIỆP PHÙ HỢP ===
${data.careerGuidance.map((career: string) => `• ${career}`).join('\n')}
${harmonyText}
${tetractysText}

=== TRIẾT LÝ PYTHAGOREAN ===
"Vũ trụ là một nhạc cụ khổng lồ. Mỗi thiên thể là một dây đàn,
và chuyển động của chúng tạo nên bản nhạc của Thượng Đế."

Bạn có tần số rung động đặc trưng là ${data.harmonyAnalysis.personalFrequency}Hz,
hòa cộng hưởng với ${data.harmonyAnalysis.lifePathTone}.
Khi sống đúng tần số này, bạn sẽ hòa điệu với toàn thể vũ trụ.

=== KẾT LUẬN ===
Theo triết lý Pythagoras, cuộc đời bạn là một bản nhạc độc đáo trong giao hưởng vĩ đại của vũ trụ.
Hãy lắng nghe "âm nhạc của các thiên thể" bên trong bạn và sống theo đúng tần số tự nhiên.
Khi đó, mọi khía cạnh của cuộc sống - từ sự nghiệp đến các mối quan hệ - sẽ tự nhiên hòa hợp và thành công.

"Người hiểu âm nhạc của các thiên thể, không cần nghe bằng tai, mà bằng linh hồn." - Pythagoras
    `.trim();
  }
}

export default new NumerologyService();