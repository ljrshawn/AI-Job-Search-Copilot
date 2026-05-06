import type {
  Resume,
  MatchJobsPayload,
  ResumePayload,
  ResumeUploadPayload,
} from "@/types/resume-types";
import { resumeSchema } from "@/types/resume-types";
import { apiClient } from "./api-client";
import { jobMatchesSchema, type JobMatch } from "@/types/job-types";

export const getResume = async (
  payload: ResumePayload,
): Promise<Resume | null> => {
  const response = await apiClient.get<Resume>("/resumes/", {
    headers: {
      Authorization: `Bearer ${payload.token}`,
    },
    query: {
      user_id: payload.user_id,
    },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to get resume");
  }

  return resumeSchema.parse(await response.json());
};

export const uploadResume = async (
  payload: ResumeUploadPayload,
): Promise<Resume> => {
  const formData = new FormData();
  formData.append("file", payload.file);

  const response = await apiClient.post<Resume>("/resumes/upload", formData, {
    headers: {
      Authorization: `Bearer ${payload.token}`,
    },
    query: {
      user_id: payload.user_id,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to upload resume");
  }

  return resumeSchema.parse(await response.json());
};

export const matchResumeToAllJob = async (
  payload: MatchJobsPayload,
): Promise<JobMatch[]> => {
  const response = await apiClient.get<JobMatch[]>("/match/", {
    headers: {
      Authorization: `Bearer ${payload.token}`,
    },
    query: {
      skip: payload.skip,
      limit: payload.limit,
    },
  });

  if (response.status === 404) {
    return [];
  }

  if (!response.ok) {
    throw new Error("Failed to match resume to job");
  }

  return jobMatchesSchema.parse(await response.json());
};
