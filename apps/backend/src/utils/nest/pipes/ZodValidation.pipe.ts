import { type PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import type { ZodTypeAny, ZodError } from 'zod';


/**
 * ZodValidationPipe
 *
 * A NestJS Pipe that validates incoming data against a Zod schema.
 * This is a functional alternative to class-validator and allows for
 * composable, functional input validation using the Zod library.
 *
 * Usage example:
 *
 * ```ts
 * const schema = z.object({
 *   email: z.string().email(),
 *   password: z.string().min(8)
 * });
 *
 * @Post('login')
 * login(@Body(new ZodValidationPipe(schema)) body: any) {
 *   // body is typed and validated
 * }
 * ```
 *
 * @template T - The inferred type of the Zod schema
 * @param schema - A Zod schema used to validate the request data
 * @throws {BadRequestException} - If the validation fails
 *
 * @returns A pipe that transforms and validates incoming data
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodTypeAny) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const formattedErrors = result.error.errors.map(err => ({
        path: err.path.join('.'),
        message: err.message,
      }));

      throw new BadRequestException({
        message: 'Validation failed',
        errors: formattedErrors,
      });
    }

    return result.data;
  };
}
