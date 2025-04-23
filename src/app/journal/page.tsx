"use client";
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Filter, Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { toast } from 'sonner';

interface MoodEntry {
  date: string;
  mood: string;
  note: string;
  weather: {
    temp: number;
    condition: string;
  } | null;
}

const moods = [
  { emoji: '😊', label: 'Happy', color: 'from-yellow-100 to-yellow-200', gradient: 'bg-gradient-to-br' },
  { emoji: '😢', label: 'Sad', color: 'from-blue-100 to-blue-200', gradient: 'bg-gradient-to-br' },
  { emoji: '😡', label: 'Angry', color: 'from-red-100 to-red-200', gradient: 'bg-gradient-to-br' },
  { emoji: '😴', label: 'Tired', color: 'from-purple-100 to-purple-200', gradient: 'bg-gradient-to-br' },
  { emoji: '😃', label: 'Excited', color: 'from-green-100 to-green-200', gradient: 'bg-gradient-to-br' },
];

const weatherIcons: { [key: string]: string } = {
  Clear: '☀️',
  Clouds: '☁️',
  Rain: '🌧️',
  Drizzle: '🌦️',
  Thunderstorm: '⛈️',
  Snow: '❄️',
  Mist: '🌫️',
  Fog: '🌫️',
  Default: '🌍'
};

export default function JournalPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filteredMood, setFilteredMood] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadEntries = () => {
      try {
        const savedEntries = localStorage.getItem('moodEntries');
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      } catch (error) {
        console.error('Failed to load entries:', error);
        toast.error('Failed to load your journal entries');
      }
    };

    loadEntries();
    // Add event listener for storage changes
    window.addEventListener('storage', loadEntries);
    
    return () => {
      window.removeEventListener('storage', loadEntries);
    };
  }, []);

  const getMoodEmoji = (moodLabel: string): string => {
    const mood = moods.find(m => m.label === moodLabel);
    return mood ? mood.emoji : '😐';
  };

  const formatEntryDate = (dateString: string): string => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };

  // Filter entries based on selected date, mood filter, and search term
  const getFilteredEntries = () => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const matchesDate = selectedDate
        ? entryDate.toDateString() === selectedDate.toDateString()
        : true;
      
      const matchesMood = filteredMood
        ? entry.mood === filteredMood
        : true;
      
      const matchesSearch = searchTerm
        ? entry.note.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      
      return matchesDate && matchesMood && matchesSearch;
    });
  };

  const deleteEntry = (entryDate: string) => {
    const updatedEntries = entries.filter(entry => entry.date !== entryDate);
    localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
    toast.success('Entry deleted successfully');
  };

  // Calendar date with entry indicator
  const hasEntryOnDate = (date: Date) => {
    return entries.some(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Your Mood Journal</span>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                          <CalendarIcon className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border"
                          modifiers={{
                            hasEntry: hasEntryOnDate
                          }}
                          modifiersStyles={{
                            hasEntry: {
                              fontWeight: 'bold',
                              backgroundColor: 'rgba(79, 70, 229, 0.2)'
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Filter className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setFilteredMood(null)}>
                          All Moods
                        </DropdownMenuItem>
                        {moods.map((mood) => (
                          <DropdownMenuItem 
                            key={mood.label}
                            onClick={() => setFilteredMood(mood.label)}
                          >
                            <span className="mr-2">{mood.emoji}</span>
                            {mood.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search journal entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full lg:w-1/3"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getFilteredEntries().length > 0 ? (
                    getFilteredEntries().map((entry, index) => (
                      <motion.div
                        key={entry.date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className={`${moods.find(m => m.label === entry.mood)?.gradient} ${moods.find(m => m.label === entry.mood)?.color} overflow-hidden`}>
                          <CardHeader className="flex flex-col space-y-1 pb-2">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold">{formatEntryDate(entry.date)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteEntry(entry.date)}
                                className="h-8 w-8 text-gray-600 hover:text-red-600 hover:bg-transparent"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
                              <span className="font-medium">{entry.mood}</span>
                              {entry.weather && (
                                <div className="ml-auto flex items-center text-sm gap-1">
                                  <span>{Math.round(entry.weather.temp)}°C</span>
                                  <span>{weatherIcons[entry.weather.condition] || weatherIcons.Default}</span>
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{entry.note || "No notes for this day."}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400">No journal entries found for the selected filters.</p>
                      {selectedDate && (
                        <Button 
                          variant="link" 
                          onClick={() => setSelectedDate(undefined)}
                          className="mt-2"
                        >
                          Clear date filter
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}