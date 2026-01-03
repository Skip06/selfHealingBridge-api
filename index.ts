import express from "express"

const sourceApp = express();
const destApp = express();

sourceApp.use(express.json());
destApp.use(express.json());

sourceApp.get('/data', (req,res) =>{
  console.log("sending data to destination api")
  res.json({
    fullName: 'Elon Musk',
    emailAdd: 'elonmusk@spacex.com'
  })
})

destApp.post('/ingest', (req,res)=> {
  const { name, email } = req.body;
  
  if(!name || !email){
    console.error('Missing required fieds');
    return res.status(400).json({
      error: "missing required fields",
      received: req.body,
      required: ['name', 'email']
    })
  }
  
  console.log("insgested successfully")
  res.status(200).json({
    message:"data insgested successfully"
  })
})

sourceApp.listen(3001, ()=>{
  console.log("SourceApp is listening at 3001")
})

destApp.listen(3002, ()=>{
  console.log("DestApp is listening at 3002")
})