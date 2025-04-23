"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Clock, Camera, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  Default: '🌍',
};

export default function HomePage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [date, setDate] = useState(new Date());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentEntry, setRecentEntry] = useState<any>(null);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [takePhoto, setTakePhoto] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  const isBrowser = typeof window !== 'undefined';

  // Check for today's entry on mount
  useEffect(() => {
    if (!isBrowser) return;

    const checkTodayEntry = () => {
      try {
        const savedEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        const today = new Date().toDateString();
        const todayEntry = savedEntries.find((entry: any) => 
          new Date(entry.date).toDateString() === today
        );
        if (todayEntry) {
          setRecentEntry(todayEntry);
        }
      } catch (error) {
        console.error('Error checking today entry:', error);
        toast.error('Failed to load recent entries.');
      }
    };
    checkTodayEntry();
  }, [isBrowser]);

  // Fetch weather data with retry logic
  useEffect(() => {
    if (!isBrowser) return;

    let isMounted = true;
    setIsLoading(true);

    const fetchWeather = async (latitude: number, longitude: number, retries = 3, delay = 1000) => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
        if (!apiKey) {
          throw new Error('Weather API key is missing.');
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );

        if (!response.ok) {
          throw new Error(`Weather API error: ${response.statusText}`);
        }

        const data = await response.json();
        if (isMounted) {
          setWeather(data);
          setError(null);
        }
      } catch (err: any) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchWeather(latitude, longitude, retries - 1, delay * 2);
        }
        if (isMounted) {
          setError(err.message || 'Unable to fetch weather data.');
          toast.error('Failed to load weather data.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const handleGeolocation = () => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        setIsLoading(false);
        toast.error('Geolocation not supported.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
        },
        (geoError) => {
          if (isMounted) {
            let errorMessage = 'Geolocation permission denied.';
            if (geoError.code === geoError.PERMISSION_DENIED) {
              errorMessage = 'Please allow location access to view weather data.';
            } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
              errorMessage = 'Location information is unavailable.';
            } else if (geoError.code === geoError.TIMEOUT) {
              errorMessage = 'Location request timed out.';
            }
            setError(errorMessage);
            setIsLoading(false);
            toast.error(errorMessage);
          }
        },
        { timeout: 10000, maximumAge: 600000 }
      );
    };

    handleGeolocation();

    return () => {
      isMounted = false;
    };
  }, [isBrowser]);

  const handleSaveEntry = () => {
    if (!selectedMood) {
      toast.error('Please select a mood first!');
      return;
    }
    if (note.length > 500) {
      toast.error('Note cannot exceed 500 characters!');
      return;
    }

    const entry = {
      date: date.toISOString(),
      mood: selectedMood,
      note,
      weather: weather
        ? {
            temp: weather.main.temp,
            condition: weather.weather[0].main,
            location: weather.name || 'Unknown',
          }
        : null,
    };

    if (isBrowser) {
      try {
        const existingEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
        const updatedEntries = [...existingEntries, entry];
        localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
        window.dispatchEvent(new Event('storage'));
        
        toast.success(`Mood entry for ${selectedMood} saved successfully!`);
        setRecentEntry(entry);
        setSelectedMood(null);
        setNote('');
        setNoteError(null);
      } catch (error) {
        console.error('Error saving entry:', error);
        toast.error('Failed to save mood entry.');
      }
    } else {
      toast.error('Storage unavailable. Please try again.');
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setNote(value);
    if (value.length > 500) {
      setNoteError(`Character limit: ${value.length}/500 (exceeded)`);
    } else {
      setNoteError(`Character count: ${value.length}/500`);
    }
  };

  const getTodayMoodEntries = () => {
    if (!isBrowser) return [];

    try {
      const savedEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
      const today = new Date().toDateString();
      return savedEntries.filter((entry: any) => 
        new Date(entry.date).toDateString() === today
      );
    } catch (error) {
      console.error('Error fetching today entries:', error);
      toast.error('Failed to load today’s entries.');
      return [];
    }
  };

  const getMoodEmoji = (moodLabel: string): string => {
    const mood = moods.find(m => m.label === moodLabel);
    return mood ? mood.emoji : '😐';
  };

  return (
    <>
      <Navbar />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`min-h-screen p-8 transition-colors duration-500 ${
            selectedMood
              ? `${moods.find((m) => m.label === selectedMood)?.gradient} ${
                  moods.find((m) => m.label === selectedMood)?.color
                }`
              : 'bg-gray-50 dark:bg-gray-900'
          }`}
        >
          <div className="max-w-4xl mx-auto pt-20">
            <Card className="mb-6 relative overflow-hidden shadow-lg">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <div className="flex items-center gap-4">
                    {isLoading ? (
                      <span className="text-sm text-gray-500 animate-pulse">Loading weather...</span>
                    ) : weather ? (
                      <motion.div 
                        className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-fullMann shadow-md"
                        whileHover={{ scale: 1.05 }}
                      >
                        <span>{Math.round(weather.main.temp)}°C</span>
                        <span className="text-2xl">{weatherIcons[weather.weather[0].main] || weatherIcons.Default}</span>
                        <span className="text-xs text-gray-500">{weather.name || 'Unknown Location'}</span>
                      </motion.div>
                    ) : (
                      <span className="text-red-500 text-sm">{error || 'Weather data unavailable.'}</span>
                    )}
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowHistoryDialog(true)}
                            aria-label="View today's entries"
                          >
                            <Clock className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View today's entries</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardTitle>
              </CardHeader>
            </Card>

            {recentEntry && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6"
              >
                <Card className="border-l-4 border-indigo-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>Your latest mood entry</span>
                      <span className="text-2xl">{getMoodEmoji(recentEntry.mood)}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-2">
                      You recorded feeling <strong>{recentEntry.mood}</strong> at{' '}
                      {new Date(recentEntry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                    </p>
                    {recentEntry.note && <p className="text-gray-700 dark:text-gray-300 italic">"{recentEntry.note}"</p>}
                    {recentEntry.weather && (
                      <p className="text-sm text-gray-500 mt-2">
                        Weather: {Math.round(recentEntry.weather.temp)}°C, {recentEntry.weather.condition}{' '}
                        {weatherIcons[recentEntry.weather.condition] || weatherIcons.Default} in {recentEntry.weather.location || 'Unknown'}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button variant="link" size="sm" onClick={() => setRecentEntry(null)}>
                      Add another entry
                    </Button>
                    <Button variant="link" size="sm" asChild className="ml-auto">
                      <a href="/journal">View all entries</a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold">How are you feeling right now?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  {moods.map((mood) => (
                    <motion.div
                      key={mood.label}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Button
                        variant={selectedMood === mood.label ? 'default' : 'outline'}
                        className={`rounded-full h-16 w-16 text-2xl ${
                          selectedMood === mood.label ? 'ring-4 ring-offset-2 ring-opacity-50' : ''
                        } ${selectedMood === mood.label ? `ring-${mood.color.split('-')[1]}` : ''}`}
                        onClick={() => setSelectedMood(mood.label)}
                        aria-label={`Select ${mood.label} mood`}
                      >
                        {mood.emoji}
                      </Button>
                      <p className="text-center text-sm mt-1">{mood.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a note about how you're feeling... (max 500 characters)"
                    value={note}
                    onChange={handleNoteChange}
                    className="min-h-24 resize-none"
                    aria-describedby="note-error"
                  />
                  {noteError && (
                    <p id="note-error" className={`text-sm ${note.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                      {noteError}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => setTakePhoto(true)}>
                            <Camera className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Capture your expression (Coming soon)</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" asChild>
                            <a href="/journal" aria-label="Go to journal">
                              <Calendar className="h-5 w-5" />
                            </a>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View journal entries</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <Button 
                    onClick={handleSaveEntry}
                    className="gap-2"
                    size="lg"
                    disabled={!selectedMood || note.length > 500}
                  >
                    <Save className="h-5 w-5" />
                    Save Entry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </AnimatePresence>

      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Today's Mood Entries</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-96 overflow-y-auto">
            {getTodayMoodEntries().length > 0 ? (
              getTodayMoodEntries().map((entry: any, index: number) => (
                <div 
                  key={index} 
                  className="mb-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl">{getMoodEmoji(entry.mood)} {entry.mood}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {entry.note && <p className="text-gray-700 dark:text-gray-300">{entry.note}</p>}
                  {entry.weather && (
                    <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                      <span>{Math.round(entry.weather.temp)}°C</span>
                      <span>{weatherIcons[entry.weather.condition] || weatherIcons.Default}</span>
                      <span>{entry.weather.location || 'Unknown Location'}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center py-4 text-gray-500">No entries recorded today.</p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>Close</Button>
            <Button asChild>
              <a href="/journal">View Full Journal</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}