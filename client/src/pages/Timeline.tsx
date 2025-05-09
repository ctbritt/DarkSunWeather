import { useState, useEffect } from "react";
import { useWeather } from "@/hooks/useWeather";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import WeatherCard from "@/components/WeatherCard";

export default function Timeline() {
  const { weatherData, currentWeather, setCurrentWeather } = useWeather();
  const [activeView, setActiveView] = useState("calendar");
  
  if (weatherData.length === 0) {
    return (
      <div className="bg-surface rounded-xl p-6 shadow-lg">
        <h2 className="font-heading text-2xl mb-4 text-primary">Weather Timeline</h2>
        <div className="text-center py-10">
          <div className="mb-4 text-gray-400">
            No weather data available. Generate weather in the Weather Generator tab first.
          </div>
          <span className="material-icons text-4xl text-gray-600">cloud_off</span>
        </div>
      </div>
    );
  }
  
  // Calculate timeline metrics
  const averageTemp = Math.round(weatherData.reduce((sum, day) => sum + day.temperature, 0) / weatherData.length);
  const maxTemp = Math.max(...weatherData.map(day => day.temperature));
  const minTemp = Math.min(...weatherData.map(day => day.temperature));
  
  // Count special events
  const specialEvents = weatherData
    .filter(day => day.specialEvent)
    .reduce<Record<string, number>>((acc, day) => {
      if (day.specialEvent) {
        acc[day.specialEvent] = (acc[day.specialEvent] || 0) + 1;
      }
      return acc;
    }, {});
  
  // Count wind conditions
  const windConditions = weatherData.reduce<Record<string, number>>((acc, day) => {
    acc[day.windCondition] = (acc[day.windCondition] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-primary font-heading text-2xl">Weather Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-background p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Average Temperature</div>
              <div className="text-xl font-mono">{averageTemp}°C</div>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Temperature Range</div>
              <div className="text-xl font-mono">{minTemp}°C - {maxTemp}°C</div>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Special Events</div>
              <div className="text-xl font-mono">{Object.keys(specialEvents).length} Types</div>
            </div>
            <div className="bg-background p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-1">Period</div>
              <div className="text-xl font-mono">{weatherData[0].day} - {weatherData[weatherData.length - 1].day}</div>
            </div>
          </div>
          
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="mb-4">
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="stats">Statistics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {weatherData.map((day, index) => (
                  <WeatherCard 
                    key={index} 
                    weather={day} 
                    onClick={() => setCurrentWeather(day)} 
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="list">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Day</TableHead>
                      <TableHead>Temperature</TableHead>
                      <TableHead>Wind</TableHead>
                      <TableHead>Special Event</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {weatherData.map((day, index) => (
                      <TableRow key={index}>
                        <TableCell>{day.day}</TableCell>
                        <TableCell>{day.temperature}°C ({day.temperatureCondition})</TableCell>
                        <TableCell>{day.windCondition} {day.windDirection}</TableCell>
                        <TableCell>
                          {day.specialEvent || "None"}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setCurrentWeather(day)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">Special Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(specialEvents).length > 0 ? (
                      <ul className="space-y-2">
                        {Object.entries(specialEvents).map(([event, count]) => (
                          <li key={event} className="flex justify-between">
                            <span>{event}</span>
                            <span className="font-mono">{count} day{count !== 1 ? 's' : ''}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-gray-400">No special events recorded</div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-primary">Wind Conditions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {Object.entries(windConditions).map(([condition, count]) => (
                        <li key={condition} className="flex justify-between">
                          <span>{condition}</span>
                          <span className="font-mono">{count} day{count !== 1 ? 's' : ''}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-primary">Temperature Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Average Temperature:</span>
                        <span className="font-mono">{averageTemp}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Maximum Temperature:</span>
                        <span className="font-mono">{maxTemp}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Minimum Temperature:</span>
                        <span className="font-mono">{minTemp}°C</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Temperature Variance:</span>
                        <span className="font-mono">{maxTemp - minTemp}°C</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Current weather display */}
      {currentWeather && (
        <Card>
          <CardHeader>
            <CardTitle className="text-primary font-heading text-xl">Selected Day: Day {currentWeather.day}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Temperature</div>
                <div className="text-xl font-mono">{currentWeather.temperature}°C</div>
                <div className="text-sm text-gray-400">{currentWeather.temperatureCondition}</div>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Wind</div>
                <div className="text-xl">{currentWeather.windCondition}</div>
                <div className="text-sm text-gray-400">{currentWeather.windDirection}</div>
              </div>
              <div className="bg-background p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Special Event</div>
                <div className="text-xl">{currentWeather.specialEvent || "None"}</div>
                <div className="text-sm text-gray-400">Visibility: {currentWeather.visibility}</div>
              </div>
            </div>
            
            <div className="mt-4 bg-background p-4 rounded-lg">
              <div className="text-gray-400 text-sm mb-2">DM Notes</div>
              <p className="text-sm">{currentWeather.dmNotes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
