const jwt = require("jsonwebtoken");

let myToken = jwt.sign({pk: 1010},"secretPassword",{expiresIn: "60 minutes"});

console.log("my token", myToken);

let verificationTest = jwt.verify(myToken, "secretPasscword");
console.log(verificationTest);