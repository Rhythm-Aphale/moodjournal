"use client";
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { DownloadIcon, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval } from 'date-fns';

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
  { emoji: '😊', label: 'Happy', color: '#FEF3C7', bgColor: '#FBBF24' },
  { emoji: '😢', label: 'Sad', color: '#DBEAFE', bgColor: '#3B82F6' },
  { emoji: '😡', label: 'Angry', color: '#FEE2E2', bgColor: '#EF4444' },
  { emoji: '😴', label: 'Tired', color: '#E5E1FC', bgColor: '#8B5CF6' },
  { emoji: '😃', label: 'Excited', color: '#D1FAE5', bgColor: '#10B981' },
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

export default function StatisticsPage() {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [timeFrame, setTimeFrame] = useState<'week' | 'month' | 'all'>('week');
  const [moodDistribution, setMoodDistribution] = useState<Array<{ name: string, value: number }>>([]);
  const [weatherInfluence, setWeatherInfluence] = useState<Array<{ condition: string, count: number, moods: any }>>([]);
  const [dailyMoods, setDailyMoods] = useState<Array<{ date: string, mood: string }>>([]);
  
  useEffect(() => {
    try {
      const savedEntries = localStorage.getItem('moodEntries');
      if (savedEntries) {
        const parsedEntries: MoodEntry[] = JSON.parse(savedEntries);
        setEntries(parsedEntries);
        processData(parsedEntries);
      }
    } catch (error) {
      console.error('Failed to load entries:', error);
    }
  }, []);

  useEffect(() => {
    processData(entries);
  }, [timeFrame, entries]);

  const processData = (data: MoodEntry[]) => {
    if (!data.length) return;

    // Filter entries based on selected time frame
    const filteredEntries = filterEntriesByTimeFrame(data);

    // Calculate mood distribution
    const moodCounts: Record<string, number> = {};
    moods.forEach(mood => {
      moodCounts[mood.label] = 0;
    });

    filteredEntries.forEach(entry => {
      if (moodCounts[entry.mood] !== undefined) {
        moodCounts[entry.mood]++;
      }
    });

    const distribution = Object.keys(moodCounts).map(mood => ({
      name: mood,
      value: moodCounts[mood]
    }));
    setMoodDistribution(distribution);

    // Calculate weather influence
    const weatherData: Record<string, { count: number, moods: Record<string, number> }> = {};

    filteredEntries.forEach(entry => {
      if (entry.weather) {
        const condition = entry.weather.condition;
        
        if (!weatherData[condition]) {
          weatherData[condition] = { 
            count: 0, 
            moods: moods.reduce((acc, m) => ({ ...acc, [m.label]: 0 }), {})
          };
        }
        
        weatherData[condition].count++;
        weatherData[condition].moods[entry.mood]++;
      }
    });

    const weatherInfluenceData = Object.keys(weatherData).map(condition => ({
      condition,
      count: weatherData[condition].count,
      moods: weatherData[condition].moods
    }));
    setWeatherInfluence(weatherInfluenceData);

    // Calculate daily mood trends
    const dailyData = filteredEntries.map(entry => ({
      date: format(new Date(entry.date), 'MMM d'),
      mood: entry.mood
    }));
    setDailyMoods(dailyData);
  };

  const filterEntriesByTimeFrame = (data: MoodEntry[]) => {
    const today = new Date();
    
    switch (timeFrame) {
      case 'week': {
        const startDate = startOfWeek(today);
        const endDate = endOfWeek(today);
        return data.filter(entry => {
          const entryDate = new Date(entry.date);
          return isWithinInterval(entryDate, { start: startDate, end: endDate });
        });
      }
      case 'month': {
        const startDate = startOfMonth(today);
        const endDate = endOfMonth(today);
        return data.filter(entry => {
          const entryDate = new Date(entry.date);
          return isWithinInterval(entryDate, { start: startDate, end: endDate });
        });
      }
      default:
        return data;
    }
  };

  const getMoodColor = (moodName: string) => {
    const mood = moods.find(m => m.label === moodName);
    return mood ? mood.bgColor : '#CBD5E1';
  };

  const exportToCSV = () => {
    if (!entries.length) return;

    const csvContent = [
      ['Date', 'Mood', 'Notes', 'Weather Condition', 'Temperature (°C)'].join(','),
      ...entries.map(entry => [
        format(new Date(entry.date), 'yyyy-MM-dd'),
        entry.mood,
        `"${entry.note.replace(/"/g, '""')}"`,
        entry.weather?.condition || 'N/A',
        entry.weather?.temp || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mood_journal_export.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getAverageTemperatureByMood = () => {
    const tempByMood: Record<string, { total: number, count: number }> = {};
    
    entries.forEach(entry => {
      if (entry.weather?.temp) {
        if (!tempByMood[entry.mood]) {
          tempByMood[entry.mood] = { total: 0, count: 0 };
        }
        tempByMood[entry.mood].total += entry.weather.temp;
        tempByMood[entry.mood].count++;
      }
    });
    
    return Object.keys(tempByMood).map(mood => ({
      mood,
      avgTemp: +(tempByMood[mood].total / tempByMood[mood].count).toFixed(1)
    }));
  };

  // Create mood trend data for line chart visualization
  const getMoodTrendData = () => {
    const today = new Date();
    const dateRange = timeFrame === 'week' 
      ? { start: subDays(today, 7), end: today }
      : timeFrame === 'month'
        ? { start: subDays(today, 30), end: today }
        : { start: subDays(today, 90), end: today };
    
    const days = eachDayOfInterval(dateRange);
    
    const moodPoints: Record<string, number> = {
      'Happy': 5,
      'Excited': 5,
      'Tired': 3,
      'Sad': 2,
      'Angry': 1
    };
    
    const trendData = days.map(day => {
      const formattedDate = format(day, 'MMM d');
      const dayEntries = entries.filter(entry => 
        format(new Date(entry.date), 'MMM d') === formattedDate
      );
      
      if (dayEntries.length > 0) {
        // Average mood score if multiple entries exist for the day
        const moodScore = dayEntries.reduce((sum, entry) => 
          sum + (moodPoints[entry.mood] || 3), 0) / dayEntries.length;
          
        return {
          date: formattedDate,
          moodScore: moodScore
        };
      }
      
      return {
        date: formattedDate,
        moodScore: null
      };
    });
    
    // Filter out days with no entries to prevent gaps in the line
    return trendData.filter(day => day.moodScore !== null);
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
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Mood Statistics</h1>
              <div className="flex gap-4">
                <Select value={timeFrame} onValueChange={(value) => setTimeFrame(value as any)}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Select time frame" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={exportToCSV}>
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Mood Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Mood Distribution</CardTitle>
                  <CardDescription>How your moods are spread over time</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={moodDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {moodDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getMoodColor(entry.name)} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} entries`, 'Count']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Weather Influence */}
              <Card>
                <CardHeader>
                  <CardTitle>Weather Influence</CardTitle>
                  <CardDescription>How weather affects your mood</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={weatherInfluence}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis 
                        dataKey="condition" 
                        type="category" 
                        tick={({ y, payload }) => (
                          <text x={0} y={y} dy={4} textAnchor="start" fill="#666">
                            {weatherIcons[payload.value] || weatherIcons.Default} {payload.value}
                          </text>
                        )}
                      />
                      <Tooltip 
                        formatter={(value, name, props) => {
                          const weatherCondition = props.payload.condition;
                          const moodDistribution = Object.entries(props.payload.moods)
                            .map(([mood, count]) => `${mood}: ${count}`)
                            .join(', ');
                          return [`${value} entries (${moodDistribution})`, weatherCondition];
                        }}
                      />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Mood Trend Line Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Mood Trend Over Time</CardTitle>
                <CardDescription>Track how your mood changes day by day</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={getMoodTrendData()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip 
                      formatter={(value) => {
                        const moodScore = Number(value);
                        let mood = "Unknown";
                        
                        if (moodScore >= 5) mood = "Excited/Happy";
                        else if (moodScore >= 4) mood = "Happy";
                        else if (moodScore >= 3) mood = "Neutral/Tired";
                        else if (moodScore >= 2) mood = "Sad";
                        else mood = "Angry";
                        
                        return [mood, "Mood"];
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="moodScore" 
                      name="Mood Score" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Temperature Effect on Mood */}
            <Card>
              <CardHeader>
                <CardTitle>Temperature Effect on Mood</CardTitle>
                <CardDescription>Average temperature when experiencing each mood</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getAverageTemperatureByMood()}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mood" />
                    <YAxis label={{ value: 'Temperature (°C)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value}°C`, 'Average Temperature']} />
                    <Bar dataKey="avgTemp" fill="#82ca9d">
                      {getAverageTemperatureByMood().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getMoodColor(entry.mood)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}