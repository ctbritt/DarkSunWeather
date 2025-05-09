import { WeatherPattern } from "@shared/schema";
import { WeatherData, Region, Season } from "../types/weather";

// IndexedDB setup
const DB_NAME = "DarkSunWeatherDB";
const DB_VERSION = 1;
const WEATHER_STORE = "weatherPatterns";
const SETTINGS_STORE = "settings";

// Initialize the database
export function initDatabase(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error("IndexedDB error:", event);
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = () => {
      resolve(true);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create weather patterns store
      if (!db.objectStoreNames.contains(WEATHER_STORE)) {
        const weatherStore = db.createObjectStore(WEATHER_STORE, { keyPath: "id", autoIncrement: true });
        weatherStore.createIndex("name", "name", { unique: false });
        weatherStore.createIndex("region", "region", { unique: false });
        weatherStore.createIndex("season", "season", { unique: false });
        weatherStore.createIndex("createdAt", "createdAt", { unique: false });
      }
      
      // Create settings store
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        const settingsStore = db.createObjectStore(SETTINGS_STORE, { keyPath: "id" });
      }
    };
  });
}

// Interface for saved weather pattern
export interface SavedWeatherPattern {
  id?: number;
  name: string;
  region: Region;
  season: Season;
  temperatureTendency: number;
  windIntensity: number;
  specialEventProbability: number;
  days: number;
  weatherData: WeatherData[];
  createdAt: string;
}

// Save weather pattern
export function saveWeatherPattern(pattern: SavedWeatherPattern): Promise<number> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([WEATHER_STORE], "readwrite");
      const store = transaction.objectStore(WEATHER_STORE);
      
      // Add the pattern
      const addRequest = store.add(pattern);
      
      addRequest.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as number);
      };
      
      addRequest.onerror = (event) => {
        reject(new Error("Failed to save weather pattern"));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

// Get all weather patterns
export function getAllWeatherPatterns(): Promise<SavedWeatherPattern[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([WEATHER_STORE], "readonly");
      const store = transaction.objectStore(WEATHER_STORE);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as SavedWeatherPattern[]);
      };
      
      getAllRequest.onerror = (event) => {
        reject(new Error("Failed to get weather patterns"));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

// Get weather pattern by ID
export function getWeatherPatternById(id: number): Promise<SavedWeatherPattern | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([WEATHER_STORE], "readonly");
      const store = transaction.objectStore(WEATHER_STORE);
      const getRequest = store.get(id);
      
      getRequest.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result as SavedWeatherPattern || null);
      };
      
      getRequest.onerror = (event) => {
        reject(new Error("Failed to get weather pattern"));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

// Delete weather pattern by ID
export function deleteWeatherPattern(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([WEATHER_STORE], "readwrite");
      const store = transaction.objectStore(WEATHER_STORE);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = (event) => {
        reject(new Error("Failed to delete weather pattern"));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

// Update weather pattern
export function updateWeatherPattern(pattern: SavedWeatherPattern): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!pattern.id) {
      reject(new Error("Pattern ID is required for updating"));
      return;
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([WEATHER_STORE], "readwrite");
      const store = transaction.objectStore(WEATHER_STORE);
      const updateRequest = store.put(pattern);
      
      updateRequest.onsuccess = () => {
        resolve();
      };
      
      updateRequest.onerror = (event) => {
        reject(new Error("Failed to update weather pattern"));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

// Save settings
export function saveSettings(settings: Record<string, any>): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([SETTINGS_STORE], "readwrite");
      const store = transaction.objectStore(SETTINGS_STORE);
      
      // Save with a fixed ID to always update/overwrite the same record
      settings.id = "user-settings";
      const putRequest = store.put(settings);
      
      putRequest.onsuccess = () => {
        resolve();
      };
      
      putRequest.onerror = (event) => {
        reject(new Error("Failed to save settings"));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

// Get settings
export function getSettings(): Promise<Record<string, any> | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([SETTINGS_STORE], "readonly");
      const store = transaction.objectStore(SETTINGS_STORE);
      const getRequest = store.get("user-settings");
      
      getRequest.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result || null);
      };
      
      getRequest.onerror = (event) => {
        reject(new Error("Failed to get settings"));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

// Export all weather patterns as JSON
export function exportWeatherPatterns(): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const patterns = await getAllWeatherPatterns();
      const jsonData = JSON.stringify(patterns, null, 2);
      resolve(jsonData);
    } catch (error) {
      reject(error);
    }
  });
}

// Import weather patterns from JSON
export function importWeatherPatterns(jsonData: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const patterns = JSON.parse(jsonData) as SavedWeatherPattern[];
      
      if (!Array.isArray(patterns)) {
        reject(new Error("Invalid format - expected an array of weather patterns"));
        return;
      }
      
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = (event) => {
        reject(new Error("Failed to open database"));
      };
      
      request.onsuccess = async (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction([WEATHER_STORE], "readwrite");
        const store = transaction.objectStore(WEATHER_STORE);
        
        // Import each pattern
        let completed = 0;
        for (const pattern of patterns) {
          // Remove ID to avoid conflicts
          delete pattern.id;
          
          // Add the pattern
          const addRequest = store.add({
            ...pattern,
            createdAt: pattern.createdAt || new Date().toISOString()
          });
          
          addRequest.onsuccess = () => {
            completed++;
            if (completed === patterns.length) {
              resolve();
            }
          };
          
          addRequest.onerror = (event) => {
            console.error("Error importing pattern:", event);
            // Continue with other patterns
            completed++;
            if (completed === patterns.length) {
              resolve();
            }
          };
        }
        
        transaction.oncomplete = () => {
          db.close();
        };
      };
    } catch (error) {
      reject(error);
    }
  });
}
