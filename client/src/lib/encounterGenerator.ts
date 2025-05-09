import { WeatherData, Region, WeatherEvent, WindCondition } from "../types/weather";

// Encounter difficulty levels
export type EncounterDifficulty = "Easy" | "Medium" | "Hard" | "Deadly";

// Encounter structure
export interface Encounter {
  day: number;
  title: string;
  description: string;
  difficulty: EncounterDifficulty;
  weatherEvent: WeatherEvent | null;
  challengeRating: number;
}

// Challenge rating by difficulty
const challengeRatingsByDifficulty: Record<EncounterDifficulty, number[]> = {
  "Easy": [1, 2],
  "Medium": [3, 4],
  "Hard": [5, 6],
  "Deadly": [7, 10]
};

// Base encounter tables by region
const baseEncountersByRegion: Record<Region, Record<EncounterDifficulty, string[]>> = {
  "Tablelands": {
    "Easy": [
      "A small pack of half-starved kanks foraging for water.",
      "Merchant caravan looking to trade water and supplies.",
      "Elven raiders scouting from a distance.",
      "A lone survivor from a failed expedition.",
      "Tribe of halflings searching for food."
    ],
    "Medium": [
      "Thri-kreen hunting party tracking prey.",
      "Templar patrol searching for defilers.",
      "Gith raid party targeting travelers.",
      "Pack of crodlu riders offering mercenary services.",
      "Band of escaped slave runners."
    ],
    "Hard": [
      "Belgoi slavers setting an ambush.",
      "Defiler performing a dangerous ritual.",
      "Obsidian golem guarding an ancient ruin.",
      "Silt runner nest disturbed by travelers.",
      "Braxat hunting for intelligent prey."
    ],
    "Deadly": [
      "Tembo pride claiming territory.",
      "Dragon's minions collecting tribute.",
      "Awakened obsidian obelisk with psionic powers.",
      "Ancient earth elemental mistaking party for defilers.",
      "Sorcerer-King's elite guard on a special mission."
    ]
  },
  "Sea of Silt": {
    "Easy": [
      "Silt skimmers offering passage across the shallows.",
      "Hermit living on a small solid island in the silt.",
      "Giant insects skittering across the silt surface.",
      "Traders with rare goods from across the sea.",
      "Stranded travelers with a broken skimmer."
    ],
    "Medium": [
      "Silt pirates lying in wait for vulnerable travelers.",
      "Silt horror partially buried and hunting.",
      "Belgoi raiding party crossing the silt.",
      "Sand bride using illusions to lure victims into the silt.",
      "Cloud ray circling overhead."
    ],
    "Hard": [
      "Silt drake charging through the shallows.",
      "Giant silt elementals forming from the dust.",
      "Gith tribe with tamed silt horrors.",
      "Psionic storm manifesting creatures from travelers' minds.",
      "Ancient obsidian guardian half-buried in silt."
    ],
    "Deadly": [
      "Silt dragon awakened from dormancy.",
      "Sorcerer-King's elite force with silt skimmers.",
      "Lost army of undead marching through the silt depths.",
      "Psionically awakened silt colossus.",
      "Abyssal horror breaching into Athas through thin reality in the silt."
    ]
  },
  "Ringing Mountains": {
    "Easy": [
      "Mountain dwarf scouts watching from a distance.",
      "Herd of ibex foraging on sparse vegetation.",
      "Travelers seeking passage through a mountain pass.",
      "Pterran gatherers collecting rare herbs.",
      "Escaped slaves hiding in a small cave."
    ],
    "Medium": [
      "Gith raiding party moving through a narrow pass.",
      "Mountain giant throwing rocks from above.",
      "Clan of goliath hunters tracking large prey.",
      "Air elementals causing dangerous updrafts.",
      "Tribe of psionic aarakocra defending territory."
    ],
    "Hard": [
      "Stone defenders animated by ancient magic.",
      "Braxat using a cave as an ambush point.",
      "Tyr military expedition with a secret mission.",
      "Pride of Athasian lions guarding their territory.",
      "Temporal anomaly where time flows differently."
    ],
    "Deadly": [
      "Ancient crystal drake defending its lair.",
      "Obsidian construct gone rogue.",
      "Psionic storm that alters reality.",
      "Defiler conclave performing a mountain-shaking ritual.",
      "Dormant earth elemental lord awakening."
    ]
  },
  "Forest Ridge": {
    "Easy": [
      "Halfling scouts observing from the trees.",
      "Jozhal herd moving through the underbrush.",
      "Lost merchant separated from caravan.",
      "Escaped slaves seeking refuge in the forest.",
      "Small tribe of pterran foraging for food."
    ],
    "Medium": [
      "Halfling hunting party looking for sacrifices.",
      "Kluzd pack stalking through the trees.",
      "Belgoi raiding party setting an ambush.",
      "Sentient carnivorous plants.",
      "Tribe of wild elves defending their territory."
    ],
    "Hard": [
      "Halfling cannibals preparing a ritual feast.",
      "Ancient forest guardian awakened by defiling magic.",
      "Brohg brute that's claimed territory.",
      "Psionic creatures warping the forest reality.",
      "Poison dusk lizardfolk with paralytic weapons."
    ],
    "Deadly": [
      "Legendary plant defiler corrupting the forest.",
      "Kaisharga pursuing psionic prey.",
      "Awakened forest collective with hive mind.",
      "Ancient black drake nesting in the canopy.",
      "Primordial nature spirit enraged by defilers."
    ]
  },
  "Jagged Cliffs": {
    "Easy": [
      "Aarakocra messengers resting on a ledge.",
      "Travelers seeking safe passage down the cliffs.",
      "Pterran group performing a spiritual ceremony.",
      "Wind traders with exotic goods from beyond.",
      "Survivors of a crashed airship."
    ],
    "Medium": [
      "Tribe of cliff-dwelling thri-kreen hunters.",
      "Band of air nomads with tamed cloud rays.",
      "Gith raiders using the updrafts to ambush.",
      "Psionic pilgrims seeking enlightenment at high altitude.",
      "Elemental cultists summoning air servants."
    ],
    "Hard": [
      "Cloud ray riders from a secret sky city.",
      "Aarakocra elite warriors with air elemental allies.",
      "Ancient flying construct patrolling for intruders.",
      "Telekinetic psionicist hurling boulders from afar.",
      "Gravity-manipulating defiler causing dangerous terrain."
    ],
    "Deadly": [
      "Ancient blue dragon claiming the cliffs as territory.",
      "Living psionic storm that feeds on mental energy.",
      "Dormant air primordial partially awakened.",
      "Reality tear leading to the Gray.",
      "Winged horror from beyond the Jagged Cliffs."
    ]
  },
  "Tyr Valley": {
    "Easy": [
      "Merchant caravan selling grain and ceramic.",
      "City patrol checking for illegal water trading.",
      "Farmers protecting their rare crops.",
      "Freed slaves looking for work.",
      "Water prospectors with divining equipment."
    ],
    "Medium": [
      "Noble's guards escorting valuable cargo.",
      "Templar tax collectors with slave warriors.",
      "Veiled Alliance members on a covert mission.",
      "Bandit group targeting merchant caravans.",
      "Defiler being hunted by preservers."
    ],
    "Hard": [
      "Rogue templar with loyal stone golems.",
      "Psionic noble with elite mind-controlled guards.",
      "Giant scorpion swarm erupting from the sand.",
      "Mul gladiator champions seeking freedom or glory.",
      "Former Tyrian noble seeking revenge."
    ],
    "Deadly": [
      "Grey-cloaked psionicist with reality-warping powers.",
      "Awakened ziggurat guardian with elemental powers.",
      "King's Champion with elite templar squad.",
      "Advanced defiler causing environmental catastrophe.",
      "Forgotten pre-cataclysm construct reactivated."
    ]
  }
};

