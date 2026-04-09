
export interface LLMSettings {
  apiKey: string;
  modelFlash: string;
  modelPro: string;
  prompts: {
    webSummary: string;
    fdaSummary: string;
    datasetExtraction: string;
    reviewReport: string;
    skillCreation: string;
    formQuestions: string;
    noteCoralize: string;
    noteSummarize: string;
    noteFormalize: string;
    skillArchitect: string;
  };
}

export interface ReviewResults {
  webSummary: string;       // 2000-3000 words
  fdaSummary: string;       // 3000-4000 words
  dataset: Entity[];        // 50 structured entities
  report: string;           // 3000-4000 words
  skillMd: string;          // Standardized skill schema
  followUpQuestions: string[]; // 20 questions for the report
  formQuestions: string[];     // 20 questions for the interactive form
}

export interface Entity {
  id: string;
  category: 'Technical' | 'Regulatory' | 'Clinical' | 'Administrative';
  name: string;
  value: string;
  description: string;
}

export interface Agent {
  id: number;
  name: string;
  role: string;
  status: 'idle' | 'active' | 'error' | 'complete';
  description: string;
  group: 'Intake' | 'Technical' | 'Regulatory' | 'WOW';
}

export type PainterStyle = 
  | 'Default' | 'VanGogh' | 'Picasso' | 'Mondrian' | 'Dali' 
  | 'Warhol' | 'Monet' | 'Basquiat' | 'Cyberpunk' | 'Bauhaus'
  | 'Rembrandt' | 'Kandinsky' | 'Hokusai' | 'Pollock' | 'Matisse'
  | 'Vermeer' | 'Degas' | 'Klimt' | 'Kahlo' | 'Banksy' | 'Brutalist';

export interface StyleConfig {
  name: PainterStyle;
  bg: string;
  card: string;
  text: string;
  accent: string;
  border: string;
  fontSans: string;
  fontSerif: string;
  fontMono: string;
  radius: string;
  shadow: string;
  grid?: boolean;
}
