"use client";

import { Calendar } from "@/components/ui/calendar";
import { useMoodStore } from "@/lib/stores/mood-store";
import { cn } from "@/lib/utils";
import { Heart, Star, Smile, Meh, Frown } from "lucide-react";

const moodIcons = [Heart, Star, Smile, Meh, Frown];
const moodColors = [
  "bg-pink-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-red-500",
];

export function MoodCalendar() {
  const entries = useMoodStore((state) => state.entries);

  const getDayContent = (day: Date) => {
    const entry = entries.find(
      (e) => new Date(e.date).toDateString() === day.toDateString()
    );

    if (!entry) return null;

    const Icon = moodIcons[entry.mood];
    return (
      <div
        className={cn(
          "h-full w-full flex items-center justify-center rounded-full",
          moodColors[entry.mood]
        )}
      >
        <Icon className="h-4 w-4 text-white" />
      </div>
    );
  };

  return (
    <Calendar
      mode="single"
      className="rounded-md border"
      components={{
        DayContent: ({ date }) => getDayContent(date),
      }}
    />
  );
}