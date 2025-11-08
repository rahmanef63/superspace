import { describe, it, expect } from 'vitest';
import { transformTextToNumber } from './dataTransformer';

describe('dataTransformer - Text to Number', () => {
  describe('Pure numeric strings', () => {
    it('should convert "123" to 123', () => {
      expect(transformTextToNumber("123")).toBe(123);
    });

    it('should convert "45.67" to 45.67', () => {
      expect(transformTextToNumber("45.67")).toBe(45.67);
    });

    it('should convert "-123" to -123', () => {
      expect(transformTextToNumber("-123")).toBe(-123);
    });

    it('should convert "-45.67" to -45.67', () => {
      expect(transformTextToNumber("-45.67")).toBe(-45.67);
    });
  });

  describe('Mixed strings (letters + numbers)', () => {
    it('should strip letters: "abc123" → 123', () => {
      const result = transformTextToNumber("abc123");
      console.log('Test "abc123" →', result);
      expect(result).toBe(123);
    });

    it('should strip letters: "123abc" → 123', () => {
      const result = transformTextToNumber("123abc");
      console.log('Test "123abc" →', result);
      expect(result).toBe(123);
    });

    it('should strip letters: "abc123def" → 123', () => {
      const result = transformTextToNumber("abc123def");
      console.log('Test "abc123def" →', result);
      expect(result).toBe(123);
    });

    it('should extract number: "price: $45.67" → 45.67', () => {
      const result = transformTextToNumber("price: $45.67");
      console.log('Test "price: $45.67" →', result);
      expect(result).toBe(45.67);
    });
  });

  describe('Invalid inputs', () => {
    it('should return null for pure text "abc"', () => {
      const result = transformTextToNumber("abc");
      console.log('Test "abc" →', result);
      expect(result).toBe(null);
    });

    it('should return null for empty string', () => {
      expect(transformTextToNumber("")).toBe(null);
    });

    it('should return null for null', () => {
      expect(transformTextToNumber(null)).toBe(null);
    });

    it('should return null for undefined', () => {
      expect(transformTextToNumber(undefined)).toBe(null);
    });
  });

  describe('Edge cases', () => {
    it('should handle whitespace: "  123  " → 123', () => {
      expect(transformTextToNumber("  123  ")).toBe(123);
    });

    it('should return null for only minus "-"', () => {
      expect(transformTextToNumber("-")).toBe(null);
    });

    it('should return null for only dot "."', () => {
      expect(transformTextToNumber(".")).toBe(null);
    });
  });
});
