import { askAgentForFix } from "./agent"  

const SOURCE_URL = 'http://localhost:3001/data'
const DEST_URL = 'http://localhost:3002/ingest'

// this is the in-memory store we start with "Guessed" mapping, if this is incorrect ai will update this.
let mappingStore: Record<string, string> = {
  fullName: "userid",   //initial guess
  emailAdd: "contact"   // intitial guess
}

async function runBridge(){
  try{
    const sourceResponse = await fetch(SOURCE_URL)   // normally its get req to make it a post -> add 2nd arg 
    const sourceData: any = await sourceResponse.json()
    
    console.log("Received from source", sourceData)
    
    const payload: any = {}
    for(const [legacyKey , modernKey] of Object.entries(mappingStore)){
      payload[modernKey] = sourceData[legacyKey]
    }
    
    console.log("transformed to payload", payload)
    
    const destResponse = await fetch(DEST_URL, {   //sending the post req
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),    // body has to be a string
    })
    
    const result = await destResponse.json()
    
    if(!destResponse.ok){
      console.log('error message:', result)
      console.log('calling the ai agent')
      //throw new Error(`Destination api rejected data: ${JSON.stringify(result)}` )  //Error message must be string o/w it will show [object Object]
      const newMapping = await askAgentForFix(sourceData, result)
      console.log("new mapping suggested by AI : ", newMapping)
      mappingStore = newMapping
      console.log('retrying with newMapping')
      return runBridge()
    }
    
    console.log('Success', result)
  }
  catch(e){
    console.error("something went wrong with the runBridge",e)
  }
    
}

runBridge();
