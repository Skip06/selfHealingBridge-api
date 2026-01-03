# Self-Healing API Bridge

1. **Architecture Overview**: A Node.js/Bun bridge that acts as an intelligent middleware between a Legacy Source API and a Modern Destination API.
2. **Failure Detection**: Uses an automated retry loop that catches 400 Bad Request errors triggered by schema mismatches or field renames.
3. **RAG-Powered Recovery**: Upon failure, a LangChain agent performs a similarity search across a local "API Manual" using Hugging Face Transformer embeddings to find correct field mappings.
4. **LLM Reasoning**: Passes the retrieved context and error logs to a Groq-hosted Llama-3 model to generate a precise, JSON-formatted mapping fix.
5. **Persistent Layer**: I am currently using the inmemory vector db to store the embeddings . it is NOT persistent rn.