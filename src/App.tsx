
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Card, CardContent } from './components/ui/card';
import { Button } from './components/ui/button';
import { ScrollArea } from './components/ui/scroll-area';
import { Separator } from './components/ui/separator';
import { Badge } from './components/ui/badge';
import { Toaster } from './components/ui/sonner';
import { 
  Palette, 
  Activity, 
  Terminal, 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  FileSearch,
  PenTool,
  Cpu,
  ShieldCheck,
  Globe,
  Database
} from 'lucide-react';
import { ReviewGenerator } from './components/ReviewGenerator';
import { SubmissionForm } from './components/SubmissionForm';
import { AINoteKeeper } from './components/AINoteKeeper';
import { SkillCreator } from './components/SkillCreator';
import { AgentPulseMap } from './components/AgentPulseMap';
import { STYLE_CONFIGS } from './lib/styleEngine';
import { PainterStyle, Agent, ReviewResults } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const INITIAL_AGENTS: Agent[] = [
  // Intake Squad
  { id: 1, name: 'Master Coordinator', role: 'Orchestrator', group: 'Intake', status: 'idle', description: 'Central logic router' },
  { id: 2, name: 'Doc Parser Alpha', role: 'OCR Specialist', group: 'Intake', status: 'idle', description: 'Extracts text from PDFs' },
  { id: 3, name: 'Metadata Extractor', role: 'ID Specialist', group: 'Intake', status: 'idle', description: 'Identifies product codes' },
  { id: 4, name: 'Image Analyzer', role: 'Vision Expert', group: 'Intake', status: 'idle', description: 'Reviews technical diagrams' },
  { id: 5, name: 'Intake Validator', role: 'RTA Specialist', group: 'Intake', status: 'idle', description: 'Simulates FDA RTA checklist' },
  // Technical Squad
  { id: 6, name: 'Software Auditor', role: 'Cybersecurity', group: 'Technical', status: 'idle', description: 'IEC 62304 compliance' },
  { id: 7, name: 'Electrical Safety', role: 'Hardware Expert', group: 'Technical', status: 'idle', description: 'IEC 60601 validation' },
  { id: 8, name: 'Biocompatibility', role: 'Toxicologist', group: 'Technical', status: 'idle', description: 'ISO 10993 evaluation' },
  { id: 9, name: 'Sterilization Pro', role: 'Microbiologist', group: 'Technical', status: 'idle', description: 'Validation protocols' },
  { id: 10, name: 'Clinical Evaluator', role: 'MD Specialist', group: 'Technical', status: 'idle', description: 'Performance data analysis' },
  { id: 11, name: 'Usability Expert', role: 'HFE Specialist', group: 'Technical', status: 'idle', description: 'Human factors engineering' },
  { id: 12, name: 'Risk Analyst', role: 'ISO 14971', group: 'Technical', status: 'idle', description: 'FMEA and hazard analysis' },
  { id: 13, name: 'Labeling Reviewer', role: 'IFU Specialist', group: 'Technical', status: 'idle', description: 'Regulatory labeling compliance' },
  { id: 14, name: 'EMC Specialist', role: 'Radio Expert', group: 'Technical', status: 'idle', description: 'Electromagnetic compatibility' },
  { id: 15, name: 'Mechanical Engineer', role: 'Stress Analyst', group: 'Technical', status: 'idle', description: 'Structural integrity review' },
  // Regulatory Squad
  { id: 16, name: 'Predicate Matcher', role: 'SE Specialist', group: 'Regulatory', status: 'idle', description: 'Substantial equivalence logic' },
  { id: 17, name: 'Guidance Finder', role: 'Policy Expert', group: 'Regulatory', status: 'idle', description: 'Real-time guidance discovery' },
  { id: 18, name: 'MAUDE Scanner', role: 'Safety Data', group: 'Regulatory', status: 'idle', description: 'Predicate safety signals' },
  { id: 19, name: 'Summary Writer', role: 'Technical Writer', group: 'Regulatory', status: 'idle', description: '510(k) summary synthesis' },
  { id: 20, name: 'Citation Wizard', role: 'Legal Specialist', group: 'Regulatory', status: 'idle', description: 'Verifies regulatory citations' },
  { id: 21, name: 'Classification Pro', role: 'Panel Expert', group: 'Regulatory', status: 'idle', description: 'Determines product codes' },
  { id: 22, name: 'Post-Market Analyst', role: 'PMS Specialist', group: 'Regulatory', status: 'idle', description: 'Post-market surveillance' },
  { id: 23, name: 'Clinical Trial Lead', role: 'GCP Specialist', group: 'Regulatory', status: 'idle', description: 'Clinical trial integrity' },
  { id: 24, name: 'Global Liaison', role: 'MDR/IVDR', group: 'Regulatory', status: 'idle', description: 'International alignment' },
  { id: 25, name: 'Submission Architect', role: 'eSTAR Expert', group: 'Regulatory', status: 'idle', description: 'Structure and formatting' },
  // WOW Squad
  { id: 26, name: 'Adversarial Red Team', role: 'Devil\'s Advocate', group: 'WOW', status: 'idle', description: 'Finds rejection triggers' },
  { id: 27, name: 'Future-Proof Analyst', role: 'Trend Forecaster', group: 'WOW', status: 'idle', description: 'Draft guidance anticipation' },
  { id: 28, name: 'Skill Architect', role: 'Logic Standardizer', group: 'WOW', status: 'idle', description: 'Creates Skill.md files' },
  { id: 29, name: 'Keyword Coralizer', role: 'Semantic Expert', group: 'WOW', status: 'idle', description: 'Highlights critical terms' },
  { id: 30, name: 'Aesthetic Engine', role: 'UI/UX Painter', group: 'WOW', status: 'idle', description: 'Manages visual styles' },
  { id: 31, name: 'Reasoning Visualizer', role: 'Logic Mapper', group: 'WOW', status: 'idle', description: 'Live reasoning chain' },
  { id: 32, name: 'Data Sculptor', role: 'JSON Specialist', group: 'WOW', status: 'idle', description: 'Dataset extraction' },
  { id: 33, name: 'Compliance Auditor', role: 'Internal Review', group: 'WOW', status: 'idle', description: 'Final quality check' },
  { id: 34, name: 'Performance Optimizer', role: 'Speed Specialist', group: 'WOW', status: 'idle', description: 'Generation throughput' },
  { id: 35, name: 'WOW Orchestrator', role: 'Final Polish', group: 'WOW', status: 'idle', description: 'Ensures "WOW" factor' },
];