// Weather-specific encounters
const weatherSpecificEncounters: Record<WeatherEvent, string[]> = {
  "Dust Storm": [
    "Travelers lost in the storm seeking shelter together.",
    "Ancient ruin partially uncovered by the storm.",
    "Creatures using the storm as cover for an ambush.",
    "Stranded caravan with dwindling supplies.",
    "Defiler using the storm to hide a dangerous ritual."
  ],
  "Heat Wave": [
    "Desperate thri-kreen hunters seeking water sources.",
    "Dehydrated travelers willing to trade valuable items for water.",
    "Creatures gathered around a rare water source.",
    "Elemental cultists performing a fire ritual.",
    "Hallucinating defiler causing random magical effects."
  ],
  "Silt Cloud": [
    "Creatures from the Sea of Silt carried by the cloud.",
    "Silt zombies animated by defiling magic.",
    "Opportunistic raiders using the cloud as cover.",
    "Silt aberrations hunting in the low visibility.",
    "Psionic entity formed within the silt consciousness."
  ],
  "Ash Fall": [
    "Fire elementals drawn to the ash-covered landscape.",
    "Survivors of a distant volcanic event.",
    "Creatures mutated by magical ash exposure.",
    "Defiler performing ritual using the ash as a power source.",
    "Ancient construct revealed by the falling ash."
  ],
  "Cold Snap": [
    "Travelers huddled together sharing a rare fire.",
    "Ice-adapted predators venturing into lower altitudes.",
    "Tribal groups fighting over shelter and firewood.",
    "Frozen temporal anomaly with preserved ancient creatures.",
    "Water elemental partially transformed by the cold."
  ],
  "Fog Bank": [
    "Silent ambush predators using the fog for hunting.",
    "Lost caravan moving in circles.",
    "Ghostly apparitions manifesting in the fog.",
    "Mind-affecting spores carried in the fog.",
    "Psionic entity using the fog as a physical form."
  ],
  "Light Rain": [
    "Celebration ritual by water worshippers.",
    "Rare plants blooming instantly with the moisture.",
    "Creatures from underground drawn to the surface.",
    "Water collectors fighting over catching rights.",
    "Defiler using the rare water to enhance a ritual."
  ],
  "Dust Devil": [
    "Psionic entity manifesting through the dust devil.",
    "Air elementals playing or fighting within the vortex.",
    "Hidden ambush as the dust devil passes.",
    "Ancient artifact revealed by the swirling dust.",
    "Dust-formed constructs animated by old magic."
  ],
  "Lightning Storm": [
    "Electricity-absorbing creatures drawn to the storm.",
    "Defiler channeling lightning for a powerful ritual.",
    "Creatures seeking shelter in the same cave as the party.",
    "Temple to forgotten storm deity with active powers.",
    "Psionic storm rider surfing the electrical currents."
  ],
  "Heavy Winds": [
    "Airborne creatures forced to land.",
    "Wind-propelled seed pods with hallucinogenic effects.",
    "Flying debris revealing ancient buried structures.",
    "Wind elementals engaged in territorial dispute.",
    "Psionic message carried on the wind from distant ally or enemy."
  ],
  "Rain": [
    "Major celebration by multiple tribal groups.",
    "Rare amphibious creatures emerging to breed.",
    "Flash flood carrying lost treasures and dangers.",
    "Water-dependent predator in a feeding frenzy.",
    "Sorcerer-King's agents collecting the water for their master."
  ],
  "Silt Storm": [
    "Silt horror hunting in familiar territory.",
    "Ancient structure revealed by shifting silt.",
    "Silt-breathing creatures forced onto dry land.",
    "Psionic nightmare manifesting from the silt.",
    "Lost caravan slowly sinking into quicksilt."
  ],
  "Silt Drift": [
    "Partially exposed ancient ruin with active defenses.",
    "Primitive tribe that lives by harvesting the silt.",
    "Valuable minerals revealed in the drift layers.",
    "Hibernating creatures awakened by the shifting silt.",
    "Psychometry-rich location revealing visions of the past."
  ],
  "Silt Tsunami": [
    "Survivors clinging to floating debris.",
    "Sea creatures washed far inland.",
    "Ancient structure temporarily revealed by receding silt.",
    "Psionic echo of drowned civilization.",
    "Valuable artifacts scattered across the landscape."
  ],
  "Rock Slide": [
    "Travelers trapped by fallen rocks.",
    "Ancient tunnel system exposed by shifted rocks.",
    "Earth elementals disturbed by the geological change.",
    "Hibernating creature awakened by the slide.",
    "Precious mineral vein exposed by the slide."
  ],
  "Mountain Storm": [
    "Travelers seeking shelter in a dangerous cave.",
    "Multiple competing groups trapped in the same shelter.",
    "Lightning-charged crystals with magical properties.",
    "Awakened stone constructs defending their territory.",
    "Psionic storm feeding off the natural energy."
  ],
  "Heavy Snow": [
    "Travelers caught unprepared for the rare snow.",
    "Ice parasites infecting warm-blooded creatures.",
    "Perfectly preserved ancient corpse with valuable items.",
    "Snow-adapted predators rarely seen in Athas.",
    "Water cultists performing rare ritual during the snow."
  ],
  "Ice Storm": [
    "Water elementals partially transformed by the ice.",
    "Ancient frozen creatures temporarily revived.",
    "Temporal anomaly where ice age Athas overlaps present.",
    "Ice-crystal formations with psionic properties.",
    "Defiler using the rare ice for powerful magic."
  ],
  "Avalanche": [
    "Survivors trapped in a pocket within the snow.",
    "Ancient structure revealed by the shifting snow and rock.",
    "Territorial predator whose den was destroyed.",
    "Magical ice crystals with temporary preservation powers.",
    "Psionic echo of a civilization destroyed by natural disaster."
  ],
  "Early Snow": [
    "Unprepared travelers suffering from exposure.",
    "Rare cold-adapted plants with valuable properties.",
    "Predators taking advantage of prey's confusion.",
    "Snow cultists believing the snow is a divine sign.",
    "Temporal anomaly causing season displacement."
  ],
  "Humid Heat": [
    "Fungal bloom with mind-affecting spores.",
    "Amphibious creatures venturing further from water.",
    "Accelerated plant growth with carnivorous tendencies.",
    "Insects swarming in unprecedented numbers.",
    "Heat-induced mirage with psionic properties."
  ],
  "Forest Fire": [
    "Fleeing creatures causing chaos as they escape.",
    "Fire elementals drawn to the blaze.",
    "Defiler using the fire's energy for ritual.",
    "Refugees from burned settlements.",
    "Ancient fireproof structure revealed as surroundings burn."
  ],
  "Insect Swarm": [
    "Thri-kreen communicating with and directing the swarm.",
    "Abandoned valuable cargo from fleeing travelers.",
    "Rare insect with valuable alchemical properties.",
    "Insect-controlling defiler using swarm as spies.",
    "Psionic collective consciousness forming within the swarm."
  ],
  "Falling Leaves": [
    "Camouflaged predators hiding in leaf piles.",
    "Hallucinogenic spores released by certain leaves.",
    "Leaf-gathering tribe with unique plant-based magic.",
    "Temporal anomaly showing glimpses of green Athas.",
    "Earth elemental formation gathering nutrients."
  ],
  "Violent Updraft": [
    "Airborne creatures caught and injured in the updraft.",
    "Valuable lightweight materials carried aloft.",
    "Air elementals using the updraft for travel.",
    "Flying platform or structure briefly visible high above.",
    "Psionic entity riding the air currents."
  ],
  "Updraft": [
    "Flying hunters using the updraft for efficient hunting.",
    "Gliding creatures from distant regions.",
    "Air cultists performing a ritual in the rising air.",
    "Seed pods from rare plants spreading on the updraft.",
    "Message-laden air elementals using current for travel."
  ],
  "Drought": [
    "Desperate water cult attacking any with water.",
    "Dangerous predators gathered at dwindling water source.",
    "Deep well with ancient guardian protecting the water.",
    "Underground water source with dangerous cave system.",
    "Defiler ritual attempting to draw water through magic."
  ],
  "Clear": [
    "Astronomical event only visible under clear conditions.",
    "Distant dragons scouting from high above.",
    "Solar-powered ancient technology temporarily activating.",
    "Mirage with psionic properties showing other locations.",
    "Light-sensitive creatures retreating to shelter."
  ]
};

