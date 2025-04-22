'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSun, FaCloud, FaCloudRain, FaSnowflake, FaMoon } from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const moodOptions = [
  { emoji: '😊', value: 'happy', color: 'happy' },
  { emoji: '😌', value: 'calm', color: 'calm' },
  { emoji: '😢', value: 'sad', color: 'sad' },
  { emoji: '😣', value: 'angry', color: 'angry' },
  { emoji: '😓', value: 'anxious', color: 'anxious' },
];

interface JournalEntry {
  date: string;
  mood: string;
  note: string;
  weather: string;
  temperature: number;
}

export default function Home() {
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [weather, setWeather] = useState({ description: '', temp: 0 });
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filterMood, setFilterMood] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Load entries from localStorage
    const storedEntries = localStorage.getItem('journalEntries');
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }

    // Get geolocation and weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
            );
            setWeather({
              description: response.data.weather[0].main,
              temp: response.data.main.temp,
            });
          } catch (err) {
            setError('Failed to fetch weather data');
          }
        },
        () => setError('Geolocation permission denied')
      );
    } else {
      setError('Geolocation not supported');
    }
  }, []);

  useEffect(() => {
    // Save entries to localStorage
    localStorage.setItem('journalEntries', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) {
      setError('Please select a mood');
      return;
    }
    const newEntry: JournalEntry = {
      date: new Date().toISOString().split('T')[0],
      mood,
      note,
      weather: weather.description,
      temperature: weather.temp,
    };
    setEntries([newEntry, ...entries]);
    setMood('');
    setNote('');
    setError('');
    setSuccess('Entry saved successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather.toLowerCase()) {
      case 'clear': return <FaSun className="text-yellow-400" />;
      case 'clouds': return <FaCloud className="text-gray-400" />;
      case 'rain': return <FaCloudRain className="text-blue-400" />;
      case 'snow': return <FaSnowflake className="text-white" />;
      default: return <FaCloud className="text-gray-400" />;
    }
  };

  const filteredEntries = filterMood ? entries.filter(entry => entry.mood === filterMood) : entries;

  const moodTrendData = {
    labels: entries.slice(0, 7).reverse().map(entry => entry.date),
    datasets: [
      {
        label: 'Mood Score',
        data: entries.slice(0, 7).reverse().map(entry => {
          const moodIndex = moodOptions.findIndex(m => m.value === entry.mood);
          return 5 - moodIndex; // Higher score for happier moods
        }),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className={`min-h-screen p-4 ${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold animate-fadeIn">Mood Journal</h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
          >
            <FaMoon />
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6 animate-slideUp">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{new Date().toLocaleDateString()}</h2>
            <div className="flex items-center gap-2">
              {getWeatherIcon(weather.description)}
              <span>{weather.description} {weather.temp}°C</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Select Mood</label>
              <div className="flex gap-2 flex-wrap">
                {moodOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setMood(option.value)}
                    className={`p-3 rounded-full text-2xl ${mood === option.value ? `bg-${option.color} text-white` : 'bg-gray-200 dark:bg-gray-700'} transition-all duration-200 hover:scale-110`}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Daily Note</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                rows={4}
                maxLength={200}
                placeholder="How are you feeling today?"
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">{success}</p>}
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Save Entry
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Mood Trend (Last 7 Days)</h2>
          <Line data={moodTrendData} />
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Past Entries</h2>
            <select
              onChange={(e) => setFilterMood(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">All Moods</option>
              {moodOptions.map(option => (
                <option key={option.value} value={option.value}>{option.value}</option>
              ))}
            </select>
          </div>
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg bg-${moodOptions.find(m => m.value === entry.mood)?.color}/20 animate-slideUp`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{entry.date}</span>
                  <div className="flex items-center gap-2">
                    {getWeatherIcon(entry.weather)}
                    <span>{entry.weather} {entry.temperature}°C</span>
                  </div>
                </div>
                <p className="text-2xl">{moodOptions.find(m => m.value === entry.mood)?.emoji}</p>
                <p>{entry.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}