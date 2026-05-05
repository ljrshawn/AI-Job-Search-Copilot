import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export type DashboardStat = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  tone: string;
};

type StatsGridProps = {
  stats: DashboardStat[];
};

export function StatsGrid({ stats }: StatsGridProps) {
  return (
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
  );
}
