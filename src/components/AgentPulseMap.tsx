
import React from 'react';
import { motion } from 'motion/react';
import { Agent } from '../types';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface AgentPulseMapProps {
  agents: Agent[];
}

export const AgentPulseMap: React.FC<AgentPulseMapProps> = ({ agents }) => {
  const groups = ['Intake', 'Technical', 'Regulatory', 'WOW'] as const;

  return (
    <div className="space-y-6">
      <h3 className="text-xs font-black uppercase tracking-widest opacity-50">Agent Pulse Map (35)</h3>
      <div className="grid grid-cols-1 gap-4">
        {groups.map(group => (
          <div key={group} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase">{group} Squad</span>
              <Badge variant="outline" className="text-[9px] h-4">{agents.filter(a => a.group === group).length}</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {agents.filter(a => a.group === group).map(agent => (
                <TooltipProvider key={agent.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <motion.div
                        animate={{
                          scale: agent.status === 'active' ? [1, 1.2, 1] : 1,
                          opacity: agent.status === 'idle' ? 0.3 : 1,
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className={`w-3 h-3 rounded-full cursor-help ${
                          agent.status === 'active' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' :
                          agent.status === 'complete' ? 'bg-blue-500' :
                          agent.status === 'error' ? 'bg-red-500' : 'bg-slate-400'
                        }`}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="space-y-1">
                        <p className="font-bold text-xs">{agent.name}</p>
                        <p className="text-[10px] opacity-70">{agent.role}</p>
                        <p className="text-[10px] italic">{agent.description}</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
