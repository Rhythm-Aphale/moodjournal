// components/MoodVisualization.tsx
'use client';

import { useState, useOptimistic } from 'react';

// Define types
type Mood = {
  emoji: string;
  label: string;
  color: string;
};

type EntryData = {
  id: string;
  date: Date;
  mood: Mood;
};

type MoodVisualizationProps = {
  entries?: EntryData[];
};

const MoodVisualization = ({ entries = [] }: MoodVisualizationProps) => {
  const [displayMode, setDisplayMode] = useState<'weekly' | 'monthly'>('weekly');
  
  // Group entries by day for the past week or month
  const getGroupedEntries = () => {
    const today = new Date();
    const startDate = new Date();
    
    if (displayMode === 'weekly') {
      startDate.setDate(today.getDate() - 7); // Last 7 days
    } else {
      startDate.setDate(today.getDate() - 30); // Last 30 days
    }
    
    // Filter entries within the date range
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= today;
    });
    
    // Group by day
    const grouped: Record<string, EntryData[]> = {};
    filteredEntries.forEach(entry => {
      const dateKey = new Date(entry.date).toLocaleDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    
    return grouped;
  };
  
  // Simulate optimistic UI updates for React 19
  const [optimisticEntries, addOptimisticEntry] = useOptimistic(
    entries,
    (state, newEntry: EntryData) => [...state, newEntry]
  );
  
  // Get mood averages for the selected period
  const getMoodStats = () => {
    if (entries.length === 0) return [];
    
    // Map mood labels to numeric values for calculation
    const moodValues: Record<string, number> = {
      'Happy': 5,
      'Calm': 4,
      'Neutral': 3,
      'Sad': 2,
      'Angry': 1
    };
    
    // Count occurrences of each mood
    const moodCounts: Record<string, number> = {};
    entries.forEach(entry => {
      const mood = entry.mood.label;
      moodCounts[mood] = (moodCounts[mood] || 0) + 1;
    });
    
    // Convert to percentage and format for display
    const total = entries.length;
    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      emoji: entries.find(e => e.mood.label === mood)?.mood.emoji || '',
      color: entries.find(e => e.mood.label === mood)?.mood.color || '',
      percentage: Math.round((count / total) * 100),
      count
    })).sort((a, b) => b.count - a.count);
  };
  
  const groupedEntries = getGroupedEntries();
  const moodStats = getMoodStats();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Mood Insights</h2>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setDisplayMode('weekly')}
            className={`px-4 py-2 text-sm font-medium ${
              displayMode === 'weekly' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } transition-colors`}
          >
            Weekly
          </button>
          <button
            onClick={() => setDisplayMode('monthly')}
            className={`px-4 py-2 text-sm font-medium ${
              displayMode === 'monthly' 
                ? 'bg-purple-500 text-white' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } transition-colors`}
          >
            Monthly
          </button>
        </div>
      </div>
      
      {/* Mood Distribution */}
      {moodStats.length > 0 ? (
        <div className="mb-8">
          <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-3">Mood Distribution</h3>
          <div className="space-y-3">
            {moodStats.map(stat => (
              <div key={stat.mood} className="flex items-center">
                <span className="text-xl mr-2">{stat.emoji}</span>
                <span className="w-24 text-sm text-gray-700 dark:text-gray-300">{stat.mood}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div 
                    className={`h-full ${stat.color} rounded-full`} 
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  {stat.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No mood data available for the selected period.
        </div>
      )}
      
      {/* Calendar View */}
      <div>
        <h3 className="text-gray-700 dark:text-gray-300 font-medium mb-3">
          {displayMode === 'weekly' ? 'Past Week' : 'Past Month'}
        </h3>
        
        {Object.keys(groupedEntries).length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(groupedEntries).map(([dateKey, dayEntries]) => (
              <div 
                key={dateKey} 
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {new Date(dateKey).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
                <div className="flex">
                  {dayEntries.map(entry => (
                    <div 
                      key={entry.id}
                      className={`${entry.mood.color} rounded-full p-2 mr-2`}
                    >
                      <span className="text-lg">{entry.mood.emoji}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            No entries found for this period.
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodVisualization;