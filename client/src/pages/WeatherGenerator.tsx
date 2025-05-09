import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateWeatherSequence } from "@/lib/weatherGenerator";
import { generateEncounters, Encounter } from "@/lib/encounterGenerator";
import { saveWeatherPattern } from "@/lib/weatherStorage";
import WeatherCard from "@/components/WeatherCard";
import TemperatureTrendChart from "@/components/TemperatureTrendChart";
import WeatherEncounters from "@/components/WeatherEncounters";
import { useWeather } from "@/hooks/useWeather";
import { WeatherData, Region, Season } from "@/types/weather";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function WeatherGenerator() {
  const { toast } = useToast();
  const { weatherParams, setWeatherParams, weatherData, setWeatherData, currentWeather, setCurrentWeather, updateParams } = useWeather();
  
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [patternName, setPatternName] = useState("");
  
  // Temperature tendency labels
  const temperatureLabels = [
    "Very Cold (-2)", 
    "Cool (-1)", 
    "Normal (+0)", 
    "Warm (+1)", 
    "Very Hot (+2)"
  ];
  
  // Wind intensity labels
  const windIntensityLabels = [
    "Calm (-2)", 
    "Light (-1)", 
    "Normal (+0)", 
    "Strong (+1)", 
    "Violent (+2)"
  ];
  
  // Special event probability labels
  const specialEventLabels = [
    "Very Rare", 
    "Uncommon", 
    "Standard", 
    "Frequent", 
    "Very Frequent"
  ];
  
  // Generate weather based on current parameters
  const handleGenerateWeather = () => {
    const newWeatherData = generateWeatherSequence(
      weatherParams.region,
      weatherParams.season,
      weatherParams.temperatureTendency,
      weatherParams.windIntensity,
      weatherParams.specialEventProbability,
      weatherParams.days
    );
    
    setWeatherData(newWeatherData);
    if (newWeatherData.length > 0) {
      setCurrentWeather(newWeatherData[0]);
    }
    
    // Generate encounters
    const newEncounters = generateEncounters(newWeatherData, weatherParams.region);
    setEncounters(newEncounters);
    
    toast({
      title: "Weather Generated",
      description: `Generated ${weatherParams.days} days of weather for ${weatherParams.region}.`,
    });
  };
  
  // Reset parameters to default values
  const handleResetParameters = () => {
    setWeatherParams({
      region: "Tablelands",
      season: "High Sun",
      temperatureTendency: 3,
      windIntensity: 3,
      specialEventProbability: 3,
      days: 7
    });
    
    toast({
      title: "Parameters Reset",
      description: "All weather parameters have been reset to default values.",
    });
  };
  
  // Handle saving the current weather pattern
  const handleSavePattern = async () => {
    if (!patternName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for the weather pattern.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const id = await saveWeatherPattern({
        name: patternName,
        region: weatherParams.region,
        season: weatherParams.season,
        temperatureTendency: weatherParams.temperatureTendency,
        windIntensity: weatherParams.windIntensity,
        specialEventProbability: weatherParams.specialEventProbability,
        days: weatherParams.days,
        weatherData,
        createdAt: new Date().toISOString()
      });
      
      setSaveDialogOpen(false);
      setPatternName("");
      
      toast({
        title: "Pattern Saved",
        description: `Weather pattern "${patternName}" has been saved.`,
      });
    } catch (error) {
      toast({
        title: "Error Saving Pattern",
        description: "There was an error saving the weather pattern.",
        variant: "destructive"
      });
    }
  };
  
  // Regenerate encounters
  const handleRegenerateEncounters = () => {
    const newEncounters = generateEncounters(weatherData, weatherParams.region);
    setEncounters(newEncounters);
    
    toast({
      title: "Encounters Regenerated",
      description: "New random encounters have been generated.",
    });
  };
  
  // Handle exporting as PDF
  const handleExportPdf = () => {
    toast({
      title: "Export Feature",
      description: "PDF export functionality will be available in the next update.",
    });
  };
  
  // Select a specific day to view details
  const handleSelectDay = (dayWeather: WeatherData) => {
    setCurrentWeather(dayWeather);
  };
  
  // Handle increment/decrement days
  const handleIncrementDays = () => {
    if (weatherParams.days < 30) {
      console.log('Incrementing days');
      updateParams({ days: weatherParams.days + 1 });
    }
  };
  
  const handleDecrementDays = () => {
    if (weatherParams.days > 1) {
      console.log('Decrementing days');
      updateParams({ days: weatherParams.days - 1 });
    }
  };
  
  // Show save dialog
  const openSaveDialog = () => {
    if (weatherData.length === 0) {
      toast({
        title: "No Weather Data",
        description: "Please generate weather data before saving.",
        variant: "destructive"
      });
      return;
    }
    
    setSaveDialogOpen(true);
  };
  
  return (
    <div className="weather-generator-tab">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Weather Controls */}
        <div className="lg:col-span-1">
          <div className="bg-surface rounded-xl p-6 shadow-lg mb-6">
            <h2 className="font-heading text-2xl mb-6 text-primary">Weather Parameters</h2>
            
            {/* Region Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Region</label>
              <Select 
                value={weatherParams.region} 
                onValueChange={(value) => setWeatherParams({...weatherParams, region: value as Region})}
              >
                <SelectTrigger className="w-full bg-background border border-gray-700 rounded-lg p-2 text-sand">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tablelands">Tablelands</SelectItem>
                  <SelectItem value="Sea of Silt">Sea of Silt</SelectItem>
                  <SelectItem value="Ringing Mountains">Ringing Mountains</SelectItem>
                  <SelectItem value="Forest Ridge">Forest Ridge</SelectItem>
                  <SelectItem value="Jagged Cliffs">Jagged Cliffs</SelectItem>
                  <SelectItem value="Tyr Valley">Tyr Valley</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Season Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Season</label>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => updateParams({ season: "High Sun" })}
                  className={weatherParams.season === "High Sun" ? "bg-primary text-white" : "bg-background hover:bg-gray-800 text-sand"}
                  size="sm"
                >
                  High Sun
                </Button>
                <Button 
                  onClick={() => updateParams({ season: "Low Sun" })}
                  className={weatherParams.season === "Low Sun" ? "bg-primary text-white" : "bg-background hover:bg-gray-800 text-sand"}
                  size="sm"
                >
                  Low Sun
                </Button>
                <Button 
                  onClick={() => updateParams({ season: "Ascending Sun" })}
                  className={weatherParams.season === "Ascending Sun" ? "bg-primary text-white" : "bg-background hover:bg-gray-800 text-sand"}
                  size="sm"
                >
                  Ascending Sun
                </Button>
                <Button 
                  onClick={() => updateParams({ season: "Descending Sun" })}
                  className={weatherParams.season === "Descending Sun" ? "bg-primary text-white" : "bg-background hover:bg-gray-800 text-sand"}
                  size="sm"
                >
                  Descending Sun
                </Button>
              </div>
            </div>
            
            {/* Temperature Influence */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Temperature Tendency</label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">Cooler</span>
                <span className="text-xs">Normal</span>
                <span className="text-xs">Hotter</span>
              </div>
              <Slider
                value={[weatherParams.temperatureTendency]}
                min={1}
                max={5}
                step={1}
                className="w-full"
                onValueChange={(value) => updateParams({ temperatureTendency: value[0] })}
              />
            </div>
            
            {/* Wind Influence */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Wind Intensity</label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">Calm</span>
                <span className="text-xs">Normal</span>
                <span className="text-xs">Violent</span>
              </div>
              <Slider
                value={[weatherParams.windIntensity]}
                min={1}
                max={5}
                step={1}
                className="w-full"
                onValueChange={(value) => updateParams({ windIntensity: value[0] })}
              />
            </div>
            
            {/* Special Event Probability */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Special Event Probability</label>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">Rare</span>
                <span className="text-xs">Normal</span>
                <span className="text-xs">Frequent</span>
              </div>
              <Slider
                value={[weatherParams.specialEventProbability]}
                min={1}
                max={5}
                step={1}
                className="w-full"
                onValueChange={(value) => updateParams({ specialEventProbability: value[0] })}
              />
            </div>
            
            {/* Days to Generate */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Days to Generate</label>
              <div className="flex items-center">
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-sand h-8 w-8 flex items-center justify-center rounded-l-lg"
                  onClick={handleDecrementDays}
                >
                  -
                </button>
                <Input
                  type="number"
                  value={weatherParams.days}
                  min={1}
                  max={30}
                  className="bg-background border-y border-gray-700 h-8 w-16 text-center text-sand rounded-none"
                  onChange={(e) => updateParams({ days: parseInt(e.target.value) || 1 })}
                />
                <button 
                  className="bg-gray-700 hover:bg-gray-600 text-sand h-8 w-8 flex items-center justify-center rounded-r-lg"
                  onClick={handleIncrementDays}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                className="bg-primary hover:bg-orange-800 text-white py-3 rounded-lg font-medium flex items-center justify-center"
                onClick={handleGenerateWeather}
              >
                <span className="material-icons mr-2">auto_awesome</span>
                Generate Weather
              </Button>
              <Button
                variant="outline"
                className="bg-gray-700 hover:bg-gray-600 text-sand py-2 rounded-lg flex items-center justify-center"
                onClick={handleResetParameters}
              >
                <span className="material-icons mr-2">restart_alt</span>
                Reset Parameters
              </Button>
            </div>
          </div>
          
          {/* Current Settings */}
          <div className="bg-surface rounded-xl p-6 shadow-lg">
            <h3 className="font-heading text-xl mb-4 text-primary">Current Settings</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Region:</span>
                <span className="font-medium">{weatherParams.region}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Season:</span>
                <span className="font-medium">{weatherParams.season}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Temperature:</span>
                <span className="font-medium">{temperatureLabels[weatherParams.temperatureTendency - 1]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Wind:</span>
                <span className="font-medium">{windIntensityLabels[weatherParams.windIntensity - 1]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Events:</span>
                <span className="font-medium">{specialEventLabels[weatherParams.specialEventProbability - 1]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Days:</span>
                <span className="font-medium">{weatherParams.days}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column: Weather Display and Timeline */}
        <div className="lg:col-span-2">
          {/* Current Weather Display */}
          {currentWeather ? (
            <div className="bg-surface rounded-xl p-6 shadow-lg mb-6">
              <h2 className="font-heading text-2xl mb-4 text-primary">Current Weather</h2>
              <div className="flex items-center mb-6">
                <div className="text-6xl font-mono text-warning mr-3">{currentWeather.temperature}°C</div>
                <div className="border-l border-gray-700 pl-3">
                  <div className="text-xl font-medium">{currentWeather.temperatureCondition}</div>
                  <div className="text-gray-400">Day {currentWeather.day} of {currentWeather.season}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-background rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">Wind</div>
                  <div className="flex items-center">
                    <span className="material-icons text-sand mr-2">air</span>
                    <span>{currentWeather.windCondition} {currentWeather.windDirection}</span>
                  </div>
                </div>
                <div className="bg-background rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-1">Visibility</div>
                  <div className="flex items-center">
                    <span className="material-icons text-warning mr-2">visibility</span>
                    <span>{currentWeather.visibility}</span>
                  </div>
                </div>
                <div className={`${currentWeather.specialEvent ? 'bg-danger bg-opacity-20' : 'bg-background'} rounded-lg p-3`}>
                  <div className="text-sm text-gray-300 mb-1">Special Event</div>
                  <div className={`flex items-center ${currentWeather.specialEvent ? 'text-danger' : ''}`}>
                    {currentWeather.specialEvent ? (
                      <>
                        <span className="material-icons mr-2">warning</span>
                        <span>{currentWeather.specialEvent}</span>
                      </>
                    ) : (
                      <span>None</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-background rounded-lg p-4">
                <h3 className="font-medium mb-2">DM Notes</h3>
                <p className="text-sm text-gray-400 mb-3">{currentWeather.dmNotes}</p>
                <div className="flex flex-wrap gap-2">
                  {currentWeather.tags.map((tag, index) => {
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
          ) : (
            <div className="bg-surface rounded-xl p-6 shadow-lg mb-6 text-center py-10">
              <h2 className="font-heading text-2xl mb-4 text-primary">Weather Generator</h2>
              <p className="text-gray-400 mb-4">Set your parameters and generate weather to see details here.</p>
              <Button 
                className="bg-primary hover:bg-orange-800 text-white"
                onClick={handleGenerateWeather}
              >
                Generate Weather
              </Button>
            </div>
          )}
          
          {/* Weather Forecast */}
          {weatherData.length > 0 && (
            <div className="bg-surface rounded-xl p-6 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading text-2xl text-primary">{weatherData.length}-Day Forecast</h2>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-gray-700 hover:bg-gray-600 text-sand p-1 rounded h-9 w-9"
                    title="Save this weather pattern"
                    onClick={openSaveDialog}
                  >
                    <span className="material-icons">bookmark_border</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-gray-700 hover:bg-gray-600 text-sand p-1 rounded h-9 w-9"
                    title="Export as PDF"
                    onClick={handleExportPdf}
                  >
                    <span className="material-icons">download</span>
                  </Button>
                </div>
              </div>
              
              {/* Weather Card Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-x-auto pb-2">
                {weatherData.map((day, index) => (
                  <WeatherCard 
                    key={index} 
                    weather={day} 
                    onClick={() => handleSelectDay(day)} 
                  />
                ))}
              </div>
              
              {/* Weather Timeline */}
              {weatherData.length > 0 && (
                <TemperatureTrendChart weatherData={weatherData} />
              )}
              
              {/* Random Encounters Based on Weather */}
              <WeatherEncounters 
                encounters={encounters} 
                onRegenerate={handleRegenerateEncounters} 
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Save Pattern Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Weather Pattern</DialogTitle>
            <DialogDescription>
              Enter a name for this weather pattern to save it for future use.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pattern-name" className="text-right">
                Name
              </Label>
              <Input
                id="pattern-name"
                placeholder="Summer Tablelands"
                className="col-span-3"
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePattern}>Save Pattern</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
