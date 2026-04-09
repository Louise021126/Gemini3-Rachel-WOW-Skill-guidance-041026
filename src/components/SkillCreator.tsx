
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Code, Download, Sparkles, Wand2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const SkillCreator: React.FC = () => {
  const [description, setDescription] = useState('');
  const [skillMd, setSkillMd] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSkill = async () => {
    if (!description) return;
    setIsGenerating(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Act as a Skill Architect. Create a standardized Skill.md file based on the following user description. 
        
        Description: ${description}
        
        Requirements:
        1. Valid YAML frontmatter (name, description).
        2. Detailed markdown instructions.
        3. Add 3 "WOW" AI features that enhance this specific skill (e.g., automated risk scoring, predicate mapping, adversarial red teaming).
        4. Include a section for "Technical Data Models" if applicable.`,
      });

      setSkillMd(response.text || '');
      toast.success('Skill.md Architected Successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Skill generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter">Skill Creator</h2>
          <p className="text-sm opacity-50">Standardize your regulatory logic into reusable AI skills.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Skill Description</CardTitle>
              <CardDescription>Describe the review logic or regulatory task you want to automate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Task Description</Label>
                <Textarea 
                  placeholder="e.g., Create a review process for orthopedic implants focusing on fatigue testing and material biocompatibility..."
                  className="min-h-[200px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={generateSkill}
                disabled={isGenerating || !description}
              >
                {isGenerating ? <Wand2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Architect Skill.md
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Generated Skill.md</CardTitle>
                <CardDescription>Standardized schema with WOW features.</CardDescription>
              </div>
              {skillMd && (
                <Button size="sm" variant="outline" onClick={() => {
                  const blob = new Blob([skillMd], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'skill.md';
                  a.click();
                }}>
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-[500px] border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
                {skillMd ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{skillMd}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full opacity-20">
                    <Code className="h-20 w-20" />
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
