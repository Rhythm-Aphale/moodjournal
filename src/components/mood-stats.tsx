"use client";

import { useMoodStore } from "@/lib/stores/mood-store";
import { Card } from "@/components/ui/card";
import { Heart, Star, Smile, Meh, Frown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const moodIcons = [Heart, Star, Smile, Meh, Frown];
const moodColors = ["#ec4899", "#eab308", "#22c55e", "#3b82f6", "#ef4444"];

export function MoodStats() {
  const entries = useMoodStore((state) => state.entries);

  const data = entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString(),
      mood: 4 - entry.mood, // Invert the mood value for the chart (0 = worst, 4 = best)
    }));

  return (
    <div className="space-y-6">
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 4]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="mood"
              stroke={moodColors[2]}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {moodIcons.map((Icon, index) => {
          const count = entries.filter((e) => e.mood === index).length;
          return (
            <Card key={index} className="p-2 text-center">
              <Icon className="h-6 w-6 mx-auto mb-1" style={{ color: moodColors[index] }} />
              <div className="text-sm font-medium">{count}</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}