// Wind-specific encounters
const windSpecificEncounters: Record<WindCondition, string[]> = {
  "Calm": [
    "Sound-hunting predators normally deterred by wind noise.",
    "Delicate spore clouds with magical effects.",
    "Psionic entities more easily manifesting in still air.",
    "Mirage-like illusions forming in the heat.",
    "Sensitive listening devices gathering information."
  ],
  "Light": [
    "Gliding predators using minimal winds efficiently.",
    "Message-carrying air spirits following wind currents.",
    "Airborne seeds with mild hallucinogenic properties.",
    "Wind-readers predicting imminent weather changes.",
    "Pollen carrying mild mind-affecting properties."
  ],
  "Moderate": [
    "Wind-propelled seed pods with valuable properties.",
    "Small air elementals riding the currents.",
    "Wind traders with special sail-driven carts.",
    "Sound-carrying winds bringing distant warnings.",
    "Particulate veils hiding stalking predators."
  ],
  "Strong": [
    "Debris-hurling opportunistic ambushers.",
    "Air cultists channeling the wind's power.",
    "Wind-carried messages from distant settlements.",
    "Flying predators struggling against unexpected gusts.",
    "Sand-filled winds revealing buried structures."
  ],
  "Violent": [
    "Flying creatures forced to land and seek shelter.",
    "Temporary structures collapsed with occupants trapped.",
    "Large objects becoming dangerous projectiles.",
    "Powerful air elementals manifesting in the chaos.",
    "Psionic storm feeding off the wind's energy."
  ]
};

