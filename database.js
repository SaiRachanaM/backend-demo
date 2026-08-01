const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./users.db", (error) => {

    if (error) {
        console.log(error.message);
    }
    else {
        console.log("Database connected.");
    }
});

module.exports = db;