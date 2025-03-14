const express=require("express")
const router=express.Router()

router.get("/test", (req, res, next) =>{
    console.log("testt");
    res.send("Hello! This is test");
}
);

module.exports=router