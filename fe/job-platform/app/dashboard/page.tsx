"use client";

import {
  BriefcaseBusiness,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileText,
  Search,
  Sparkles,
  Upload,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/header";
import {
  UploadFileButton,
  type FileUploadPayload,
} from "@/components/uploadFileButton";
import { uploadResume } from "@/services/resume";
import { useCurrentResume } from "@/services/resume-hooks";

const stats = [
  {
    label: "Matched roles",
    value: "18",
    helper: "+6 this week",
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
    label: "Resume score",
    value: "82%",
    helper: "Strong match",
    icon: FileText,
    tone: "bg-amber-50 text-amber-700 ring-amber-100",
  },
];

const pipeline = [
  { label: "Saved", count: 12, color: "bg-slate-400" },
  { label: "Applied", count: 7, color: "bg-cyan-500" },
  { label: "Screening", count: 3, color: "bg-amber-500" },
  { label: "Interview", count: 2, color: "bg-emerald-500" },
];

const matches = [
  {
    title: "Frontend Engineer",
    company: "Northstar Labs",
    match: "94%",
    tags: ["React", "Next.js", "Design systems"],
    status: "Ready to apply",
  },
  {
    title: "Full Stack Developer",
    company: "SignalWorks",
    match: "89%",
    tags: ["FastAPI", "Postgres", "AI tools"],
    status: "Resume tailored",
  },
  {
    title: "Product Engineer",
    company: "ClearPath AI",
    match: "86%",
    tags: ["TypeScript", "UX", "Automation"],
    status: "Cover letter draft",
  },
];

const tasks = [
  {
    title: "Upload latest resume",
    detail: "Use the newest version before generating matches.",
    icon: Upload,
  },
  {
    title: "Review 3 high-fit roles",
    detail: "Focus on matches above 85% first.",
    icon: Search,
  },
  {
    title: "Prepare interview notes",
    detail: "Frontend Engineer call is coming up next.",
    icon: Clock3,
  },
];

const weeklyActivity = [45, 70, 52, 88, 64, 76, 58];
const resumeFileTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function getGreeting(name?: string | null) {
  const firstName = name?.trim().split(" ")[0];
  return firstName ? `Welcome back, ${firstName}` : "Welcome back";
}

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

  const resumeQuery = useCurrentResume(
    session?.user?.id && session.accessToken
      ? {
          user_id: session.user.id,
          token: session.accessToken,
        }
      : undefined,
  );

  const historyFiles = resumeQuery.data
    ? [
        {
          id: String(resumeQuery.data.id),
          fileName: resumeQuery.data.file_name,
        },
      ]
    : [];

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
        <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end">
          <div className="min-w-0">
            <p className="text-sm font-medium text-cyan-700">Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950 sm:text-3xl">
              {getGreeting(session?.user?.name)}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Your search is organized around the roles with the strongest fit,
              freshest activity, and next steps that keep momentum moving.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <UploadFileButton
              userId={session?.user?.id}
              token={session?.accessToken}
              acceptedFileTypes={resumeFileTypes}
              uploadFn={uploadResumeFile}
              historyFiles={historyFiles}
              isHistoryLoading={resumeQuery.isLoading}
              onUploadSuccess={() => resumeQuery.refetch()}
            />
            <Button>
              <Search className="size-4" />
              Find roles
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <Card key={item.label} className="rounded-xl py-5 shadow-sm">
                <CardContent className="flex items-start justify-between gap-4 px-5">
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {item.value}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {item.helper}
                    </p>
                  </div>
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ring-1 ${item.tone}`}
                  >
                    <Icon className="size-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="px-5">
              <CardTitle className="flex items-center gap-2 text-base">
                <BriefcaseBusiness className="size-4 text-cyan-700" />
                Job pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 px-5">
              <div className="grid gap-3 sm:grid-cols-4">
                {pipeline.map((stage) => (
                  <div
                    key={stage.label}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className={`h-1.5 w-10 rounded-full ${stage.color}`} />
                    <p className="mt-4 text-2xl font-semibold text-slate-950">
                      {stage.count}
                    </p>
                    <p className="text-sm text-slate-500">{stage.label}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-700">
                    Weekly activity
                  </p>
                  <p className="text-xs text-slate-500">Last 7 days</p>
                </div>
                <div className="flex h-36 items-end gap-2">
                  {weeklyActivity.map((height, index) => (
                    <div
                      key={index}
                      className="flex flex-1 items-end rounded-md bg-slate-100"
                    >
                      <div
                        className="w-full rounded-md bg-cyan-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardHeader className="px-5">
              <CardTitle className="flex items-center gap-2 text-base">
                <CheckCircle2 className="size-4 text-emerald-700" />
                Next actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 px-5">
              {tasks.map((task) => {
                const Icon = task.icon;

                return (
                  <div
                    key={task.title}
                    className="flex gap-3 rounded-lg border border-slate-200 p-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Icon className="size-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {task.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Recommended matches
              </h2>
              <p className="text-sm text-slate-500">
                Ranked by resume fit and recent market signals.
              </p>
            </div>
            <Button variant="outline" size="sm">
              View all
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {matches.map((job) => (
              <Card
                key={`${job.company}-${job.title}`}
                className="rounded-xl shadow-sm"
              >
                <CardContent className="space-y-5 px-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {job.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {job.company}
                      </p>
                    </div>
                    <div className="rounded-lg bg-cyan-50 px-2.5 py-1 text-sm font-semibold text-cyan-700">
                      {job.match}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <p className="text-xs font-medium text-slate-500">
                      {job.status}
                    </p>
                    <Button size="sm">Open</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
