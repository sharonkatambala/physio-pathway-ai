import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Video, Upload, Camera, CheckCircle, AlertCircle, Play } from 'lucide-react';

interface VideoAssessmentProps {
  onComplete: (videoFile?: File) => void;
}

const VideoAssessment = ({ onComplete }: VideoAssessmentProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedVideo(file);
      
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsAnalyzing(true);
            // Simulate AI analysis
            setTimeout(() => {
              setIsAnalyzing(false);
            }, 3000);
          }, 500);
        }
      }, 200);
    }
  };

  const handleContinue = () => {
    onComplete(uploadedVideo || undefined);
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-6 w-6 text-primary" />
          Video Assessment (Optional)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center mx-auto">
            <Camera className="h-10 w-10 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload a Video of Your Affected Area</h3>
            <p className="text-muted-foreground">
              Record a short video (10-30 seconds) showing your movement, posture, or the area of concern. 
              This helps our AI provide more accurate assessment.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Good Video Tips:</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Good lighting and clear view</li>
              <li>• Show the affected area clearly</li>
              <li>• Demonstrate the problematic movement</li>
              <li>• Keep video under 30 seconds</li>
            </ul>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Avoid:</span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Poor lighting or blurry videos</li>
              <li>• Very long recordings</li>
              <li>• Forcing painful movements</li>
              <li>• Including personal information</li>
            </ul>
          </div>
        </div>

        {!uploadedVideo ? (
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Drag and drop your video here, or click to browse
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Choose Video File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Play className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="font-medium">{uploadedVideo.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(uploadedVideo.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
              {uploadProgress < 100 && (
                <Badge variant="secondary">Uploading...</Badge>
              )}
              {uploadProgress === 100 && !isAnalyzing && (
                <Badge variant="secondary" className="bg-success/10 text-success">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Uploaded
                </Badge>
              )}
              {isAnalyzing && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Analyzing...
                </Badge>
              )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {isAnalyzing && (
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-primary">AI is analyzing your video...</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip Video Assessment
          </Button>
          <Button 
            onClick={handleContinue} 
            className="flex-1"
            disabled={uploadProgress > 0 && uploadProgress < 100}
          >
            Continue to Questionnaire
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoAssessment;