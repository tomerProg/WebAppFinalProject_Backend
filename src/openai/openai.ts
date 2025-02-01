
import { OpenAI } from "openai";
import { ChatGeneratorConfig } from "./config";

export class ChatGenerator {
    private openAI: OpenAI; 
    constructor(
        private readonly config: ChatGeneratorConfig,
    ) {
        this.openAI = new OpenAI({apiKey: config.apiKey});
    }

    async getSuggestion(description: string) : Promise<string | undefined>{
        try {
            const response = await this.openAI.chat.completions.create({
              model: "gpt-3.5-turbo",
              messages: [
                { role: "system", content: "You are a helpful assistant providing suggestions." },
                { role: "user", content: description },
              ],
              temperature: 0.7,
              max_tokens: 100
            });
        
            return response.choices[0]?.message?.content || "No response from AI.";
          } catch (error) {
            return undefined;
        }
    }
}


