import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Heart,
  Activity,
  Clock,
  Calendar,
  Pill,
  Utensils,
  Droplets,
  Moon,
  Smile,
  Frown,
  Meh,
  CheckCircle,
  Plus,
  TrendingUp,
  BarChart3,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

const wellnessMetrics = [
  { name: "Sleep Quality", value: 85, trend: "+5%", icon: Moon, color: "text-primary" },
  { name: "Medication Adherence", value: 95, trend: "+1%", icon: Pill, color: "text-warning" },
];

const initialSchedule = [
  { time: "08:00", task: "Morning Medication", status: "completed", type: "medication" },
  { time: "09:00", task: "Breakfast", status: "completed", type: "meal" },
  { time: "13:00", task: "Lunch", status: "pending", type: "meal" },
  { time: "15:00", task: "Afternoon Walk", status: "pending", type: "exercise" },
  { time: "18:00", task: "Evening Medication", status: "pending", type: "medication" },
];

export const WellnessTracking = () => {
  const [moodEntry, setMoodEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState<"happy" | "neutral" | "sad" | null>(null);
  const [todaySchedule, setTodaySchedule] = useState(initialSchedule);


  // State for the Set Reminder dialog
  const [reminderTitle, setReminderTitle] = useState("");
  const [reminderType, setReminderType] = useState("");
  const [reminderTime, setReminderTime] = useState("");

  const handleMoodSubmit = () => {
    if (selectedMood) {
      toast.success("Mood entry saved!");
      setMoodEntry("");
      setSelectedMood(null);
    } else {
      toast.error("Please select a mood first");
    }
  };

  const handleSetReminder = () => {
    if (!reminderTitle || !reminderType || !reminderTime) {
        toast.error("Please fill out all reminder fields.");
        return;
    }
    toast.success("Reminder Set!", {
        description: `You will be reminded to "${reminderTitle}" at ${reminderTime}.`,
    });
    // Reset form
    setReminderTitle("");
    setReminderType("");
    setReminderTime("");
  };

  const handleTaskComplete = (taskIndex: number) => {
    const newSchedule = [...todaySchedule];
    const task = newSchedule[taskIndex];
    if (task) {
      task.status = "completed";
      setTodaySchedule(newSchedule);
      toast.success(`Task "${task.task}" marked as completed!`);
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case "medication":
        return <Pill className="w-4 h-4" />;
      case "meal":
        return <Utensils className="w-4 h-4" />;
      case "exercise":
        return <Activity className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wellness Tracking</h1>
          <p className="text-muted-foreground">
            Monitor health metrics, routines, and overall well-being
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <Bell className="w-4 h-4" />
                Set Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set a New Wellness Reminder</DialogTitle>
                <DialogDescription>
                  Create a reminder for medication, appointments, or other activities.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input id="title" value={reminderTitle} onChange={(e) => setReminderTitle(e.target.value)} className="col-span-3" placeholder="e.g., Take morning pills" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type</Label>
                  <Select onValueChange={setReminderType}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a reminder type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medication">Medication</SelectItem>
                      <SelectItem value="appointment">Appointment</SelectItem>
                      <SelectItem value="exercise">Exercise</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">Time</Label>
                  <Input id="time" type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" onClick={handleSetReminder}>Save Reminder</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                View Reports
              </Button>
            </DialogTrigger>
             <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Weekly Wellness Report</DialogTitle>
                  <DialogDescription>
                    A summary of wellness metrics from the last 7 days.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                        <p className="font-medium">Overall Wellness Score</p>
                        <p className="font-bold text-lg text-success">92%</p>
                    </div>
                     <div className="flex items-center justify-between">
                        <p className="font-medium">Sleep Consistency</p>
                        <p className="font-bold text-lg text-primary">89%</p>
                    </div>
                     <div className="flex items-center justify-between">
                        <p className="font-medium">Medication Adherence</p>
                        <p className="font-bold text-lg text-success">95%</p>
                    </div>
                     <div className="flex items-center justify-between">
                        <p className="font-medium">Average Daily Steps</p>
                        <p className="font-bold text-lg text-primary">5,430</p>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Wellness Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {wellnessMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="shadow-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${metric.color}`} />
                  <Badge 
                    variant={metric.trend.startsWith("+") ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {metric.trend}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{metric.value}%</p>
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="mood">Mood Journal</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Summary */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Today's Summary
                </CardTitle>
                <CardDescription>Overview of today's wellness activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-accent rounded-lg">
                    <div className="text-2xl font-bold text-success">3/5</div>
                    <p className="text-sm text-muted-foreground">Tasks Complete</p>
                  </div>
                  <div className="text-center p-4 bg-accent rounded-lg">
                    <div className="text-2xl font-bold text-primary">8.5</div>
                    <p className="text-sm text-muted-foreground">Hours Sleep</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Check-in */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Quick Check-in
                </CardTitle>
                <CardDescription>How are you feeling today?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center gap-4">
                  <Button
                    variant={selectedMood === "happy" ? "default" : "outline"}
                    size="lg"
                    className="flex-col gap-2 h-20 w-20"
                    onClick={() => setSelectedMood("happy")}
                  >
                    <Smile className="w-8 h-8" />
                    <span className="text-xs">Great</span>
                  </Button>
                  <Button
                    variant={selectedMood === "neutral" ? "default" : "outline"}
                    size="lg"
                    className="flex-col gap-2 h-20 w-20"
                    onClick={() => setSelectedMood("neutral")}
                  >
                    <Meh className="w-8 h-8" />
                    <span className="text-xs">Okay</span>
                  </Button>
                  <Button
                    variant={selectedMood === "sad" ? "default" : "outline"}
                    size="lg"
                    className="flex-col gap-2 h-20 w-20"
                    onClick={() => setSelectedMood("sad")}
                  >
                    <Frown className="w-8 h-8" />
                    <span className="text-xs">Not Great</span>
                  </Button>
                </div>
                
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={() => toast.success("I'm doing well check-in recorded!")}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I'm Doing Well
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Today's Schedule
              </CardTitle>
              <CardDescription>Your wellness routine for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaySchedule.map((item, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      item.status === "completed" 
                        ? "bg-success/10 border-success/20" 
                        : "bg-accent border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getTaskIcon(item.type)}
                      <div>
                        <p className="font-medium">{item.task}</p>
                        <p className="text-sm text-muted-foreground">{item.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === "completed" ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleTaskComplete(index)}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Mood Journal
              </CardTitle>
              <CardDescription>Track your emotional well-being</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">How are you feeling today?</label>
                  <div className="flex gap-3 mt-2">
                    <Button
                      variant={selectedMood === "happy" ? "default" : "outline"}
                      onClick={() => setSelectedMood("happy")}
                    >
                      <Smile className="w-4 h-4 mr-2" />
                      Happy
                    </Button>
                    <Button
                      variant={selectedMood === "neutral" ? "default" : "outline"}
                      onClick={() => setSelectedMood("neutral")}
                    >
                      <Meh className="w-4 h-4 mr-2" />
                      Neutral
                    </Button>
                    <Button
                      variant={selectedMood === "sad" ? "default" : "outline"}
                      onClick={() => setSelectedMood("sad")}
                    >
                      <Frown className="w-4 h-4 mr-2" />
                      Sad
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Any notes about today?</label>
                  <Textarea
                    placeholder="Share what's on your mind..."
                    value={moodEntry}
                    onChange={(e) => setMoodEntry(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={handleMoodSubmit}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Wellness Insights
              </CardTitle>
              <CardDescription>AI-powered recommendations for better health</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="font-medium text-primary">Sleep Improvement</span>
                  </div>
                  <p className="text-sm">
                    Your sleep quality has improved by 12% this week. Consider maintaining your 
                    current bedtime routine for continued progress.
                  </p>
                </div>

                <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Pill className="w-4 h-4 text-warning" />
                    <span className="font-medium text-warning">Medication Reminder</span>
                  </div>
                  <p className="text-sm">
                    Don't forget your evening medication at 6 PM. Consider setting up automatic 
                    reminders for better adherence.
                  </p>
                </div>

                <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-success" />
                    <span className="font-medium text-success">Exercise Streak</span>
                  </div>
                  <p className="text-sm">
                    Great job! You've maintained daily activity for 7 days. This consistency 
                    is excellent for your overall health.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};