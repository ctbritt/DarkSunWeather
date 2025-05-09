import { createContext, useReducer, useEffect, ReactNode, useCallback } from "react";
import { WeatherParameters, WeatherData, Region, Season } from "../types/weather";
import { initDatabase, getSettings, saveSettings } from "@/lib/weatherStorage";

// Define the context type
interface WeatherContextType {
  // Tab state
  activeTab: "weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings";
  
  // Weather parameters
  weatherParams: WeatherParameters;
  
  // Weather data
  weatherData: WeatherData[];
  
  // Current weather (selected day)
  currentWeather: WeatherData | null;
  
  // Dark mode toggle
  darkMode: boolean;
  
  // Dispatch function to update state
  dispatch: React.Dispatch<WeatherAction>;
  
  // Direct action methods
  updateParams: (newParams: Partial<WeatherParameters>) => void;
  setWeatherData: (data: WeatherData[]) => void;
  setCurrentWeather: (weather: WeatherData | null) => void;
  setDarkMode: (enabled: boolean) => void;
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

// Define action types
type WeatherAction =
  | { type: 'SET_ACTIVE_TAB', payload: "weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings" }
  | { type: 'UPDATE_WEATHER_PARAMS', payload: Partial<WeatherParameters> }
  | { type: 'SET_WEATHER_DATA', payload: WeatherData[] }
  | { type: 'SET_CURRENT_WEATHER', payload: WeatherData | null }
  | { type: 'SET_DARK_MODE', payload: boolean }
  | { type: 'LOAD_SETTINGS', payload: { weatherParams?: WeatherParameters, darkMode?: boolean } };

// Define the initial state
const initialState = {
  activeTab: "weatherGenerator" as const,
  weatherParams: defaultWeatherParams,
  weatherData: [] as WeatherData[],
  currentWeather: null as WeatherData | null,
  darkMode: true,
};

// Reducer function
function weatherReducer(state = initialState, action: WeatherAction) {
  console.log('Reducer called with action:', action.type, action.payload);
  
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
      
    case 'UPDATE_WEATHER_PARAMS':
      return { 
        ...state, 
        weatherParams: { 
          ...state.weatherParams, 
          ...action.payload 
        } 
      };
      
    case 'SET_WEATHER_DATA':
      return { ...state, weatherData: action.payload };
      
    case 'SET_CURRENT_WEATHER':
      return { ...state, currentWeather: action.payload };
      
    case 'SET_DARK_MODE':
      return { ...state, darkMode: action.payload };
      
    case 'LOAD_SETTINGS':
      return {
        ...state,
        weatherParams: action.payload.weatherParams 
          ? { ...state.weatherParams, ...action.payload.weatherParams } 
          : state.weatherParams,
        darkMode: action.payload.darkMode !== undefined 
          ? action.payload.darkMode 
          : state.darkMode
      };
      
    default:
      return state;
  }
}

// Create the context with default values
export const WeatherContext = createContext<WeatherContextType>({
  activeTab: initialState.activeTab,
  weatherParams: initialState.weatherParams,
  weatherData: initialState.weatherData,
  currentWeather: initialState.currentWeather,
  darkMode: initialState.darkMode,
  dispatch: () => {},
  updateParams: () => {},
  setWeatherData: () => {},
  setCurrentWeather: () => {},
  setDarkMode: () => {},
  changeTab: () => {}
});

// Define props for weather provider
interface WeatherProviderProps {
  children: ReactNode;
}

export function WeatherProvider({ children }: WeatherProviderProps) {
  console.log('WeatherProvider rendering');
  
  // Set up reducer for state management
  const [state, dispatch] = useReducer(weatherReducer, initialState);
  
  // Create action methods
  const updateParams = useCallback((newParams: Partial<WeatherParameters>) => {
    console.log('updateParams called with:', newParams);
    dispatch({ type: 'UPDATE_WEATHER_PARAMS', payload: newParams });
  }, []);
  
  const setWeatherData = useCallback((data: WeatherData[]) => {
    dispatch({ type: 'SET_WEATHER_DATA', payload: data });
  }, []);
  
  const setCurrentWeather = useCallback((weather: WeatherData | null) => {
    dispatch({ type: 'SET_CURRENT_WEATHER', payload: weather });
  }, []);
  
  const setDarkMode = useCallback((enabled: boolean) => {
    dispatch({ type: 'SET_DARK_MODE', payload: enabled });
  }, []);
  
  const changeTab = useCallback((tab: "weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings") => {
    console.log('changeTab called with:', tab);
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
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
          dispatch({ 
            type: 'LOAD_SETTINGS', 
            payload: {
              weatherParams: settings.weatherParams,
              darkMode: settings.darkMode
            }
          });
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
          weatherParams: state.weatherParams,
          darkMode: state.darkMode
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
  }, [state.weatherParams, state.darkMode]);
  
  // Provide the context value
  const contextValue: WeatherContextType = {
    activeTab: state.activeTab,
    weatherParams: state.weatherParams,
    weatherData: state.weatherData,
    currentWeather: state.currentWeather,
    darkMode: state.darkMode,
    dispatch,
    updateParams,
    setWeatherData,
    setCurrentWeather,
    setDarkMode,
    changeTab
  };
  
  return (
    <WeatherContext.Provider value={contextValue}>
      {children}
    </WeatherContext.Provider>
  );
}
