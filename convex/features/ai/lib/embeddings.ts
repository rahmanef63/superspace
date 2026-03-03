import { OpenAI } from "openai";

export async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const openai = new OpenAI({ apiKey });
  
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.replace(/\n/g, " "),
  });

  return response.data[0].embedding;
}
