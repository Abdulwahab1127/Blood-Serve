const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const pool = require("./db");

const app = express();
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set the views directory and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static("public"));

app.get('/donorDash', (req, res) => {
    res.sendFile(path.join(__dirname, 'DonorForm.html'));
});

app.get('/loginDonor', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database');
        release(); 
    }
});


app.post("/loginDonor", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                if (user.role === 'donor') {
                    return res.redirect('http://127.0.0.1:5500/DonorForm.html');
                } else if (user.role === 'recipient') {
                    return res.redirect('http://127.0.0.1:5500/RecipientForm.html');
                } else if (user.role === 'administrator') {
                    return res.redirect('http://127.0.0.1:5500/administrator-updated2.html');
                } else {
                    return res.send("Invalid role");
                }
            } else {
                return res.sendFile(path.join(__dirname, 'login.html'));
            }
        } else {
            return res.sendFile(path.join(__dirname, 'login.html'));
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

function generateRandomId() {
    const prefix = 'U';
    const randomNumber = Math.floor(Math.random() * 1000);
    const formattedNumber = String(randomNumber).padStart(3, '0');
    return prefix + formattedNumber;
}

app.post("/signup", async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (userExists.rows.length > 0) {
            return res.sendFile(path.join(__dirname, 'login.html'));
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = generateRandomId();
            const newUser = await pool.query(
                'INSERT INTO users (user_id, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
                [userId, email, hashedPassword, role]
            );

            if (newUser.rows.length > 0) {
                return res.send(`<script>alert('Successfully registered!'); window.location.href='http://127.0.0.1:5500/login.html';</script>`);
            } else {
                return res.sendFile(path.join(__dirname, 'login.html'));
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

app.listen(5900, () => {
    console.log("App listening on port 5900");
});






