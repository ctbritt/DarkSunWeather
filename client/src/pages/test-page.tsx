import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useWeather } from "../hooks/useWeather";

export default function TestPage() {
  const [counter, setCounter] = useState(0);
  const { weatherParams, updateParams } = useWeather();
  
  const handleClick = () => {
    console.log('Button clicked');
    setCounter(prev => prev + 1);
  };

  const testWeatherUpdate = () => {
    console.log('Test weather update button clicked');
    console.log('Current weather params:', weatherParams);
    updateParams({ days: weatherParams.days + 1 });
  };

  const testRegionUpdate = () => {
    console.log('Test region update button clicked');
    const regions = ["Tablelands", "Sea of Silt", "Ringing Mountains", "Forest Ridge", "Jagged Cliffs", "Tyr Valley"];
    const currentIndex = regions.indexOf(weatherParams.region);
    const nextIndex = (currentIndex + 1) % regions.length;
    updateParams({ region: regions[nextIndex] as any });
  };

  return (
    <div className="p-8 bg-surface rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">Counter: {counter}</p>
      
      <div className="space-y-4">
        <Button 
          onClick={handleClick}
          className="bg-primary hover:bg-orange-800 text-white"
        >
          Click Me (Button Component)
        </Button>
        
        <button 
          onClick={handleClick}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          Click Me (Native Button)
        </button>

        <h2 className="text-xl font-bold mt-8 mb-4">Weather Context Test</h2>
        <div className="p-4 bg-gray-700 text-white rounded mb-4">
          <pre>{JSON.stringify(weatherParams, null, 2)}</pre>
        </div>

        <Button 
          onClick={testWeatherUpdate}
          className="bg-green-600 hover:bg-green-700 text-white mr-4"
        >
          Test Increment Days
        </Button>

        <Button 
          onClick={testRegionUpdate}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Test Cycle Region
        </Button>
      </div>
    </div>
  );
}