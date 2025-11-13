import Navigation from '@/components/Navigation';

const AssessmentPlaceholder = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Assessment is being updated</h1>
        <p className="text-muted-foreground">
          We’re finalizing the new multi-step assessment experience. This page is temporarily unavailable.
        </p>
      </div>
    </div>
  );
};

export default AssessmentPlaceholder;
