"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Cloud, Sun, CloudRain, Loader2 } from "lucide-react";

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

export function WeatherDisplay() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const API_KEY = "a9b43e680c963a0b94a6256c32787541" ; // Replace with your OpenWeatherMap API key
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        
        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: data.weather[0].icon,
        });
      } catch (err) {
        setError("Failed to fetch weather data");
      } finally {
        setLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setError("Location access denied");
        setLoading(false);
      }
    );
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground">{error}</div>
    );
  }

  return (
    <div className="text-center">
      {weather && (
        <>
          <div className="text-6xl font-bold mb-2">{weather.temp}°C</div>
          <div className="text-lg text-muted-foreground capitalize">
            {weather.description}
          </div>
          <img
            src={`http://openweathermap.org/img/w/${weather.icon}.png`}
            alt={weather.description}
            className="mx-auto mt-4"
          />
        </>
      )}
    </div>
  );
}