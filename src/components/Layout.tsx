// anshikagarg0410/familysafe-ai/familysafe-ai-main/src/components/Layout.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Shield,
  Video,
  AlertTriangle,
  Heart,
  Users,
  Menu,
  X,
  Phone,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { sendSosEmail } from "@/lib/email";
import { AlertAPI } from "@/lib/api";


interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: Shield },
  { id: "monitor", label: "Live Monitor", icon: Video },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "wellness", label: "Wellness", icon: Heart },
  { id: "contacts", label: "Contacts", icon: Users },
  { id: "profile", label: "User Profile", icon: User },
];

export const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSOSTrigger = async () => {
    try {
      await AlertAPI.triggerSOS({ includeEmergencyCall: false });
    } catch {}
    try {
      await sendSosEmail({ subject: 'SOS Alert Triggered', message: 'SOS triggered from sidebar button.' });
    } catch (e) {
      console.error('EmailJS SOS send failed:', (e as Error)?.message);
    }
    toast.success("SOS Alert Triggered!", { description: "Emergency contacts have been notified." });
  };


  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-sidebar-foreground">SafeGuard AI</h1>
                <p className="text-xs text-sidebar-foreground/60">Home Protection</p>
              </div>
            </div>
            {user && (
              <div className="mt-4 text-xs text-sidebar-foreground/70">
                Signed in as<br />
                <span className="font-medium">{user.firstName} {user.lastName}</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-11",
                    activeTab === item.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => {
                    onTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Emergency Contact */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <div className="text-xs text-sidebar-foreground/70 mb-2 px-1">
              Watch Notifications: <span className="font-medium">{import.meta.env.VITE_PUSHOVER_ENABLED === 'true' ? 'Enabled' : 'Off (env not set)'}</span>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  SOS
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to trigger an SOS alert?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will immediately notify all your primary emergency contacts.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSOSTrigger}>
                    Yes, Send SOS
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" className="w-full gap-2">
              <Phone className="w-4 h-4" />
              Emergency Call
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                logout();
                navigate('/auth');
              }}
            >
              Log out
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:ml-64">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};