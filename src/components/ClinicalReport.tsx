import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Dumbbell,
  FileText,
  ListChecks,
  Repeat,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Target,
} from 'lucide-react';

/**
 * A polished, print-friendly clinical report view shared by the full-report
 * page and (in a compact form) the programs list. It expects the `program`
 * JSON produced by the exercise-program generator:
 *   { title, description, phase, weekly_target, notes,
 *     report: { summary, findings[], recommendations[] },
 *     exercises[], schedule: { early, intermediate, advanced } }
 */

type Exercise = {
  name?: string;
  description?: string;
  phase?: string;
  difficulty?: string;
  duration?: string;
  frequency?: string;
  target_area?: string;
  equipment?: string;
  instructions?: string[];
  precautions?: string[];
};

interface ClinicalReportProps {
  program: any;
  createdAt?: string | null;
  source?: string | null;
}

const Stat = ({ icon: Icon, label, value }: { icon: typeof Target; label: string; value: string }) => (
  <div className="flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 backdrop-blur-sm">
    <Icon className="h-4 w-4 shrink-0 text-white/90" />
    <div className="leading-tight">
      <p className="text-[11px] uppercase tracking-wide text-white/70">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  </div>
);

const ExerciseMeta = ({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
};

const ClinicalReport = ({ program, createdAt, source }: ClinicalReportProps) => {
  const report = program?.report || {};
  const exercises: Exercise[] = Array.isArray(program?.exercises) ? program.exercises : [];
  const schedule = program?.schedule || {};
  const findings: string[] = Array.isArray(report.findings) ? report.findings : [];
  const recommendations: string[] = Array.isArray(report.recommendations) ? report.recommendations : [];

  const phase = program?.phase || schedule?.current_phase;
  const phases = [
    { key: 'early', label: 'Early', data: schedule.early },
    { key: 'intermediate', label: 'Intermediate', data: schedule.intermediate },
    { key: 'advanced', label: 'Advanced', data: schedule.advanced },
  ].filter((p) => p.data);

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <Card className="overflow-hidden border-0 shadow-card">
        <div className="bg-gradient-hero p-6 sm:p-8 text-primary-foreground">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
                  {program?.title || 'Clinical Assessment Report'}
                </h1>
                <p className="mt-1 max-w-prose text-sm text-white/85">
                  {program?.description || 'Your personalized assessment and exercise program.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
              {source && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  {source === 'ai' ? 'AI Generated' : source}
                </span>
              )}
              {createdAt && (
                <span className="inline-flex items-center gap-1.5 text-xs text-white/80">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {phase && <Stat icon={Stethoscope} label="Phase" value={String(phase)} />}
            {program?.weekly_target && (
              <Stat icon={Repeat} label="Weekly target" value={`${program.weekly_target} sessions`} />
            )}
            {exercises.length > 0 && (
              <Stat icon={Dumbbell} label="Exercises" value={`${exercises.length}`} />
            )}
            {findings.length > 0 && (
              <Stat icon={ListChecks} label="Key findings" value={`${findings.length}`} />
            )}
          </div>
        </div>
      </Card>

      {/* Clinical summary */}
      {report.summary && (
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Clinical Summary</h2>
            </div>
            <p className="rounded-lg border-l-4 border-primary bg-primary/5 p-4 text-[15px] leading-relaxed text-foreground/90">
              {report.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Findings + Recommendations */}
      {(findings.length > 0 || recommendations.length > 0) && (
        <div className="grid gap-6 md:grid-cols-2">
          {findings.length > 0 && (
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/15">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  </span>
                  <h2 className="text-base font-semibold text-foreground">Key Findings</h2>
                </div>
                <ul className="space-y-3">
                  {findings.map((finding, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-warning/15 text-[11px] font-semibold text-warning">
                        {idx + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-foreground/90">{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {recommendations.length > 0 && (
            <Card className="shadow-card">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </span>
                  <h2 className="text-base font-semibold text-foreground">Recommendations</h2>
                </div>
                <ul className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span className="text-sm leading-relaxed text-foreground/90">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Exercise program */}
      {exercises.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="mb-1 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Exercise Program</h2>
            </div>
            <p className="mb-5 text-sm text-muted-foreground">
              {exercises.length} exercise{exercises.length === 1 ? '' : 's'} tailored to your condition.
            </p>

            <div className="space-y-4">
              {exercises.map((ex, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground">{ex.name}</h3>
                        {(ex.target_area || ex.difficulty || ex.phase) && (
                          <p className="text-xs text-muted-foreground">
                            {[ex.target_area, ex.difficulty || ex.phase].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ex.phase && <Badge variant="outline">{ex.phase}</Badge>}
                      {ex.difficulty && <Badge>{ex.difficulty}</Badge>}
                    </div>
                  </div>

                  {ex.description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ex.description}</p>
                  )}

                  {(ex.duration || ex.frequency || ex.target_area || ex.equipment) && (
                    <div className="mt-4 grid grid-cols-1 gap-2 rounded-lg bg-muted/40 p-3 sm:grid-cols-2">
                      <ExerciseMeta icon={Clock} label="Duration" value={ex.duration} />
                      <ExerciseMeta icon={Repeat} label="Frequency" value={ex.frequency} />
                      <ExerciseMeta icon={Target} label="Target" value={ex.target_area} />
                      <ExerciseMeta icon={Dumbbell} label="Equipment" value={ex.equipment} />
                    </div>
                  )}

                  {Array.isArray(ex.instructions) && ex.instructions.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium text-foreground">How to perform</p>
                      <ol className="space-y-2">
                        {ex.instructions.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {Array.isArray(ex.precautions) && ex.precautions.length > 0 && (
                    <div className="mt-4 rounded-lg border border-warning/30 bg-warning/10 p-3">
                      <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <ShieldAlert className="h-4 w-4 text-warning" />
                        Precautions
                      </p>
                      <ul className="space-y-1">
                        {ex.precautions.map((p, i) => (
                          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule / phases */}
      {phases.length > 0 && (
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Rehabilitation Phases</h2>
            </div>
            <div className="space-y-4">
              {phases.map((p, idx) => (
                <div key={p.key} className="relative flex gap-4 pl-2">
                  <div className="flex flex-col items-center">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {idx + 1}
                    </span>
                    {idx < phases.length - 1 && <span className="mt-1 w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-2">
                    <p className="font-semibold text-foreground">{p.label} Phase</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {p.data.summary || p.data.description || ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {program?.notes && (
        <Card className="shadow-card">
          <CardContent className="p-6">
            <h2 className="mb-2 text-base font-semibold text-foreground">Additional Notes</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{program.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClinicalReport;
