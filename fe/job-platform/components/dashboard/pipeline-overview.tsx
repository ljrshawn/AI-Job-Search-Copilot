import { BriefcaseBusiness } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const pipeline = [
  { label: "Saved", count: 12, color: "bg-slate-400" },
  { label: "Applied", count: 7, color: "bg-cyan-500" },
  { label: "Screening", count: 3, color: "bg-amber-500" },
  { label: "Interview", count: 2, color: "bg-emerald-500" },
];

const weeklyActivity = [45, 70, 52, 88, 64, 76, 58];

export function PipelineOverview() {
  return (
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
  );
}
