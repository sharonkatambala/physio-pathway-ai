import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Type, Languages, RotateCcw, Minus, Plus, Settings as SettingsIcon } from 'lucide-react';
import { useSettings, FONT_BOUNDS } from '@/contexts/SettingsContext';
import { useLanguage } from '@/contexts/LanguageContext';

const SettingsPage = () => {
  const { theme, setTheme, fontScale, increaseFont, decreaseFont, resetFont } = useSettings();
  const { language, setLanguage, t } = useLanguage();

  const themeOptions = [
    { value: 'light' as const, label: t('settings.light'), icon: Sun },
    { value: 'dark' as const, label: t('settings.dark'), icon: Moon },
  ];

  const languageOptions = [
    { value: 'en' as const, label: 'English' },
    { value: 'sw' as const, label: 'Kiswahili' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('settings.title')}</h1>
            <p className="text-muted-foreground">{t('settings.subtitle')}</p>
          </div>
        </div>

        {/* Appearance */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sun className="h-5 w-5 text-primary" />
              {t('settings.appearance')}
            </CardTitle>
            <CardDescription>{t('settings.appearanceDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  aria-pressed={theme === value}
                  className={`flex items-center justify-center gap-2 h-12 rounded-xl border text-sm font-semibold transition-colors ${
                    theme === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Text size */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Type className="h-5 w-5 text-primary" />
              {t('settings.textSize')}
            </CardTitle>
            <CardDescription>{t('settings.textSizeDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseFont}
                disabled={fontScale <= FONT_BOUNDS.min}
                aria-label={t('settings.decrease')}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <div className="flex-1 text-center">
                <span className="text-2xl font-bold text-foreground">{fontScale}%</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={increaseFont}
                disabled={fontScale >= FONT_BOUNDS.max}
                aria-label={t('settings.increase')}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={resetFont} className="gap-1.5">
                <RotateCcw className="h-3.5 w-3.5" />
                {t('settings.reset')}
              </Button>
            </div>
            <div className="rounded-xl border border-border bg-muted/40 p-4">
              <p className="text-foreground">{t('settings.preview')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Language */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Languages className="h-5 w-5 text-primary" />
              {t('settings.language')}
            </CardTitle>
            <CardDescription>{t('settings.languageDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {languageOptions.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLanguage(value)}
                  aria-pressed={language === value}
                  className={`flex items-center justify-center gap-2 h-12 rounded-xl border text-sm font-semibold transition-colors ${
                    language === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
