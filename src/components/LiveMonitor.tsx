import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Video,
  VideoOff,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Camera,
  Mic,
  MicOff,
} from "lucide-react";
import { toast } from "sonner";

export const LiveMonitor = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState("living-room");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(false);
  const [aiDetections, setAiDetections] = useState([
    { id: 1, type: "safe", activity: "Reading", confidence: 95, zone: { x: 320, y: 240, width: 200, height: 150 } },
    { id: 2, type: "safe", activity: "Sitting", confidence: 88, zone: { x: 100, y: 180, width: 180, height: 200 } },
  ]);

  useEffect(() => {
    if (isStreaming && videoRef.current) {
      // Simulate video stream
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: audioEnabled })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
          toast.error("Unable to access camera. Check permissions.");
        });
    }
  }, [isStreaming, audioEnabled]);

  const toggleStreaming = () => {
    if (isStreaming) {
      // Stop stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsStreaming(false);
      toast.info("Monitoring stopped");
    } else {
      setIsStreaming(true);
      toast.success("Monitoring started");
    }
  };

  const handleEmergencyAlert = () => {
    toast.error("Emergency alert sent to contacts!");
    // Simulate adding a danger detection
    setAiDetections(prev => [...prev, {
      id: Date.now(),
      type: "danger",
      activity: "Fall Detected",
      confidence: 96,
      zone: { x: 200, y: 160, width: 220, height: 180 }
    }]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Live Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time AI-powered activity recognition with safety overlays
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCamera} onValueChange={setSelectedCamera}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="living-room">Living Room Camera</SelectItem>
              <SelectItem value="bedroom">Bedroom Camera</SelectItem>
              <SelectItem value="kitchen">Kitchen Camera</SelectItem>
              <SelectItem value="front-door">Front Door Camera</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant={isStreaming ? "success" : "secondary"}>
            {isStreaming ? "ONLINE" : "OFFLINE"}
          </Badge>
        </div>
      </div>

      {/* Main Video Display */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              {selectedCamera.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
            {/* Video Element */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={!audioEnabled}
              className="w-full h-full object-cover"
            />
            
            {/* AI Detection Overlays */}
            {isStreaming && (
              <div className="absolute inset-0">
                {aiDetections.map((detection) => (
                  <div
                    key={detection.id}
                    className={`absolute border-2 rounded ${
                      detection.type === "safe" 
                        ? "border-success bg-success/10" 
                        : "border-destructive bg-destructive/10"
                    }`}
                    style={{
                      left: `${(detection.zone.x / 640) * 100}%`,
                      top: `${(detection.zone.y / 480) * 100}%`,
                      width: `${(detection.zone.width / 640) * 100}%`,
                      height: `${(detection.zone.height / 480) * 100}%`,
                    }}
                  >
                    <div className={`absolute -top-8 left-0 px-2 py-1 rounded text-xs font-medium ${
                      detection.type === "safe" 
                        ? "bg-success text-success-foreground" 
                        : "bg-destructive text-destructive-foreground"
                    }`}>
                      {detection.activity} ({detection.confidence}%)
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Offline Overlay */}
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <VideoOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">Camera Offline</p>
                  <p className="text-sm opacity-75">Click start to begin monitoring</p>
                </div>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="flex items-center justify-between mt-4 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Button 
                variant={isStreaming ? "destructive" : "success"}
                onClick={toggleStreaming}
              >
                {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isStreaming ? "Stop" : "Start"} Monitoring
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAudioEnabled(!audioEnabled)}
              >
                {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMicEnabled(!micEnabled)}
              >
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
            </div>

            <Button 
              variant="destructive"
              onClick={handleEmergencyAlert}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency Alert
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Live Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <Card className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              Current Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-success">Reading</div>
              <div className="text-sm text-muted-foreground">
                Duration: 23 minutes
              </div>
              <div className="text-sm text-muted-foreground">
                Location: Living Room Sofa
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};