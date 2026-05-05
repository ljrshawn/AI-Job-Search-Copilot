import { z } from "zod";

export const jobSchema = z.object({
  id: z.number(),
  origin_id: z.number(),
  title: z.string(),
  raw_content: z.string(),
  raw_text: z.string(),
  structured_data: z.record(z.string(), z.unknown()).nullable(),
  embedding_vector: z.array(z.number()).nullable(),
  salary: z.string().nullable(),
  share_link: z.string().nullable(),
  location: z.string().nullable(),
  advertiser: z.string().nullable(),
  expires_at: z.string().nullable(),
  is_expired: z.boolean(),
  listed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const jobMatchSchema = z.object({
  id: z.number(),
  title: z.string(),
  raw_content: z.string(),
  share_link: z.string().nullable(),
  score: z.number(),
  listed_at: z.string().nullable(),
  expires_at: z.string().nullable(),
  location: z.string().nullable(),
});

export const jobMatchesSchema = z.array(jobMatchSchema);

export type Job = z.infer<typeof jobSchema>;
export type JobMatch = z.infer<typeof jobMatchSchema>;
