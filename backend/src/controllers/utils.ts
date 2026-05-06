/**
 * Parse and validate a route :id parameter.
 * Throws a 400 error if the value is not a positive integer.
 * This prevents NaN or 0 from reaching the service/repository layer (CR-02).
 */
export function parseId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) {
    throw Object.assign(new Error('Invalid task id'), { status: 400 });
  }
  return id;
}
