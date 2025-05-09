import { WeatherData, WeatherEvent, WindCondition, Region, Season } from "../types/weather";

// Temperature ranges for each season (min, max in °C)
const seasonTemperatureRanges = {
  "High Sun": [45, 55],
  "Low Sun": [30, 40],
  "Ascending Sun": [35, 50],
  "Descending Sun": [40, 50],
};

// Region temperature modifiers
const regionTemperatureModifiers = {
  "Tablelands": 0,
  "Sea of Silt": 3,
  "Ringing Mountains": -3,
  "Forest Ridge": -2,
  "Jagged Cliffs": -1,
  "Tyr Valley": 2,
};

// Wind condition probabilities by region
const regionWindProbabilities = {
  "Tablelands": {
    "Calm": 0.2,
    "Light": 0.3,
    "Moderate": 0.3,
    "Strong": 0.15,
    "Violent": 0.05,
  },
  "Sea of Silt": {
    "Calm": 0.05,
    "Light": 0.15,
    "Moderate": 0.3,
    "Strong": 0.3,
    "Violent": 0.2,
  },
  "Ringing Mountains": {
    "Calm": 0.1,
    "Light": 0.2,
    "Moderate": 0.3,
    "Strong": 0.3,
    "Violent": 0.1,
  },
  "Forest Ridge": {
    "Calm": 0.4,
    "Light": 0.3,
    "Moderate": 0.2,
    "Strong": 0.08,
    "Violent": 0.02,
  },
  "Jagged Cliffs": {
    "Calm": 0.1,
    "Light": 0.2,
    "Moderate": 0.2,
    "Strong": 0.3,
    "Violent": 0.2,
  },
  "Tyr Valley": {
    "Calm": 0.25,
    "Light": 0.35,
    "Moderate": 0.25,
    "Strong": 0.1,
    "Violent": 0.05,
  },
};

// Special weather events by region and season
const specialWeatherEvents = {
  "Tablelands": {
    "High Sun": ["Dust Storm", "Heat Wave", "Silt Cloud", "Ash Fall"],
    "Low Sun": ["Cold Snap", "Fog Bank", "Light Rain", "Clear"],
    "Ascending Sun": ["Dust Devil", "Lightning Storm", "Silt Cloud", "Clear"],
    "Descending Sun": ["Heavy Winds", "Dust Storm", "Rain", "Clear"],
  },
  "Sea of Silt": {
    "High Sun": ["Silt Storm", "Heat Wave", "Dust Devil", "Ash Fall"],
    "Low Sun": ["Fog Bank", "Cold Snap", "Silt Drift", "Clear"],
    "Ascending Sun": ["Silt Storm", "Lightning Storm", "Dust Devil", "Clear"],
    "Descending Sun": ["Silt Tsunami", "Heavy Winds", "Silt Storm", "Clear"],
  },
  "Ringing Mountains": {
    "High Sun": ["Rock Slide", "Heat Wave", "Mountain Storm", "Clear"],
    "Low Sun": ["Heavy Snow", "Cold Snap", "Ice Storm", "Clear"],
    "Ascending Sun": ["Avalanche", "Lightning Storm", "Heavy Rain", "Clear"],
    "Descending Sun": ["Rock Slide", "Early Snow", "Heavy Winds", "Clear"],
  },
  "Forest Ridge": {
    "High Sun": ["Humid Heat", "Forest Fire", "Insect Swarm", "Clear"],
    "Low Sun": ["Cold Snap", "Heavy Rain", "Fog", "Clear"],
    "Ascending Sun": ["Lightning Storm", "Heavy Rain", "Insect Swarm", "Clear"],
    "Descending Sun": ["Heavy Winds", "Rain", "Falling Leaves", "Clear"],
  },
  "Jagged Cliffs": {
    "High Sun": ["Violent Updraft", "Heat Wave", "Ash Fall", "Clear"],
    "Low Sun": ["Cold Snap", "Heavy Winds", "Snow", "Clear"],
    "Ascending Sun": ["Lightning Storm", "Updraft", "Heavy Winds", "Clear"],
    "Descending Sun": ["Rock Slide", "Heavy Winds", "Snow", "Clear"],
  },
  "Tyr Valley": {
    "High Sun": ["Dust Storm", "Heat Wave", "Drought", "Clear"],
    "Low Sun": ["Cold Snap", "Light Rain", "Fog Bank", "Clear"],
    "Ascending Sun": ["Dust Devil", "Lightning Storm", "Drought", "Clear"],
    "Descending Sun": ["Heavy Winds", "Light Rain", "Dust Storm", "Clear"],
  },
};

