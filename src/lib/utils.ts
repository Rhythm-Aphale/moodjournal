import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function exportToCSV() {
  const entries = JSON.parse(localStorage.getItem("mood-storage") || "{}").state?.entries || [];
  if (entries.length === 0) return;

  const csvContent = [
    ["Date", "Mood", "Note"],
    ...entries.map((entry: any) => [
      new Date(entry.date).toLocaleDateString(),
      ["Amazing", "Good", "Okay", "Meh", "Bad"][entry.mood],
      entry.note,
    ]),
  ]
    .map((row) => row.map((cell: any) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `mood-journal-${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}