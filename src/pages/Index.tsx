// src/pages/Index.tsx

import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/components/Dashboard";
import { LiveMonitor } from "@/components/LiveMonitor";
import { AlertSystem } from "@/components/AlertSystem";
import { WellnessTracking } from "@/components/WellnessTracking";
import { ContactManagement } from "@/components/ContactManagement";
import { UserProfile } from "@/components/UserProfile";
import { ActivityLog } from "@/components/ActivityLog"; // Import the new component
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathToTab: Record<string, string> = useMemo(() => ({
    "/app": "dashboard",
    "/app/": "dashboard",
    "/app/dashboard": "dashboard",
    "/app/monitor": "monitor",
    "/app/alerts": "alerts",
    "/app/activity": "activity-log",
    "/app/wellness": "wellness",
    "/app/contacts": "contacts",
    "/app/profile": "profile",
  }), []);
  const tabToPath: Record<string, string> = useMemo(() => ({
    "dashboard": "/app/dashboard",
    "monitor": "/app/monitor",
    "alerts": "/app/alerts",
    "activity-log": "/app/activity",
    "wellness": "/app/wellness",
    "contacts": "/app/contacts",
    "profile": "/app/profile",
  }), []);

  const [activeTab, setActiveTab] = useState("dashboard");

  // Sync tab when URL changes
  useEffect(() => {
    const tab = pathToTab[location.pathname] || "dashboard";
    setActiveTab(tab);
  }, [location.pathname, pathToTab]);

  // Navigate when tab changes from UI
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const target = tabToPath[tab] || "/app/dashboard";
    if (location.pathname !== target) navigate(target);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onTabChange={setActiveTab} />;
      case "monitor":
        return <LiveMonitor />;
      case "alerts":
        return <AlertSystem />;
      case "activity-log": // Add case for the new component
        return <ActivityLog />;
      case "wellness":
        return <WellnessTracking />;
      case "contacts":
        return <ContactManagement />;
      case "profile":
        return <UserProfile />;
      default:
        return <Dashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={handleTabChange}>
      <Routes>
        <Route index element={<Dashboard onTabChange={handleTabChange} />} />
        <Route path="dashboard" element={<Dashboard onTabChange={handleTabChange} />} />
        <Route path="monitor" element={<LiveMonitor />} />
        <Route path="alerts" element={<AlertSystem />} />
        <Route path="activity" element={<ActivityLog />} />
        <Route path="wellness" element={<WellnessTracking />} />
        <Route path="contacts" element={<ContactManagement />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="*" element={<Dashboard onTabChange={handleTabChange} />} />
      </Routes>
    </Layout>
  );
};

export default Index;