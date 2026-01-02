const SOURCE_URL = 'http://localhost:3001/data'
const DEST_URL = 'http://localhost:3002/ingest'

async function runBridge(){
  const sourceResponse = await fetch(SOURCE_URL)
  const sourceData = await sourceResponse.json()
  
  console.log("Received from source", sourceData)
  
  const payload
  
}