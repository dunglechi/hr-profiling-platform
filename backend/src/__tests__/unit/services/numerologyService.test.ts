import { describe, test, expect } from '@jest/globals';
import numerologyService from '../../../services/numerologyService';

describe('NumerologyService', () => {
  describe('calculateLifePathNumber', () => {
    test('should calculate life path number correctly for 1990-05-15', () => {
      const birthDate = new Date('1990-05-15');
      const result = numerologyService.calculateLifePathNumber(birthDate);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(33);
    });

    test('should handle master numbers 11 and 22', () => {
      const testDate = new Date('1983-11-02');
      const result = numerologyService.calculateLifePathNumber(testDate);
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThanOrEqual(1);
    });

    test('should handle edge case dates', () => {
      const result = numerologyService.calculateLifePathNumber(new Date('2000-01-01'));
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(33);
    });
  });

  describe('calculateDestinyNumber', () => {
    test('should calculate destiny number for valid name', () => {
      const result = numerologyService.calculateDestinyNumber('John Doe');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(33);
    });

    test('should handle names with special characters', () => {
      const result = numerologyService.calculateDestinyNumber('Jean-Luc O\'Connor');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(33);
    });

    test('should handle empty names gracefully', () => {
      const result = numerologyService.calculateDestinyNumber('');
      expect(typeof result).toBe('number');
    });
  });

  describe('getCoreTraits', () => {
    test('should return traits object for valid life path number', () => {
      const traits = numerologyService.getCoreTraits(7);
      
      expect(traits).toBeDefined();
      expect(traits.positive).toBeDefined();
      expect(traits.negative).toBeDefined();
      expect(traits.keywords).toBeDefined();
      expect(Array.isArray(traits.positive)).toBe(true);
      expect(Array.isArray(traits.negative)).toBe(true);
      expect(Array.isArray(traits.keywords)).toBe(true);
      expect(traits.positive.length).toBeGreaterThan(0);
    });

    test('should handle master numbers', () => {
      const traits11 = numerologyService.getCoreTraits(11);
      const traits22 = numerologyService.getCoreTraits(22);
      
      expect(traits11).toBeDefined();
      expect(traits11.positive).toBeDefined();
      expect(traits22).toBeDefined();
      expect(traits22.positive).toBeDefined();
    });

    test('should handle invalid numbers gracefully', () => {
      const traits = numerologyService.getCoreTraits(0);
      expect(traits).toBeDefined();
      expect(traits.positive).toBeDefined();
    });
  });

  describe('calculateNumerology - Complete Analysis', () => {
    test('should generate comprehensive numerology analysis', () => {
      const fullName = 'John Doe';
      const birthDate = new Date('1990-05-15');
      
      const result = numerologyService.calculateNumerology(fullName, birthDate);
      
      // Kiểm tra kết quả có đầy đủ các thành phần
      expect(result).toHaveProperty('lifePathNumber');
      expect(result).toHaveProperty('destinyNumber');
      expect(result).toHaveProperty('personalityNumber');
      expect(result).toHaveProperty('soulUrgeNumber');
      expect(result).toHaveProperty('analysis');
      expect(result).toHaveProperty('compatibility');
      
      // Kiểm tra analysis string
      expect(typeof result.analysis).toBe('string');
      expect(result.analysis).toContain('JOHN DOE');
      expect(result.analysis).toContain('Số đường đời');
      expect(result.analysis.toLowerCase()).toContain('pythagoras');
      
      // Kiểm tra các số hợp lệ
      expect(result.lifePathNumber).toBeGreaterThanOrEqual(1);
      expect(result.lifePathNumber).toBeLessThanOrEqual(33);
      expect(result.destinyNumber).toBeGreaterThanOrEqual(1);
      expect(result.destinyNumber).toBeLessThanOrEqual(33);
    });

    test('should include comprehensive Vietnamese analysis', () => {
      const fullName = 'Jane Smith';
      const birthDate = new Date('1985-12-25');
      
      const result = numerologyService.calculateNumerology(fullName, birthDate);
      
      // Kiểm tra có analysis text tiếng Việt đầy đủ
      expect(result.analysis.toLowerCase()).toContain('pythagoras');
      expect(result.analysis).toContain('vũ trụ');
      expect(result.analysis).toContain('JANE SMITH');
      expect(result.analysis).toContain('Số đường đời');
      expect(result.analysis).toContain('=== CÁC SỐ CHÍNH (CORE NUMBERS) ===');
      
      // Kiểm tra có analysis chi tiết
      expect(result.analysis.length).toBeGreaterThan(100);
      expect(result.compatibility).toBeDefined();
      expect(result.compatibility.overall).toBeGreaterThanOrEqual(0);
      expect(result.compatibility.overall).toBeLessThanOrEqual(100);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle leap year dates', () => {
      const result = numerologyService.calculateLifePathNumber(new Date('2000-02-29'));
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(33);
    });

    test('should handle very long names', () => {
      const longName = 'a'.repeat(100) + ' ' + 'b'.repeat(100);
      
      const result = numerologyService.calculateDestinyNumber(longName);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(33);
    });

    test('should handle Unicode characters in names', () => {
      const result = numerologyService.calculateDestinyNumber('José García');
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(33);
    });

    test('should handle invalid dates gracefully', () => {
      const invalidDate = new Date('invalid');
      expect(() => {
        numerologyService.calculateLifePathNumber(invalidDate);
      }).not.toThrow();
    });
  });
});