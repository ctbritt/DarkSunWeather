import { WeatherPattern } from "@shared/schema";
import { WeatherData, Region, Season } from "../types/weather";
import { apiRequest } from "./queryClient";

// IndexedDB setup
const DB_NAME = "DarkSunWeatherDB";
const DB_VERSION = 1;
const WEATHER_STORE = "weatherPatterns";
const SETTINGS_STORE = "settings";
const SYNC_STORE = "syncQueue";

// Online state tracking
let isOnline = navigator.onLine;
window.addEventListener('online', () => { 
  isOnline = true;
  synchronizeData();
});
window.addEventListener('offline', () => { isOnline = false; });

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

      // Create sync queue store
      if (!db.objectStoreNames.contains(SYNC_STORE)) {
        const syncStore = db.createObjectStore(SYNC_STORE, { keyPath: "id", autoIncrement: true });
        syncStore.createIndex("operation", "operation", { unique: false });
        syncStore.createIndex("timestamp", "timestamp", { unique: false });
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

// Add operation to sync queue
async function addToSyncQueue(operation: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([SYNC_STORE], "readwrite");
      const store = transaction.objectStore(SYNC_STORE);
      
      const syncItem = {
        operation,
        data,
        timestamp: new Date().toISOString()
      };
      
      const addRequest = store.add(syncItem);
      
      addRequest.onsuccess = () => {
        resolve();
      };
      
      addRequest.onerror = () => {
        reject(new Error("Failed to add to sync queue"));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

// Synchronize data with server when online
async function synchronizeData(): Promise<void> {
  if (!isOnline) return;
  
  const syncItems = await getSyncQueue();
  if (syncItems.length === 0) return;
  
  for (const item of syncItems) {
    try {
      switch (item.operation) {
        case 'CREATE':
          await apiRequest('/api/weather-patterns', {
            method: 'POST',
            body: JSON.stringify(item.data),
            headers: { 'Content-Type': 'application/json' }
          });
          break;
        case 'UPDATE':
          await apiRequest(`/api/weather-patterns/${item.data.id}`, {
            method: 'PUT',
            body: JSON.stringify(item.data),
            headers: { 'Content-Type': 'application/json' }
          });
          break;
        case 'DELETE':
          await apiRequest(`/api/weather-patterns/${item.data.id}`, {
            method: 'DELETE'
          });
          break;
      }
      
      // Remove from sync queue after successful sync
      await removeFromSyncQueue(item.id);
    } catch (error) {
      console.error(`Failed to synchronize item ${item.id}:`, error);
      // Keep in queue to retry later
    }
  }
}

// Get items from sync queue
async function getSyncQueue(): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([SYNC_STORE], "readonly");
      const store = transaction.objectStore(SYNC_STORE);
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = (event) => {
        resolve((event.target as IDBRequest).result);
      };
      
      getAllRequest.onerror = (event) => {
        reject(new Error("Failed to get sync queue"));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

// Remove item from sync queue
async function removeFromSyncQueue(id: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction([SYNC_STORE], "readwrite");
      const store = transaction.objectStore(SYNC_STORE);
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = (event) => {
        reject(new Error("Failed to remove from sync queue"));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    };
  });
}

// Save weather pattern
export function saveWeatherPattern(pattern: SavedWeatherPattern): Promise<number> {
  // Try to save to server if online
  if (isOnline) {
    return apiRequest('/api/weather-patterns', {
      method: 'POST',
      body: JSON.stringify(pattern),
      headers: { 'Content-Type': 'application/json' }
    })
      .then((response: any) => {
        // Also save to local IndexedDB for offline access
        saveToIndexedDB(pattern);
        return response.id;
      })
      .catch(error => {
        console.error("Failed to save to server, falling back to IndexedDB:", error);
        return saveToIndexedDB(pattern);
      });
  } else {
    // Save to IndexedDB and queue for sync
    return saveToIndexedDB(pattern)
      .then(id => {
        const patternWithId = { ...pattern, id };
        addToSyncQueue('CREATE', patternWithId);
        return id;
      });
  }
}

// Save to IndexedDB
function saveToIndexedDB(pattern: SavedWeatherPattern): Promise<number> {
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
  // Try to get from server if online
  if (isOnline) {
    return apiRequest('/api/weather-patterns')
      .then((response: SavedWeatherPattern[]) => {
        // Update local IndexedDB with server data
        updateLocalPatterns(response);
        return response;
      })
      .catch(error => {
        console.error("Failed to get from server, falling back to IndexedDB:", error);
        return getAllFromIndexedDB();
      });
  } else {
    // Get from IndexedDB when offline
    return getAllFromIndexedDB();
  }
}

// Update local IndexedDB with server data
async function updateLocalPatterns(patterns: SavedWeatherPattern[]): Promise<void> {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  
  request.onerror = (event) => {
    console.error("Failed to open database for update:", event);
  };
  
  request.onsuccess = (event) => {
    const db = (event.target as IDBOpenDBRequest).result;
    const transaction = db.transaction([WEATHER_STORE], "readwrite");
    const store = transaction.objectStore(WEATHER_STORE);
    
    // Clear existing patterns
    const clearRequest = store.clear();
    
    clearRequest.onsuccess = () => {
      // Add all patterns from server
      for (const pattern of patterns) {
        store.add(pattern);
      }
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  };
}

// Get all from IndexedDB
function getAllFromIndexedDB(): Promise<SavedWeatherPattern[]> {
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
  // Try to get from server if online
  if (isOnline) {
    return apiRequest(`/api/weather-patterns/${id}`)
      .then((response: SavedWeatherPattern) => {
        return response;
      })
      .catch(error => {
        console.error("Failed to get from server, falling back to IndexedDB:", error);
        return getFromIndexedDB(id);
      });
  } else {
    // Get from IndexedDB when offline
    return getFromIndexedDB(id);
  }
}

// Get from IndexedDB
function getFromIndexedDB(id: number): Promise<SavedWeatherPattern | null> {
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
  // Try to delete from server if online
  if (isOnline) {
    return apiRequest(`/api/weather-patterns/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        // Also delete from IndexedDB
        return deleteFromIndexedDB(id);
      })
      .catch(error => {
        console.error("Failed to delete from server, falling back to IndexedDB:", error);
        return deleteFromIndexedDB(id)
          .then(() => {
            // Queue for sync when back online
            addToSyncQueue('DELETE', { id });
          });
      });
  } else {
    // Delete from IndexedDB and queue for sync
    return deleteFromIndexedDB(id)
      .then(() => {
        addToSyncQueue('DELETE', { id });
      });
  }
}

// Delete from IndexedDB
function deleteFromIndexedDB(id: number): Promise<void> {
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
  if (!pattern.id) {
    return Promise.reject(new Error("Pattern ID is required for updating"));
  }
  
  // Try to update on server if online
  if (isOnline) {
    return apiRequest(`/api/weather-patterns/${pattern.id}`, {
      method: 'PUT',
      body: JSON.stringify(pattern),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(() => {
        // Also update in IndexedDB
        return updateInIndexedDB(pattern);
      })
      .catch(error => {
        console.error("Failed to update on server, falling back to IndexedDB:", error);
        return updateInIndexedDB(pattern)
          .then(() => {
            // Queue for sync when back online
            addToSyncQueue('UPDATE', pattern);
          });
      });
  } else {
    // Update in IndexedDB and queue for sync
    return updateInIndexedDB(pattern)
      .then(() => {
        addToSyncQueue('UPDATE', pattern);
      });
  }
}

// Update in IndexedDB
function updateInIndexedDB(pattern: SavedWeatherPattern): Promise<void> {
  return new Promise((resolve, reject) => {
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
      
      // If online, try to import to server first
      if (isOnline) {
        try {
          await apiRequest('/api/weather-patterns/import', {
            method: 'POST',
            body: jsonData,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error("Failed to import to server, falling back to IndexedDB:", error);
        }
      }
      
      // Always save to IndexedDB as well
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