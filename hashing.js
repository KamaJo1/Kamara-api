const bcrypt = require("bcryptjs");

let hashedPassword = bcrypt.hashSync('csu123');


let hasTest = bcrypt.compareSync("csu123",hashedPassword);
console.log(hasTest);