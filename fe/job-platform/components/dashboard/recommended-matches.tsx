import { ExternalLink } from "lucide-react";
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

export type RecommendedMatch = {
  id: string;
  title: string;
  detail: string;
  match: string;
  tags: string[];
  status: string;
  shareLink: string | null;
  rawContent: string;
};

type RecommendedMatchesProps = {
  matches: RecommendedMatch[];
};

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

export function RecommendedMatches({ matches }: RecommendedMatchesProps) {
  return (
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
          <Card key={job.id} className="rounded-xl shadow-sm">
            <CardContent className="space-y-5 px-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    {job.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{job.detail}</p>
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">Check</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{job.title}</DialogTitle>
                      <DialogDescription>
                        {job.detail} · {job.match} match
                      </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                        {getReadableJobContent(job.rawContent) ||
                          "No job description available."}
                      </p>
                    </div>

                    {job.shareLink && (
                      <div className="flex justify-end">
                        <Button asChild size="sm">
                          <a
                            href={job.shareLink}
                            target="_blank"
                            rel="noreferrer"
                          >
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
        ))}
      </div>
    </section>
  );
}
