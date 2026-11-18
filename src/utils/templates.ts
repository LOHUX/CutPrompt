export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
}

export const templates: Template[] = [
  {
    id: 'research',
    name: 'Research Analysis',
    description: 'Multi-part research question template',
    category: 'Research',
    content: `Please analyze the following research topic comprehensively.\n\nPart 1: Background and Context\n[Your background information here]\n\nPart 2: Main Research Question\n[Your research questions here]\n\nPart 3: Methodology\n[Your methodology details here]\n\nPart 4: Expected Outcomes\n[Your expected outcomes here]`
  },
  {
    id: 'writing',
    name: 'Long-form Writing',
    description: 'Template for book chapters, articles, essays',
    category: 'Writing',
    content: `I need help writing a comprehensive piece. Here's the structure:\n\nTitle: [Your title]\n\nOutline:\n1. Introduction\n2. Main Body\n3. Conclusion\n\nPlease help me develop each section with detailed content, maintaining consistency throughout.`
  },
  {
    id: 'coding',
    name: 'Code Review & Refactoring',
    description: 'For reviewing and improving large codebases',
    category: 'Development',
    content: `I need a comprehensive code review and refactoring suggestions.\n\nProject Context:\n[Describe your project]\n\nCode Section 1:\n[First code block]\n\nCode Section 2:\n[Second code block]\n\nPlease review for: performance, security, best practices, and maintainability.`
  },
  {
    id: 'analysis',
    name: 'Data Analysis',
    description: 'For analyzing large datasets or documents',
    category: 'Analysis',
    content: `Please perform a detailed analysis of the following data:\n\nDataset Overview:\n[Your dataset description]\n\nAnalysis Goals:\n1. [Goal 1]\n2. [Goal 2]\n3. [Goal 3]\n\nData:\n[Your data here]\n\nPlease provide insights, patterns, and actionable recommendations.`
  },
  {
    id: 'brainstorm',
    name: 'Brainstorming Session',
    description: 'For creative ideation and problem-solving',
    category: 'Creative',
    content: `Let's have a comprehensive brainstorming session.\n\nTopic: [Your topic]\n\nContext: [Background information]\n\nConstraints:\n- [Constraint 1]\n- [Constraint 2]\n\nPlease generate creative ideas, evaluate them, and provide detailed recommendations.`
  },
  {
    id: 'tutorial',
    name: 'Learning Tutorial',
    description: 'For creating step-by-step learning materials',
    category: 'Education',
    content: `Create a comprehensive tutorial on the following topic:\n\nTopic: [Your topic]\n\nTarget Audience: [Beginner/Intermediate/Advanced]\n\nLearning Objectives:\n1. [Objective 1]\n2. [Objective 2]\n\nPlease include examples, exercises, and best practices.`
  }
];

export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter(t => t.category === category);
}

export const categories = ['All', 'Research', 'Writing', 'Development', 'Analysis', 'Creative', 'Education'];
