const SOURCE_URL = 'http://localhost:3001/data'
const DEST_URL = 'http://localhost:3002/ingest'

async function runBridge(){
  try{
    const sourceResponse = await fetch(SOURCE_URL)   // normally its get req to make it a post -> add 2nd arg 
    const sourceData: any = await sourceResponse.json()
    
    console.log("Received from source", sourceData)
    
    const payload = {
      name: sourceData.fullName,
      email: sourceData.emailAdd,
    }
    console.log("transformed to payload", payload)
    
    const destResponse = await fetch(DEST_URL, {   //sending the post req
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),    // body has to be a string
    })
    
    const result = await destResponse.json()
    
    if(!destResponse.ok){
      throw new Error(`Destination api rejected data: ${JSON.stringify(result)}` )  //Error message must be string o/w it will show [object Object]
    }
    
    console.log('migrated', result)
  }
  catch(error){
    console.error("something went wrong with the runBridge")
  }
    
}

runBridge();
