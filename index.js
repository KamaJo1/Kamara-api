const { response, application } = require('express');
const bcrypt = require("bcryptjs");
const express = require('express')

const db = require("./dbConnectExec.js");

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

    //creating the end point for the API
    app.post("/Customer",async (req,res)=>{
        // res.send("/contacts called");

        // console.log("Request body", req.body);

        //the naming of the objects must match the body 
        let Fname = req.body.Fname;
        let Lname = req.body.Lname;
        let Email = req.body.Email;
        let password = req.body.password;
        // let Token = req.body.Token;

        //
        let emailCheckQuery = `SELECT email 
        from Customer
        where Email = '${Email}'`;

      let existingUser= await  db.executeQuery(emailCheckQuery);

    //   console.log("exisisting user ", existingUser);
//this will make sure to send the 409 error if the user account has been created 
    if (existingUser[0]){
        return res.status(409).send("Duplicate email");};


    let insertQuery = 
        `INSERT INTO Customer (Fname,Lname,Email,Password)
        VALUES	('${Fname}', '${Lname}','${Email}','${password}')`;

// console.log(insertQuery);

        db.executeQuery(insertQuery).then(()=>{

            res.status(201).send();
        }).catch((err)=>{
            console.log("error in Post/ Customer", err);
            res.status(500).send(); 
            
        })
    });

    app.get("/movies",(req,res)=>{
        
        db.executeQuery(`SELECT*
        FROM movie
        LEFT JOIN Genre
        ON genre.GenrePK = movie.GenreFK`)
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

