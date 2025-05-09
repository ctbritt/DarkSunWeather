import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWeather } from "@/hooks/useWeather";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { initDatabase } from "@/lib/weatherStorage";

export default function Settings() {
  const { toast } = useToast();
  const { darkMode, setDarkMode } = useWeather();
  
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [isResetting, setIsResetting] = useState(false);
  
  // Handle resetting the application
  const handleResetApp = async () => {
    setIsResetting(true);
    
    try {
      // Request to delete the IndexedDB database
      const deleteRequest = indexedDB.deleteDatabase("DarkSunWeatherDB");
      
      deleteRequest.onsuccess = async () => {
        // Reinitialize the database
        await initDatabase();
        
        setResetDialogOpen(false);
        setIsResetting(false);
        
        toast({
          title: "Reset Complete",
          description: "All saved patterns and settings have been reset.",
        });
        
        // Reload the application to ensure clean state
        window.location.reload();
      };
      
      deleteRequest.onerror = () => {
        setIsResetting(false);
        toast({
          title: "Reset Failed",
          description: "There was an error resetting the application.",
          variant: "destructive"
        });
      };
    } catch (error) {
      setIsResetting(false);
      console.error("Error resetting app:", error);
      toast({
        title: "Reset Failed",
        description: "There was an error resetting the application.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-primary font-heading text-2xl">Settings</CardTitle>
          <CardDescription>
            Configure the Dark Sun Weather Master application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Appearance</h3>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <Label className="font-medium">Dark Mode</Label>
                      <p className="text-sm text-gray-400">
                        The Dark Sun theme is optimized for dark mode and is recommended.
                      </p>
                    </div>
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={setDarkMode} 
                      disabled={true} // Disabled for now as the app is designed for dark mode
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Data Management</h3>
                  <Alert className="bg-background border-gray-700">
                    <AlertTitle>Local Storage</AlertTitle>
                    <AlertDescription>
                      All weather patterns and settings are stored locally in your browser using IndexedDB. 
                      This allows the application to work completely offline.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="pt-2">
                    <Button 
                      variant="destructive" 
                      className="bg-danger text-white"
                      onClick={() => setResetDialogOpen(true)}
                    >
                      <span className="material-icons mr-2">delete_forever</span>
                      Reset Application
                    </Button>
                    <p className="text-sm text-gray-400 mt-2">
                      This will delete all saved weather patterns and reset all settings to default values.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="help">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weather Generation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">Regions</h4>
                      <p className="text-sm text-gray-400">
                        Each region in Dark Sun has unique weather patterns. 
                        The Tablelands are hot and arid, while the Ringing Mountains have colder temperatures but more extreme conditions.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Seasons</h4>
                      <p className="text-sm text-gray-400">
                        Athas has four seasons: High Sun (summer), Low Sun (winter), Ascending Sun (spring), and Descending Sun (autumn). 
                        High Sun is the most punishing with extreme heat.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Temperature Tendency</h4>
                      <p className="text-sm text-gray-400">
                        Adjust this slider to bias temperature generation toward cooler or hotter conditions. 
                        The middle setting produces realistic average temperatures for the region and season.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Wind Intensity</h4>
                      <p className="text-sm text-gray-400">
                        Controls the probability of stronger winds. Higher settings increase the chance of violent winds and dust storms.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Special Event Probability</h4>
                      <p className="text-sm text-gray-400">
                        Determines how often special weather events (like dust storms, heat waves) occur. 
                        Higher values create more dynamic and potentially dangerous conditions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Game Integration Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium">Weather Impacts</h4>
                      <p className="text-sm text-gray-400">
                        Use the DM Notes and tags for each weather condition to apply appropriate game effects:
                      </p>
                      <ul className="text-sm text-gray-400 list-disc pl-6 mt-2">
                        <li>Extreme heat (45°C+) should require Constitution saves to avoid exhaustion</li>
                        <li>Violent winds can impose disadvantage on ranged attacks and Perception checks</li>
                        <li>Dust storms can severely limit visibility and make navigation difficult</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Resource Management</h4>
                      <p className="text-sm text-gray-400">
                        Dark Sun is a resource-scarce setting. Weather should impact water consumption:
                      </p>
                      <ul className="text-sm text-gray-400 list-disc pl-6 mt-2">
                        <li>During heat waves, characters may need twice the normal water ration</li>
                        <li>Rare rain events should be significant and potentially lead to temporary societal changes</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium">Weather-Appropriate Encounters</h4>
                      <p className="text-sm text-gray-400">
                        The Encounters tab generates thematically appropriate random encounters based on current weather conditions. 
                        These can be used as-is or as inspiration for your own encounters.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="about">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About Dark Sun Weather Master</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300">
                      Dark Sun Weather Master is a specialized tool for Dungeon Masters running campaigns in the harsh 
                      and unforgiving world of Athas, the setting for the Dark Sun campaign.
                    </p>
                    
                    <p className="text-gray-300">
                      This application works entirely offline, making it perfect for use during game sessions 
                      regardless of internet connectivity. All data is stored locally in your browser.
                    </p>
                    
                    <div className="pt-4">
                      <h4 className="font-medium">Dark Sun Setting</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Dark Sun is a campaign setting for the Dungeons & Dragons role-playing game, set on the desert world 
                        of Athas. The world is harsh and resources are scarce, with metal being rare and water a precious commodity. 
                        The setting features unique elements like defiling magic (which destroys plant life), psionic abilities, 
                        and a post-apocalyptic tone.
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <h4 className="font-medium">Weather in Dark Sun</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Weather on Athas is extreme and often deadly. The scorching sun, violent dust storms, and rare but 
                        catastrophic rainfall shape the world and its inhabitants. Realistic weather generation adds immersion 
                        and strategic elements to Dark Sun campaigns, as survival often depends on being prepared for the elements.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="text-center text-sm text-gray-500">
                  <p>Dark Sun Weather Master © 2023</p>
                  <p className="mt-1">Version 1.0.0</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Reset confirmation dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Application</DialogTitle>
            <DialogDescription>
              This will delete all saved weather patterns and reset all settings to default values. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setResetDialogOpen(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleResetApp}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full"></div>
                  Resetting...
                </>
              ) : (
                'Reset Application'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
