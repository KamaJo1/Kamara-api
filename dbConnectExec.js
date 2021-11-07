const sql = require ("mssql");

const rockWellConfig = require("./config.js");

const config = {
    user: rockWellConfig.DB.user,
    password: rockWellConfig.DB.password,
    server: rockWellConfig.DB.server, // You can use 'localhost\\instance' to connect to named instance
    database: rockWellConfig.DB.database,
}

async function executeQuery(aQuery){
    let connection = await sql.connect(config);
   let result = await connection.query(aQuery);

//    console.log(result);
return result.recordset
}

// executeQuery(`SELECT * 
// FROM Movie 
// LEFT JOIN Genre 
// ON Genre.GenrePK = Movie.GenreFK`);

module.exports = {executeQuery: executeQuery};