// Generate difficulty based on weather conditions
function determineDifficulty(weatherData: WeatherData): EncounterDifficulty {
  // Special events generally increase difficulty
  if (weatherData.specialEvent) {
    if (weatherData.specialEvent === "Silt Tsunami" || 
        weatherData.specialEvent === "Forest Fire" || 
        weatherData.specialEvent === "Avalanche") {
      return "Deadly";
    }
    
    if (weatherData.specialEvent === "Dust Storm" || 
        weatherData.specialEvent === "Lightning Storm" || 
        weatherData.specialEvent === "Silt Storm") {
      return "Hard";
    }
    
    return "Medium";
  }
  
  // Extreme temperatures increase difficulty
  if (weatherData.temperature >= 45 || weatherData.temperature <= 15) {
    return "Hard";
  }
  
  // Violent winds increase difficulty
  if (weatherData.windCondition === "Violent") {
    return "Hard";
  }
  
  if (weatherData.windCondition === "Strong") {
    return "Medium";
  }
  
  // Default to easier encounters for normal weather
  return Math.random() < 0.7 ? "Easy" : "Medium";
}

// Generate challenge rating based on difficulty
function generateChallengeRating(difficulty: EncounterDifficulty): number {
  const crRange = challengeRatingsByDifficulty[difficulty];
  return crRange[0] + Math.floor(Math.random() * (crRange[1] - crRange[0] + 1));
}

