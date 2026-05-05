import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  UploadFileButton,
  type FileUploadPayload,
  type FileUploadResult,
  type UploadedFileItem,
} from "@/components/uploadFileButton";

type DashboardSummaryProps = {
  name?: string | null;
  userId?: string;
  token?: string;
  resumeFiles: UploadedFileItem[];
  isResumeLoading: boolean;
  acceptedResumeFileTypes: string[];
  uploadResumeFile: (payload: FileUploadPayload) => Promise<FileUploadResult>;
  onResumeUploadSuccess: () => void;
};

function getGreeting(name?: string | null) {
  const firstName = name?.trim().split(" ")[0];
  return firstName ? `Welcome back, ${firstName}` : "Welcome back";
}

export function DashboardSummary({
  name,
  userId,
  token,
  resumeFiles,
  isResumeLoading,
  acceptedResumeFileTypes,
  uploadResumeFile,
  onResumeUploadSuccess,
}: DashboardSummaryProps) {
  return (
    <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end">
      <div className="min-w-0">
        <p className="text-sm font-medium text-cyan-700">Dashboard</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
          {getGreeting(name)}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Your search is organized around the roles with the strongest fit,
          freshest activity, and next steps that keep momentum moving.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <UploadFileButton
          userId={userId}
          token={token}
          acceptedFileTypes={acceptedResumeFileTypes}
          uploadFn={uploadResumeFile}
          historyFiles={resumeFiles}
          isHistoryLoading={isResumeLoading}
          onUploadSuccess={onResumeUploadSuccess}
        />
        <Button>
          <Search className="size-4" />
          Find roles
        </Button>
      </div>
    </section>
  );
}