// Event probability modifiers based on special event probability setting
const eventProbabilityModifiers = {
  1: 0.3,  // Very Rare
  2: 0.6,  // Uncommon
  3: 1.0,  // Standard
  4: 1.5,  // Frequent
  5: 2.0,  // Very Frequent
};

// Temperature condition description based on temperature
function getTemperatureCondition(temperature: number): string {
  if (temperature >= 55) return "Deadly Heat";
  if (temperature >= 50) return "Blistering Heat";
  if (temperature >= 45) return "Extreme Heat";
  if (temperature >= 40) return "Scorching";
  if (temperature >= 35) return "Hot";
  if (temperature >= 30) return "Warm";
  if (temperature >= 25) return "Mild";
  if (temperature >= 20) return "Cool";
  if (temperature < 20) return "Cold";
  return "Unknown";
}

// DM notes based on temperature and wind conditions
function getDMNotes(temperature: number, windCondition: WindCondition, specialEvent: WeatherEvent | null): string {
  let notes = [];
  
  // Temperature notes
  if (temperature >= 45) {
    notes.push("Extreme heat forces Constitution saves (DC 15) every hour for characters without adequate protection or water.");
  } else if (temperature >= 40) {
    notes.push("Characters must make Constitution saves (DC 12) every 2 hours if not properly hydrated or protected.");
  } else if (temperature <= 15) {
    notes.push("Cold temperatures require warm clothing or shelter to avoid suffering exhaustion.");
  }
  
  // Wind notes
  if (windCondition === "Strong") {
    notes.push("Strong winds impose disadvantage on ranged attacks and Perception checks based on hearing.");
  } else if (windCondition === "Violent") {
    notes.push("Violent winds make ranged attacks impossible and force Constitution saves (DC 10) to avoid being knocked prone when running.");
  }
  
  // Special event notes
  if (specialEvent) {
    switch (specialEvent) {
      case "Dust Storm":
        notes.push("The dust storm reduces visibility to 10 feet and imposes disadvantage on Perception checks.");
        break;
      case "Heat Wave":
        notes.push("The heat wave increases the DC of Constitution saves by 2 and requires double the normal water consumption.");
        break;
      case "Silt Storm":
        notes.push("The silt storm makes breathing difficult without proper protection, requiring Constitution saves (DC 13) every hour or gain 1 level of exhaustion.");
        break;
      case "Lightning Storm":
        notes.push("Lightning strikes randomly. Each hour, roll a d20. On a 1, a character must make a Dexterity save (DC 15) or take 4d10 lightning damage (half on success).");
        break;
      case "Avalanche":
      case "Rock Slide":
        notes.push("Traveling on or below mountain slopes is dangerous. Characters must succeed on a Wisdom (Survival) check (DC 15) to avoid being caught in falling debris (4d10 bludgeoning damage).");
        break;
      case "Forest Fire":
        notes.push("Smoke reduces visibility to 60 feet and makes breathing difficult. Characters must make Constitution saves (DC 13) every hour or gain 1 level of exhaustion.");
        break;
      case "Insect Swarm":
        notes.push("Insect swarms cause constant irritation. Characters suffer disadvantage on Concentration checks and ability checks requiring focus.");
        break;
    }
  }
  
  return notes.join(" ");
}

