const jwt = require("jsonwebtoken");
const db = require("../dbConnectExec.js")
const josephKaConfig = require("../config.js")

const auth =async(req,res,next)=>{ 
    console.log("In the middleware",req.header("Authorization"));
    // next();

    try{

        //1. decode token
        let myToken = req.header("Authorization").replace("Bearer ","");
        // console.log("token", myToken);
        let decoded = jwt.verify(myToken,josephKaConfig.JWT)
            console.log(decoded);
        let CustomerFK = decoded.pk;
        console.log(CustomerFK);
        //2. compare token with database 
        let query = `SELECT CustomerID ,FName,Lname ,Email,Password ,Token
        FROM Customer 
        WHERE CustomerID = ${CustomerFK} AND Token = '${myToken}'`;

        let returnedUser = await db.executeQuery(query);
        console.log("returned user",returnedUser);

        //3. save user infomation in request 
        if (returnedUser[0]){
            req.customer = returnedUser[0];
            next();

        }else {
            return res.status(401).send("Invalid Credentals");
        }
    }
    catch(err){
        return res.status(401).send("Invalid Credentials");
    }
}

// // INSERT INTO Review (Rating,Summary,CustomerFK,WorkFK)
// OUTPUT inserted.ReviewID,inserted.Summary,inserted.Rating,inserted.CustomerFK,inserted.WorkFK
// VALUES ('10', 'fantastic','6','2')

module.exports = auth;