import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Eye,
  Phone,
  MessageSquare,
  Shield,
  Heart,
  Video,
  Play,
  FileText,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { AlertAPI } from "@/lib/api";
import { sendSosEmail } from "@/lib/email";

// Added 'notes' array to each alert object
const initialAlerts = [
  {
    id: 1,
    type: "high",
    title: "Fall Detected",
    description: "Sudden impact detected in living room",
    timestamp: "2024-01-15 14:23:15",
    status: "resolved",
    location: "Living Room",
    confidence: 96,
    hasVideo: true,
    notes: ["Called primary contact, they are on their way."],
  },
  {
    id: 2,
    type: "medium",
    title: "Prolonged Inactivity",
    description: "No movement detected for 2 hours",
    timestamp: "2024-01-15 12:45:22",
    status: "acknowledged",
    location: "Bedroom",
    confidence: 84,
    hasVideo: true,
    notes: [],
  },
  {
    id: 3,
    type: "low",
    title: "Missed Medication",
    description: "Morning medication reminder not acknowledged",
    timestamp: "2024-01-15 09:30:00",
    status: "pending",
    location: "Kitchen",
    confidence: 90,
    hasVideo: false,
    notes: [],
  },
  {
    id: 4,
    type: "medium",
    title: "Unusual Sleep Pattern",
    description: "Activity detected during usual sleep hours",
    timestamp: "2024-01-15 02:15:33",
    status: "resolved",
    location: "Bedroom",
    confidence: 78,
    hasVideo: true,
    notes: ["User confirmed they were just getting a glass of water."],
  },
];

