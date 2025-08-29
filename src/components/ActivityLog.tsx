// src/components/ActivityLog.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Shield,
  Clock,
  Heart,
  CheckCircle,
  Activity,
  AlertTriangle,
} from "lucide-react";

const mockActivities = [
  {
    time: "2:30 PM",
    activity: "Safe Activity Detected",
    details: "Living Room - Reading",
    status: "Normal",
    icon: <Activity className="w-4 h-4 text-primary" />,
  },
  {
    time: "10:30 AM",
    activity: "Wellness Check-in",
    details: "Grandma confirmed she's doing well",
    status: "Completed",
    icon: <CheckCircle className="w-4 h-4 text-success" />,
  },
  {
    time: "9:00 AM",
    activity: "Medication Reminder",
    details: "Morning pills taken on time",
    status: "Completed",
    icon: <Heart className="w-4 h-4 text-primary" />,
  },
  {
    time: "Yesterday",
    activity: "Prolonged Inactivity",
    details: "No movement detected for 2 hours in Bedroom",
    status: "Alert",
    icon: <AlertTriangle className="w-4 h-4 text-warning" />,
  },
    {
    time: "Yesterday",
    activity: "Fall Detected",
    details: "Sudden impact detected in living room",
    status: "Resolved",
    icon: <Shield className="w-4 h-4 text-destructive" />,
  },
];

const getStatusBadge = (status: string) => {
    switch (status) {
      case "Normal":
        return <Badge variant="secondary">Normal</Badge>;
      case "Completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "Alert":
        return <Badge variant="destructive">Alert</Badge>;
      case "Resolved":
        return <Badge variant="outline">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
}

export const ActivityLog = () => {
  return (
    <div className="space-y-6">
       <div>
          <h1 className="text-3xl font-bold">Activity Log</h1>
          <p className="text-muted-foreground">
            A complete history of all detected activities and system events.
          </p>
        </div>
        <Card className="shadow-card">
            <CardHeader>
                <CardTitle>All Activities</CardTitle>
                <CardDescription>Browse through the timeline of recent events.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Time</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {mockActivities.map((log, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{log.time}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {log.icon}
                                        <span>{log.activity}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{log.details}</TableCell>
                                <TableCell className="text-right">{getStatusBadge(log.status)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
};