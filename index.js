const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("./dbConnectExec.js");
const josephKaConfig = require("./config.js");
const auth = require("./middleWare/authenticate");

const app = express();

//this is to make app reonize incoming data
app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});

app.get("/hi", (req, res) => {
  res.send("Hello world");
});

app.get("/", (req, res) => {
  res.send("API is running");
});

//app.post()
//app.put()

app.post("/Customer/logout",auth, (req,res)=>{

  let query = `UPDATE Customer 
  SET Token = NULL
  WHERE CustomerID = ${req.customer.CustomerID}`;

  db.executeQuery(query)
  .then(()=>{res.status(200).send()}).catch((err)=>{
    console.log("error in POST /Customer/logout",err); 

    res.status(500).send();
  })
} )

/*

*/
// app.get("/Review/me", auth,async(req,res)=>{

//   //1. get the CustomerID 
//   //2. query the database for user's records 
//   //3. send user's reviews back to them 
// })

// app.patch("/Review/:pk", auth, async(req,res)=>{

// })

// app.delete("/Review/pk:",)

app.post("/Review", auth, async (req, res) => {
  try {
    let Work = req.body.WorkFK;
    let summary = req.body.summary;
    let rating = req.body.rating;

    if (!Work || !summary || !rating || !Number.isInteger(rating)) {
      return res.status(400).send("bad requst");
    }

    summary = summary.replace("'","''");

    console.log("Summary",summary);

    // console.log("here is the Customer", req.customer)

    let insertQuery = `INSERT INTO Review (Rating, Summary, WorkFK, CustomerFK)
            OUTPUT inserted.Summary,inserted.Rating,inserted.CustomerFK,inserted.WorkFK
            VALUES ('${rating}' ,'${summary}', '${Work}', '${req.customer.CustomerID}')`;

    let insertedReview = await db.executeQuery(insertQuery);

    // console.log("inserted review ", insertedReview);

    // res.send("here is the response");

    res.status(201).send(insertedReview[0]);
  } catch (err) {
    console.log("erro in POST /reviews", err);

    res.status(500).send();
  }
});

app.get("/Customer/me", auth, (req, res) => {
  res.send(req.customer);
});

//this is where the login info is saved

app.post("/Customer/login", async (req, res) => {
  // console.log('/Customer/login called',req.body);

  //1. data validation

  let email = req.body.Email;

  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Bad request");
  }

  //2.check if user exist in data base
  let query = `SELECT * 
From Customer
WHERE Email = '${email}'`;

  let result;

  try {
    result = await db.executeQuery(query);
  } catch (myError) {
    // console.log("error in /contacts/login", myError);

    return res.status(500).send();
  }
  //  console.log(result);

  if (!result[0]) {
    return res.status(401).send("Invalid user cerdentails");
  }

  //3. check password
  let user = result[0];

  if (!bcrypt.compareSync(password, user.Password)) {
    // console.log("invalid passoword ");

    return res.status(401).send("Invalid User Credentails");
  }

  //4.generate token

  let token = jwt.sign({ pk: user.CustomerID }, josephKaConfig.JWT, {
    expiresIn: "60 minutes",
  });

  // console.log("Token ", token);

  //5. save token in DB and send reposne back

  let setTokenQuery = `UPDATE Customer 
SET token = '${token}'
WHERE CustomerID = ${user.CustomerID}`;

  try {
    await db.executeQuery(setTokenQuery);

    res.status(200).send({
      token: token,
      user: {
        Fname: user.Fname,
        Lname: user.Lname,
        Email: user.Email,
        CustomerID: user.CustomerID,
      },
    });
  } catch (myError) {
    console.log("error in setting uer token", myError);
    res.status(500).send();
  }
});

//creating the end point for the API
app.post("/Customer", async (req, res) => {
  // res.send("/contacts called");

  // console.log("Request body", req.body);

  //the naming of the objects must match the body
  let Fname = req.body.Fname;
  let Lname = req.body.Lname;
  let Email = req.body.Email;
  let password = req.body.Password;
  // let Token = req.body.Token;

  //
  let emailCheckQuery = `SELECT Email 
        from Customer
        where Email = '${Email}'`;

  let existingUser = await db.executeQuery(emailCheckQuery);

  //   console.log("exisisting user ", existingUser);
  //this will make sure to send the 409 error if the user account has been created
  if (existingUser[0]) {
    return res.status(409).send("Duplicate email");
  }
  //this is where the hasings for the password is taking place

  let hashedPassword = bcrypt.hashSync(password);

  let insertQuery = `INSERT INTO Customer (Fname,Lname,Email,Password)
        VALUES	('${Fname}', '${Lname}','${Email}','${hashedPassword}')`;

  // console.log(insertQuery);

  db.executeQuery(insertQuery)
    .then(() => {
      res.status(201).send();
    })
    .catch((err) => {
      console.log("error in Post/ Customer", err);
      res.status(500).send();
    });
});

app.get("/Work", (req, res) => {
  db.executeQuery(
    `SELECT*
            FROM Work
            LEFT JOIN ProjectType
            ON ProjectType.ProjectName = 'Work.ProjectTypeFK'`
  )
    .then((theResults) => {
      res.status(200).send(theResults);
    })
    .catch((myError) => {
      // console.log(myError);

      res.status(500).send();
    });
});

app.get("/movies/:pk", (req, res) => {
  let pk = req.params.pk;

  // console.log(pk);
  let myQuery = `SELECT*
        FROM movie
        LEFT JOIN Genre
        ON genre.GenrePK = ${pk}`;

  db.executeQuery(myQuery)
    .then((result) => {
      console.log(result);
      if (result[0]) {
        res.send(result[0]);
      } else {
        res.status(404).send(`bad request`);
      }
    })
    .catch((err) => {
      console.log("Error in /movies/:pk", err);
      res.status(500).send();
    });
});
