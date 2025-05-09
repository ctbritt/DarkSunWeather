import { useState } from "react";
import { Encounter } from "@/lib/encounterGenerator";

interface WeatherEncountersProps {
  encounters: Encounter[];
  onRegenerate: () => void;
}

export default function WeatherEncounters({ encounters, onRegenerate }: WeatherEncountersProps) {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Suggested Encounters</h3>
        <button 
          className="text-xs text-primary hover:text-orange-400 flex items-center"
          onClick={onRegenerate}
        >
          <span className="material-icons text-sm mr-1">refresh</span>
          Regenerate
        </button>
      </div>
      
      {encounters.length === 0 ? (
        <div className="bg-background rounded-lg p-4 text-gray-400 text-sm">
          No encounters generated. Try adding more days or increasing the special event probability.
        </div>
      ) : (
        <div className="bg-background rounded-lg divide-y divide-gray-700">
          {encounters.map((encounter, index) => (
            <div key={index} className="p-3">
              <div className="flex justify-between">
                <div>
                  <span className={`${encounter.weatherEvent ? 'text-danger' : 'text-warning'} text-sm mr-2`}>
                    Day {encounter.day}
                  </span>
                  <span className="text-sm">{encounter.title}</span>
                </div>
                <span className={`text-xs ${
                  encounter.difficulty === "Easy" ? "bg-primary" : 
                  encounter.difficulty === "Medium" ? "bg-warning" : 
                  encounter.difficulty === "Hard" ? "bg-danger" : 
                  "bg-danger"
                } bg-opacity-20 ${
                  encounter.difficulty === "Easy" ? "text-primary" : 
                  encounter.difficulty === "Medium" ? "text-warning" : 
                  encounter.difficulty === "Hard" ? "text-danger" : 
                  "text-danger"
                } px-2 py-0.5 rounded`}>
                  CR {encounter.challengeRating}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">{encounter.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
