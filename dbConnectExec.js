const sql = require ("mssql");

const josephKaConfig = require("./config.js");

const config = {
    user: josephKaConfig.DB.user,
    password: josephKaConfig.DB.password,
    server: josephKaConfig.DB.server, // You can use 'localhost\\instance' to connect to named instance
    database: josephKaConfig.DB.database,
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
