import { ChatGroq } from "@langchain/groq";
//import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import "dotenv/config";

//this will be used as rag
const documentation = [
  new Document({ 
    pageContent: "Modern API v2 Docs: The field 'fullName' from legacy systems must now be mapped to 'name'. The field 'emailAdd' must be mapped to 'email'." 
  })
];

export async function askAgentForFix(sourceData: any, errorLog: any): Promise<Record<string, string>> {
  
  //this is the embdedding model its running locally rn 
  const embeddings = new HuggingFaceTransformersEmbeddings({
      model: "Xenova/all-MiniLM-L6-v2", // Very lightweight and fast
    });

  //this acts as inmemory vector db to store the embeddings
  const vectorStore = await MemoryVectorStore.fromDocuments(documentation, embeddings);

  //performing the semantic search in the rag mem to get some context so that it will go with the prompt to the ai model.
  const relevantDocs = await vectorStore.similaritySearch(JSON.stringify(errorLog), 1);
 
  const context = relevantDocs[0]?.pageContent ?? documentation[0]!.pageContent;

 //this is the ai model brain
  const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
    });

  const prompt = `
    You are an API Mapping Expert. 
    CONTEXT FROM MANUAL: ${context}
    DATA RECEIVED: ${JSON.stringify(sourceData)}
    ERROR RECEIVED: ${JSON.stringify(errorLog)}

    TASK: Based on the manual and the error, create a JSON mapping.
    Return ONLY the JSON. No conversation.
    Example Format: {"legacy_field": "modern_field"}
  `;

  const response = await model.invoke(prompt);
  
  
  const cleanJsonString = response.content.toString().replace(/```json|```/g, "").trim(); //i just cleaned the string 
  return JSON.parse(cleanJsonString); // sending the response as json
}