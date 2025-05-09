import { useContext } from "react";
import { WeatherContext } from "../providers/WeatherProvider";

// Custom hook to use the weather context
export function useWeather() {
  const context = useContext(WeatherContext);
  
  if (!context || typeof context.setActiveTab !== 'function') {
    console.error("Weather context is not properly initialized or missing functions");
    throw new Error("useWeather must be used within a WeatherProvider");
  }
  
  return context;
}