export const AlertSystem = () => {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState(alerts[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [noteText, setNoteText] = useState("");
  const [isSOSLoading, setIsSOSLoading] = useState(false);
  const [isEmergencyCallLoading, setIsEmergencyCallLoading] = useState(false);
  const [sosDialogOpen, setSosDialogOpen] = useState(false);
  const [emergencyCallDialogOpen, setEmergencyCallDialogOpen] = useState(false);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "high":
        return <AlertTriangle className="w-5 h-5 text-destructive" />;
      case "medium":
        return <Clock className="w-5 h-5 text-warning" />;
      case "low":
        return <Shield className="w-5 h-5 text-primary" />;
      default:
        return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-success text-success-foreground">Resolved</Badge>;
      case "acknowledged":
        return <Badge variant="secondary">Acknowledged</Badge>;
      case "pending":
        return <Badge variant="destructive">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAcknowledge = (alertId: number) => {
    const newAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, status: 'acknowledged' } : alert
    );
    setAlerts(newAlerts);
    setSelectedAlert(newAlerts.find(a => a.id === alertId) || newAlerts[0]);
    toast.success("Alert Acknowledged");
  };

  const handleResolve = (alertId: number) => {
    const newAlerts = alerts.map(alert =>
      alert.id === alertId ? { ...alert, status: 'resolved' } : alert
    );
    setAlerts(newAlerts);
    setSelectedAlert(newAlerts.find(a => a.id === alertId) || newAlerts[0]);
    toast.success("Alert Resolved");
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) {
      toast.error("Note cannot be empty.");
      return;
    }
    
    const updatedAlerts = alerts.map(alert => {
        if (alert.id === selectedAlert.id) {
            return { ...alert, notes: [...alert.notes, noteText] };
        }
        return alert;
    });

    setAlerts(updatedAlerts);
    setSelectedAlert(updatedAlerts.find(a => a.id === selectedAlert.id)!);
    
    toast.success("Note Saved", {
      description: `Your note has been added to the alert "${selectedAlert.title}".`,
    });
    setNoteText("");
  };

  const handleSOS = async () => {
    setIsSOSLoading(true);
    try {
      const response = await AlertAPI.triggerSOS({ includeEmergencyCall: false });
      try {
        await sendSosEmail({
          subject: "SOS Alert Triggered",
          message: "A user has triggered SOS from the Alerts page.",
        });
      } catch (e) {
        console.error('EmailJS SOS send failed:', (e as Error)?.message);
      }

      toast.success("SOS alert sent successfully!", {
        description: "Emergency services and contacts have been notified."
      });

      setSosDialogOpen(false);
    } catch (error) {
      console.error('SOS error:', error);
      toast.error("Failed to send SOS alert", {
        description: "Please try again or contact support."
      });
    } finally {
      setIsSOSLoading(false);
    }
  };

  const handleEmergencyCall = async () => {
    setIsEmergencyCallLoading(true);
    try {
      const response = await AlertAPI.triggerEmergencyCall({});
      try {
        await sendSosEmail({
          subject: "Emergency Call Initiated",
          message: "A user has requested an emergency call to ambulance services.",
        });
      } catch (e) {
        console.error('EmailJS Emergency send failed:', (e as Error)?.message);
      }

      toast.success("Emergency call initiated!", {
        description: "Ambulance services and contacts have been notified."
      });

      setEmergencyCallDialogOpen(false);
    } catch (error) {
      console.error('Emergency call error:', error);
      toast.error("Failed to initiate emergency call", {
        description: "Please try again or contact support."
      });
    } finally {
      setIsEmergencyCallLoading(false);
    }
  };

  const handleContactAlert = (method: string) => {
    toast.success(`Alert sent via ${method}!`);
  };

  const handleReplayVideo = () => {
    toast.info("Playing incident video...");
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Cards ... */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Alert Management</h1>
          <p className="text-muted-foreground">
            Monitor, review, and manage safety alerts and incidents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
          
          {/* SOS Buttons */}
          <Dialog open={sosDialogOpen} onOpenChange={setSosDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <AlertTriangle className="w-4 h-4" />
                SOS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>🚨 Send SOS Alert</DialogTitle>
                <DialogDescription>
                  This will send an emergency alert to +91 8447879309 and all your contacts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium">
                    ⚠️ This will immediately notify emergency services and all your contacts.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSosDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleSOS}
                  disabled={isSOSLoading}
                >
                  {isSOSLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send SOS Alert'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={emergencyCallDialogOpen} onOpenChange={setEmergencyCallDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Phone className="w-4 h-4" />
                Emergency Call
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>🚑 Emergency Call</DialogTitle>
                <DialogDescription>
                  This will call ambulance services (+91-102) and send alerts to all contacts.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium">
                    🚑 This will call ambulance services and notify all your contacts immediately.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEmergencyCallDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleEmergencyCall}
                  disabled={isEmergencyCallLoading}
                >
                  {isEmergencyCallLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calling...
                    </>
                  ) : (
                    'Call Ambulance'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-destructive">{alerts.filter(a => a.type === 'high' && a.status !== 'resolved').length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Medium Priority</p>
                <p className="text-2xl font-bold text-warning">{alerts.filter(a => a.type === 'medium' && a.status !== 'resolved').length}</p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Priority</p>
                <p className="text-2xl font-bold text-primary">{alerts.filter(a => a.type === 'low' && a.status !== 'resolved').length}</p>
              </div>
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-success">{alerts.filter(a => a.status === 'resolved').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Alert Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert List */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Click on an alert to view details and take action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedAlert.id === alert.id 
                      ? "border-primary bg-accent" 
                      : "border-border hover:bg-accent/50"
                  }`}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getAlertIcon(alert.type)}
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">{alert.location}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(alert.status)}
                      <p className="text-xs text-muted-foreground mt-1">{alert.confidence}% confidence</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alert Details */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getAlertIcon(selectedAlert.type)}
              Alert Details
            </CardTitle>
            <CardDescription>Review incident information and take action</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-lg">{selectedAlert.title}</h4>
                    <p className="text-muted-foreground">{selectedAlert.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Timestamp</p>
                      <p className="text-sm text-muted-foreground">{selectedAlert.timestamp}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{selectedAlert.location}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Confidence</p>
                      <p className="text-sm text-muted-foreground">{selectedAlert.confidence}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      {getStatusBadge(selectedAlert.status)}
                    </div>
                  </div>

                  {/* Notes Section */}
                  {selectedAlert.notes && selectedAlert.notes.length > 0 && (
                    <div className="pt-2">
                      <h4 className="font-medium flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4"/>
                        Notes
                      </h4>
                      <div className="space-y-2">
                        {selectedAlert.notes.map((note, index) => (
                          <div key={index} className="text-sm bg-muted p-3 rounded-md">
                            {note}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </TabsContent>

              <TabsContent value="video" className="space-y-4">
                {selectedAlert.hasVideo ? (
                  <div>
                    <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
                      <div className="text-center text-white">
                        <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="mb-4">Incident Video Replay</p>
                        <Button variant="secondary" onClick={handleReplayVideo}>
                          <Play className="w-4 h-4 mr-2" />
                          Play Incident
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Video captured 30 seconds before and after the incident
                    </p>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Video className="w-16 h-16 mx-auto mb-4 opacity-25" />
                    <p className="text-muted-foreground">No video available for this alert</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="actions" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-3">Emergency Contacts</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="destructive" 
                        className="w-full justify-start"
                        onClick={() => handleContactAlert("Emergency Services")}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Emergency Services
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleContactAlert("Family")}
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Primary Contact
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => handleContactAlert("SMS")}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send SMS Alert
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Alert Management</h4>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleAcknowledge(selectedAlert.id)}
                        disabled={selectedAlert.status === 'acknowledged' || selectedAlert.status === 'resolved'}
                      >
                        Mark as Acknowledged
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => handleResolve(selectedAlert.id)}
                        disabled={selectedAlert.status === 'resolved'}
                      >
                        Mark as Resolved
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="outline" className="w-full">Add Notes</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Note to "{selectedAlert.title}"</DialogTitle>
                            <DialogDescription>
                              Add any relevant information or observations about this alert.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="note" className="text-right">
                                Note
                              </Label>
                              <Textarea
                                id="note"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="col-span-3"
                                placeholder="Type your note here."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button type="button" onClick={handleSaveNote}>Save Note</Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};