import { createContext, useState, useEffect, ReactNode } from "react";
import { WeatherParameters, WeatherData, Region, Season } from "../types/weather";
import { initDatabase, getSettings, saveSettings } from "@/lib/weatherStorage";

// Define the context type
interface WeatherContextType {
  // Tab state
  activeTab: "weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings";
  setActiveTab: (tab: "weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings") => void;
  
  // Weather parameters
  weatherParams: WeatherParameters;
  setWeatherParams: (params: WeatherParameters) => void;
  
  // Weather data
  weatherData: WeatherData[];
  setWeatherData: (data: WeatherData[]) => void;
  
  // Current weather (selected day)
  currentWeather: WeatherData | null;
  setCurrentWeather: (weather: WeatherData | null) => void;
  
  // Dark mode toggle
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
}

// Create the context with default values to ensure proper typing
export const WeatherContext = createContext<WeatherContextType>({
  activeTab: "weatherGenerator",
  setActiveTab: () => {},
  weatherParams: {
    region: "Tablelands",
    season: "High Sun",
    temperatureTendency: 3,
    windIntensity: 3,
    specialEventProbability: 3,
    days: 7
  },
  setWeatherParams: () => {},
  weatherData: [],
  setWeatherData: () => {},
  currentWeather: null,
  setCurrentWeather: () => {},
  darkMode: true,
  setDarkMode: () => {}
});

// Define props for weather provider
interface WeatherProviderProps {
  children: ReactNode;
}

export function WeatherProvider({ children }: WeatherProviderProps) {
  // Set up state
  const [activeTab, setActiveTab] = useState<"weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings">("weatherGenerator");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Weather parameters state with default values
  const [weatherParams, setWeatherParams] = useState<WeatherParameters>({
    region: "Tablelands",
    season: "High Sun",
    temperatureTendency: 3, // Normal
    windIntensity: 3, // Normal
    specialEventProbability: 3, // Standard
    days: 7
  });
  
  // Weather data state
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  
  // Current weather state (selected day)
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  
  // Initialize the database and load settings on mount
  useEffect(() => {
    async function initialize() {
      try {
        // Initialize the IndexedDB database
        await initDatabase();
        
        // Try to load saved settings
        const settings = await getSettings();
        if (settings) {
          // Apply saved settings if they exist
          if (settings.weatherParams) {
            setWeatherParams(settings.weatherParams);
          }
          if (settings.darkMode !== undefined) {
            setDarkMode(settings.darkMode);
          }
        }
      } catch (error) {
        console.error("Error initializing the app:", error);
      }
    }
    
    initialize();
  }, []);
  
  // Save settings when they change
  useEffect(() => {
    const saveUserSettings = async () => {
      try {
        await saveSettings({
          weatherParams,
          darkMode
        });
      } catch (error) {
        console.error("Error saving settings:", error);
      }
    };
    
    saveUserSettings();
  }, [weatherParams, darkMode]);
  
  // Provide the context value
  const contextValue: WeatherContextType = {
    activeTab,
    setActiveTab,
    weatherParams,
    setWeatherParams,
    weatherData,
    setWeatherData,
    currentWeather,
    setCurrentWeather,
    darkMode,
    setDarkMode
  };
  
  return (
    <WeatherContext.Provider value={contextValue}>
      {children}
    </WeatherContext.Provider>
  );
}
