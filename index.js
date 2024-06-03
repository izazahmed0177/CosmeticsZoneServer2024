

const express=require("express")
const app=express();
const cors=require("cors")
const port=5000;

app.use(cors());
app.use(express.json());


app.get("/",(req,res)=>{
    res.send("Route is working");
});



app.listen(port,(req,res)=>{
    console.log("App is listening on port :",port);
});
