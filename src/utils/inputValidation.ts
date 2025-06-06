
import { z } from 'zod';

// Input sanitization utilities
export const sanitizeInput = {
  // Remove potentially dangerous characters
  sanitizeString(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  },

  // Sanitize email
  sanitizeEmail(email: string): string {
    return email.toLowerCase().trim();
  },

  // Sanitize phone number
  sanitizePhone(phone: string): string {
    return phone.replace(/[^\d\-\+\(\)\s]/g, '').trim();
  },

  // Sanitize URL
  sanitizeUrl(url: string): string {
    const sanitized = url.trim();
    // Only allow http and https protocols
    if (sanitized && !sanitized.match(/^https?:\/\//)) {
      return `https://${sanitized}`;
    }
    return sanitized;
  }
};

// Validation schemas
export const validationSchemas = {
  school: z.object({
    name: z.string().min(2, 'School name must be at least 2 characters').max(200, 'School name too long'),
    address: z.string().min(5, 'Address must be at least 5 characters').max(300, 'Address too long'),
    phone: z.string().min(8, 'Phone number must be at least 8 characters').max(20, 'Phone number too long'),
    principal: z.string().max(100, 'Principal name too long').optional(),
    website: z.string().url('Invalid URL format').optional().or(z.literal('')),
    grades: z.string().max(50, 'Grades description too long').optional(),
    enrollment: z.number().min(0).max(10000).optional()
  }),

  supplyPack: z.object({
    name: z.string().min(2, 'Pack name must be at least 2 characters').max(100, 'Pack name too long'),
    grade: z.string().min(1, 'Grade is required').max(20, 'Grade description too long'),
    price: z.number().min(0, 'Price must be positive').max(1000, 'Price too high'),
    description: z.string().max(500, 'Description too long').optional(),
    items: z.array(z.object({
      name: z.string().min(1, 'Item name required').max(100, 'Item name too long'),
      quantity: z.number().min(1, 'Quantity must be at least 1').max(100, 'Quantity too high'),
      price: z.number().min(0, 'Price must be positive').max(100, 'Item price too high')
    })).min(1, 'At least one item required')
  }),

  electronics: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters').max(100, 'Product name too long'),
    brand: z.string().min(1, 'Brand is required').max(50, 'Brand name too long'),
    category: z.string().min(1, 'Category is required').max(50, 'Category too long'),
    price: z.number().min(0, 'Price must be positive').max(10000, 'Price too high'),
    original_price: z.number().min(0, 'Original price must be positive').max(10000, 'Original price too high').optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    image: z.string().url('Invalid image URL').optional(),
    features: z.array(z.string().max(100, 'Feature description too long')).optional(),
    rating: z.number().min(0).max(5).optional(),
    reviews: z.number().min(0).max(10000).optional()
  }),

  userProfile: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    phone: z.string().max(20, 'Phone number too long').optional(),
    address: z.string().max(300, 'Address too long').optional(),
    role: z.enum(['Cliente', 'Admin'], { required_error: 'Valid role required' })
  }),

  sliderImage: z.object({
    title_key: z.string().min(1, 'Title is required').max(100, 'Title too long'),
    subtitle_key: z.string().min(1, 'Subtitle is required').max(200, 'Subtitle too long'),
    button_text_key: z.string().max(50, 'Button text too long').optional(),
    button_link: z.string().min(1, 'Button link is required').max(200, 'Button link too long'),
    image_url: z.string().url('Invalid image URL'),
    background_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
    display_order: z.number().min(0).max(100),
    is_active: z.boolean()
  })
};

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(identifier);

    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingTime(identifier: string): number {
    const record = this.attempts.get(identifier);
    if (!record) return 0;
    
    const remaining = record.resetTime - Date.now();
    return Math.max(0, remaining);
  }
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes
