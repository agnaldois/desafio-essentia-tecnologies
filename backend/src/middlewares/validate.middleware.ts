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
      res.status(400).json({
        error: 'Validation failed',
        statusCode: 400,
        details: errors.map((e) => Object.values(e.constraints ?? {})),
      });
      return;
    }
    req.body = dto;
    next();
  };
}
