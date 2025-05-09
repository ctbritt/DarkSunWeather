import { Route, Switch, Link } from "wouter";
import Header from "./components/Header";
import NavigationTabs from "./components/NavigationTabs";
import WeatherGenerator from "./pages/WeatherGenerator";
import Timeline from "./pages/Timeline";
import Encounters from "./pages/Encounters";
import SavedPatterns from "./pages/SavedPatterns";
import Settings from "./pages/Settings";
import TestPage from "./pages/test-page";
import NotFound from "./pages/not-found";
import { useWeather } from "./hooks/useWeather";
import { Button } from "@/components/ui/button";

function App() {
  const { activeTab } = useWeather();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Header />
        <div className="mb-4 p-4 bg-red-500 text-white rounded">
          <p className="font-bold">Test Mode</p>
          <p>Debugging interactivity issues. <a href="/test" className="underline">Click here to access test page</a></p>
        </div>
        <NavigationTabs />
        
        <main>
          {activeTab === "weatherGenerator" && <WeatherGenerator />}
          {activeTab === "timeline" && <Timeline />}
          {activeTab === "encounters" && <Encounters />}
          {activeTab === "savedPatterns" && <SavedPatterns />}
          {activeTab === "settings" && <Settings />}
        </main>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Dark Sun Weather Master © 2023</p>
          <p className="mt-1">Works completely offline - all data is stored locally in your browser</p>
        </footer>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={App} />
      <Route path="/test" component={TestPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default Router;
