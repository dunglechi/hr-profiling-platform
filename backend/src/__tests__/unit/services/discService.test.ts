import { describe, test, expect } from '@jest/globals';
import {
  calculateDISCScores,
  determinePrimaryStyle,
  generateDISCAnalysis,
  calculateDISCAssessment,
  getDISCQuestions,
  validateDISCResponses,
  DISCResponse
} from '../../../services/discService';

describe('DISCService', () => {
  describe('calculateDISCScores', () => {
    test('should calculate DISC scores correctly for balanced responses', () => {
      const responses: DISCResponse[] = [
        { questionId: 1, mostLike: true, leastLike: false, neutral: false },
        { questionId: 2, mostLike: false, leastLike: true, neutral: false },
        { questionId: 3, mostLike: false, leastLike: false, neutral: true },
        { questionId: 4, mostLike: true, leastLike: false, neutral: false }
      ];

      // Add more responses to reach 28 total
      for (let i = 5; i <= 28; i++) {
        responses.push({
          questionId: i,
          mostLike: i % 3 === 0,
          leastLike: i % 3 === 1,
          neutral: i % 3 === 2
        });
      }

      const scores = calculateDISCScores(responses);
      
      expect(typeof scores.D).toBe('number');
      expect(typeof scores.I).toBe('number');
      expect(typeof scores.S).toBe('number');
      expect(typeof scores.C).toBe('number');
      
      expect(scores.D).toBeGreaterThanOrEqual(0);
      expect(scores.D).toBeLessThanOrEqual(100);
      expect(scores.I).toBeGreaterThanOrEqual(0);
      expect(scores.I).toBeLessThanOrEqual(100);
      expect(scores.S).toBeGreaterThanOrEqual(0);
      expect(scores.S).toBeLessThanOrEqual(100);
      expect(scores.C).toBeGreaterThanOrEqual(0);
      expect(scores.C).toBeLessThanOrEqual(100);
    });

    test('should handle high Dominance responses', () => {
      const responses: DISCResponse[] = [];
      
      // Create responses favoring D (Dominance) dimension
      for (let i = 1; i <= 28; i++) {
        responses.push({
          questionId: i,
          mostLike: i <= 7, // Only D questions (1-7) get mostLike
          leastLike: i >= 22, // C questions get leastLike  
          neutral: i >= 8 && i <= 21 // I and S questions get neutral
        });
      }

      const scores = calculateDISCScores(responses);
      
      // Dominance should be highest
      expect(scores.D).toBeGreaterThan(60); // Should be high
      expect(scores.D).toBeGreaterThan(scores.I);
      expect(scores.D).toBeGreaterThan(scores.S);
      expect(scores.D).toBeGreaterThan(scores.C);
    });
  });

  describe('determinePrimaryStyle', () => {
    test('should identify Dominance as primary style', () => {
      const scores = { D: 85, I: 45, S: 30, C: 55 };
      const result = determinePrimaryStyle(scores);
      
      expect(result.primary).toBe('D');
      expect(result.intensity).toBe('High');
    });

    test('should identify Influence as primary style with moderate intensity', () => {
      const scores = { D: 40, I: 65, S: 50, C: 45 };
      const result = determinePrimaryStyle(scores);
      
      expect(result.primary).toBe('I');
      expect(result.intensity).toBe('Moderate');
    });

    test('should identify secondary style when scores are close', () => {
      const scores = { D: 75, I: 70, S: 35, C: 40 };
      const result = determinePrimaryStyle(scores);
      
      expect(result.primary).toBe('D');
      expect(result.secondary).toBe('I');
    });

    test('should handle balanced scores', () => {
      const scores = { D: 75, I: 60, S: 55, C: 50 }; // Gap of 15 should be Moderate
      const result = determinePrimaryStyle(scores);
      
      expect(['D', 'I', 'S', 'C']).toContain(result.primary);
      expect(result.intensity).toBe('Moderate');
    });
  });

  describe('generateDISCAnalysis', () => {
    test('should generate comprehensive analysis for Dominance style', () => {
      const scores = { D: 85, I: 45, S: 30, C: 55 };
      const analysis = generateDISCAnalysis(scores, 'D', 'High');
      
      expect(analysis.strengths).toBeInstanceOf(Array);
      expect(analysis.strengths.length).toBeGreaterThan(0);
      expect(analysis.challenges).toBeInstanceOf(Array);
      expect(analysis.challenges.length).toBeGreaterThan(0);
      expect(typeof analysis.communication).toBe('string');
      expect(typeof analysis.motivation).toBe('string');
      expect(typeof analysis.workEnvironment).toBe('string');
      expect(typeof analysis.leadership).toBe('string');
      expect(typeof analysis.decisionMaking).toBe('string');
      expect(typeof analysis.stressResponse).toBe('string');
    });

    test('should generate different analysis for different styles', () => {
      const scoresD = { D: 85, I: 45, S: 30, C: 55 };
      const scoresI = { D: 35, I: 85, S: 40, C: 30 };
      
      const analysisD = generateDISCAnalysis(scoresD, 'D', 'High');
      const analysisI = generateDISCAnalysis(scoresI, 'I', 'High');
      
      expect(analysisD.communication).not.toBe(analysisI.communication);
      expect(analysisD.leadership).not.toBe(analysisI.leadership);
    });
  });

  describe('calculateDISCAssessment', () => {
    test('should complete full DISC assessment with 28 responses', () => {
      const responses: DISCResponse[] = [];
      
      // Create 28 valid responses
      for (let i = 1; i <= 28; i++) {
        responses.push({
          questionId: i,
          mostLike: i % 4 === 1,
          leastLike: i % 4 === 2,
          neutral: i % 4 === 0
        });
      }

      const result = calculateDISCAssessment(responses);
      
      expect(result.scores).toBeDefined();
      expect(result.primaryStyle).toBeDefined();
      expect(['D', 'I', 'S', 'C']).toContain(result.primaryStyle);
      expect(result.intensity).toBeDefined();
      expect(['High', 'Moderate', 'Low']).toContain(result.intensity);
      expect(result.analysis).toBeDefined();
      expect(result.behavioralTraits).toBeDefined();
      expect(result.compatibility).toBeDefined();
    });

    test('should throw error for incomplete responses', () => {
      const incompleteResponses: DISCResponse[] = [
        { questionId: 1, mostLike: true, leastLike: false, neutral: false }
      ];

      expect(() => {
        calculateDISCAssessment(incompleteResponses);
      }).toThrow('DISC assessment requires responses to all 28 questions');
    });
  });

  describe('getDISCQuestions', () => {
    test('should return 28 DISC questions', () => {
      const questions = getDISCQuestions();
      
      expect(questions).toBeInstanceOf(Array);
      expect(questions.length).toBe(28);
      
      questions.forEach((question, index) => {
        expect(question.id).toBe(index + 1);
        expect(typeof question.text).toBe('string');
        expect(question.text.length).toBeGreaterThan(0);
        expect(['D', 'I', 'S', 'C']).toContain(question.dimension);
        expect(typeof question.weight).toBe('number');
        expect(question.weight).toBeGreaterThanOrEqual(1);
        expect(question.weight).toBeLessThanOrEqual(3);
      });
    });

    test('should have balanced distribution of dimensions', () => {
      const questions = getDISCQuestions();
      const dimensionCount = { D: 0, I: 0, S: 0, C: 0 };
      
      questions.forEach(question => {
        dimensionCount[question.dimension]++;
      });
      
      // Each dimension should have at least 5 questions
      expect(dimensionCount.D).toBeGreaterThanOrEqual(5);
      expect(dimensionCount.I).toBeGreaterThanOrEqual(5);
      expect(dimensionCount.S).toBeGreaterThanOrEqual(5);
      expect(dimensionCount.C).toBeGreaterThanOrEqual(5);
    });
  });

  describe('validateDISCResponses', () => {
    test('should validate correct responses', () => {
      const validResponses: DISCResponse[] = [];
      
      for (let i = 1; i <= 28; i++) {
        validResponses.push({
          questionId: i,
          mostLike: i % 3 === 1,
          leastLike: i % 3 === 2,
          neutral: i % 3 === 0
        });
      }

      const validation = validateDISCResponses(validResponses);
      
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect insufficient responses', () => {
      const insufficientResponses: DISCResponse[] = [
        { questionId: 1, mostLike: true, leastLike: false, neutral: false }
      ];

      const validation = validateDISCResponses(insufficientResponses);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Must answer all 28 questions');
    });

    test('should detect invalid response selections', () => {
      const invalidResponses: DISCResponse[] = [];
      
      for (let i = 1; i <= 28; i++) {
        invalidResponses.push({
          questionId: i,
          mostLike: true,
          leastLike: true, // Invalid: both mostLike and leastLike selected
          neutral: false
        });
      }

      const validation = validateDISCResponses(invalidResponses);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors[0]).toContain('Must select exactly one option');
    });

    test('should detect missing responses', () => {
      const responses: DISCResponse[] = [];
      
      // Missing question 1
      for (let i = 2; i <= 28; i++) {
        responses.push({
          questionId: i,
          mostLike: i % 3 === 1,
          leastLike: i % 3 === 2,
          neutral: i % 3 === 0
        });
      }

      const validation = validateDISCResponses(responses);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Missing response for question 1');
    });

    test('should detect no selection made', () => {
      const noSelectionResponses: DISCResponse[] = [];
      
      for (let i = 1; i <= 28; i++) {
        noSelectionResponses.push({
          questionId: i,
          mostLike: false,
          leastLike: false,
          neutral: false // No selection made
        });
      }

      const validation = validateDISCResponses(noSelectionResponses);
      
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBe(28); // All questions have errors
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle extreme high scores', () => {
      const extremeScores = { D: 100, I: 0, S: 0, C: 0 };
      const result = determinePrimaryStyle(extremeScores);
      
      expect(result.primary).toBe('D');
      expect(result.intensity).toBe('High');
    });

    test('should handle all zero scores gracefully', () => {
      const zeroScores = { D: 0, I: 0, S: 0, C: 0 };
      const result = determinePrimaryStyle(zeroScores);
      
      expect(['D', 'I', 'S', 'C']).toContain(result.primary);
    });

    test('should generate analysis for all intensity levels', () => {
      const scoresHigh = { D: 90, I: 30, S: 20, C: 40 };
      const scoresModerate = { D: 60, I: 40, S: 35, C: 45 };
      const scoresLow = { D: 35, I: 30, S: 40, C: 45 };
      
      const analysisHigh = generateDISCAnalysis(scoresHigh, 'D', 'High');
      const analysisModerate = generateDISCAnalysis(scoresModerate, 'D', 'Moderate');
      const analysisLow = generateDISCAnalysis(scoresLow, 'C', 'Low');
      
      expect(analysisHigh.strengths.length).toBeGreaterThan(0);
      expect(analysisModerate.strengths.length).toBeGreaterThan(0);
      expect(analysisLow.strengths.length).toBeGreaterThan(0);
    });

    test('should maintain score consistency across calculations', () => {
      const responses: DISCResponse[] = [];
      
      // Create consistent responses
      for (let i = 1; i <= 28; i++) {
        responses.push({
          questionId: i,
          mostLike: i <= 7,
          leastLike: i > 21,
          neutral: i > 7 && i <= 21
        });
      }

      const scores1 = calculateDISCScores(responses);
      const scores2 = calculateDISCScores(responses);
      
      expect(scores1.D).toBe(scores2.D);
      expect(scores1.I).toBe(scores2.I);
      expect(scores1.S).toBe(scores2.S);
      expect(scores1.C).toBe(scores2.C);
    });
  });

  describe('Integration Tests', () => {
    test('should complete full assessment workflow', () => {
      // Step 1: Get questions
      const questions = getDISCQuestions();
      expect(questions.length).toBe(28);
      
      // Step 2: Create responses
      const responses: DISCResponse[] = questions.map((question, index) => ({
        questionId: question.id,
        mostLike: index % 3 === 0,
        leastLike: index % 3 === 1,
        neutral: index % 3 === 2
      }));
      
      // Step 3: Validate responses
      const validation = validateDISCResponses(responses);
      expect(validation.isValid).toBe(true);
      
      // Step 4: Calculate assessment
      const result = calculateDISCAssessment(responses);
      expect(result).toBeDefined();
      expect(result.primaryStyle).toBeDefined();
      expect(result.scores).toBeDefined();
    });

    test('should produce different results for different response patterns', () => {
      // Pattern 1: Dominance-focused responses
      const dominanceResponses: DISCResponse[] = [];
      for (let i = 1; i <= 28; i++) {
        dominanceResponses.push({
          questionId: i,
          mostLike: i <= 10,
          leastLike: i > 20,
          neutral: i > 10 && i <= 20
        });
      }
      
      // Pattern 2: Influence-focused responses
      const influenceResponses: DISCResponse[] = [];
      for (let i = 1; i <= 28; i++) {
        influenceResponses.push({
          questionId: i,
          mostLike: i > 10 && i <= 20,
          leastLike: i <= 5,
          neutral: i > 20 || (i > 5 && i <= 10)
        });
      }
      
      const result1 = calculateDISCAssessment(dominanceResponses);
      const result2 = calculateDISCAssessment(influenceResponses);
      
      // Results should be different
      expect(result1.primaryStyle !== result2.primaryStyle || 
             result1.scores.D !== result2.scores.D ||
             result1.scores.I !== result2.scores.I).toBe(true);
    });
  });
});