export default function App() {
  const [currentStyle, setCurrentStyle] = useState<PainterStyle>('Default');
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [results, setResults] = useState<ReviewResults | null>(null);
  const [logs, setLogs] = useState<{ time: string; msg: string; type: 'info' | 'success' | 'error' }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const style = useMemo(() => STYLE_CONFIGS[currentStyle], [currentStyle]);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 50));
  };

  const handleAgentPulse = (step: number) => {
    setAgents(prev => prev.map(agent => {
      // Logic to activate agents based on step
      const shouldBeActive = 
        (step === 1 && agent.group === 'Regulatory') ||
        (step === 2 && agent.group === 'Technical') ||
        (step === 3 && agent.name.includes('Data')) ||
        (step === 4 && agent.group === 'WOW') ||
        (step === 5 && agent.name.includes('Skill'));
      
      if (shouldBeActive) {
        addLog(`Agent ${agent.name} activated for Step ${step}`, 'info');
        return { ...agent, status: 'active' };
      }
      return { ...agent, status: agent.status === 'active' ? 'complete' : agent.status };
    }));
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-700 ease-in-out flex overflow-hidden",
      style.bg,
      style.text,
      style.fontSans
    )}>
      <Toaster position="top-right" />
      
      {/* Left Sidebar: Controls & Pulse Map */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? '320px' : '0px', opacity: sidebarOpen ? 1 : 0 }}
        className={cn(
          "h-screen border-r flex flex-col overflow-hidden relative z-20",
          style.card,
          style.border
        )}
      >
        <div className="p-6 space-y-8 flex-1 overflow-y-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={cn("p-2 rounded-lg", style.accent)}>
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">ORICKS v4.0</h1>
            </div>
            <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Operating Regulatory Intelligent Compliance Knowledge System</p>
          </div>

          <Separator className={style.border} />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-50">
              <Palette className="h-3 w-3" />
              <span>Painter Style Engine</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(STYLE_CONFIGS) as PainterStyle[]).map(s => (
                <Button 
                  key={s}
                  variant={currentStyle === s ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    "text-[10px] h-8 font-bold uppercase tracking-tighter",
                    currentStyle === s && style.accent
                  )}
                  onClick={() => {
                    setCurrentStyle(s);
                    addLog(`Style changed to ${s}`, 'info');
                  }}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>

          <Separator className={style.border} />

          <AgentPulseMap agents={agents} />
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header / Nav */}
        <header className={cn(
          "h-16 border-b flex items-center justify-between px-6 z-10",
          style.card,
          style.border
        )}>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase font-black">v4.0 Production</Badge>
              <Badge variant="secondary" className="text-[10px] uppercase font-black">35 Agents Live</Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-xs font-bold">
               <Activity className="h-3 w-3 text-green-500 animate-pulse" />
               <span>System Healthy</span>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <ScrollArea className="flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-12">
            <Tabs defaultValue="generator" className="w-full">
              <TabsList className={cn(
                "grid grid-cols-4 w-full h-14 p-1 mb-8",
                style.border,
                "border-2",
                style.radius
              )}>
                <TabsTrigger value="generator" className="text-xs font-black uppercase tracking-widest">
                  <FileSearch className="h-4 w-4 mr-2" /> Review Generator
                </TabsTrigger>
                <TabsTrigger value="form" className="text-xs font-black uppercase tracking-widest">
                  <LayoutDashboard className="h-4 w-4 mr-2" /> Submission Form
                </TabsTrigger>
                <TabsTrigger value="notes" className="text-xs font-black uppercase tracking-widest">
                  <PenTool className="h-4 w-4 mr-2" /> AI Note Keeper
                </TabsTrigger>
                <TabsTrigger value="skills" className="text-xs font-black uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4 mr-2" /> Skill Creator
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="generator">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ReviewGenerator 
                      onResults={(res) => {
                        setResults(res);
                        addLog('Review results received', 'success');
                      }} 
                      onAgentPulse={handleAgentPulse}
                    />
                  </motion.div>
                </TabsContent>

                <TabsContent value="form">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {results ? (
                      <SubmissionForm dataset={results.dataset} questions={results.formQuestions} />
                    ) : (
                      <Card className="p-20 text-center border-dashed">
                        <Database className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <h3 className="text-xl font-black uppercase">No Dataset Available</h3>
                        <p className="opacity-50">Run the Review Generator first to extract 510(k) entities.</p>
                      </Card>
                    )}
                  </motion.div>
                </TabsContent>

                <TabsContent value="notes">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <AINoteKeeper />
                  </motion.div>
                </TabsContent>

                <TabsContent value="skills">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <SkillCreator />
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </div>
        </ScrollArea>
      </main>

      {/* Right Sidebar: Live Log */}
      <aside className={cn(
        "w-80 h-screen border-l flex flex-col overflow-hidden",
        style.card,
        style.border
      )}>
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <Terminal className="h-4 w-4" />
            <span>Live Reasoning Log</span>
          </div>
          <Badge variant="outline" className="text-[9px]">{logs.length}</Badge>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {logs.map((log, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-[9px] font-mono opacity-40">
                  <span>{log.time}</span>
                  <span className={cn(
                    log.type === 'success' ? 'text-green-500' :
                    log.type === 'error' ? 'text-red-500' : 'text-blue-500'
                  )}>{log.type.toUpperCase()}</span>
                </div>
                <p className="text-[11px] font-mono leading-tight">{log.msg}</p>
                <Separator className="opacity-5" />
              </div>
            ))}
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Terminal className="h-12 w-12 mb-2" />
                <span className="text-[10px] font-bold uppercase">Awaiting Input...</span>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Background Grid (Optional) */}
      {style.grid && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'linear-gradient(to right, black 1px, transparent 1px), linear-gradient(to bottom, black 1px, transparent 1px)',
            backgroundSize: '100px 100px'
          }} />
        </div>
      )}
    </div>
  );
}
