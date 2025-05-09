import { useWeather } from "@/hooks/useWeather";

export default function Header() {
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center">
          {/* Stylized sun icon for Dark Sun campaign setting */}
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" strokeWidth="1" stroke="currentColor" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold ml-3 text-sand">Dark Sun Weather Master</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm bg-surface px-3 py-1 rounded-full flex items-center">
            <span className="material-icons text-green-500 text-sm mr-1">offline_bolt</span>
            Offline Ready
          </span>
          <button className="bg-surface hover:bg-gray-700 text-sand px-4 py-2 rounded-lg flex items-center">
            <span className="material-icons mr-1">help_outline</span>
            Help
          </button>
        </div>
      </div>
    </header>
  );
}
