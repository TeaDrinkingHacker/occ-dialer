
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const AppearancePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState('basic');

  // Initialize theme from localStorage or default to 'basic'
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') || 'basic';
    setSelectedTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const themes = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Clean and simple interface'
    },
    {
      id: 'dark',
      name: 'Dark',
      description: 'Basic dark theme'
    },
    {
      id: 'occ-basic',
      name: 'OCC Basic',
      description: 'Basic theme with OCC branding'
    },
    {
      id: 'occ-dark',
      name: 'OCC Dark',
      description: 'Dark theme with OCC branding'
    }
  ];

  const applyTheme = (themeId: string) => {
    const html = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    html.classList.remove('dark');
    body.classList.remove('occ-basic-theme', 'occ-dark-theme');
    
    // Apply theme based on selection
    switch (themeId) {
      case 'dark':
        html.classList.add('dark');
        break;
      case 'occ-basic':
        body.classList.add('occ-basic-theme');
        break;
      case 'occ-dark':
        html.classList.add('dark');
        body.classList.add('occ-dark-theme');
        break;
      case 'basic':
      default:
        // Light theme is default, no additional classes needed
        break;
    }
  };

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
    
    // Save theme preference to localStorage
    localStorage.setItem('app-theme', themeId);
    
    console.log('Theme selected:', themeId);
    
    toast({
      title: "Theme Updated",
      description: `Switched to ${themes.find(t => t.id === themeId)?.name} theme`,
    });
  };

  const handleSaveChanges = () => {
    toast({
      title: "Settings Saved",
      description: "Your appearance preferences have been saved.",
    });
    
    // Navigate to admin dashboard if user is admin, otherwise to main dashboard
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleCancel = () => {
    // Navigate to admin dashboard if user is admin, otherwise to main dashboard
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Appearance Settings</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-2">Choose Your Theme</h2>
          <p className="text-muted-foreground mb-6">
            Select a theme that matches your preference. Changes will be applied immediately.
          </p>

          <RadioGroup value={selectedTheme} onValueChange={handleThemeSelect}>
            <div className="space-y-3">
              {themes.map((theme) => (
                <Card key={theme.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value={theme.id} id={theme.id} />
                      <Label htmlFor={theme.id} className="cursor-pointer flex-1">
                        <div>
                          <div className="font-medium text-lg">{theme.name}</div>
                          <div className="text-sm text-muted-foreground">{theme.description}</div>
                        </div>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppearancePage;
