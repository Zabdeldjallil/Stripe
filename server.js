if(process.env.NODE_ENV!="production"){
    require("dotenv").config()
}
const fs=require("fs")
const SecretKey=process.env.STRIPE_SECRET_KEY
const PublicKey=process.env.STRIPE_PUBLIC_KEY
console.log(PublicKey)
let express=require("express");
let app=express();
let EJS=require("ejs");
const { json } = require("express")
const stripe = require('stripe')(SecretKey)
app.set("view engine","ejs")
app.use(express.json())
app.use(express.static("public"));
app.get("/store",(req,res)=>{
   fs.readFile("items.json",(error,data)=>{
       if(error) res.status(500).end()
       else{res.render("store",{items:JSON.parse(data),stripePublicKey:PublicKey})
    }
   })
})
app.post("/purchase",(req,res)=>{
    fs.readFile("items.json",(error,data)=>{
        if(error) res.status(500).end()
        else{
            const itemsJson=JSON.parse(data)
            const itemsArray=itemsJson.music.concat(itemsJson.merch)
            let total=0;
            req.body.items.forEach(item => {
                const itemJson=itemsArray.find(function(i){
                    return i.id==item.id
                })
            //multipier le prix venant du fichier par la quantité envoyé avec le fetch
                total = total + itemJson.price * item.quantity
            });
            stripe.charges.create({
                amount:total,
                source:req.body.stripeTokenId,
                currency:'usd'
            }).then(function(){
                console.log('Charge Successfull')
                res.json({message:'Successfully purchased'})
            }).catch(function(){
                console.log("charge fail")
                res.status(500).end()
            })
     }
    })
})
app.listen(3000)