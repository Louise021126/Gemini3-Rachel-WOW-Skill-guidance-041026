
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Entity } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Download, Save, HelpCircle, AlertTriangle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Textarea } from './ui/textarea';

interface SubmissionFormProps {
  dataset: Entity[];
  questions: string[];
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ dataset, questions }) => {
  const [entities, setEntities] = useState<Entity[]>(dataset);

  useEffect(() => {
    setEntities(dataset);
  }, [dataset]);

  const handleUpdate = (id: string, value: string) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, value } : e));
  };

  const downloadDataset = () => {
    const blob = new Blob([JSON.stringify(entities, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'edited_dataset.json';
    a.click();
  };

  const categories = ['Administrative', 'Regulatory', 'Technical', 'Clinical'];

  return (
    <TooltipProvider>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Interactive 510(k) Submission Form</h2>
            <p className="text-sm opacity-50">Verify and edit the 50 extracted entities before final submission.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadDataset}>
              <Download className="h-4 w-4 mr-2" /> Download JSON
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {categories.map(cat => (
              <Card key={cat} className="border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold uppercase">{cat} Data</CardTitle>
                    <Badge>{entities.filter(e => e.category === cat).length} Entities</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {entities.filter(e => e.category === cat).map((entity, idx) => (
                    <div key={`entity-${entity.id}-${idx}`} className="space-y-2 group">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                          {entity.name}
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3 w-3 opacity-30" />
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p className="text-[10px] w-48">{entity.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input 
                        value={entity.value}
                        onChange={(e) => handleUpdate(entity.id, e.target.value)}
                        className="h-9 text-sm font-medium"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
              <CardHeader>
                <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Red Team Follow-up
                </CardTitle>
                <CardDescription className="text-amber-700/70 dark:text-amber-500/70">
                  20 critical questions to address before FDA submission.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <Accordion className="w-full">
                    {questions.map((q, i) => (
                      <AccordionItem key={`question-${i}`} value={`item-${i}`}>
                        <AccordionTrigger className="text-xs font-bold text-left hover:no-underline">
                          Q{i+1}: {q.substring(0, 50)}...
                        </AccordionTrigger>
                        <AccordionContent className="text-xs leading-relaxed opacity-80">
                          {q}
                          <div className="mt-4">
                            <Textarea placeholder="Enter response for internal audit..." className="text-[10px] min-h-[60px]" />
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
