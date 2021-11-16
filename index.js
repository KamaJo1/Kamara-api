const express = require("express")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./dbConnectExec.js");
const josephKaConfig = require('./config.js');


const app = express(); 

//this is to make app reonize incoming data
app.use(express.json());

app.listen(5000,()=>{

    // console.log("App is running on port 5000");

});

app.get("/hi",(req,res)=>{ 
res.send("Hello world");
});

app.get("/",(req,res)=>{
    res.send("API is running");
    });

    //app.post() 
    //app.put()

//this is where the login info is saved 

app.post("/Customer/login",async (req,res)=>{
// console.log('/Customer/login called',req.body);


//1. data validation 

let email = req.body.Email;

let password = req.body.password; 

if (!email || !password){
    return res.status(400).send("Bad request");
}

//2.check if user exist in data base 
let query = `SELECT * 
From Customer
WHERE Email = '${email}'`;

let result;


try {

result =  await db.executeQuery(query);

}catch(myError){
   
    // console.log("error in /contacts/login", myError);
    
    return res.status(500).send();
}
//  console.log(result);

 if(!result[0]) {return res.status(401).send("Invalid user cerdentails")}


//3. check password 
let user = result[0];

if (!bcrypt.compareSync(password,user.Password)){
// console.log("invalid passoword ");
    
return res.status(401).send("Invalid User Credentails");
}

//4.generate token

let token = jwt.sign({pk: user.CustomerID },josephKaConfig.JWT,{expiresIn: "60 minutes"});

// console.log("Token ", token);


//5. save token in DB and send reposne back 

let setTokenQuery = `UPDATE Customer 
SET token = '${token}'
WHERE CustomerID = ${user.CustomerID}`

try{
     await db.executeQuery(setTokenQuery);

     res.status(200).send({
         token: token,
         user:{
             Fname: user.Fname,
             Lname: user.Lname,
             email: user.Email,
             CustomerID: user.CustomerID
         },
     });
}
catch(myError){
console.log("error in setting uer token", myError).res.status(500).send();
}

})

    //creating the end point for the API
    app.post("/Customer",async (req,res)=>{
        // res.send("/contacts called");

        // console.log("Request body", req.body);

        //the naming of the objects must match the body 
        let Fname = req.body.Fname;
        let Lname = req.body.Lname;
        let email = req.body.Email;
        let password = req.body.Password;
        // let Token = req.body.Token;

        //
        let emailCheckQuery = `SELECT Email 
        from Customer
        where Email = '${email}'`;

      let existingUser= await  db.executeQuery(emailCheckQuery);

    //   console.log("exisisting user ", existingUser);
//this will make sure to send the 409 error if the user account has been created 
    if (existingUser[0]){
        return res.status(409).send("Duplicate email");};
//this is where the hasings for the password is taking place 

        let hashedPassword = bcrypt.hashSync(password);

    let insertQuery = 
        `INSERT INTO Customer (Fname,Lname,Email,Password)
        VALUES	('${Fname}', '${Lname}','${email}','${hashedPassword}')`;

// console.log(insertQuery);

        db.executeQuery(insertQuery).then(()=>{

            res.status(201).send();
        }).catch((err)=>{
            console.log("error in Post/ Customer", err);
            res.status(500).send(); 
            
        })
    });

    app.get("/Work",(req,res)=>{
        
        db.executeQuery(`SELECT*
            FROM Work
            LEFT JOIN ProjectType
            ON ProjectType.ProjectName = 'Work.ProjectTypeFK'`)
        .then((theResults)=>{
            res.status (200).send(theResults);
        }
        ).catch((myError)=>{
            // console.log(myError);

            res.status(500).send();
        })
    });

    app.get("/movies/:pk",(req,res)=>{
        let pk = req.params.pk;

        // console.log(pk);
        let myQuery = `SELECT*
        FROM movie
        LEFT JOIN Genre
        ON genre.GenrePK = ${pk}`
        
        db.executeQuery(myQuery).then((result)=>{

            console.log(result);
            if(result[0]){
                res.send(result[0]);
            }else {
                res.status(404).send(`bad request`);
            }
        }).catch((err)=>{
            console.log("Error in /movies/:pk",err);
            res.status(500).send();
        });
        
    })

