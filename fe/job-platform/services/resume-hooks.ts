"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getResume,
  uploadResume,
  type ResumePayload,
  type ResumeUploadPayload,
} from "@/services/resume";

export const resumeKeys = {
  all: ["resumes"] as const,
  current: (userId?: string) => [...resumeKeys.all, "current", userId] as const,
};

export function useCurrentResume(payload?: ResumePayload) {
  return useQuery({
    queryKey: resumeKeys.current(payload?.user_id),
    queryFn: () => {
      if (!payload) {
        throw new Error("Missing resume query payload");
      }

      return getResume(payload);
    },
    enabled: Boolean(payload?.user_id && payload?.token),
  });
}

export function useUploadResume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ResumeUploadPayload) => uploadResume(payload),
    onSuccess: (resume) => {
      queryClient.setQueryData(resumeKeys.current(resume.user_id), resume);
      queryClient.invalidateQueries({
        queryKey: resumeKeys.current(resume.user_id),
      });
    },
  });
}