// Generate a title for the encounter
function generateEncounterTitle(baseEncounter: string, weatherEvent: WeatherEvent | null): string {
  // Extract a short title from the base encounter description
  const parts = baseEncounter.split(" ");
  let title = "";
  
  if (parts.length <= 3) {
    title = baseEncounter;
  } else {
    // Try to extract meaningful part
    if (baseEncounter.includes("hunters") || baseEncounter.includes("hunting")) {
      title = "Hunting Party";
    } else if (baseEncounter.includes("ambush")) {
      title = "Deadly Ambush";
    } else if (baseEncounter.includes("ritual")) {
      title = "Dark Ritual";
    } else if (baseEncounter.includes("traders") || baseEncounter.includes("merchant")) {
      title = "Merchant Encounter";
    } else if (baseEncounter.includes("patrol") || baseEncounter.includes("guards")) {
      title = "Armed Patrol";
    } else if (baseEncounter.includes("elemental")) {
      title = "Elemental Force";
    } else if (baseEncounter.includes("psionic")) {
      title = "Psionic Manifestation";
    } else {
      // Take first few words
      title = parts.slice(0, 2).join(" ");
    }
  }
  
  // Add weather context if relevant
  if (weatherEvent) {
    return `${title} (${weatherEvent})`;
  }
  
  return title;
}

// Main function to generate encounters based on weather data
export function generateEncounters(weatherData: WeatherData[], region: Region): Encounter[] {
  const encounters: Encounter[] = [];
  
  // Go through each day's weather and generate appropriate encounters
  weatherData.forEach((dayWeather) => {
    // Only generate encounters for days with special events or extreme conditions
    if (dayWeather.specialEvent || 
        dayWeather.temperature >= 45 || 
        dayWeather.temperature <= 15 ||
        dayWeather.windCondition === "Violent" ||
        dayWeather.windCondition === "Strong" ||
        Math.random() < 0.3) { // 30% chance for random encounters on normal days
      
      // Determine encounter difficulty
      const difficulty = determineDifficulty(dayWeather);
      
      // Get base encounter options for this region and difficulty
      const baseEncounterOptions = baseEncountersByRegion[region][difficulty];
      let baseEncounter = baseEncounterOptions[Math.floor(Math.random() * baseEncounterOptions.length)];
      
      // If there's a special weather event, 70% chance to use a weather-specific encounter
      if (dayWeather.specialEvent && Math.random() < 0.7) {
        const weatherEncounterOptions = weatherSpecificEncounters[dayWeather.specialEvent];
        baseEncounter = weatherEncounterOptions[Math.floor(Math.random() * weatherEncounterOptions.length)];
      }
      // Otherwise, 30% chance to use a wind-specific encounter
      else if (Math.random() < 0.3) {
        const windEncounterOptions = windSpecificEncounters[dayWeather.windCondition];
        baseEncounter = windEncounterOptions[Math.floor(Math.random() * windEncounterOptions.length)];
      }
      
      // Generate challenge rating
      const challengeRating = generateChallengeRating(difficulty);
      
      // Generate title
      const title = generateEncounterTitle(baseEncounter, dayWeather.specialEvent);
      
      // Create encounter
      const encounter: Encounter = {
        day: dayWeather.day,
        title,
        description: baseEncounter,
        difficulty,
        weatherEvent: dayWeather.specialEvent,
        challengeRating
      };
      
      encounters.push(encounter);
    }
  });
  
  return encounters;
}
