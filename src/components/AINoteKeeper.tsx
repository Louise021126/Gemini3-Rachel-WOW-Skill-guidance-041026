
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Sparkles, Highlighter, ListChecks, FileType, Trash2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { toast } from 'sonner';
import { LLMSettings } from '../types';

interface AINoteKeeperProps {
  settings: LLMSettings;
}

export const AINoteKeeper: React.FC<AINoteKeeperProps> = ({ settings }) => {
  const [notes, setNotes] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const applyMagic = async (type: 'coralize' | 'summarize' | 'formalize') => {
    if (!notes) return;
    if (!settings.apiKey) {
      toast.error('Please provide a Gemini API Key in the Settings tab.');
      return;
    }

    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: settings.apiKey });
      const prompt = type === 'coralize' 
        ? settings.prompts.noteCoralize
        : type === 'summarize'
        ? settings.prompts.noteSummarize
        : settings.prompts.noteFormalize;

      const response = await (ai as any).models.generateContent({
        model: settings.modelFlash,
        contents: `${prompt}\n\nText:\n${notes}`,
      });

      setNotes(response.text || notes);
      toast.success(`AI Magic: ${type} applied!`);
    } catch (error) {
      console.error(error);
      toast.error('AI Magic failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">AI Note Keeper</h2>
          <p className="text-sm opacity-50">Collaborative workspace with regulatory intelligence.</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => applyMagic('coralize')}
            disabled={isProcessing}
          >
            <Highlighter className="h-4 w-4 mr-2" /> Coralize
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => applyMagic('summarize')}
            disabled={isProcessing}
          >
            <ListChecks className="h-4 w-4 mr-2" /> Summarize
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => applyMagic('formalize')}
            disabled={isProcessing}
          >
            <FileType className="h-4 w-4 mr-2" /> Formalize
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={() => setNotes('')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="min-h-[600px] flex flex-col">
        <CardContent className="flex-1 p-0">
          <Textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Start typing your regulatory notes here... Use AI Magic to transform them."
            className="flex-1 min-h-[600px] border-none focus-visible:ring-0 resize-none p-8 font-serif text-lg leading-relaxed"
          />
        </CardContent>
      </Card>
      
      {isProcessing && (
        <div className="fixed bottom-8 right-8">
          <Card className="p-4 flex items-center gap-3 shadow-2xl animate-bounce">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-sm font-bold">AI is working its magic...</span>
          </Card>
        </div>
      )}
    </div>
  );
};
