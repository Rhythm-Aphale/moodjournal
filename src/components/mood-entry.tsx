"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMoodStore } from "@/lib/stores/mood-store";
import { cn } from "@/lib/utils";
import { Smile, Meh, Frown, Heart, Star } from "lucide-react";

const moods = [
  { icon: Heart, label: "Amazing", color: "text-pink-500" },
  { icon: Star, label: "Good", color: "text-yellow-500" },
  { icon: Smile, label: "Okay", color: "text-green-500" },
  { icon: Meh, label: "Meh", color: "text-blue-500" },
  { icon: Frown, label: "Bad", color: "text-red-500" },
];

interface MoodEntryProps {
  date: Date;
}

export function MoodEntry({ date }: MoodEntryProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const addEntry = useMoodStore((state) => state.addEntry);

  const handleSubmit = () => {
    if (selectedMood !== null) {
      addEntry({
        date: date.toISOString(),
        mood: selectedMood,
        note,
      });
      setSelectedMood(null);
      setNote("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between gap-2">
        {moods.map((mood, index) => {
          const Icon = mood.icon;
          return (
            <Button
              key={mood.label}
              variant={selectedMood === index ? "default" : "outline"}
              className={cn("flex-1", selectedMood === index && "bg-primary")}
              onClick={() => setSelectedMood(index)}
            >
              <Icon className={cn("h-6 w-6", mood.color)} />
            </Button>
          );
        })}
      </div>
      
      <Textarea
        placeholder="How are you feeling today?"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-h-[100px]"
      />
      
      <Button 
        className="w-full" 
        onClick={handleSubmit}
        disabled={selectedMood === null}
      >
        Save Entry
      </Button>
    </div>
  );
}