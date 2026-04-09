import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { LLMSettings } from '../types';
import { Save, RotateCcw, Key, Cpu, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface LLMSettingsManagerProps {
  settings: LLMSettings;
  onSave: (settings: LLMSettings) => void;
  onReset: () => void;
}

export function LLMSettingsManager({ settings, onSave, onReset }: LLMSettingsManagerProps) {
  const [localSettings, setLocalSettings] = useState<LLMSettings>(settings);

  const handleSave = () => {
    onSave(localSettings);
    toast.success("LLM Settings saved successfully");
  };

  const updatePrompt = (key: keyof LLMSettings['prompts'], value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      prompts: {
        ...prev.prompts,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">LLM Configuration</h2>
          <p className="text-xs opacity-50 font-bold uppercase tracking-widest">Manage models, API keys, and system prompts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onReset} className="uppercase font-black text-[10px]">
            <RotateCcw className="h-3 w-3 mr-2" /> Reset Defaults
          </Button>
          <Button size="sm" onClick={handleSave} className="uppercase font-black text-[10px]">
            <Save className="h-3 w-3 mr-2" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* API & Model Config */}
        <Card className="md:col-span-1 border-2">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
              <Key className="h-4 w-4" /> API & Models
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-50">Gemini API Key</Label>
              <Input 
                type="password" 
                value={localSettings.apiKey} 
                onChange={(e) => setLocalSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter your API key..."
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-50">Flash Model (Speed)</Label>
              <Select 
                value={localSettings.modelFlash} 
                onValueChange={(v) => setLocalSettings(prev => ({ ...prev, modelFlash: v }))}
              >
                <SelectTrigger className="text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (Preview)</SelectItem>
                  <SelectItem value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</SelectItem>
                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase opacity-50">Pro Model (Reasoning)</Label>
              <Select 
                value={localSettings.modelPro} 
                onValueChange={(v) => setLocalSettings(prev => ({ ...prev, modelPro: v }))}
              >
                <SelectTrigger className="text-xs font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-3-flash-preview">Gemini 3 Flash (Preview)</SelectItem>
                  <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash</SelectItem>
                  <SelectItem value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite (Preview)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Config */}
        <Card className="md:col-span-2 border-2">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Prompt Engineering
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase">Customize the instructions for each AI agent</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6">
                {Object.entries(localSettings.prompts).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-[10px] font-black uppercase flex items-center justify-between">
                      <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <Badge variant="outline" className="text-[8px] opacity-50">TEMPLATE</Badge>
                    </Label>
                    <Textarea 
                      value={value} 
                      onChange={(e) => updatePrompt(key as keyof LLMSettings['prompts'], e.target.value)}
                      className="text-xs font-mono min-h-[100px] leading-relaxed"
                    />
                    <p className="text-[9px] opacity-40 font-mono italic">
                      Available variables: {getVariablesForKey(key)}
                    </p>
                    <Separator className="mt-4 opacity-10" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getVariablesForKey(key: string): string {
  switch (key) {
    case 'webSummary': return '{{language}}, {{input}}';
    case 'fdaSummary': return '{{language}}, {{webSummary}}, {{input}}';
    case 'datasetExtraction': return '{{fdaSummary}}';
    case 'reviewReport': return '{{language}}, {{template}}, {{webSummary}}, {{fdaSummary}}, {{dataset}}';
    case 'formQuestions': return '{{dataset}}';
    case 'skillArchitect': return '{{description}}';
    default: return 'None';
  }
}
