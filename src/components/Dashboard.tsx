import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Video,
  AlertTriangle,
  Heart,
  Users,
  CheckCircle,
  Clock,
  Activity,
  Eye,
  Wifi,
  Battery,
  Phone,
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { AlertAPI } from "@/lib/api";

interface DashboardProps {
  onTabChange: (tab: string) => void;
}

export const Dashboard = ({ onTabChange }: DashboardProps) => {
  const currentTime = new Date().toLocaleTimeString();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div 
        className="relative rounded-2xl overflow-hidden bg-gradient-hero p-8 lg:p-12 text-primary-foreground"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(34, 197, 94, 0.8)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            AI-Powered Home Safety & Wellness
          </h1>
          <p className="text-xl mb-8 text-primary-foreground/90">
            Monitor your loved ones with intelligent activity recognition, instant alerts, 
            and comprehensive wellness tracking.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => onTabChange("monitor")}
            >
              <Video className="w-5 h-5" />
              Start Monitoring
            </Button>
            <Button 
              variant="secondary" 
              size="xl"
              onClick={() => onTabChange("wellness")}
            >
              <Heart className="w-5 h-5" />
              View Wellness
            </Button>
            <Button 
              variant="destructive" 
              size="xl"
              onClick={() => onTabChange("alerts")}
              className="animate-pulse"
            >
              <AlertTriangle className="w-5 h-5" />
              SOS Alert
            </Button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Live Activity Feed */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Live Activity Feed
            </CardTitle>
            <CardDescription>Real-time activity recognition updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Safe Activity Detected</p>
                  <p className="text-sm text-muted-foreground">Living Room - Reading</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{currentTime}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-success" />
                <div>
                  <p className="font-medium">Wellness Check-in</p>
                  <p className="text-sm text-muted-foreground">Grandma confirmed she's doing well</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">10:30 AM</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 text-primary" />
                <div>
                  <p className="font-medium">Medication Reminder</p>
                  <p className="text-sm text-muted-foreground">Morning pills taken on time</p>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">9:00 AM</span>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => onTabChange("activity-log")} // Changed from "alerts"
            >
              View All Activities
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access key features and controls</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button 
              variant="safety" 
              className="h-20 flex-col gap-2"
              onClick={() => onTabChange("monitor")}
            >
              <Video className="w-6 h-6" />
              Live Monitor
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onTabChange("alerts")}
            >
              <AlertTriangle className="w-6 h-6" />
              Alert History
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onTabChange("wellness")}
            >
              <Heart className="w-6 h-6" />
              Wellness Tracking
            </Button>
            
            <Button 
              variant="outline" 
              className="h-20 flex-col gap-2"
              onClick={() => onTabChange("contacts")}
            >
              <Users className="w-6 h-6" />
              Manage Contacts
            </Button>
          </CardContent>
        </Card>

        {/* Watch Integration */}
        <Card className="shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-primary" />
              Watch Notifications
            </CardTitle>
            <CardDescription>
              Receive SOS and alert pushes on your smartwatch via the Pushover app.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant="secondary">
                {import.meta.env.VITE_PUSHOVER_ENABLED === 'true' ? 'Enabled' : 'Off (env not set)'}
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={async () => {
                  try {
                    await AlertAPI.sendWatchTest();
                    alert('Test push sent. Check your phone/watch.');
                  } catch (e) {
                    alert('Failed to send test push');
                  }
                }}
              >
                Send Test Push
              </Button>
              <Button variant="link" onClick={() => window.open('https://pushover.net', '_blank')}>Setup Guide</Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};