import { z } from "zod";

export const CouponSchema = z.object({
  code: z.string().min(1, "Code is required"),
  type: z.enum(["fixed", "percentage"]),
  discount: z.coerce.number().positive("Discount must be greater than 0"),
  minOrderAmount: z.coerce.number().min(0, "Minimum order amount is required"),
  maxDiscountAmount: z.coerce
    .number()
    .min(0, "Max discount amount is required"),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  usageLimit: z.coerce.number().min(1, "Usage limit is required"),
});
