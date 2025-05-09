import { useState, useEffect } from "react";
import { useWeather } from "@/hooks/useWeather";
import { generateEncounters, Encounter } from "@/lib/encounterGenerator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatTemperature } from "@/lib/temperature";

export default function Encounters() {
  const { weatherData, weatherParams } = useWeather();
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [generatedEncounters, setGeneratedEncounters] = useState(false);
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  
  // Generate encounters on page load if weather data exists
  useEffect(() => {
    if (weatherData.length > 0 && !generatedEncounters) {
      handleGenerateEncounters();
    }
  }, [weatherData]);
  
  // Function to generate encounters
  const handleGenerateEncounters = () => {
    if (weatherData.length === 0) return;
    
    const newEncounters = generateEncounters(weatherData, weatherParams.region);
    setEncounters(newEncounters);
    setGeneratedEncounters(true);
    
    if (newEncounters.length > 0) {
      setSelectedEncounter(newEncounters[0]);
    }
  };
  
  // Filter encounters by difficulty
  const filteredEncounters = difficultyFilter === "all" 
    ? encounters 
    : encounters.filter(e => e.difficulty === difficultyFilter);
  
  // Get color for difficulty
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500 text-white";
      case "Medium": return "bg-yellow-500 text-white";
      case "Hard": return "bg-orange-500 text-white";
      case "Deadly": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };
  
  // Get weather day info
  const getWeatherDay = (day: number) => {
    return weatherData.find(w => w.day === day);
  };
  
  if (weatherData.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-6 shadow-lg">
        <h2 className="font-heading text-2xl mb-4 text-primary">Weather Encounters</h2>
        <div className="text-center py-10">
          <div className="mb-4 text-gray-400">
            No weather data available. Generate weather in the Weather Generator tab first.
          </div>
          <span className="material-icons text-4xl text-gray-600">cloud_off</span>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <CardTitle className="text-primary font-heading text-2xl">Weather Encounters</CardTitle>
              <CardDescription>
                Random encounters based on the current weather conditions
              </CardDescription>
            </div>
            <Button onClick={handleGenerateEncounters}>
              <span className="material-icons mr-2">refresh</span>
              Regenerate All Encounters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list">
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Filter By:</h3>
                    <div className="flex gap-2">
                      <Badge 
                        className={`cursor-pointer ${difficultyFilter === 'all' ? 'bg-primary' : 'bg-gray-700'}`}
                        onClick={() => setDifficultyFilter('all')}
                      >
                        All
                      </Badge>
                      <Badge 
                        className={`cursor-pointer ${difficultyFilter === 'Easy' ? 'bg-green-500' : 'bg-gray-700'}`}
                        onClick={() => setDifficultyFilter('Easy')}
                      >
                        Easy
                      </Badge>
                      <Badge 
                        className={`cursor-pointer ${difficultyFilter === 'Medium' ? 'bg-yellow-500' : 'bg-gray-700'}`}
                        onClick={() => setDifficultyFilter('Medium')}
                      >
                        Medium
                      </Badge>
                      <Badge 
                        className={`cursor-pointer ${difficultyFilter === 'Hard' ? 'bg-orange-500' : 'bg-gray-700'}`}
                        onClick={() => setDifficultyFilter('Hard')}
                      >
                        Hard
                      </Badge>
                      <Badge 
                        className={`cursor-pointer ${difficultyFilter === 'Deadly' ? 'bg-red-500' : 'bg-gray-700'}`}
                        onClick={() => setDifficultyFilter('Deadly')}
                      >
                        Deadly
                      </Badge>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {filteredEncounters.length > 0 ? (
                        filteredEncounters.map((encounter, index) => (
                          <div 
                            key={index}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedEncounter === encounter 
                                ? 'bg-primary bg-opacity-10 border-primary' 
                                : 'bg-background border-gray-700 hover:border-gray-600'
                            }`}
                            onClick={() => setSelectedEncounter(encounter)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-medium">Day {encounter.day}: {encounter.title}</div>
                              <Badge className={getDifficultyColor(encounter.difficulty)}>
                                CR {encounter.challengeRating}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-400 mt-1 truncate">
                              {encounter.description}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-10 text-gray-400">
                          No encounters found with the selected filter.
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
                
                <div className="md:w-2/3">
                  {selectedEncounter ? (
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{selectedEncounter.title}</CardTitle>
                            <CardDescription>
                              Day {selectedEncounter.day} - {selectedEncounter.difficulty} Encounter (CR {selectedEncounter.challengeRating})
                            </CardDescription>
                          </div>
                          <Badge className={getDifficultyColor(selectedEncounter.difficulty)}>
                            {selectedEncounter.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Description</h3>
                            <p className="text-gray-300">{selectedEncounter.description}</p>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="font-medium mb-2">Weather Conditions</h3>
                            {getWeatherDay(selectedEncounter.day) && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-background p-3 rounded-lg">
                                  <div className="text-sm text-gray-400">Temperature</div>
                                  <div>{formatTemperature(getWeatherDay(selectedEncounter.day)?.temperature || 0)} ({getWeatherDay(selectedEncounter.day)?.temperatureCondition})</div>
                                </div>
                                <div className="bg-background p-3 rounded-lg">
                                  <div className="text-sm text-gray-400">Wind</div>
                                  <div>{getWeatherDay(selectedEncounter.day)?.windCondition} {getWeatherDay(selectedEncounter.day)?.windDirection}</div>
                                </div>
                                <div className="bg-background p-3 rounded-lg">
                                  <div className="text-sm text-gray-400">Special Event</div>
                                  <div>{getWeatherDay(selectedEncounter.day)?.specialEvent || "None"}</div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="font-medium mb-2">DM Notes</h3>
                            <div className="bg-background p-3 rounded-lg">
                              <p className="text-sm text-gray-300">
                                {getWeatherDay(selectedEncounter.day)?.dmNotes || "No specific DM notes available."}
                              </p>
                              
                              <div className="mt-3 flex flex-wrap gap-2">
                                {getWeatherDay(selectedEncounter.day)?.tags.map((tag, index) => {
                                  let tagClass = "bg-primary bg-opacity-20 text-primary";
                                  
                                  if (tag.includes("Risk") || tag.includes("Danger") || tag === "Dust Storm" || tag === "Sand Storm") {
                                    tagClass = "bg-danger bg-opacity-20 text-danger";
                                  } else if (tag.includes("Penalty") || tag === "Heat Wave" || tag === "Cold Snap") {
                                    tagClass = "bg-warning bg-opacity-20 text-warning";
                                  }
                                  
                                  return (
                                    <span key={index} className={`text-xs ${tagClass} px-2 py-1 rounded`}>{tag}</span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="h-full flex items-center justify-center bg-background rounded-lg p-10">
                      <div className="text-center">
                        <span className="material-icons text-4xl text-gray-600 mb-2">search_off</span>
                        <p className="text-gray-400">Select an encounter to view details</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="calendar">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weatherData.map((day, index) => {
                  const dayEncounter = encounters.find(e => e.day === day.day);
                  
                  return (
                    <div 
                      key={index} 
                      className={`p-4 rounded-lg ${dayEncounter ? 'bg-background' : 'bg-gray-800 bg-opacity-30'}`}
                    >
                      <div className="font-medium">Day {day.day}</div>
                      <div className="text-sm text-gray-400">{day.temperature}°C, {day.windCondition}</div>
                      <div className="mt-2 text-xs">
                        {day.specialEvent && (
                          <Badge variant="outline" className="mb-2 bg-opacity-20 border-danger text-danger">
                            {day.specialEvent}
                          </Badge>
                        )}
                      </div>
                      
                      {dayEncounter ? (
                        <div className="mt-2">
                          <Separator className="my-2" />
                          <div className="flex justify-between mb-1">
                            <div className="text-sm font-medium">{dayEncounter.title}</div>
                            <Badge className={getDifficultyColor(dayEncounter.difficulty)}>
                              CR {dayEncounter.challengeRating}
                            </Badge>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full mt-2"
                            onClick={() => setSelectedEncounter(dayEncounter)}
                          >
                            View Details
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-4 text-xs text-gray-500 text-center">No encounter</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
