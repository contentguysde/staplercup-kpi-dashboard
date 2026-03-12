"use client";

import { CHANNELS } from "@/lib/constants";
import { ChannelCard } from "./channel-card";
import type { YearKpiData } from "@/types";

interface ChannelGridProps {
  currentYear: YearKpiData;
  previousYear: YearKpiData | null;
}

export function ChannelGrid({ currentYear, previousYear }: ChannelGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {CHANNELS.map((channel) => (
        <ChannelCard
          key={channel.id}
          channel={channel}
          currentYear={currentYear}
          previousYear={previousYear}
        />
      ))}
    </div>
  );
}
