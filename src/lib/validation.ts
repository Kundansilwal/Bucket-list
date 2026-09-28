import { z } from "zod";
import { config } from "@/lib/config";

export const publicIdSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^BL-[A-HJ-NP-Z2-9]{8}$/, "That Bucket List ID isn't valid.");

export const createBucketListSchema = z.object({
  items: z
    .array(z.string().trim().min(1, "A dream cannot be empty.").max(config.maxItemLength))
    .min(1, "Add at least one dream.")
    .max(config.maxItems)
    .transform((items) => [...new Set(items.map((item) => item.replace(/\s+/g, " ")))]),
});
