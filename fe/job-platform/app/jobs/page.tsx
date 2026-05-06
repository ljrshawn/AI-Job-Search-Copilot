"use client";

import { ExternalLink, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useMatchResumeToAllJob } from "@/services/resume-hooks";
import type { JobMatch } from "@/types/job-types";

const pageSize = 6;

function getReadableJobContent(html: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  document
    .querySelectorAll("br, p, div, section, article, h1, h2, h3, h4, li")
    .forEach((element) => {
      element.append(document.createTextNode("\n"));
    });

  document.querySelectorAll("li").forEach((element) => {
    element.prepend(document.createTextNode("- "));
  });

  return (
    document.body.textContent
      ?.replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim() || ""
  );
}

function getJobTags(job: JobMatch) {
  return [
    job.listed_at
      ? `Listed ${new Date(job.listed_at).toLocaleDateString()}`
      : "Recently listed",
    job.expires_at
      ? `Expires ${new Date(job.expires_at).toLocaleDateString()}`
      : "Open role",
  ];
}

function JobCard({ job }: { job: JobMatch }) {
  const matchScore = `${Math.round(job.score * 100)}%`;
  const location = job.location ?? "Location not listed";

  return (
    <Card className="rounded-xl shadow-sm">
      <CardContent className="flex h-full flex-col space-y-5 px-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-slate-950">
              {job.title}
            </p>
            <p className="mt-1 line-clamp-1 text-sm text-slate-500">
              {location}
            </p>
          </div>
          <div className="shrink-0 rounded-lg bg-cyan-50 px-2.5 py-1 text-sm font-semibold text-cyan-700">
            {matchScore}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {getJobTags(job).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-xs font-medium text-slate-500">
            {job.share_link ? "Ready to view" : "Match found"}
          </p>

          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">Check</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>{job.title}</DialogTitle>
                <DialogDescription>
                  {location} · {matchScore} match
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {getReadableJobContent(job.raw_content) ||
                    "No job description available."}
                </p>
              </div>

              {job.share_link && (
                <div className="flex justify-end">
                  <Button asChild size="sm">
                    <a href={job.share_link} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-4" />
                      Open job
                    </a>
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default function JobsPage() {
  const { data: session } = useSession();
  const [page, setPage] = useState(1);
  const userId = session?.user?.id;
  const token = session?.accessToken;
  const skip = (page - 1) * pageSize;
  const authorizedPayload =
    userId && token
      ? {
          user_id: userId,
          token,
          skip,
          limit: pageSize,
        }
      : undefined;

  const matchJobs = useMatchResumeToAllJob(authorizedPayload);
  const jobs = matchJobs.data ?? [];
  const hasPreviousPage = page > 1;
  const hasNextPage = jobs.length === pageSize;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <Header />

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-end">
          <div>
            <p className="text-sm font-medium text-cyan-700">Jobs</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-950 sm:text-3xl">
              Recommended job matches
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Review ranked opportunities from your active resume and open the
              details without leaving your workflow.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <Search className="size-4 text-cyan-700" />
            Page {page}
          </div>
        </section>

        <section className="grid flex-1 auto-rows-fr gap-4 lg:grid-cols-3">
          {matchJobs.isLoading &&
            Array.from({ length: pageSize }).map((_, index) => (
              <Card key={index} className="rounded-xl shadow-sm">
                <CardContent className="space-y-4 px-5">
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-100" />
                  <div className="h-8 rounded bg-slate-100" />
                </CardContent>
              </Card>
            ))}

          {!matchJobs.isLoading &&
            jobs.map((job) => <JobCard key={job.id} job={job} />)}

          {!matchJobs.isLoading && jobs.length === 0 && (
            <Card className="rounded-xl shadow-sm lg:col-span-3">
              <CardContent className="flex min-h-60 items-center justify-center px-5 text-sm text-slate-500">
                No matched jobs found. Upload a resume to generate matches.
              </CardContent>
            </Card>
          )}
        </section>

        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                aria-disabled={!hasPreviousPage}
                className={
                  !hasPreviousPage ? "pointer-events-none opacity-50" : ""
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (hasPreviousPage) setPage((current) => current - 1);
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <Button variant="outline" size="icon" disabled>
                {page}
              </Button>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                aria-disabled={!hasNextPage}
                className={
                  !hasNextPage ? "pointer-events-none opacity-50" : ""
                }
                onClick={(event) => {
                  event.preventDefault();
                  if (hasNextPage) setPage((current) => current + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </main>
    </div>
  );
}