// Get weather tags based on temperature, wind, and special event
function getWeatherTags(temperature: number, windCondition: WindCondition, specialEvent: WeatherEvent | null): string[] {
  const tags: string[] = [];
  
  // Temperature tags
  if (temperature >= 50) {
    tags.push("Exhaustion Risk");
    tags.push("Deadly Heat");
  } else if (temperature >= 45 && temperature < 50) {
    tags.push("Heat Danger");
    tags.push("Extreme Heat");
  } else if (temperature >= 40 && temperature < 45) {
    tags.push("Heat Stress");
    tags.push("Scorching");
  } else if (temperature <= 20) {
    tags.push("Cold Danger");
    tags.push("Hypothermia Risk");
  }
  
  // Wind tags
  if (windCondition === "Strong") {
    tags.push("Navigation Penalty");
    tags.push("Strong Winds");
  } else if (windCondition === "Violent") {
    tags.push("Combat Penalty");
    tags.push("Violent Winds");
  }
  
  // Special event tags
  if (specialEvent) {
    tags.push(specialEvent);
    
    if (specialEvent === "Dust Storm" || specialEvent === "Silt Storm") {
      tags.push("Low Visibility");
      tags.push("Breathing Hazard");
    }
    
    if (specialEvent === "Heat Wave") {
      tags.push("Dehydration Risk");
      tags.push("Heat Stress");
    }
    
    if (specialEvent === "Lightning Storm") {
      tags.push("Lightning Danger");
      tags.push("Storm Hazard");
    }
  }
  
  return tags;
}

// Generate visibility based on conditions
function getVisibility(windCondition: WindCondition, specialEvent: WeatherEvent | null): string {
  if (specialEvent === "Dust Storm" || specialEvent === "Silt Storm") {
    return "Severely Reduced";
  }
  
  if (specialEvent === "Fog Bank" || specialEvent === "Silt Cloud") {
    return "Moderately Reduced";
  }
  
  if (windCondition === "Strong" || windCondition === "Violent") {
    return "Slightly Reduced";
  }
  
  return "Normal";
}

// Determine wind direction
function getWindDirection(): string {
  const directions = ["Northerly", "Northeasterly", "Easterly", "Southeasterly", "Southerly", "Southwesterly", "Westerly", "Northwesterly"];
  return directions[Math.floor(Math.random() * directions.length)];
}

// Generate random temperature within range with seasonal variation
function generateTemperature(
  season: Season,
  region: Region,
  temperatureTendency: number,
  previousTemp: number | null
): number {
  const [min, max] = seasonTemperatureRanges[season];
  const regionMod = regionTemperatureModifiers[region];
  
  // Temperature tendency modifier (1-5 scale, 3 is neutral)
  const tendencyMod = (temperatureTendency - 3) * 2;
  
  // Base range
  let adjustedMin = min + regionMod + tendencyMod;
  let adjustedMax = max + regionMod + tendencyMod;
  
  // If we have a previous temperature, limit the change to +/- 3 degrees for continuity
  if (previousTemp !== null) {
    const minTemp = Math.max(adjustedMin, previousTemp - 3);
    const maxTemp = Math.min(adjustedMax, previousTemp + 3);
    return Math.floor(minTemp + Math.random() * (maxTemp - minTemp));
  }
  
  return Math.floor(adjustedMin + Math.random() * (adjustedMax - adjustedMin));
}

