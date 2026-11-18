/** Public model names / documented limits checked against vendor pages 2026-11-17.
 * Context/output limits are reference information; chunk budgets are CutPrompts suggestions.
 * Token estimates are NOT provider-native counts.
 */
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  maxTokens: number; // Suggested *chunk* budget, not the provider context limit.
  contextTokens?: number;
  outputTokens?: number;
  description: string;
  status: 'Current' | 'Legacy' | 'Custom';
  source?: string;
  color: string;
  icon: string;
}
const sources = {
  openai: 'https://developers.openai.com/api/docs/models',
  claude: 'https://platform.claude.com/docs/en/models/overview',
  google: 'https://ai.google.dev/gemini-api/docs/models',
  meta: 'https://ai.meta.com/resources/models-and-libraries/llama-downloads/',
  mistral: 'https://docs.mistral.ai/models',
};
const preset = (id: string, name: string, provider: string, maxTokens: number, contextTokens?: number, outputTokens?: number, status: AIModel['status'] = 'Current'): AIModel => {
  const iconName = ({ OpenAI: 'openai', Anthropic: 'anthropic', Google: 'google', Meta: 'meta', 'Mistral AI': 'mistral' } as Record<string, string>)[provider] || 'customize';
  return { id, name, provider, maxTokens, contextTokens, outputTokens, status,
    description: provider === 'Recommended' ? 'CutPrompts suggestion; not an official model limit' : 'Suggested chunk size; context/output limits are shown separately',
    color: 'from-teal-500 to-cyan-600', icon: `/ai-icons/${iconName}.svg`,
    source: ({ OpenAI: sources.openai, Anthropic: sources.claude, Google: sources.google, Meta: sources.meta, 'Mistral AI': sources.mistral } as Record<string, string>)[provider],
  };
};
export const aiModels: AIModel[] = [
  preset('gpt-6-astra', 'GPT-6 Astra', 'OpenAI', 8000, 1_050_000, 128_000),
  preset('gpt-6.1-sol', 'GPT-6.1 Sol', 'OpenAI', 8000, 1_050_000, 128_000),
  preset('gpt-6.1-terra', 'GPT-6.1 Terra', 'OpenAI', 4000, 1_050_000, 128_000),
  preset('gpt-6-luna', 'GPT-6 Luna', 'OpenAI', 4000, 1_050_000, 128_000),
  preset('claude-fable-5-2', 'Claude Fable 5.2', 'Anthropic', 8000, 1_000_000, 128_000),
  preset('claude-opus-5-5', 'Claude Opus 5.5', 'Anthropic', 8000, 1_000_000, 128_000),
  preset('claude-sonnet-5-5', 'Claude Sonnet 5.5', 'Anthropic', 8000, 1_000_000, 128_000),
  preset('claude-haiku-5-5', 'Claude Haiku 5.5', 'Anthropic', 4000, 1_000_000, 128_000),
  preset('gemini-3.8-flash', 'Gemini 3.8 Flash', 'Google', 4000, 1_048_576, 65_536),
  preset('llama-4-scout', 'Llama 4 Scout', 'Meta', 4000, 10_000_000),
  preset('llama-4-maverick', 'Llama 4 Maverick', 'Meta', 4000), // Limit varies by host.
  preset('mistral-large-4-0', 'Mistral Large 4', 'Mistral AI', 4000, 1_000_000),
  preset('mistral-small-2603', 'Mistral Small 4', 'Mistral AI', 4000),
  preset('general-safe', 'General Safe', 'Recommended', 2000),
  preset('chatgpt-safe', 'ChatGPT Safe', 'Recommended', 3000),
  preset('claude-safe', 'Claude Safe', 'Recommended', 8000),
  preset('gpt-4-turbo', 'GPT-4 Turbo (legacy)', 'OpenAI', 3000, 128_000, undefined, 'Legacy'),
  preset('claude-3-5-sonnet', 'Claude 3.5 Sonnet (legacy)', 'Anthropic', 3000, 200_000, undefined, 'Legacy'),
  preset('gemini-1.5-pro', 'Gemini 1.5 Pro (legacy)', 'Google', 3000, undefined, undefined, 'Legacy'),
  preset('custom', 'Custom Budget', 'Custom', 3000, undefined, undefined, 'Custom'),
];
export const providers = ['All', 'OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral AI', 'Recommended', 'Custom'];
export const getModelById = (id: string): AIModel | undefined => aiModels.find(model => model.id === id);
export const getModelsByProvider = (provider: string): AIModel[] => aiModels.filter(model => model.provider === provider);
