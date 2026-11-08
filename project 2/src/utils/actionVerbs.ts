export interface ActionVerbCategory {
  category: string;
  description: string;
  verbs: string[];
}

export const ACTION_VERBS: ActionVerbCategory[] = [
  {
    category: 'Leadership & Management',
    description: 'Use when leading teams, spearheading initiatives, or orchestrating programs.',
    verbs: [
      'Architected', 'Spearheaded', 'Directed', 'Mobilized', 'Orchestrated',
      'Pioneered', 'Supervised', 'Championed', 'Mentored', 'Delegated',
      'Empowered', 'Steered', 'Coordinated', 'Unified', 'Governed'
    ]
  },
  {
    category: 'Technical & Engineering',
    description: 'Use when creating, developing, deploying, or integrating technology.',
    verbs: [
      'Engineered', 'Architected', 'Implemented', 'Deployed', 'Refactored',
      'Configured', 'Automated', 'Integrated', 'Built', 'Migrated',
      'Containerized', 'Benchmarked', 'Programmed', 'Constructed', 'Virtualised'
    ]
  },
  {
    category: 'Optimization & Performance',
    description: 'Use when boosting speed, cutting latency, eliminating waste, or raising throughput.',
    verbs: [
      'Accelerated', 'Streamlined', 'Minimized', 'Maximized', 'Consolidated',
      'Elevated', 'Pruned', 'Augmented', 'Overhauled', 'Surpassed',
      'Reduced', 'Amplified', 'Standardized', 'Strengthened', 'Trimmed'
    ]
  },
  {
    category: 'Research & Analysis',
    description: 'Use when diagnosing problems, evaluating metrics, or deriving insights.',
    verbs: [
      'Audited', 'Diagnosed', 'Identified', 'Discovered', 'Synthesized',
      'Extracted', 'Quantified', 'Interpreted', 'Uncovered', 'Modeled',
      'Forecasted', 'Benchmarked', 'Evaluated', 'Investigated', 'Appraised'
    ]
  },
  {
    category: 'Collaboration & Communication',
    description: 'Use when partnering across teams, presenting to stakeholders, or training.',
    verbs: [
      'Facilitated', 'Negotiated', 'Partnered', 'Presented', 'Advocated',
      'Authored', 'Coached', 'Trained', 'Liaised', 'Mediated',
      'Conveyed', 'Influenced', 'Documented', 'Published', 'Fostered'
    ]
  }
];

export interface WeakPhraseSuggestion {
  weakPhrase: string;
  replacementAlternatives: string[];
  explanation: string;
}

export const WEAK_PHRASES: WeakPhraseSuggestion[] = [
  {
    weakPhrase: 'Responsible for',
    replacementAlternatives: ['Engineered', 'Orchestrated', 'Delivered', 'Managed'],
    explanation: 'Passive phrase that describes a duty rather than an action or achievement.'
  },
  {
    weakPhrase: 'Helped with',
    replacementAlternatives: ['Collaborated on', 'Assisted in designing', 'Co-authored', 'Supported deployment of'],
    explanation: 'Minimizes your impact. Specify your precise technical or operational contribution.'
  },
  {
    weakPhrase: 'Worked on',
    replacementAlternatives: ['Developed', 'Implemented', 'Crafted', 'Engineered', 'Overhauled'],
    explanation: 'Vague verb. Clarify what you built, resolved, or improved.'
  },
  {
    weakPhrase: 'Handled',
    replacementAlternatives: ['Administered', 'Executed', 'Resolved', 'Processed', 'Maintained'],
    explanation: 'Informal and passive. Use an active verb matching your exact role.'
  },
  {
    weakPhrase: 'Duties included',
    replacementAlternatives: ['Spearheaded', 'Executed', 'Formulated', 'Produced'],
    explanation: 'Reads like a job description rather than your personal track record.'
  }
];

export function findWeakPhrasesInText(text: string): { phrase: string; suggestions: string[]; explanation: string }[] {
  const matches: { phrase: string; suggestions: string[]; explanation: string }[] = [];
  
  WEAK_PHRASES.forEach(wp => {
    const regex = new RegExp(`\\b${wp.weakPhrase}\\b`, 'gi');
    if (regex.test(text)) {
      matches.push({
        phrase: wp.weakPhrase,
        suggestions: wp.replacementAlternatives,
        explanation: wp.explanation
      });
    }
  });

  return matches;
}
