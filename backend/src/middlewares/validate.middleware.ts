import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RequestHandler } from 'express';

export function validateBody<T extends object>(
  DtoClass: new () => T,
): RequestHandler {
  return async (req, res, next) => {
    const dto = plainToInstance(DtoClass, req.body);
    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length > 0) {
      // WR-05: route through errorMiddleware for a unified error response shape.
      // Attaching 'details' to the error object lets errorMiddleware include it.
      const appErr = Object.assign(new Error('Validation failed'), {
        status: 400,
        details: errors.map((e) => Object.values(e.constraints ?? {})),
      });
      return next(appErr);
    }
    req.body = dto;
    next();
  };
}
