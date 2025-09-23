import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, Briefcase, Calendar, FileText, ArrowRight } from 'lucide-react';

interface HealthData {
  age: string;
  sex: string;
  occupation: string;
  diagnosis: string;
  problemDescription: string;
}

interface HealthInputFormProps {
  onSubmit: (data: HealthData) => void;
}

const HealthInputForm = ({ onSubmit }: HealthInputFormProps) => {
  const [formData, setFormData] = useState<HealthData>({
    age: '',
    sex: '',
    occupation: '',
    diagnosis: '',
    problemDescription: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof HealthData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Tell Us About Your Health Problem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Age
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="Enter your age"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select value={formData.sex} onValueChange={(value) => updateField('sex', value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Occupation
              </Label>
              <Input
                id="occupation"
                placeholder="Your occupation"
                value={formData.occupation}
                onChange={(e) => updateField('occupation', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diagnosis" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Medical Diagnosis (Optional)
            </Label>
            <Input
              id="diagnosis"
              placeholder="Enter your medical diagnosis if available"
              value={formData.diagnosis}
              onChange={(e) => updateField('diagnosis', e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              If you don't have a formal diagnosis, leave this blank and describe your problem below.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Describe Your Problem
            </Label>
            <Textarea
              id="problem"
              placeholder="Tell us about your symptoms, pain, limitations, when it started, what makes it better or worse..."
              value={formData.problemDescription}
              onChange={(e) => updateField('problemDescription', e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <Badge variant="secondary" className="mb-2">
              AI Assessment Preview
            </Badge>
            <p className="text-sm text-muted-foreground">
              Our AI will analyze your information to provide a preliminary assessment and recommend appropriate tests or exercises.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Continue to Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default HealthInputForm;