import { CheckCircle2, Clock3, Search, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function NextActions() {
  return (
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
                <p className="mt-1 text-xs text-slate-500">{task.detail}</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
