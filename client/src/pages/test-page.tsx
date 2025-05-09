import { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function TestPage() {
  const [counter, setCounter] = useState(0);
  
  const handleClick = () => {
    console.log('Button clicked');
    setCounter(prev => prev + 1);
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
      </div>
    </div>
  );
}