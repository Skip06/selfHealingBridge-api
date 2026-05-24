

# selfHealingBridge

An API bridge that automatically detects and repairs schema drift between APIs using LangChain, RAG, and an LLM.

## The problem it solves
When a source API renames or restructures fields, calls to a destination API start failing with 400 errors.
This bridge catches those failures, uses RAG to find the correct field mappings from an API manual,
and asks an LLM to generate a fix — automatically, without human intervention.

## How it works
1. Request comes in → bridge forwards it to the destination API
2. If a 400 error occurs (schema mismatch), the agent activates
3. LangChain performs a similarity search on the API manual using Hugging Face embeddings
4. Retrieved context + error log is sent to Groq (Llama-3) to generate a JSON field mapping fix
5. Bridge retries the request with the corrected payload

## Tech stack
- **Runtime**: Bun + TypeScript
- **LLM**: Groq (Llama-3)
- **Embeddings**: Hugging Face Transformers
- **RAG**: LangChain + in-memory vector store
- **HTTP**: Express.js

## Run locally
```bash
git clone https://github.com/Skip06/selfHealingBridge-api
cd selfHealingBridge-api
bun install
# Add your keys to .env
GROQ_API_KEY=your_key
bun run index.ts
```

## What's next
- [ ] Persistent vector DB (replace in-memory with Pinecone/Chroma)
- [ ] Support for auth header drift detection
- [ ] Dashboard to visualize repair history
