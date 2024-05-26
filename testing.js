
const express = require("express");
const path = require("path");

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

app.get('/loginDonor', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/donorDash', (req, res) => {
  res.sendFile(path.join(__dirname, 'DonorForm.html'));
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
  console.log(req.body);

  let errors = [];

  if (!email || !password) {
    errors.push({ message: 'Please enter all fields' });
  }
  if (password && password.length < 6) {
    errors.push({ message: 'Please enter a longer password' });
  }
  if (errors.length > 0) {
    return res.redirect("http://127.0.0.1:5500/login.html");
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      if (password !== user.password) {
        errors.push({ message: "Enter correct password" });
        return res.redirect("http://127.0.0.1:5500/login.html");
      }
      // return res.redirect('http://127.0.0.1:5500/Final_project_bloodDonation/DonorForm.html');
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
      errors.push({ message: "Email not found" });
      return res.redirect("http://127.0.0.1:5500/login.html");
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
  const { email, password, userType } = req.body;

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.redirect("http://127.0.0.1:5500/login.html");
    } else {
      const userId = generateRandomId();
      const newUser = await pool.query(
        'INSERT INTO users (user_id, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, email, password, userType]
      );

      if (newUser.rows.length > 0) {
        return res.send(`<script>alert('Successfully registered!'); window.location.href='http://127.0.0.1:5500/login.html';</script>`);
      } else {
        return res.redirect("http://127.0.0.1:5500/login.html");
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.listen(8800, () => {
  console.log("Server is running on port 8800");
});

