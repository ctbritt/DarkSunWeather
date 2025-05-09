import { useWeather } from "@/hooks/useWeather";

export default function NavigationTabs() {
  const { activeTab, changeTab } = useWeather();
  
  console.log('NavigationTabs rendering, activeTab:', activeTab);
  
  const handleTabClick = (tab: "weatherGenerator" | "timeline" | "encounters" | "savedPatterns" | "settings") => {
    console.log('Tab clicked:', tab);
    changeTab(tab);
  };
  
  return (
    <div className="mb-8 border-b border-gray-700">
      <nav className="flex flex-wrap gap-1 -mb-px">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'weatherGenerator' ? 'text-sand border-b-2 border-primary' : 'text-gray-400 hover:text-sand border-b-2 border-transparent hover:border-gray-500'}`}
          onClick={() => handleTabClick('weatherGenerator')}
        >
          Weather Generator
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'timeline' ? 'text-sand border-b-2 border-primary' : 'text-gray-400 hover:text-sand border-b-2 border-transparent hover:border-gray-500'}`}
          onClick={() => handleTabClick('timeline')}
        >
          Timeline
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'encounters' ? 'text-sand border-b-2 border-primary' : 'text-gray-400 hover:text-sand border-b-2 border-transparent hover:border-gray-500'}`}
          onClick={() => handleTabClick('encounters')}
        >
          Encounters
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'savedPatterns' ? 'text-sand border-b-2 border-primary' : 'text-gray-400 hover:text-sand border-b-2 border-transparent hover:border-gray-500'}`}
          onClick={() => handleTabClick('savedPatterns')}
        >
          Saved Patterns
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'settings' ? 'text-sand border-b-2 border-primary' : 'text-gray-400 hover:text-sand border-b-2 border-transparent hover:border-gray-500'}`}
          onClick={() => handleTabClick('settings')}
        >
          Settings
        </button>
      </nav>
    </div>
  );
}
