// Region types for Dark Sun campaign setting
export type Region = 
  | "Tablelands" 
  | "Sea of Silt" 
  | "Ringing Mountains" 
  | "Forest Ridge" 
  | "Jagged Cliffs" 
  | "Tyr Valley";

// Season types for Dark Sun
export type Season = 
  | "High Sun" 
  | "Low Sun" 
  | "Ascending Sun" 
  | "Descending Sun";

// Wind condition types
export type WindCondition = 
  | "Calm" 
  | "Light" 
  | "Moderate" 
  | "Strong" 
  | "Violent";

// Special weather events in Dark Sun
export type WeatherEvent = 
  | "Dust Storm" 
  | "Heat Wave" 
  | "Silt Cloud" 
  | "Ash Fall" 
  | "Cold Snap" 
  | "Fog Bank" 
  | "Light Rain" 
  | "Dust Devil" 
  | "Lightning Storm" 
  | "Heavy Winds" 
  | "Rain" 
  | "Silt Storm" 
  | "Silt Drift" 
  | "Silt Tsunami" 
  | "Rock Slide" 
  | "Mountain Storm" 
  | "Heavy Snow" 
  | "Ice Storm" 
  | "Avalanche" 
  | "Early Snow" 
  | "Humid Heat" 
  | "Forest Fire" 
  | "Insect Swarm" 
  | "Falling Leaves" 
  | "Violent Updraft" 
  | "Updraft" 
  | "Drought" 
  | "Clear"
  | null;

// Weather parameters for generation
export interface WeatherParameters {
  region: Region;
  season: Season;
  temperatureTendency: number; // 1-5 scale, 3 is normal
  windIntensity: number; // 1-5 scale, 3 is normal
  specialEventProbability: number; // 1-5 scale, 3 is normal
  days: number; // Number of days to generate
}

// Weather data structure for a single day
export interface WeatherData {
  day: number;
  temperature: number; // Temperature in Celsius
  temperatureCondition: string; // Description of temperature (e.g., "Blistering Heat")
  windCondition: WindCondition;
  windDirection: string; // e.g., "Northerly", "Southeasterly"
  visibility: string; // e.g., "Normal", "Reduced", "Severely Reduced"
  specialEvent: WeatherEvent;
  dmNotes: string; // Notes for the Dungeon Master about game effects
  tags: string[]; // Tags for quick reference (e.g., "Exhaustion Risk", "Combat Penalty")
  season: Season; // The season this day is in
}
