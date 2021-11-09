const bcrypt = require("bcryptjs");

let hashedPassword = bcrypt.hashSync('csu123');

console.log(hashedPassword);

let hasTest = bcrypt.compareSync("CSU123",hashedPassword);
console.log(hasTest);