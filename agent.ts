import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import "dotenv/config";

/** * --- 1. PREPARING THE "KNOWLEDGE" (RAG) ---
 * Think of this as the "API Manual" that the AI will read.
 */
const documentation = [
  new Document({ 
    pageContent: "Modern API v2 Docs: The field 'fullName' from legacy systems must now be mapped to 'name'. The field 'emailAdd' must be mapped to 'email'." 
  })
];

/** * --- 2. THE HEALER FUNCTION ---
 * This function takes the problem and returns the solution.
 * * @param sourceData - (Object) The raw data from the Legacy API.
 * @param errorLog - (Object) The 400 error message from the Modern API.
 * @returns - (Promise<Record<string, string>>) A clean mapping object.
 */
export async function askAgentForFix(sourceData: any, errorLog: any): Promise<Record<string, string>> {
  
  // A. Initialize the Embedding Model (How AI "reads" the manual)
  const embeddings = new GoogleGenerativeAIEmbeddings({
    modelName: "embedding-001",
    apiKey: process.env.GOOGLE_API_KEY,
  });

  // B. Create a temporary "Searchable Manual" (Vector Store)
  const vectorStore = await MemoryVectorStore.fromDocuments(documentation, embeddings);

  // C. Search for the specific page in the manual related to the error
  // Argument: The error message string. Returns: The most relevant sentence.
  const relevantDocs = await vectorStore.similaritySearch(JSON.stringify(errorLog), 1);
  // this is what relevantDocs looks like rn:/*[
  //   {
  //     "pageContent": "Modern API v2 Docs: The field 'fullName' from legacy systems must now be mapped to 'name'. The field 'emailAdd' must be mapped to 'email'.",
  //     "metadata": {
  //       // Internal metadata like source file or line numbers
  //     }
  //   }
  // ]
  const context = relevantDocs[0]?.pageContent ?? documentation[0]!.pageContent;

  // D. Initialize the "Brain" (Gemini)
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0, // 0 makes the AI "strict" and less creative (good for code)
  });

  // E. The Prompt (The instruction you give the AI)
  const prompt = `
    You are an API Mapping Expert. 
    CONTEXT FROM MANUAL: ${context}
    DATA RECEIVED: ${JSON.stringify(sourceData)}
    ERROR RECEIVED: ${JSON.stringify(errorLog)}

    TASK: Based on the manual and the error, create a JSON mapping.
    Return ONLY the JSON. No conversation.
    Example Format: {"legacy_field": "modern_field"}
  `;

  // F. Send to Gemini
  const response = await model.invoke(prompt);
  
  // G. Clean the string and turn it back into a JavaScript Object
  const cleanJsonString = response.content.toString().replace(/```json|```/g, "").trim();
  return JSON.parse(cleanJsonString);
}