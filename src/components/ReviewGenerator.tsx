
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, FileText, Database, ClipboardCheck, Code, Download, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { runSequentialReview } from '../lib/gemini';
import { ReviewResults } from '../types';
import { toast } from 'sonner';

interface ReviewGeneratorProps {
  onResults: (results: ReviewResults) => void;
  onAgentPulse: (step: number) => void;
}

export const ReviewGenerator: React.FC<ReviewGeneratorProps> = ({ onResults, onAgentPulse }) => {
  const [input, setInput] = useState('');
  const [template, setTemplate] = useState('');
  const [language, setLanguage] = useState<'Traditional Chinese' | 'English'>('Traditional Chinese');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepMessage, setStepMessage] = useState('');
  const [results, setResults] = useState<ReviewResults | null>(null);

  const handleGenerate = async () => {
    if (!input) {
      toast.error('Please provide 510(k) input data.');
      return;
    }

    setIsGenerating(true);
    setCurrentStep(1);
    try {
      const reviewResults = await runSequentialReview(
        input,
        template,
        language,
        (step, message) => {
          setCurrentStep(step);
          setStepMessage(message);
          onAgentPulse(step);
        }
      );
      setResults(reviewResults);
      onResults(reviewResults);
      toast.success('Review Generation Complete!');
    } catch (error) {
      console.error(error);
      toast.error('Generation failed. Please check your API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadMarkdown = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const steps = [
    { id: 1, name: 'Web Summary', icon: Search },
    { id: 2, name: '510(k) Summary', icon: FileText },
    { id: 3, name: 'Dataset', icon: Database },
    { id: 4, name: 'Review Report', icon: ClipboardCheck },
    { id: 5, name: 'Skill.md', icon: Code },
  ];

  return (
    <div className="space-y-8">
      {!results && !isGenerating && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <Label className="text-sm font-bold uppercase tracking-wider">1. Submission Data / Guidance</Label>
            <Textarea 
              placeholder="Paste 510(k) submission summary, review notes, or guidance here..."
              className="min-h-[300px] font-mono text-sm leading-relaxed"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-bold uppercase tracking-wider">2. Review Template (Optional)</Label>
              <Textarea 
                placeholder="Paste custom report template or leave blank for default..."
                className="min-h-[150px] font-mono text-sm"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
              />
            </div>
            <div className="space-y-4">
              <Label className="text-sm font-bold uppercase tracking-wider">3. Output Language</Label>
              <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Traditional Chinese">Traditional Chinese (Default)</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="w-full h-16 text-lg font-black uppercase tracking-widest"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              <Sparkles className="mr-2 h-6 w-6" />
              Initialize 35-Agent Review
            </Button>
          </div>
        </motion.div>
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-20 space-y-8">
          <div className="relative">
            <Loader2 className="h-24 w-24 animate-spin text-primary opacity-20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-black">{currentStep}/5</span>
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-tighter">{stepMessage}</h2>
            <p className="text-sm opacity-50">Orchestrating specialized squads for regulatory precision...</p>
          </div>
          <div className="flex gap-4">
            {steps.map(step => (
              <div 
                key={step.id}
                className={`flex flex-col items-center gap-2 transition-opacity duration-500 ${currentStep >= step.id ? 'opacity-100' : 'opacity-20'}`}
              >
                <div className={`p-3 rounded-full ${currentStep === step.id ? 'bg-primary text-primary-foreground animate-pulse' : 'bg-slate-200'}`}>
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="text-[10px] font-bold uppercase">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {results && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Review Generation Results</h2>
            <Button variant="outline" onClick={() => setResults(null)}>New Review</Button>
          </div>

          <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid grid-cols-5 w-full h-12">
              <TabsTrigger value="web">Web Summary</TabsTrigger>
              <TabsTrigger value="summary">510(k) Summary</TabsTrigger>
              <TabsTrigger value="dataset">Dataset (JSON)</TabsTrigger>
              <TabsTrigger value="report">Final Report</TabsTrigger>
              <TabsTrigger value="skill">Skill.md</TabsTrigger>
            </TabsList>

            <TabsContent value="web" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>FDA Guidance & Predicate Trends</CardTitle>
                    <CardDescription>2000-3000 words based on real-time web search</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => downloadMarkdown(results.webSummary, 'web_summary.md')}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-slate max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{results.webSummary}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Comprehensive 510(k) Summary</CardTitle>
                    <CardDescription>3000-4000 words technical synthesis</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => downloadMarkdown(results.fdaSummary, '510k_summary.md')}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-slate max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{results.fdaSummary}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dataset" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Extracted Dataset (50 Entities)</CardTitle>
                    <CardDescription>Structured JSON for submission form</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => {
                    const blob = new Blob([JSON.stringify(results.dataset, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'dataset.json';
                    a.click();
                  }}>
                    <Download className="h-4 w-4 mr-2" /> Download JSON
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    <pre className="p-4 bg-slate-950 text-green-400 rounded-lg text-xs font-mono overflow-auto">
                      {JSON.stringify(results.dataset, null, 2)}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="report" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Final 510(k) Review Report</CardTitle>
                    <CardDescription>3000-4000 words with tables, checklist, and 20 follow-up questions</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => downloadMarkdown(results.report, 'final_report.md')}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-slate max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{results.report}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skill" className="mt-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Skill.md (Reusable Logic)</CardTitle>
                    <CardDescription>Standardized review skill with 3 WOW features</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => downloadMarkdown(results.skillMd, 'skill.md')}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="prose prose-slate max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{results.skillMd}</ReactMarkdown>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
};
