import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Heart, Wind, Shield, FileText, ClipboardList, AlertTriangle, CheckCircle, Target, UserCheck } from "lucide-react";

interface ExerciseProgramDisplayProps {
  program: string;
}

const ExerciseProgramDisplay = ({ program }: ExerciseProgramDisplayProps) => {
  // Parse the program text into sections
  const sections = program.split(/\*\*(.*?)\*\*/g);
  
  const getSectionIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('warm')) return <Wind className="h-5 w-5" />;
    if (lowerTitle.includes('main')) return <Activity className="h-5 w-5" />;
    if (lowerTitle.includes('cool')) return <Heart className="h-5 w-5" />;
    if (lowerTitle.includes('safety')) return <Shield className="h-5 w-5" />;
    if (lowerTitle.includes('summary') || lowerTitle.includes('finding')) return <FileText className="h-5 w-5" />;
    if (lowerTitle.includes('clinical') || lowerTitle.includes('impression')) return <ClipboardList className="h-5 w-5" />;
    if (lowerTitle.includes('risk') || lowerTitle.includes('flag') || lowerTitle.includes('alert')) return <AlertTriangle className="h-5 w-5" />;
    if (lowerTitle.includes('management') || lowerTitle.includes('plan')) return <CheckCircle className="h-5 w-5" />;
    if (lowerTitle.includes('progress') || lowerTitle.includes('goal')) return <Target className="h-5 w-5" />;
    if (lowerTitle.includes('referral') || lowerTitle.includes('guidance')) return <UserCheck className="h-5 w-5" />;
    return null;
  };

  const getSectionColor = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('warm')) return 'bg-blue-500/10 border-blue-500/20';
    if (lowerTitle.includes('main')) return 'bg-primary/10 border-primary/20';
    if (lowerTitle.includes('cool')) return 'bg-purple-500/10 border-purple-500/20';
    if (lowerTitle.includes('safety')) return 'bg-amber-500/10 border-amber-500/20';
    if (lowerTitle.includes('summary') || lowerTitle.includes('finding')) return 'bg-violet-500/10 border-violet-500/20';
    if (lowerTitle.includes('clinical') || lowerTitle.includes('impression')) return 'bg-indigo-500/10 border-indigo-500/20';
    if (lowerTitle.includes('risk') || lowerTitle.includes('flag') || lowerTitle.includes('alert')) return 'bg-red-500/10 border-red-500/20';
    if (lowerTitle.includes('management') || lowerTitle.includes('plan')) return 'bg-green-500/10 border-green-500/20';
    if (lowerTitle.includes('progress') || lowerTitle.includes('goal')) return 'bg-teal-500/10 border-teal-500/20';
    if (lowerTitle.includes('referral') || lowerTitle.includes('guidance')) return 'bg-cyan-500/10 border-cyan-500/20';
    return 'bg-muted border-border';
  };

  // Split content into structured sections
  const renderContent = () => {
    const lines = program.split('\n');
    let currentSection = '';
    let sections: { title: string; content: string[] }[] = [];
    let currentContent: string[] = [];

    lines.forEach((line) => {
      const boldMatch = line.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        if (currentSection && currentContent.length > 0) {
          sections.push({ title: currentSection, content: currentContent });
          currentContent = [];
        }
        currentSection = boldMatch[1];
      } else if (line.trim() && currentSection) {
        currentContent.push(line);
      }
    });

    if (currentSection && currentContent.length > 0) {
      sections.push({ title: currentSection, content: currentContent });
    }

    return sections.map((section, idx) => (
      <div key={idx} className={`p-6 rounded-lg border ${getSectionColor(section.title)}`}>
        <div className="flex items-center gap-2 mb-4">
          {getSectionIcon(section.title)}
          <h3 className="text-lg font-semibold">{section.title}</h3>
        </div>
        <div className="space-y-3">
          {section.content.map((line, lineIdx) => {
            // Check if it's a list item
            if (line.trim().startsWith('-')) {
              const content = line.trim().substring(1).trim();
              return (
                <div key={lineIdx} className="flex gap-2 text-sm">
                  <span className="text-primary">•</span>
                  <span>{content}</span>
                </div>
              );
            }
            return line.trim() ? (
              <p key={lineIdx} className="text-sm">
                {line}
              </p>
            ) : null;
          })}
        </div>
      </div>
    ));
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Hip Knee Ankle Assessment Report & Exercise Program
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            WHO Guidelines
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">{renderContent()}</div>
      </CardContent>
    </Card>
  );
};

export default ExerciseProgramDisplay;