// Generate wind conditions based on region and wind intensity setting
function generateWindCondition(
  region: Region,
  windIntensity: number,
  previousWind: WindCondition | null
): WindCondition {
  const windTypes: WindCondition[] = ["Calm", "Light", "Moderate", "Strong", "Violent"];
  const baseProbabilities = { ...regionWindProbabilities[region] };
  
  // Adjust probabilities based on wind intensity setting (1-5 scale, 3 is neutral)
  const adjustment = (windIntensity - 3) * 0.15;
  
  // Shift probabilities toward stronger winds or calmer winds based on intensity
  const adjustedProbabilities: Record<WindCondition, number> = {
    "Calm": Math.max(0, baseProbabilities["Calm"] - adjustment),
    "Light": Math.max(0, baseProbabilities["Light"] - adjustment / 2),
    "Moderate": baseProbabilities["Moderate"],
    "Strong": Math.max(0, baseProbabilities["Strong"] + adjustment / 2),
    "Violent": Math.max(0, baseProbabilities["Violent"] + adjustment),
  };
  
  // Normalize probabilities to ensure they sum to 1
  const total = Object.values(adjustedProbabilities).reduce((sum, prob) => sum + prob, 0);
  Object.keys(adjustedProbabilities).forEach((key) => {
    adjustedProbabilities[key as WindCondition] /= total;
  });
  
  // If we have a previous wind condition, increase probability of similar conditions
  if (previousWind !== null) {
    const prevIndex = windTypes.indexOf(previousWind);
    const randomValue = Math.random();
    
    // 60% chance to stay within 1 level of previous wind
    if (randomValue < 0.6) {
      const minIndex = Math.max(0, prevIndex - 1);
      const maxIndex = Math.min(windTypes.length - 1, prevIndex + 1);
      return windTypes[minIndex + Math.floor(Math.random() * (maxIndex - minIndex + 1))];
    }
  }
  
  // Random selection based on adjusted probabilities
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const windType of windTypes) {
    cumulativeProbability += adjustedProbabilities[windType];
    if (random <= cumulativeProbability) {
      return windType;
    }
  }
  
  return "Moderate"; // Fallback
}

// Generate special weather event based on region, season, and probability setting
function generateSpecialEvent(
  region: Region,
  season: Season,
  specialEventProbability: number,
  previousEvent: WeatherEvent | null
): WeatherEvent | null {
  const possibleEvents = specialWeatherEvents[region][season];
  const probabilityModifier = eventProbabilityModifiers[specialEventProbability];
  
  // Base chance for special event (30% * modifier)
  const eventChance = 0.3 * probabilityModifier;
  
  // If previous day had an event, reduce chance for consecutive days
  const adjustedChance = previousEvent ? eventChance * 0.5 : eventChance;
  
  // Random determination of whether an event occurs
  if (Math.random() <= adjustedChance) {
    // If there was a previous event, don't repeat it
    if (previousEvent) {
      const filteredEvents = possibleEvents.filter(event => event !== previousEvent);
      return filteredEvents[Math.floor(Math.random() * filteredEvents.length)];
    }
    return possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
  }
  
  return null;
}

// Main function to generate weather data for specified number of days
export function generateWeatherSequence(
  region: Region,
  season: Season,
  temperatureTendency: number,
  windIntensity: number,
  specialEventProbability: number,
  days: number
): WeatherData[] {
  const weatherSequence: WeatherData[] = [];
  let previousTemp: number | null = null;
  let previousWind: WindCondition | null = null;
  let previousEvent: WeatherEvent | null = null;
  
  for (let day = 1; day <= days; day++) {
    // Generate temperature
    const temperature = generateTemperature(season, region, temperatureTendency, previousTemp);
    previousTemp = temperature;
    
    // Generate wind condition
    const windCondition = generateWindCondition(region, windIntensity, previousWind);
    previousWind = windCondition;
    
    // Generate wind direction
    const windDirection = getWindDirection();
    
    // Generate special weather event
    const specialEvent = generateSpecialEvent(region, season, specialEventProbability, previousEvent);
    previousEvent = specialEvent;
    
    // Get temperature condition description
    const temperatureCondition = getTemperatureCondition(temperature);
    
    // Get visibility
    const visibility = getVisibility(windCondition, specialEvent);
    
    // Get DM notes
    const dmNotes = getDMNotes(temperature, windCondition, specialEvent);
    
    // Get weather tags
    const tags = getWeatherTags(temperature, windCondition, specialEvent);
    
    // Create weather data object
    const weatherData: WeatherData = {
      day,
      temperature,
      temperatureCondition,
      windCondition,
      windDirection,
      visibility,
      specialEvent,
      dmNotes,
      tags,
      season,
    };
    
    weatherSequence.push(weatherData);
  }
  
  return weatherSequence;
}
