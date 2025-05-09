import { useWeather } from "@/hooks/useWeather";

export default function NavigationTabs() {
  const { activeTab, setActiveTab } = useWeather();
  
  return (
    <div className="mb-8 border-b border-gray-700">
      <nav className="flex flex-wrap gap-1 -mb-px">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'weatherGenerator' ? 'text-sand border-b-2 border-primary' : 'text-gray-400 hover:text-sand border-b-2 border-transparent hover:border-gray-500'}`}
          onClick={() => setActiveTab('weatherGenerator')}
        >
          Weather Generator
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'timeline' ? 'text-sand border-b-2 border-primary' : 'text-gray-400 hover:text-sand border-b-2 border-transparent hover:border-gray-500'}`}
          onClick={() => setActiveTab('timeline')}
        >
          Timeline
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'encounters' ? 'text-sand border-b-2 border-primary' : 'text-gray-400 hover:text-sand border-b-2 border-transparent hover:border-gray-500'}`}
          onClick={() => setActiveTab('encounters')}
        >
          Encounters
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'savedPatterns' ? 'text-sand border-b-2 border-primary' : 'text-gray-400 hover:text-sand border-b-2 border-transparent hover:border-gray-500'}`}
          onClick={() => setActiveTab('savedPatterns')}
        >
          Saved Patterns
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-sand border-b-2 border-primary' : 'text-gray-400 hover:text-sand border-b-2 border-transparent hover:border-gray-500'}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>
    </div>
  );
}
