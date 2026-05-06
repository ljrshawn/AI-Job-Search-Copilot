import { z } from "zod";

export const resumeSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  file_name: z.string(),
  raw_text: z.string(),
  structured_data: z.record(z.string(), z.unknown()).nullable(),
  embedding_vector: z.array(z.number()).nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  activated: z.boolean(),
});

export type Resume = z.infer<typeof resumeSchema>;

export type ResumePayload = {
  user_id: string;
  token: string;
};

export type MatchJobsPayload = ResumePayload & {
  skip?: number;
  limit?: number;
};

export type ResumeUploadPayload = {
  file: File;
} & ResumePayload;
