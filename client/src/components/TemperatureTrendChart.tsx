import { WeatherData } from "@/types/weather";

interface TemperatureTrendChartProps {
  weatherData: WeatherData[];
}

export default function TemperatureTrendChart({ weatherData }: TemperatureTrendChartProps) {
  // Calculate positions for chart points
  const calculatePosition = (temp: number, index: number, data: WeatherData[]) => {
    // Find min and max temperature to scale properly
    const temps = data.map(d => d.temperature);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const range = maxTemp - minTemp;
    
    // Calculate percentage positions
    const xPercent = (index / (data.length - 1)) * 100;
    
    // Calculate y-position (inverted since lower pixels = higher on screen)
    // Leave some padding at top and bottom (10%)
    let yPercent;
    if (range === 0) {
      // All temperatures are the same
      yPercent = 50;
    } else {
      yPercent = 10 + (80 * (maxTemp - temp) / range);
    }
    
    return { x: `${xPercent}%`, y: `${yPercent}%` };
  };
  
  // Generate SVG path for the temperature line
  const generateLinePath = () => {
    if (weatherData.length < 2) return "";
    
    return weatherData.map((data, index) => {
      const { x, y } = calculatePosition(data.temperature, index, weatherData);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };
  
  return (
    <div className="mt-8">
      <h3 className="font-medium mb-4">Temperature Trend</h3>
      <div className="h-24 bg-background rounded-lg p-3 relative">
        {/* Temperature Line */}
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gray-700"></div>
        
        {/* Temperature Points and Connecting Lines */}
        <div className="relative h-full flex items-center">
          <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
            <path
              d={generateLinePath()}
              stroke="#E65100"
              strokeWidth="2"
              fill="none"
            />
          </svg>
          
          {weatherData.map((data, index) => {
            const { x, y } = calculatePosition(data.temperature, index, weatherData);
            return (
              <div key={index} style={{ position: "absolute", left: x, top: y }}>
                <div className="w-2 h-2 bg-primary rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                
                {/* Temperature Label */}
                <div className="absolute transform -translate-x-1/2 top-[-15px] text-xs">
                  {data.temperature}°
                </div>
                
                {/* Day Label */}
                <div className="absolute transform -translate-x-1/2 top-[15px] text-xs text-gray-500">
                  D{data.day}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
