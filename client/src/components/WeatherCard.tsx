import { WeatherData } from "@/types/weather";
import { formatTemperature } from "@/lib/temperature";

interface WeatherCardProps {
  weather: WeatherData;
  onClick?: () => void;
}

export default function WeatherCard({ weather, onClick }: WeatherCardProps) {
  // Determine color class for event tag
  const getTagColorClass = () => {
    if (!weather.specialEvent) return "bg-primary bg-opacity-20 text-primary";
    
    switch (weather.specialEvent) {
      case "Dust Storm":
      case "Silt Storm":
      case "Avalanche":
      case "Rock Slide":
      case "Forest Fire":
        return "bg-danger bg-opacity-20 text-danger";
      case "Heat Wave":
      case "Cold Snap":
      case "Lightning Storm":
        return "bg-warning bg-opacity-20 text-warning";
      default:
        return "bg-primary bg-opacity-20 text-primary";
    }
  };

  return (
    <div 
      className="weather-card bg-background rounded-lg p-4 flex flex-col min-w-[140px] cursor-pointer transition-transform hover:translate-y-[-5px]"
      onClick={onClick}
    >
      <div className="text-sm font-medium mb-1">Day {weather.day}</div>
      <div className="text-xs text-gray-400 mb-3">{weather.season}</div>
      <div className="text-xl font-mono mb-3">{formatTemperature(weather.temperature)}</div>
      <div className="flex items-center text-sm mb-2">
        <span className="material-icons text-sand text-sm mr-1">air</span>
        <span>{weather.windCondition}</span>
      </div>
      <div className="mt-auto">
        <span className={`text-xs ${getTagColorClass()} px-2 py-1 rounded`}>
          {weather.specialEvent || "Normal"}
        </span>
      </div>
    </div>
  );
}
