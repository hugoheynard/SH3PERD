import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../ZodValidation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });

  const pipe = new ZodValidationPipe(schema);

  it('should return value if valid', () => {
    const input = { email: 'test@example.com', password: 'supersecure' };
    const result = pipe.transform(input);
    expect(result).toEqual(input);
  });

  it('should throw BadRequestException for invalid email', () => {
    const input = { email: 'not-an-email', password: 'supersecure' };
    expect(() => pipe.transform(input)).toThrow(BadRequestException);
  });

  it('should throw BadRequestException for short password', () => {
    const input = { email: 'test@example.com', password: '123' };
    expect(() => pipe.transform(input)).toThrow(BadRequestException);
  });

  it('should include validation messages in error', () => {
    const input = { email: '', password: '' };

    try {
      pipe.transform(input);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as any;
      expect(response).toHaveProperty('errors');
      expect(response.errors.length).toBeGreaterThan(0);
    }
  });
});
