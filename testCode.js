const express = require('express');
const pool = require('./db'); // Make sure you have configured your PostgreSQL connection
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/donor', async (req, res) => {
    const { Name, Age, Gender, Blood_Type, Contact_Info } = req.body;
    console.log(req.body);
    try {
        const newDonor = await pool.query(
            'INSERT INTO Donor (Name, Age, Gender, Blood_Type, Contact_Info) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [Name, Age, Gender, Blood_Type, Contact_Info]
        );

        res.status(201).json(newDonor.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3333,()=>{
    console.log("Server is Running at Port 3333")
})













