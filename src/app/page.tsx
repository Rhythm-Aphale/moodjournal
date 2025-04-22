"use client";

import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoodEntry } from "@/components/mood-entry";
import { MoodCalendar } from "@/components/mood-calendar";
import { WeatherDisplay } from "@/components/weather-display";
import { MoodStats } from "@/components/mood-stats";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportToCSV } from "@/lib/utils";

export default function Home() {
  const [date, setDate] = useState<Date>(new Date());

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-primary">Mood Journal</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => exportToCSV()}>
              <Download className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Today&apos;s Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <MoodEntry date={date} />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Weather</CardTitle>
            </CardHeader>
            <CardContent>
              <WeatherDisplay />
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Mood Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <MoodStats />
            </CardContent>
          </Card>

          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Mood Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <MoodCalendar />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}