import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWeather } from "@/hooks/useWeather";
import { SavedWeatherPattern, getAllWeatherPatterns, deleteWeatherPattern, exportWeatherPatterns, importWeatherPatterns } from "@/lib/weatherStorage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";

export default function SavedPatterns() {
  const { toast } = useToast();
  const { setWeatherData, setWeatherParams, setCurrentWeather, setActiveTab } = useWeather();
  
  const [savedPatterns, setSavedPatterns] = useState<SavedWeatherPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [selectedPattern, setSelectedPattern] = useState<SavedWeatherPattern | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  
  // Load saved patterns on mount
  useEffect(() => {
    loadSavedPatterns();
  }, []);
  
  // Function to load saved patterns
  const loadSavedPatterns = async () => {
    setIsLoading(true);
    try {
      const patterns = await getAllWeatherPatterns();
      // Sort by creation date, newest first
      patterns.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setSavedPatterns(patterns);
    } catch (error) {
      console.error("Error loading saved patterns:", error);
      toast({
        title: "Error",
        description: "Failed to load saved weather patterns.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to delete a pattern
  const handleDeletePattern = async (id: number | undefined) => {
    if (!id) return;
    
    try {
      await deleteWeatherPattern(id);
      setSavedPatterns(savedPatterns.filter(pattern => pattern.id !== id));
      toast({
        title: "Pattern Deleted",
        description: "The weather pattern has been deleted."
      });
    } catch (error) {
      console.error("Error deleting pattern:", error);
      toast({
        title: "Error",
        description: "Failed to delete the weather pattern.",
        variant: "destructive"
      });
    }
  };
  
  // Function to load a pattern
  const handleLoadPattern = (pattern: SavedWeatherPattern) => {
    setWeatherParams({
      region: pattern.region,
      season: pattern.season,
      temperatureTendency: pattern.temperatureTendency,
      windIntensity: pattern.windIntensity,
      specialEventProbability: pattern.specialEventProbability,
      days: pattern.days
    });
    
    setWeatherData(pattern.weatherData);
    
    if (pattern.weatherData.length > 0) {
      setCurrentWeather(pattern.weatherData[0]);
    }
    
    setActiveTab("weatherGenerator");
    
    toast({
      title: "Pattern Loaded",
      description: `Loaded weather pattern "${pattern.name}".`
    });
  };
  
  // Function to export all patterns
  const handleExportPatterns = async () => {
    try {
      const jsonData = await exportWeatherPatterns();
      
      // Create a blob and download it
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dark-sun-weather-patterns.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Weather patterns exported successfully."
      });
    } catch (error) {
      console.error("Error exporting patterns:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export weather patterns.",
        variant: "destructive"
      });
    }
  };
  
  // Function to import patterns
  const handleImportPatterns = async () => {
    if (!importJson.trim()) {
      toast({
        title: "Error",
        description: "Please paste valid JSON data.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Try to parse the JSON to validate it
      JSON.parse(importJson);
      
      await importWeatherPatterns(importJson);
      setImportDialogOpen(false);
      setImportJson("");
      
      // Reload patterns
      await loadSavedPatterns();
      
      toast({
        title: "Import Successful",
        description: "Weather patterns imported successfully."
      });
    } catch (error) {
      console.error("Error importing patterns:", error);
      toast({
        title: "Import Failed",
        description: "Invalid JSON data or import error.",
        variant: "destructive"
      });
    }
  };
  
  // Function to view pattern details
  const handleViewDetails = (pattern: SavedWeatherPattern) => {
    setSelectedPattern(pattern);
    setDetailsDialogOpen(true);
  };
  
  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };
  
  // If loading, show a loading state
  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl p-6 shadow-lg">
        <h2 className="font-heading text-2xl mb-4 text-primary">Saved Weather Patterns</h2>
        <div className="text-center py-10">
          <div className="mb-4 text-gray-400">Loading saved patterns...</div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-primary font-heading text-2xl">Saved Weather Patterns</CardTitle>
              <CardDescription>
                Load, manage, and share your custom weather patterns
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                className="bg-gray-700 hover:bg-gray-600 text-sand"
                onClick={() => setImportDialogOpen(true)}
              >
                <span className="material-icons mr-2">upload</span>
                Import
              </Button>
              <Button 
                variant="outline"
                className="bg-gray-700 hover:bg-gray-600 text-sand"
                onClick={handleExportPatterns}
              >
                <span className="material-icons mr-2">download</span>
                Export All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {savedPatterns.length === 0 ? (
            <Alert>
              <AlertTitle>No saved patterns</AlertTitle>
              <AlertDescription>
                Generate weather in the Weather Generator tab and save patterns to see them here.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Season</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedPatterns.map((pattern) => (
                    <TableRow key={pattern.id}>
                      <TableCell className="font-medium">{pattern.name}</TableCell>
                      <TableCell>{pattern.region}</TableCell>
                      <TableCell>{pattern.season}</TableCell>
                      <TableCell>{pattern.days}</TableCell>
                      <TableCell>{formatDate(pattern.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleViewDetails(pattern)}
                          >
                            <span className="material-icons text-sm">visibility</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-2 text-primary border-primary"
                            onClick={() => handleLoadPattern(pattern)}
                          >
                            <span className="material-icons text-sm">check_circle</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="h-8 px-2 text-danger border-danger"
                            onClick={() => handleDeletePattern(pattern.id)}
                          >
                            <span className="material-icons text-sm">delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Weather Patterns</DialogTitle>
            <DialogDescription>
              Paste the JSON data from a previously exported weather patterns file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Label htmlFor="import-json">JSON Data</Label>
            <textarea 
              id="import-json"
              className="w-full h-40 px-3 py-2 text-sm rounded-md border border-gray-700 bg-background text-sand resize-none"
              placeholder='Paste JSON data here (e.g., [{"name":"Tyr Valley Summer",...}])'
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
            ></textarea>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportPatterns}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Pattern Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedPattern?.name}</DialogTitle>
            <DialogDescription>
              Created {selectedPattern ? formatDate(selectedPattern.createdAt) : ""}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPattern && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Region</div>
                  <div>{selectedPattern.region}</div>
                </div>
                <div className="bg-background p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Season</div>
                  <div>{selectedPattern.season}</div>
                </div>
                <div className="bg-background p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Days</div>
                  <div>{selectedPattern.days}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Temperature Tendency</div>
                  <div>{selectedPattern.temperatureTendency === 3 ? "Normal" : 
                       selectedPattern.temperatureTendency < 3 ? "Cooler" : "Hotter"}</div>
                </div>
                <div className="bg-background p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Wind Intensity</div>
                  <div>{selectedPattern.windIntensity === 3 ? "Normal" : 
                       selectedPattern.windIntensity < 3 ? "Calmer" : "Stronger"}</div>
                </div>
                <div className="bg-background p-3 rounded-lg">
                  <div className="text-sm text-gray-400 mb-1">Special Events</div>
                  <div>{selectedPattern.specialEventProbability === 3 ? "Normal" : 
                       selectedPattern.specialEventProbability < 3 ? "Rarer" : "More Frequent"}</div>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2">Weather Summary</h3>
                <div className="bg-background p-3 rounded-lg">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-60 overflow-y-auto pr-2">
                    {selectedPattern.weatherData.map((day, index) => (
                      <div key={index} className="text-sm">
                        <div className="font-medium">Day {day.day}</div>
                        <div className="text-gray-400">{day.temperature}°C, {day.windCondition}</div>
                        {day.specialEvent && (
                          <div className="text-xs mt-1 text-warning">{day.specialEvent}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedPattern && handleLoadPattern(selectedPattern)}>
              Load Pattern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
