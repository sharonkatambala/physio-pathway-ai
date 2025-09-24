import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Filter, 
  User, 
  Activity, 
  TrendingUp, 
  Video,
  MessageSquare,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  MoreVertical
} from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  startDate: string;
  progress: number;
  painLevel: number;
  lastSession: string;
  status: 'active' | 'pending' | 'completed';
  avatar: string;
  completionRate: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const PatientManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'completed'>('all');
  const [selectedPatient, setSelectedPatient] = useState<string>('');

  const patients: Patient[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      age: 34,
      condition: 'Lower Back Pain',
      startDate: '2024-01-15',
      progress: 85,
      painLevel: 3,
      lastSession: '2 days ago',
      status: 'active',
      avatar: '',
      completionRate: 92,
      riskLevel: 'low'
    },
    {
      id: '2',
      name: 'Michael Chen',
      age: 28,
      condition: 'ACL Rehabilitation',
      startDate: '2024-02-01',
      progress: 65,
      painLevel: 4,
      lastSession: '1 day ago',
      status: 'active',
      avatar: '',
      completionRate: 78,
      riskLevel: 'medium'
    },
    {
      id: '3',
      name: 'Emma Davis',
      age: 45,
      condition: 'Shoulder Impingement',
      startDate: '2024-01-20',
      progress: 40,
      painLevel: 6,
      lastSession: '5 days ago',
      status: 'active',
      avatar: '',
      completionRate: 45,
      riskLevel: 'high'
    },
    {
      id: '4',
      name: 'Robert Wilson',
      age: 52,
      condition: 'Neck Pain',
      startDate: '2023-12-10',
      progress: 95,
      painLevel: 1,
      lastSession: '1 week ago',
      status: 'completed',
      avatar: '',
      completionRate: 96,
      riskLevel: 'low'
    },
    {
      id: '5',
      name: 'Lisa Martinez',
      age: 31,
      condition: 'Post-Surgery Rehab',
      startDate: '2024-02-10',
      progress: 25,
      painLevel: 5,
      lastSession: 'Never',
      status: 'pending',
      avatar: '',
      completionRate: 0,
      riskLevel: 'medium'
    }
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success text-white';
      case 'pending': return 'bg-warning text-white';
      case 'completed': return 'bg-primary text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-success';
      case 'medium': return 'text-warning';
      case 'high': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Patient Management
            </CardTitle>
            <Badge className="bg-primary text-white">
              {filteredPatients.length} Patients
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or condition..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'pending', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status as any)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="shadow-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={patient.avatar} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-lg">{patient.name}</h4>
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {patient.condition} • Age {patient.age} • Started {patient.startDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  {/* Progress Metrics */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-16">
                        <Progress value={patient.progress} className="h-2" />
                      </div>
                      <span className="text-sm font-medium">{patient.progress}%</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Pain Level</p>
                    <p className={`text-lg font-bold ${
                      patient.painLevel <= 3 ? 'text-success' : 
                      patient.painLevel <= 6 ? 'text-warning' : 'text-destructive'
                    }`}>
                      {patient.painLevel}/10
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Compliance</p>
                    <p className="text-lg font-bold text-primary">{patient.completionRate}%</p>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <div className={`flex items-center justify-center space-x-1 ${getRiskColor(patient.riskLevel)}`}>
                      {getRiskIcon(patient.riskLevel)}
                      <span className="text-sm font-medium capitalize">{patient.riskLevel}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Plan
                    </Button>
                    <Button size="sm" variant="outline">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Quick Insights */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground">
                      Last session: <span className="font-medium">{patient.lastSession}</span>
                    </span>
                    {patient.riskLevel === 'high' && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Needs Attention
                      </Badge>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="ghost">
                      <Video className="h-4 w-4 mr-2" />
                      Review Videos
                    </Button>
                    <Button size="sm" variant="ghost">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Progress Report
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="p-8 text-center">
            <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Patients Found</h3>
            <p className="text-muted-foreground">
              No patients match your current search and filter criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PatientManagement;