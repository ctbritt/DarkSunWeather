import { createContext, useState, useEffect, ReactNode, useCallback } from "react";
import { WeatherParameters, WeatherData, Region, Season } from "../types/weather";
import { initDatabase, getSettings, saveSettings } from "@/lib/weatherStorage";

// Define the context type
interface WeatherContextType {
  // Tab state
  activeTab: "weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings";
  setActiveTab: (tab: "weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings") => void;
  
  // Weather parameters
  weatherParams: WeatherParameters;
  setWeatherParams: (params: WeatherParameters | ((prev: WeatherParameters) => WeatherParameters)) => void;
  
  // Weather data
  weatherData: WeatherData[];
  setWeatherData: (data: WeatherData[]) => void;
  
  // Current weather (selected day)
  currentWeather: WeatherData | null;
  setCurrentWeather: (weather: WeatherData | null) => void;
  
  // Dark mode toggle
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  
  // Direct action methods
  updateParams: (newParams: Partial<WeatherParameters>) => void;
  changeTab: (tab: "weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings") => void;
}

// Default weather parameters
const defaultWeatherParams: WeatherParameters = {
  region: "Tablelands",
  season: "High Sun",
  temperatureTendency: 3,
  windIntensity: 3,
  specialEventProbability: 3,
  days: 7
};

// Create the context with default values
export const WeatherContext = createContext<WeatherContextType>({
  activeTab: "weatherGenerator",
  setActiveTab: () => {},
  weatherParams: defaultWeatherParams,
  setWeatherParams: () => {},
  weatherData: [],
  setWeatherData: () => {},
  currentWeather: null,
  setCurrentWeather: () => {},
  darkMode: true,
  setDarkMode: () => {},
  updateParams: () => {},
  changeTab: () => {}
});

// Define props for weather provider
interface WeatherProviderProps {
  children: ReactNode;
}

export function WeatherProvider({ children }: WeatherProviderProps) {
  console.log('WeatherProvider rendering');
  
  // Set up state
  const [activeTab, setActiveTab] = useState<"weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings">("weatherGenerator");
  const [darkMode, setDarkMode] = useState<boolean>(true);
  
  // Weather parameters state with default values
  const [weatherParams, setWeatherParams] = useState<WeatherParameters>(defaultWeatherParams);
  
  // Weather data state
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  
  // Current weather state (selected day)
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  
  // Direct action methods that don't depend on closures
  const updateParams = useCallback((newParams: Partial<WeatherParameters>) => {
    console.log('updateParams called with:', newParams);
    console.log('Current weatherParams before update:', weatherParams);
    setWeatherParams(prev => {
      const updatedParams = {
        ...prev,
        ...newParams
      };
      console.log('Updated weatherParams will be:', updatedParams);
      return updatedParams;
    });
  }, [weatherParams]);
  
  const changeTab = useCallback((tab: "weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings") => {
    console.log('changeTab called with:', tab);
    setActiveTab(tab);
  }, []);
  
  // Initialize the database and load settings on mount
  useEffect(() => {
    let isMounted = true;
    
    async function initialize() {
      try {
        // Initialize the IndexedDB database
        await initDatabase();
        
        if (!isMounted) return;
        
        // Try to load saved settings
        const settings = await getSettings();
        if (settings && isMounted) {
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
    
    console.log('Running initialization effect');
    initialize();
    
    return () => {
      isMounted = false;
    };
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
    
    const timeoutId = setTimeout(() => {
      console.log('Saving settings');
      saveUserSettings();
    }, 1000);
    
    return () => clearTimeout(timeoutId);
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
    setDarkMode,
    updateParams,
    changeTab
  };
  
  return (
    <WeatherContext.Provider value={contextValue}>
      {children}
    </WeatherContext.Provider>
  );
}
