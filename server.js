const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require("./database");

const app = express();

const SECRET_KEY = "mysecretkey";

app.use(express.json());
app.use(express.static("public"));

app.post("/signup", async (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
        "INSERT INTO users (email, password) VALUES (?, ?)",
        [email, hashedPassword],
        (error) => {

            if (error) {
                res.send("Error creating user");
                return;
            }

            res.send("User created successfully");
        }
    );
});

app.post("/login", (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    db.get(
        "SELECT * FROM users WHERE email = ?",
        [email],
        async (error, row) => {

            if (error) {
                res.send("Database error");
                return;
            }

            if (!row) {
                res.send("Invalid credentials");
                return;
            }

            const match = await bcrypt.compare(
                password,
                row.password
            );

            if (match) {

                const token = jwt.sign(
                    {
                        email: row.email
                    },
                    SECRET_KEY
                );

                res.json({
                    message: "Login successful",
                    token: token
                });

            } else {

                res.send("Invalid credentials");

            }
        }
    );
});

app.get("/profile", (req, res) => {

    const token = req.headers.authorization;

    if (!token) {
        res.send("Access denied");
        return;
    }

    try {

        const decoded = jwt.verify(
            token,
            SECRET_KEY
        );

        res.json({
            message: "Welcome",
            email: decoded.email
        });

    } catch (error) {

        res.send("Invalid token");

    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});