import { apiClient } from "./api-client";

export type Resume = {
  id: number;
  user_id: string;
  file_name: string;
  raw_text: string;
  structured_data: Record<string, unknown> | null;
  embedding_vector: number[] | null;
  created_at: string | null;
  updated_at: string | null;
  activated: boolean;
};

export type ResumePayload = {
  user_id: string;
  token: string;
};

export type ResumeUploadPayload = {
  file: File;
} & ResumePayload;

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

  return response.json();
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

  return response.json();
};
