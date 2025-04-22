// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Calendar, Clock, CloudRain, Sun, CloudSun, Cloud } from 'lucide-react';

// Define the mood options
const moods = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-400' },
  { emoji: '😌', label: 'Calm', color: 'bg-green-400' },
  { emoji: '😐', label: 'Neutral', color: 'bg-gray-400' },
  { emoji: '😞', label: 'Sad', color: 'bg-blue-400' },
  { emoji: '😠', label: 'Angry', color: 'bg-red-400' },
];

// Define the entry type
type MoodEntry = {
  id: string;
  date: Date;
  mood: {
    emoji: string;
    label: string;
    color: string;
  };
  note: string;
  weather: {
    temp: number;
    condition: string;
    icon: string;
  };
};

export default function Home() {
  // State for the current entry
  const [selectedMood, setSelectedMood] = useState(moods[2]); // Default to neutral
  const [note, setNote] = useState('');
  const [weather, setWeather] = useState({ temp: 0, condition: 'Loading...', icon: '' });
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [currentDate] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Mock function to fetch weather (in a real app, this would call a weather API)
  useEffect(() => {
    const fetchWeather = async () => {
      // This would be replaced with an actual API call
      setTimeout(() => {
        const mockWeather = {
          temp: Math.floor(Math.random() * 30) + 10, // Random temp between 10-40°C
          condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
          icon: ''
        };
        setWeather(mockWeather);
      }, 1000);
    };

    fetchWeather();
    
    // Load saved entries from local storage
    const savedEntries = localStorage.getItem('moodEntries');
    if (savedEntries) {
      try {
        const parsedEntries = JSON.parse(savedEntries);
        // Convert date strings back to Date objects
        parsedEntries.forEach((entry: any) => {
          entry.date = new Date(entry.date);
        });
        setEntries(parsedEntries);
      } catch (e) {
        console.error('Error parsing saved entries', e);
      }
    }
  }, []);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date(),
      mood: selectedMood,
      note,
      weather,
    };
    
    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    
    // Save to local storage
    localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
    
    // Reset form
    setNote('');
    setSelectedMood(moods[2]); // Reset to neutral
    
    // Show success feedback
    setTimeout(() => {
      setIsSubmitting(false);
    }, 1000);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Get weather icon based on condition
  const getWeatherIcon = () => {
    switch(weather.condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="text-gray-500" />;
      case 'rainy':
        return <CloudRain className="text-blue-500" />;
      case 'partly cloudy':
        return <CloudSun className="text-gray-400" />;
      default:
        return <Cloud className="text-gray-500" />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-950 transition-colors duration-300">
      <Navbar />
      
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-purple-800 dark:text-purple-300">
            How are you feeling today?
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Track your mood and reflect on your day
          </p>
        </div>
        
        {/* Card with 3D effect */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-8 transform transition-all hover:scale-[1.01] duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex items-center mb-4 md:mb-0">
              <Calendar className="text-purple-500 mr-2" />
              <span className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {formatDate(currentDate)}
              </span>
            </div>
            
            <div className="flex items-center">
              {getWeatherIcon()}
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                {weather.temp}°C, {weather.condition}
              </span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            {/* Mood Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Select your mood:
              </label>
              <div className="flex flex-wrap gap-4">
                {moods.map((mood) => (
                  <button
                    key={mood.label}
                    type="button"
                    onClick={() => setSelectedMood(mood)}
                    className={`${
                      selectedMood.label === mood.label
                        ? 'ring-4 ring-purple-400 dark:ring-purple-600 transform scale-110'
                        : 'hover:scale-105'
                    } ${mood.color} rounded-full p-4 flex flex-col items-center justify-center w-16 h-16 md:w-20 md:h-20 transition-all duration-200 shadow-md`}
                  >
                    <span className="text-2xl md:text-3xl">{mood.emoji}</span>
                    <span className="text-xs font-medium mt-1 text-gray-800">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Daily Note */}
            <div className="mb-6">
              <label htmlFor="dailyNote" className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">
                Daily Note:
              </label>
              <textarea
                id="dailyNote"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none transition-all duration-200"
                rows={4}
                placeholder="How was your day? What made you feel this way?"
              />
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 transition-all duration-300 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </button>
          </form>
        </div>
        
        {/* Calendar Toggle */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="inline-flex items-center bg-purple-100 dark:bg-purple-900 hover:bg-purple-200 dark:hover:bg-purple-800 text-purple-800 dark:text-purple-200 font-medium px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <Calendar className="mr-2" size={20} />
            {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
          </button>
        </div>
        
        {/* Calendar View */}
        {showCalendar && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 mb-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Previous Entries</h2>
            
            {entries.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No entries yet. Start tracking your mood today!
              </p>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div 
                    key={entry.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{entry.mood.emoji}</span>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">
                            {formatDate(entry.date)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {entry.weather.temp}°C, {entry.weather.condition}
                          </p>
                        </div>
                      </div>
                    </div>
                    {entry.note && (
                      <p className="mt-2 text-gray-700 dark:text-gray-300 border-t border-gray-100 dark:border-gray-700 pt-2">
                        {entry.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}