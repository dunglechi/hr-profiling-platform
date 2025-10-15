/**
 * Numerology Service
 * Integrates existing numerology logic with CV parsing
 */

const { logger } = require('../utils/logger');

class NumerologyService {
  /**
   * Calculate numerology analysis from birth date and name
   * @param {string} birthDate - Birth date in YYYY-MM-DD format
   * @param {string} fullName - Full name of candidate
   * @returns {Object} Numerology analysis
   */
  static calculateNumerology(birthDate, fullName) {
    try {
      logger.debug('Calculating numerology', { birthDate, fullName });

      // Parse birth date
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid birth date format');
      }

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      // Calculate core numbers
      const lifePathNumber = this.calculateLifePath(day, month, year);
      const destinyNumber = this.calculateDestiny(fullName);
      const soulUrgeNumber = this.calculateSoulUrge(fullName);
      const personalityNumber = this.calculatePersonality(fullName);

      // Get interpretations
      const analysis = {
        lifePathNumber,
        destinyNumber,
        soulUrgeNumber,
        personalityNumber,
        interpretation: {
          lifePath: this.getLifePathInterpretation(lifePathNumber),
          destiny: this.getDestinyInterpretation(destinyNumber),
          personality: this.getPersonalityInterpretation(personalityNumber),
          careerGuidance: this.getCareerGuidance(lifePathNumber, destinyNumber)
        },
        culturalContext: this.getVietnameseCulturalContext(lifePathNumber),
        workstyleProfile: this.getWorkstyleProfile(lifePathNumber, personalityNumber)
      };

      logger.debug('Numerology calculation completed', { analysis });
      return analysis;

    } catch (error) {
      logger.error('Numerology calculation failed', { 
        birthDate, 
        fullName, 
        error: error.message 
      });
      return null;
    }
  }

  /**
   * Calculate Life Path Number
   */
  static calculateLifePath(day, month, year) {
    const sum = day + month + year;
    return this.reduceToSingleDigit(sum);
  }

  /**
   * Calculate Destiny Number from full name
   */
  static calculateDestiny(fullName) {
    const nameValue = this.getNameValue(fullName);
    return this.reduceToSingleDigit(nameValue);
  }

  /**
   * Calculate Soul Urge Number (vowels only)
   */
  static calculateSoulUrge(fullName) {
    const vowels = fullName.toLowerCase().match(/[aeiou]/g) || [];
    const vowelValue = vowels.reduce((sum, vowel) => sum + this.getLetterValue(vowel), 0);
    return this.reduceToSingleDigit(vowelValue);
  }

  /**
   * Calculate Personality Number (consonants only)
   */
  static calculatePersonality(fullName) {
    const consonants = fullName.toLowerCase().match(/[bcdfghjklmnpqrstvwxyz]/g) || [];
    const consonantValue = consonants.reduce((sum, consonant) => sum + this.getLetterValue(consonant), 0);
    return this.reduceToSingleDigit(consonantValue);
  }

  /**
   * Get numerical value of name
   */
  static getNameValue(name) {
    return name.toLowerCase()
      .replace(/[^a-z]/g, '')
      .split('')
      .reduce((sum, letter) => sum + this.getLetterValue(letter), 0);
  }

  /**
   * Get numerical value of letter (A=1, B=2, ..., Z=26)
   */
  static getLetterValue(letter) {
    return letter.charCodeAt(0) - 96; // 'a' = 97, so 'a' - 96 = 1
  }

  /**
   * Reduce number to single digit (except master numbers 11, 22, 33)
   */
  static reduceToSingleDigit(number) {
    while (number > 9 && number !== 11 && number !== 22 && number !== 33) {
      number = number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return number;
  }

  /**
   * Get Life Path interpretation
   */
  static getLifePathInterpretation(number) {
    const interpretations = {
      1: "Natural leader, independent, innovative",
      2: "Cooperative, diplomatic, patient",
      3: "Creative, expressive, optimistic",
      4: "Practical, organized, hardworking",
      5: "Adventurous, versatile, freedom-loving",
      6: "Nurturing, responsible, family-oriented",
      7: "Analytical, introspective, spiritual",
      8: "Ambitious, material success, leadership",
      9: "Humanitarian, generous, idealistic",
      11: "Intuitive, inspirational, enlightened",
      22: "Master builder, practical visionary",
      33: "Master teacher, compassionate leader"
    };
    return interpretations[number] || "Unknown";
  }

  /**
   * Get Destiny interpretation
   */
  static getDestinyInterpretation(number) {
    const interpretations = {
      1: "Destined for leadership and innovation",
      2: "Destined for cooperation and partnerships",
      3: "Destined for creative expression",
      4: "Destined for building and organizing",
      5: "Destined for freedom and adventure",
      6: "Destined for service and nurturing",
      7: "Destined for knowledge and wisdom",
      8: "Destined for material achievement",
      9: "Destined for humanitarian service"
    };
    return interpretations[number] || "Unique path ahead";
  }

  /**
   * Get Personality interpretation
   */
  static getPersonalityInterpretation(number) {
    const interpretations = {
      1: "Appears confident and independent",
      2: "Appears gentle and cooperative",
      3: "Appears creative and entertaining",
      4: "Appears reliable and practical",
      5: "Appears dynamic and versatile",
      6: "Appears caring and responsible",
      7: "Appears mysterious and analytical",
      8: "Appears ambitious and successful",
      9: "Appears generous and wise"
    };
    return interpretations[number] || "Unique personality";
  }

  /**
   * Get career guidance based on numbers
   */
  static getCareerGuidance(lifePath, destiny) {
    const guidance = {
      1: ["Management", "Entrepreneurship", "Sales", "Leadership roles"],
      2: ["Human Resources", "Counseling", "Diplomacy", "Teamwork roles"],
      3: ["Marketing", "Arts", "Entertainment", "Communications"],
      4: ["Engineering", "Accounting", "Project Management", "Operations"],
      5: ["Travel", "Marketing", "Consulting", "Diverse roles"],
      6: ["Healthcare", "Education", "Social Work", "Service roles"],
      7: ["Research", "IT", "Analysis", "Knowledge work"],
      8: ["Finance", "Business", "Real Estate", "Executive roles"],
      9: ["NGOs", "Teaching", "Counseling", "Humanitarian work"]
    };

    const primary = guidance[lifePath] || [];
    const secondary = guidance[destiny] || [];
    
    return [...new Set([...primary, ...secondary])];
  }

  /**
   * Get Vietnamese cultural context
   */
  static getVietnameseCulturalContext(lifePath) {
    const contexts = {
      1: "Suitable for Vietnamese business leadership culture",
      2: "Aligns with Vietnamese harmony and cooperation values",
      3: "Matches Vietnamese creativity and expression traditions",
      4: "Fits Vietnamese work ethic and dedication",
      5: "Balances Vietnamese stability with modern flexibility",
      6: "Strong alignment with Vietnamese family values",
      7: "Resonates with Vietnamese wisdom and learning traditions",
      8: "Compatible with Vietnamese business and success orientation",
      9: "Aligns with Vietnamese community service values"
    };
    return contexts[lifePath] || "Unique cultural position";
  }

  /**
   * Get workstyle profile
   */
  static getWorkstyleProfile(lifePath, personality) {
    return {
      leadership: lifePath === 1 || lifePath === 8 ? "High" : lifePath === 2 || lifePath === 6 ? "Supportive" : "Moderate",
      teamwork: lifePath === 2 || lifePath === 6 || lifePath === 9 ? "Excellent" : "Good",
      creativity: lifePath === 3 || lifePath === 5 ? "High" : "Moderate",
      analytical: lifePath === 7 || lifePath === 4 ? "Strong" : "Moderate",
      independence: lifePath === 1 || lifePath === 5 ? "High" : "Moderate",
      communication: personality === 3 || personality === 1 ? "Strong" : "Good"
    };
  }
}

module.exports = NumerologyService;