"use client";

import {
  BriefcaseBusiness,
  CalendarCheck,
  FileText,
  Sparkles,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardSummary } from "@/components/dashboard/dashboard-summary";
import { NextActions } from "@/components/dashboard/next-actions";
import { PipelineOverview } from "@/components/dashboard/pipeline-overview";
import {
  RecommendedMatches,
  type RecommendedMatch,
} from "@/components/dashboard/recommended-matches";
import {
  StatsGrid,
  type DashboardStat,
} from "@/components/dashboard/stats-grid";
import { Header } from "@/components/header";
import type { FileUploadPayload } from "@/components/uploadFileButton";
import { uploadResume } from "@/services/resume";
import {
  useCurrentResume,
  useMatchResumeToAllJob,
} from "@/services/resume-hooks";

const resumeFileTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

async function uploadResumeFile({ file, userId, token }: FileUploadPayload) {
  const resume = await uploadResume({
    file,
    user_id: userId,
    token,
  });

  return {
    fileName: resume.file_name,
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const userId = session?.user?.id;
  const token = session?.accessToken;
  const authorizedPayload =
    userId && token
      ? {
          user_id: userId,
          token,
        }
      : undefined;

  const resumeQuery = useCurrentResume(authorizedPayload);
  const matchJobs = useMatchResumeToAllJob(authorizedPayload);

  const resumeFiles = resumeQuery.data
    ? [
        {
          id: String(resumeQuery.data.id),
          fileName: resumeQuery.data.file_name,
        },
      ]
    : [];

  const matchedRoleCount = matchJobs.isLoading
    ? "—"
    : String(matchJobs.data?.length ?? 0);

  const bestMatchScore = matchJobs.data?.[0]
    ? `${Math.round(matchJobs.data[0].score * 100)}%`
    : "—";

  const stats: DashboardStat[] = [
    {
      label: "Matched roles",
      value: matchedRoleCount,
      helper: matchJobs.data?.length
        ? "Based on your resume"
        : "Upload a resume",
      icon: Sparkles,
      tone: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    },
    {
      label: "Applications",
      value: "7",
      helper: "3 awaiting reply",
      icon: BriefcaseBusiness,
      tone: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    },
    {
      label: "Interviews",
      value: "2",
      helper: "Next on Thursday",
      icon: CalendarCheck,
      tone: "bg-violet-50 text-violet-700 ring-violet-100",
    },
    {
      label: "Best match",
      value: bestMatchScore,
      helper: matchJobs.data?.[0]?.title ?? "No match yet",
      icon: FileText,
      tone: "bg-amber-50 text-amber-700 ring-amber-100",
    },
  ];

  const recommendedMatches: RecommendedMatch[] =
    matchJobs.data?.slice(0, 3).map((job) => ({
      id: String(job.id),
      title: job.title,
      detail: job.location ?? "Location not listed",
      match: `${Math.round(job.score * 100)}%`,
      tags: [
        job.listed_at
          ? `Listed ${new Date(job.listed_at).toLocaleDateString()}`
          : "Recently listed",
        job.expires_at
          ? `Expires ${new Date(job.expires_at).toLocaleDateString()}`
          : "Open role",
      ],
      status: job.share_link ? "Ready to view" : "Match found",
      shareLink: job.share_link,
      rawContent: job.raw_content,
    })) ?? [];

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (session?.needsSignup) {
      router.push("/signup");
    }
  }, [session?.needsSignup, status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="animate-pulse text-sm font-medium text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardSummary
          name={session?.user?.name}
          userId={userId}
          token={token}
          resumeFiles={resumeFiles}
          isResumeLoading={resumeQuery.isLoading}
          acceptedResumeFileTypes={resumeFileTypes}
          uploadResumeFile={uploadResumeFile}
          onResumeUploadSuccess={() => resumeQuery.refetch()}
        />

        <StatsGrid stats={stats} />

        <section className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <PipelineOverview />
          <NextActions />
        </section>

        <RecommendedMatches matches={recommendedMatches} />
      </main>
    </div>
  );
}
