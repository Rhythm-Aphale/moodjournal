import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MoodEntry {
  date: string;
  mood: number;
  note: string;
}

interface MoodStore {
  entries: MoodEntry[];
  addEntry: (entry: MoodEntry) => void;
  removeEntry: (date: string) => void;
}

export const useMoodStore = create<MoodStore>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries.filter((e) => new Date(e.date).toDateString() !== new Date(entry.date).toDateString()),
            entry,
          ],
        })),
      removeEntry: (date) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.date !== date),
        })),
    }),
    {
      name: 'mood-storage',
    }
  )
);