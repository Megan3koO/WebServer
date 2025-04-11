const app = require('express')();
const PORT = process.env.PORT || 80;

//GET API
app.use("/", require("./apis/home"))
app.use("/", require("./apis/backtrace"))

app.listen()
app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running,  and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);