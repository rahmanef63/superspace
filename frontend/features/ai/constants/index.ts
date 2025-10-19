export const AI_MODELS = {
  GPT_4: "gpt-4",
  GPT_3_5: "gpt-3.5-turbo",
  CLAUDE: "claude-3",
  LLAMA: "llama-2",
} as const

export const AI_PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    models: [AI_MODELS.GPT_4, AI_MODELS.GPT_3_5],
    isAvailable: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    models: [AI_MODELS.CLAUDE],
    isAvailable: true,
  },
  {
    id: "meta",
    name: "Meta",
    models: [AI_MODELS.LLAMA],
    isAvailable: true,
  },
]

export const DEFAULT_AI_SETTINGS = {
  model: AI_MODELS.GPT_4,
  temperature: 0.7,
  maxTokens: 2048,
  systemPrompt: "You are a helpful AI assistant.",
}

export const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
} as const

export const AI_TOPICS = [
  "General",
  "Programming",
  "Cooking",
  "Travel",
  "Fitness",
  "Education",
  "Business",
  "Creative",
] as const

export const MAX_MESSAGE_LENGTH = 4000
export const MAX_CONVERSATIONS = 100
export const AUTO_SAVE_DELAY = 1000
