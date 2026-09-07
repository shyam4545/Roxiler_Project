const { z } = require('zod');

// ─── Password regex: 8-16 chars, >=1 uppercase, >=1 special char ─────────────
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(16, 'Password must be at most 16 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const nameSchema = z
  .string()
  .min(20, 'Name must be at least 20 characters')
  .max(60, 'Name must be at most 60 characters');

// ─── Address: max 400 chars ───────────────────────────────────────────────────
const addressSchema = z
  .string()
  .max(400, 'Address must be at most 400 characters');

// ─── Email ────────────────────────────────────────────────────────────────────
const emailSchema = z.string().email('Invalid email address');

// ─── Schemas ──────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  address: addressSchema,
  role: z.enum(['ADMIN', 'USER', 'STORE_OWNER']),
});

const createStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(255),
  email: emailSchema,
  address: addressSchema,
  ownerId: z.number().int().positive().optional().nullable(),
});

const ratingSchema = z.object({
  value: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});

/**
 * Middleware factory to validate request body against a Zod schema.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return res.status(400).json({ message: 'Validation failed', errors });
  }
  req.body = result.data;
  next();
};

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  changePasswordSchema,
  createUserSchema,
  createStoreSchema,
  ratingSchema,
};
