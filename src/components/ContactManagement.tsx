import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Phone,
  Mail,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Heart,
  Home,
  AlertTriangle,
  MessageSquare,
  Video,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { ContactAPI } from "@/lib/api";

interface Contact {
  _id: string;
  contactType: string;
  firstName: string;
  lastName: string;
  relationship: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  isActive: boolean;
  alertTypes: string[];
  emergencyResponse?: {
    canRespond: boolean;
    responseTime: number;
  };
}

export const ContactManagement = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newContact, setNewContact] = useState({
    contactType: "",
    firstName: "",
    lastName: "",
    relationship: "",
    email: "",
    phone: "",
    isPrimary: false,
  });

  // Load contacts on component mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const response = await ContactAPI.getContacts();
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Failed to load contacts:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (contactType: string, isPrimary: boolean) => {
    const getVariant = () => {
      if (isPrimary) return "default";
      switch (contactType) {
        case "emergency_contact":
          return "destructive";
        case "family_member":
          return "secondary";
        case "healthcare_provider":
          return "outline";
        default:
          return "outline";
      }
    };

    const getLabel = () => {
      switch (contactType) {
        case "family_member":
          return "Family Member";
        case "caregiver":
          return "Caregiver";
        case "emergency_contact":
          return "Emergency Contact";
        case "healthcare_provider":
          return "Healthcare Provider";
        case "neighbor":
          return "Neighbor";
        default:
          return contactType;
      }
    };

    return <Badge variant={getVariant()}>{getLabel()}</Badge>;
  };

  const getRoleIcon = (contactType: string) => {
    switch (contactType) {
      case "caregiver":
        return <Heart className="w-5 h-5 text-primary" />;
      case "healthcare_provider":
        return <Shield className="w-5 h-5 text-success" />;
      case "emergency_contact":
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case "family_member":
        return <Users className="w-5 h-5 text-primary" />;
      case "neighbor":
        return <Home className="w-5 h-5 text-muted-foreground" />;
      default:
        return <Users className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const handleAddContact = async () => {
    if (!newContact.firstName || !newContact.lastName || !newContact.relationship || !newContact.email || !newContact.phone || !newContact.contactType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await ContactAPI.createContact(newContact);
      setContacts([...contacts, response.data.contact]);
      setNewContact({
        contactType: "",
        firstName: "",
        lastName: "",
        relationship: "",
        email: "",
        phone: "",
        isPrimary: false,
      });
      setIsAddDialogOpen(false);
      toast.success("Contact added successfully!");
    } catch (error) {
      console.error('Failed to add contact:', error);
      toast.error('Failed to add contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestAlert = (contact: Contact) => {
    toast.info(`Test alert sent to ${contact.firstName} ${contact.lastName}`);
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await ContactAPI.deleteContact(contactId);
      setContacts(contacts.filter(c => c._id !== contactId));
      toast.success("Contact removed");
    } catch (error) {
      console.error('Failed to delete contact:', error);
      toast.error('Failed to delete contact');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading contacts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Contact Management</h1>
          <p className="text-muted-foreground">
            Manage emergency contacts, caregivers, and notification preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <UserPlus className="w-4 h-4" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
                <DialogDescription>
                  Add a new emergency contact or caregiver to your network
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={newContact.firstName}
                      onChange={(e) => setNewContact({...newContact, firstName: e.target.value})}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={newContact.lastName}
                      onChange={(e) => setNewContact({...newContact, lastName: e.target.value})}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="relationship">Relationship *</Label>
                  <Input
                    id="relationship"
                    value={newContact.relationship}
                    onChange={(e) => setNewContact({...newContact, relationship: e.target.value})}
                    placeholder="e.g., Daughter, Brother"
                  />
                </div>

                <div>
                  <Label htmlFor="contactType">Contact Type *</Label>
                  <Select onValueChange={(value) => setNewContact({...newContact, contactType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family_member">Family Member</SelectItem>
                      <SelectItem value="caregiver">Caregiver</SelectItem>
                      <SelectItem value="emergency_contact">Emergency Contact</SelectItem>
                      <SelectItem value="healthcare_provider">Healthcare Provider</SelectItem>
                      <SelectItem value="neighbor">Neighbor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({...newContact, email: e.target.value})}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={newContact.isPrimary}
                    onChange={(e) => setNewContact({...newContact, isPrimary: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="isPrimary">Set as primary contact</Label>
                </div>

                <Button 
                  onClick={handleAddContact} 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    'Add Contact'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Contact Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-bold">{contacts.length}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emergency Contacts</p>
                <p className="text-2xl font-bold text-destructive">
                  {contacts.filter(c => c.contactType === "emergency_contact").length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Caregivers</p>
                <p className="text-2xl font-bold text-primary">
                  {contacts.filter(c => c.contactType === "caregiver" || c.contactType === "healthcare_provider").length}
                </p>
              </div>
              <Heart className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Contacts</p>
                <p className="text-2xl font-bold text-success">
                  {contacts.filter(c => c.isActive).length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contacts">Contact List</TabsTrigger>
          <TabsTrigger value="escalation">Alert Escalation</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-6">
          {contacts.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No contacts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first emergency contact to get started
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Contact
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {contacts.map((contact) => (
                <Card key={contact._id} className="shadow-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getRoleIcon(contact.contactType)}
                        <div>
                          <CardTitle className="text-lg">{contact.firstName} {contact.lastName}</CardTitle>
                          <CardDescription>{contact.relationship}</CardDescription>
                        </div>
                      </div>
                      {getRoleBadge(contact.contactType, contact.isPrimary)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{contact.phone}</span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{contact.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Response Time:</span>
                      <span className="font-medium">
                        {contact.emergencyResponse?.responseTime ? `${contact.emergencyResponse.responseTime} min` : 'Unknown'}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleTestAlert(contact)}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Text
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteContact(contact._id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="escalation" className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Alert Escalation Matrix</CardTitle>
              <CardDescription>
                Configure how alerts are escalated based on response times and severity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <h4 className="font-medium text-destructive mb-3">Critical Emergency (Fall, Medical Emergency)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Step 1 (Immediate):</span>
                      <span>Emergency Services + Primary Caregiver</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Step 2 (If no response in 2 min):</span>
                      <span>All High Priority Contacts</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                  <h4 className="font-medium text-warning mb-3">High Priority (Prolonged Inactivity)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Step 1 (Immediate):</span>
                      <span>Primary Caregiver</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Step 2 (If no response in 10 min):</span>
                      <span>Emergency Contacts</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <h4 className="font-medium text-primary mb-3">Medium Priority (Wellness Alerts)</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Step 1 (Immediate):</span>
                      <span>Primary Caregiver (Non-urgent notification)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Step 2 (If no response in 30 min):</span>
                      <span>Follow-up notification</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Quick Communications
                </CardTitle>
                <CardDescription>Send updates to your care network</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="hero" className="w-full justify-start gap-3">
                  <CheckCircle className="w-5 h-5" />
                  Send "All Good" Update
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Heart className="w-5 h-5" />
                  Share Wellness Report
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Video className="w-5 h-5" />
                  Start Video Call
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <AlertTriangle className="w-5 h-5" />
                  Request Check-in
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recent Communications</CardTitle>
                <CardDescription>Latest messages and interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="font-medium">Sarah Johnson</span>
                      <span className="text-xs text-muted-foreground">2 hours ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Received "All Good" update
                    </p>
                  </div>

                  <div className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Video className="w-4 h-4 text-primary" />
                      <span className="font-medium">Dr. Michael Chen</span>
                      <span className="text-xs text-muted-foreground">Yesterday</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Video consultation completed
                    </p>
                  </div>

                  <div className="p-3 bg-accent rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <span className="font-medium">Robert Smith</span>
                      <span className="text-xs text-muted-foreground">2 days ago</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Responded to wellness check
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};