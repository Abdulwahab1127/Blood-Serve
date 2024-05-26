//this is our final code



const express = require('express')
const app = express()
const path = require("path");
 const pool = require('./db')
 const cors = require('cors')
 const { dirname } = require("path");

 const bodyParser = require('body-parser');



 app.use(cors());
 app.use(express.json())
 app.use(express.urlencoded({ extended: true }));


 

 app.use(bodyParser.urlencoded({ extended: true }));


// Set the views directory and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static("public"));

app.get('/loginDonor', (req, res) => {
    res.render("loginDonor");
});

app.get('/signup', (req, res) => {
    res.render("signup");
});


//Donor

app.get('/donor', async (req,res) => {
    try {
        const random = await pool.query("SELECT * FROM Donor",(error,result)=>{
           if(!error){
            res.json(result.rows);
           }else{
               console.log(error);
           }
        })
        
        console.log(random)
    } catch (error) {
        console.log(error)
    }
})


// GET donor by ID
app.get('/donor/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const donor = await pool.query('SELECT * FROM Donor WHERE donor_id = $1', [id]);
        if (donor.length === 0) {
            res.status(404).json({ error: 'Donor not found' });
        } else {
            res.json(donor.rows);
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




app.post('/donor', async (req, res) => {
    const donor_id = generateRandomId();
    console.log(donor_id);
    const { Name, Age, Gender, Blood_Type, Contact_Info } = req.body;
    console.log(req.body);
    try {
        const newDonor = await pool.query(
            'INSERT INTO Donor (donor_id ,Name, Age, Gender, Blood_Type, Contact_Info) VALUES ($1, $2, $3, $4, $5,$6) RETURNING *', 
            [donor_id, Name, Age, Gender, Blood_Type, Contact_Info]
        );

        res.status(201).json(newDonor.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function generateRandomId(char) {
    const prefix = 'D';
    const randomNumber = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
    const formattedNumber = String(randomNumber).padStart(3, '0'); // Pad the number with leading zeros if necessary
    return prefix + formattedNumber;
}


// PUT update donor by ID
app.put('/donors/:id', async (req, res) => {
    const donorId = req.params.id;
    const { name, age, gender, blood_type, contact_info } = req.body;

    const updateQuery = `
        UPDATE donor
        SET name = $1, age = $2, gender = $3, blood_type = $4, contact_info = $5
        WHERE donor_id = $6
        RETURNING *;
    `;

    try {
        const result = await pool.query(updateQuery, [name, age, gender, blood_type, contact_info, donorId]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Donor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete donor
app.delete('/donors/:id', async (req, res) => {
    const donorId = req.params.id;

    const deleteQuery = `
        DELETE FROM donor
        WHERE donor_id = $1
        RETURNING *;
    `;

    try {
        const result = await pool.query(deleteQuery, [donorId]);
        if (result.rows.length > 0) {
            res.status(200).json({ message: 'Donor deleted successfully' });
        } else {
            res.status(404).json({ message: 'Donor not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});






//Recipient
app.get('/recipient', async (req, res) => {
    try {
        const recipients = await pool.query('SELECT * FROM Recipient');
        res.json(recipients.rows);
        console.log('Retrieved all recipients:', recipients.rows);
    } catch (error) {
        console.error('Error retrieving recipients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/recipient/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const recipient = await pool.query('SELECT * FROM Recipient WHERE recipient_id = $1', [id]);
        if (recipient.rows.length === 0) {
            res.status(404).json({ error: 'Recipient not found' });
        } else {
            res.json(recipient.rows);
            console.log('Retrieved recipient by ID:', recipient.rows);
        }
    } catch (error) {
        console.error('Error retrieving recipient by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/recipient', async (req, res) => {
    const recipient_id = RandomId('R');
    const { name, age, gender, blood_type, contact_info } = req.body;
    try {
        const newRecipient = await pool.query(
            'INSERT INTO Recipient (recipient_id, name, age, gender, blood_type, contact_info) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [recipient_id,name, age, gender, blood_type, contact_info]
        );

        // Check if a recipient was successfully inserted
        if (newRecipient.rows.length === 0) {
            // If no recipient was inserted, respond with an appropriate error message
            return res.status(500).json({ error: 'Failed to add recipient' });
        }

        // Respond with the newly inserted recipient
        res.status(201).json(newRecipient.rows[0]);
        console.log('Added recipient:', newRecipient.rows[0]);
    } catch (error) {
        // Handle any errors that occurred during the insertion process
        console.error('Error adding recipient:', error);
        res.status(500).json({ error: error.message });
    }
});


function RandomId(char) {
    const prefix = 'R';
    const randomNumber = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
    const formattedNumber = String(randomNumber).padStart(3, '0'); // Pad the number with leading zeros if necessary
    return prefix + formattedNumber;
}



app.put('/recipient/:id', async (req, res) => {
   
    const { id } = req.params;
    const { name, age, gender, blood_type, contact_info } = req.body;
    try {
        // Check if all required fields are provided
        if (!name || !age || !gender || !blood_type || !contact_info) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const updatedRecipient = await pool.query(
            'UPDATE Recipient SET name = $1, age = $2, gender = $3, blood_type = $4, contact_info = $5 WHERE recipient_id = $6 RETURNING *',
            [name, age, gender, blood_type, contact_info, id]
        );

        // Check if a recipient with the given ID exists
        if (updatedRecipient.rows.length === 0) {
            return res.status(404).json({ error: 'Recipient not found' });
        }

        res.json(updatedRecipient.rows[0]);
        console.log('Updated recipient:', updatedRecipient.rows[0]);
    } catch (error) {
        console.error('Error updating recipient:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.delete('/recipient/:id', (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM Recipient WHERE recipient_id = $1 RETURNING *';
    pool.query(query, [id], (err, result) => {
        if (!err) {
            if (result.rows.length === 0) {
                res.status(404).json({ error: "Recipient not found" });
            } else {
                res.json({ message: "Recipient deleted successfully" });
            }
        } else {
            console.error("Error executing query:", err);
            res.status(500).json({ error: "Error deleting Recipient" });
        }
    });
});



// CRUD operations for Users table
app.get('/users', async (req, res) => {
    try {
        const users = await pool.query('SELECT * FROM Users');
        res.json(users.rows);
        console.log('Retrieved all users:', users.rows);
    } catch (error) {
        console.error('Error retrieving users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await pool.query('SELECT * FROM Users WHERE id = $1', [id]);
        if (user.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(user.rows);
            console.log('Retrieved user by ID:', user.rows);
        }
    } catch (error) {
        console.error('Error retrieving user by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/users', async (req, res) => {
    const { user_id, email, username, password, role, created_at } = req.body;
    try {
        const newUser = await pool.query('INSERT INTO Users (user_id, email, username, password, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [user_id, email, username, password, role, created_at]);
        res.status(201).json(newUser.rows);
        console.log('Created new user:', newUser.rows);
    } catch (error) {
        console.error('Error creating new user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { user_id, email, username, password, role, created_at } = req.body;
    try {
        const updatedUser = await pool.query('UPDATE Users SET  email=$1, username=$2, password=$3, role=$4, created_at=$5  WHERE user_id = $6 RETURNING *', [ email, username, password, role, created_at, user_id]);
        if (updatedUser.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(updatedUser.rows);
            console.log('Updated user:', updatedUser.rows);
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUser = await pool.query('DELETE FROM Users WHERE id = $1 RETURNING *', [id]);
        if (deletedUser.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
        } else {
            res.json(deletedUser.rows);
            console.log('Deleted user:', deletedUser.rows);
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});








app.post('/signup', async (req, res) => {
    const { email, password, userType } = req.body;
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Store user data in the database
        await pool.query('INSERT INTO Users (email, password, user_type) VALUES ($1, $2, $3)', [email, hashedPassword, userType]);
        res.status(201).send("User created successfully");
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send("Error creating user");
    }
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Fetch user data from the database
        const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
        const user = result.rows[0];
        if (!user) {
            return res.status(400).send("Invalid email or password");
        }
        // Compare passwords
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send("Invalid email or password");
        }
        // Generate JWT token
        const token = jwt.sign({ userId: user.user_id }, 'your_secret_key');
        // Save login data
        await pool.query('INSERT INTO UserLogin (user_id) VALUES ($1)', [user.user_id]);
        res.header('auth-token', token).send(token);
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send("Internal server error");
    }
});


// CRUD operations for UserLogin table
app.get('/userlogins', async (req, res) => {
    try {
        const userLogins = await pool.query('SELECT * FROM UserLogin');
        res.json(userLogins.rows);
        console.log('Retrieved all user logins:', userLogins.rows);
    } catch (error) {
        console.error('Error retrieving user logins:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/userlogins/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const userLogin = await pool.query('SELECT * FROM UserLogin WHERE id = $1', [id]);
        if (userLogin.rows.length === 0) {
            res.status(404).json({ error: 'User login not found' });
        } else {
            res.json(userLogin.rows[0]);
            console.log('Retrieved user login by ID:', userLogin.rows);
        }
    } catch (error) {
        console.error('Error retrieving user login by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/userlogins', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUserLogin = await pool.query('INSERT INTO UserLogin (username, password) VALUES ($1, $2) RETURNING *', [username, password]);
        res.status(201).json(newUserLogin.rows);
        console.log('Created new user login:', newUserLogin.rows);
    } catch (error) {
        console.error('Error creating new user login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.put('/userlogins/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
    try {
        const updatedUserLogin = await pool.query('UPDATE UserLogin SET username = $1, password = $2 WHERE id = $3 RETURNING *', [username, password, id]);
        if (updatedUserLogin.rows.length === 0) {
            res.status(404).json({ error: 'User login not found' });
        } else {
            res.json(updatedUserLogin.rows);
            console.log('Updated user login:', updatedUserLogin.rows);
        }
    } catch (error) {
        console.error('Error updating user login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.delete('/userlogins/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedUserLogin = await pool.query('DELETE FROM UserLogin WHERE id = $1 RETURNING *', [id]);
        if (deletedUserLogin.rows.length === 0) {
            res.status(404).json({ error: 'User login not found' });
        } else {
            res.json(deletedUserLogin.rows[0]);
            console.log('Deleted user login:', deletedUserLogin.rows);
        }
    } catch (error) {
        console.error('Error deleting user login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// CRUD operations for Administrators table
app.get('/administrators', async (req, res) => {
    try {
        const administrators = await pool.query('SELECT * FROM Administrators');
        res.json(administrators.rows);
        console.log('Retrieved all administrators:', administrators.rows);
    } catch (error) {
        console.error('Error retrieving administrators:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/administrators/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const AdministratorById = await pool.query('SELECT * FROM Administrators WHERE administrator_id = $1', [id]);
        if (AdministratorById.length === 0) {
            res.status(404).json({ error: 'Administrator not found' });
        } else {
            res.json(AdministratorById.rows);
        }
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});







app.post('/administrators', async (req, res) => {
    const { administrator_id, administrator_name, email, password, created_at } = req.body;
    try {
        const newAdministrator = await pool.query('INSERT INTO Administrators (administrator_id, administrator_name, email, password, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *', [administrator_id, administrator_name, email, password, created_at]);
        res.status(201).json(newAdministrator.rows[0]); // Accessing the first row of the result
        console.log('Created new administrator:', newAdministrator.rows[0]);
    } catch (error) {
        console.error('Error creating new administrator:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put('/administrators/:id', async (req, res) => {
    const { id } = req.params;
    const { administrator_name, email, password, created_at } = req.body;
    try {
        const updatedAdministrator = await pool.query('UPDATE Administrators SET administrator_name = $1, email = $2, password = $3, created_at = $4 WHERE administrator_id = $5 RETURNING *', [administrator_name, email, password, created_at, id]);
        if (updatedAdministrator.rows.length === 0) {
            res.status(404).json({ error: 'Administrator not found' });
        } else {
            res.json(updatedAdministrator.rows[0]); // Sending only the first row
            console.log('Updated administrator:', updatedAdministrator.rows[0]);
        }
    } catch (error) {
        console.error('Error updating administrator:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.delete('/administrators/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedAdministrator = await pool.query('DELETE FROM Administrators WHERE administrator_id = $1 RETURNING *', [id]);
        if (deletedAdministrator.rows.length === 0) {
            res.status(404).json({ error: 'Administrator not found' });
        } else {
            res.json(deletedAdministrator.rows[0]); // Sending only the first row
            console.log('Deleted administrator:', deletedAdministrator.rows[0]);
        }
    } catch (error) {
        console.error('Error deleting administrator:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// CREATE operation
app.post('/bloodbank', async (req, res) => {
    const { bank_id, name, contact_info } = req.body;
    try {
        // Check if all required fields are provided
        if (!bank_id || !name || !contact_info) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newBloodBank = await pool.query(
            'INSERT INTO Blood_Bank (Bank_ID, Name, Contact_Info) VALUES ($1, $2, $3) RETURNING *',
            [bank_id, name, contact_info]
        );

        res.status(201).json(newBloodBank.rows[0]);
        console.log('Added blood bank:', newBloodBank.rows[0]);
    } catch (error) {
        console.error('Error adding blood bank:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// READ operation
app.get('/bloodbank', async (req, res) => {
    try {
        const bloodBanks = await pool.query('SELECT * FROM Blood_Bank');
        res.json(bloodBanks.rows);
    } catch (error) {
        console.error('Error fetching blood banks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE operation
app.put('/bloodbank/:id', async (req, res) => {
    const { id } = req.params;
    const { name, contact_info } = req.body;
    try {
        const updatedBloodBank = await pool.query(
            'UPDATE Blood_Bank SET Name = $1, Contact_Info = $2 WHERE Bank_ID = $3 RETURNING *',
            [name, contact_info, id]
        );

        if (updatedBloodBank.rows.length === 0) {
            return res.status(404).json({ error: 'Blood bank not found' });
        }

        res.json(updatedBloodBank.rows[0]);
        console.log('Updated blood bank:', updatedBloodBank.rows[0]);
    } catch (error) {
        console.error('Error updating blood bank:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE operation
app.delete('/bloodbank/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBloodBank = await pool.query(
            'DELETE FROM Blood_Bank WHERE Bank_ID = $1 RETURNING *',
            [id]
        );

        if (deletedBloodBank.rows.length === 0) {
            return res.status(404).json({ error: 'Blood bank not found' });
        }

        res.json(deletedBloodBank.rows[0]);
        console.log('Deleted blood bank:', deletedBloodBank.rows[0]);
    } catch (error) {
        console.error('Error deleting blood bank:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/bloodinventory', async (req, res) => {
    const { inventory_id, bank_id, blood_type, quantity, expiry_date } = req.body;
    try {
        const newRecord = await pool.query(
            'INSERT INTO blood_inventory (inventory_id, bank_id, blood_type, quantity, expiry_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [inventory_id, bank_id, blood_type, quantity, expiry_date]
        );
        res.status(201).json(newRecord.rows[0]);
    } catch (error) {
        console.error('Error creating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// READ operation
app.get('/bloodinventory', async (req, res) => {
    try {
        const bloodInventory = await pool.query('SELECT * FROM blood_inventory');
        res.json(bloodInventory.rows);
    } catch (error) {
        console.error('Error fetching blood inventory:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE operation
app.put('/bloodinventory/:inventory_id', async (req, res) => {
    const { inventory_id } = req.params;
    const { bank_id, blood_type, quantity, expiry_date } = req.body;
    try {
        const updatedRecord = await pool.query(
            'UPDATE blood_inventory SET bank_id = $1, blood_type = $2, quantity = $3, expiry_date = $4 WHERE inventory_id = $5 RETURNING *',
            [bank_id, blood_type, quantity, expiry_date, inventory_id]
        );
        if (updatedRecord.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json(updatedRecord.rows[0]);
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE operation
app.delete('/bloodinventory/:inventory_id', async (req, res) => {
    const { inventory_id } = req.params;
    try {
        const deletedRecord = await pool.query('DELETE FROM blood_inventory WHERE inventory_id = $1 RETURNING *', [inventory_id]);
        if (deletedRecord.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// CREATE operation
app.post('/request', async (req, res) => {
    const { request_id, request_date, blood_type, quantity, status, recipient_id } = req.body;
    try {
        // Check if all required fields are provided
        if (!request_id || !request_date || !blood_type || !quantity || !status || !recipient_id) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const newRequest = await pool.query(
            'INSERT INTO Request (Request_ID, Request_Date, Blood_Type, Quantity, Status, Recipient_ID) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [request_id, request_date, blood_type, quantity, status, recipient_id]
        );

        res.status(201).json(newRequest.rows[0]);
        console.log('Added request:', newRequest.rows[0]);
    } catch (error) {
        console.error('Error adding request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// READ operation
app.get('/request', async (req, res) => {
    try {
        const requests = await pool.query('SELECT * FROM Request');
        res.json(requests.rows);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE operation
app.put('/request/:id', async (req, res) => {
    const { id } = req.params;
    const { request_date, blood_type, quantity, status, recipient_id } = req.body;
    try {
        const updatedRequest = await pool.query(
            'UPDATE Request SET Request_Date = $1, Blood_Type = $2, Quantity = $3, Status = $4, Recipient_ID = $5 WHERE Request_ID = $6 RETURNING *',
            [request_date, blood_type, quantity, status, recipient_id, id]
        );

        if (updatedRequest.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json(updatedRequest.rows[0]);
        console.log('Updated request:', updatedRequest.rows[0]);
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE operation
app.delete('/request/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedRequest = await pool.query(
            'DELETE FROM Request WHERE Request_ID = $1 RETURNING *',
            [id]
        );

        if (deletedRequest.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json(deletedRequest.rows[0]);
        console.log('Deleted request:', deletedRequest.rows[0]);
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/donorhealthhistory', async (req, res) => {
    const { healthhistoryid, medicalconditions, medications, allergies, pastsurgeries, donorid } = req.body;
    try {
        const newRecord = await pool.query(
            'INSERT INTO donorhealthhistory (healthhistoryid, medicalconditions, medications, allergies, pastsurgeries, donorid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [healthhistoryid, medicalconditions, medications, allergies, pastsurgeries, donorid]
        );
        res.status(201).json(newRecord.rows[0]);
    } catch (error) {
        console.error('Error creating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// READ operation
app.get('/donorhealthhistory', async (req, res) => {
    try {
        const donorHealthHistories = await pool.query('SELECT * FROM donorHealthHistory');
        res.json(donorHealthHistories.rows);
    } catch (error) {
        console.error('Error fetching donor health histories:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// UPDATE operation
app.put('/donorhealthhistory/:healthhistoryid', async (req, res) => {
    const { healthhistoryid } = req.params;
    const { medicalconditions, medications, allergies, pastsurgeries, donorid } = req.body;
    try {
        const updatedRecord = await pool.query(
            'UPDATE donorhealthhistory SET medicalconditions = $1, medications = $2, allergies = $3, pastsurgeries = $4, donorid = $5 WHERE healthhistoryid = $6 RETURNING *',
            [medicalconditions, medications, allergies, pastsurgeries, donorid, healthhistoryid]
        );
        if (updatedRecord.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json(updatedRecord.rows[0]);
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// DELETE operation
app.delete('/donorhealthhistory/:healthhistoryid', async (req, res) => {
    const { healthhistoryid } = req.params;
    try {
        const deletedRecord = await pool.query('DELETE FROM donorhealthhistory WHERE healthhistoryid = $1 RETURNING *', [healthhistoryid]);
        if (deletedRecord.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/donationhistory', async (req, res) => {
    const { donationhistoryid, donationdate, bloodtype, quantity, hemoglobinlevel, donationstatus, donorid, donationid } = req.body;
    try {
        const newRecord = await pool.query(
            'INSERT INTO donationhistory (donationhistoryid, donationdate, bloodtype, quantity, hemoglobinlevel, donationstatus, donorid, donationid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [donationhistoryid, donationdate, bloodtype, quantity, hemoglobinlevel, donationstatus, donorid, donationid]
        );
        res.status(201).json(newRecord.rows[0]);
    } catch (error) {
        console.error('Error creating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
  
  // READ operation
  app.get('/donationhistory', async (req,res) => {
    try {
        const history = await pool.query("SELECT * FROM donationhistory",(error,result)=>{
           if(!error){
            res.json(result.rows);
           }else{
               console.log(error);
           }
        })
        
        console.log(history)
    } catch (error) {
        console.log(error)
    }
})

  
  // UPDATE operation
  app.put('/donationhistory/:donationhistoryid', async (req, res) => {
    const { donationhistoryid } = req.params;
    const { donationdate, bloodtype, quantity, hemoglobinlevel, donationstatus, donorid, donationid } = req.body;
    try {
        const updatedRecord = await pool.query(
            'UPDATE donationhistory SET donationdate = $1, bloodtype = $2, quantity = $3, hemoglobinlevel = $4, donationstatus = $5, donorid = $6, donationid = $7 WHERE donationhistoryid = $8 RETURNING *',
            [donationdate, bloodtype, quantity, hemoglobinlevel, donationstatus, donorid, donationid, donationhistoryid]
        );
        if (updatedRecord.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json(updatedRecord.rows[0]);
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  // DELETE operation
  app.delete('/donationhistory/:donationhistoryid', async (req, res) => {
    const { donationhistoryid } = req.params;
    try {
        const deletedRecord = await pool.query('DELETE FROM donationhistory WHERE donationhistoryid = $1 RETURNING *', [donationhistoryid]);
        if (deletedRecord.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



  // CRUD operations

// READ operation
app.get('/donoreligibility', async (req, res) => {
    try {
        const donor_eligibility = await pool.query('SELECT * FROM donor_eligibility');
        res.json(donor_eligibility.rows);
    } catch (error) {
        console.error('Error fetching Donor Eligibity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
  

  // CREATE operation
  app.post('/donoreligibility', async (req, res) => {
    const { eligibilityid, donorid, donationid, eligibililtystatus, comment } = req.body;
    try {
        const newRecord = await pool.query(
            'INSERT INTO donor_eligibility (eligibilityid, donorid, donationid, eligibililtystatus, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [eligibilityid, donorid, donationid, eligibililtystatus, comment]
        );
        res.status(201).json(newRecord.rows[0]);
    } catch (error) {
        console.error('Error creating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  
  // UPDATE operation
  app.put('/donoreligibility/:eligibilityid', async (req, res) => {
    const { eligibilityid } = req.params;
    const { donorid, donationid, eligibililtystatus, comment } = req.body;
    try {
        const updatedRecord = await pool.query(
            'UPDATE donor_eligibility SET donorid = $1, donationid = $2, eligibililtystatus = $3, comment = $4 WHERE eligibilityid = $5 RETURNING *',
            [donorid, donationid, eligibililtystatus, comment, eligibilityid]
        );
        if (updatedRecord.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json(updatedRecord.rows[0]);
    } catch (error) {
        console.error('Error updating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

  
  // DELETE operation
  app.delete('/donoreligibility/:eligibilityid', async (req, res) => {
    const { eligibilityid } = req.params;
    try {
        const deletedRecord = await pool.query('DELETE FROM donor_eligibility WHERE eligibilityid = $1 RETURNING *', [eligibilityid]);
        if (deletedRecord.rowCount === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Error deleting record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// READ operation
app.get('/bloodtests', async (req, res) => {
    try {
        const blood_test = await pool.query('SELECT * FROM blood_test');
        res.json(blood_test.rows);
    } catch (error) {
        console.error('Error fetching Blood Tests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/bloodtests/:testid', async (req, res) => {
    const { testid } = req.params;
    try {
      const { rows } = await pool.query('SELECT * FROM blood_test WHERE testid = $1', [testid]);
      res.json(rows[0]);
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.post('/bloodtests', async (req, res) => {
    const { testid, testdate, bloodtype, hemoglobinlevel, donorid, donationid, recipientid } = req.body;
    try {
        const newRecord = await pool.query(
            'INSERT INTO blood_test (testid, testdate, bloodtype, hemoglobinlevel, donorid, donationid, recipientid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [testid, testdate, bloodtype, hemoglobinlevel, donorid, donationid, recipientid]
        );
        res.status(201).json(newRecord.rows[0]);
    } catch (error) {
        console.error('Error creating record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.put('/bloodtests/:testid', async (req, res) => {
    const { testid } = req.params;
    const { testdate, bloodtype, hemoglobinlevel, donorid, donationid, recipientid } = req.body;
    try {
      await pool.query(
        'UPDATE blood_test SET testdate = $1, bloodtype = $2, hemoglobinlevel = $3, donorid = $4, donationid = $5, recipientid = $6 WHERE testid = $7',
        [testdate, bloodtype, hemoglobinlevel, donorid, donationid, recipientid, testid]
      );
      res.json({ message: 'Blood test updated successfully' });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.delete('/bloodtests/:testid', async (req, res) => {
    const { testid } = req.params;
    try {
      await pool.query('DELETE FROM blood_test WHERE testid = $1', [testid]);
      res.json({ message: 'Blood test deleted successfully' });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
//READ operation
app.get('/transfusion', async (req, res) => {
    try {
        const transfusion = await pool.query('SELECT * FROM transfusion');
        res.json(transfusion.rows);
    } catch (error) {
        console.error('Error fetching transfusion:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/transfusion/:transfusionid', async (req, res) => {
    const { transfusionid } = req.params;
    try {
      const { rows } = await pool.query('SELECT * FROM transfusion WHERE transfusionid = $1', [transfusionid]);
      res.json(rows[0]);
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Create a new transfusion
  app.post('/transfusion', async (req, res) => {
    const { transfusionid, recipientid, hospital_id, donationid, transfusiondate, bloodtype, quantity, status } = req.body;
    try {
      await pool.query(
        'INSERT INTO transfusion (transfusionid, recipientid, hospital_id, donationid, transfusiondate, bloodtype, quantity, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [transfusionid, recipientid, hospital_id, donationid, transfusiondate, bloodtype, quantity, status]
      );
      res.status(201).json({ message: 'Transfusion created successfully' });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Update a transfusion
  app.put('/transfusion/:transfusionid', async (req, res) => {
    const { transfusionid } = req.params;
    const { recipientid, hospital_id, donationid, transfusiondate, bloodtype, quantity, status } = req.body;
    try {
      await pool.query(
        'UPDATE transfusion SET recipientid = $1, hospital_id = $2, donationid = $3, transfusiondate = $4, bloodtype = $5, quantity = $6, status = $7 WHERE transfusionid = $8',
        [recipientid, hospital_id, donationid, transfusiondate, bloodtype, quantity, status, transfusionid]
      );
      res.json({ message: 'Transfusion updated successfully' });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // Delete a transfusion
  app.delete('/transfusion/:transfusionid', async (req, res) => {
    const { transfusionid } = req.params;
    try {
      await pool.query('DELETE FROM transfusion WHERE transfusionid = $1', [transfusionid]);
      res.json({ message: 'Transfusion deleted successfully' });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  




app.listen(10000, ()=>{
    console.log("Server is listening at port 10000")
})
















// const express = require('express')
// const app = express()
// const path = require("path");
//  const pool = require('./db')
//  const cors = require('cors')
//  const { dirname } = require("path");

//  const bodyParser = require('body-parser');


//  app.use(cors());
//  app.use(express.json())
//  app.use(express.urlencoded({ extended: true }));
 

//  app.use(bodyParser.urlencoded({ extended: true }));


// // Set the views directory and view engine
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use(express.static("public"));

// app.get('/loginDonor', (req, res) => {
//     res.render("loginDonor");
// });

// app.get('/signup', (req, res) => {
//     res.render("signup");
// });


// //Donor



// app.get('/donor', async (req,res) => {
//     try {
//         const random = await pool.query("SELECT * FROM Donor",(error,result)=>{
//            if(!error){
//             res.json(result.rows);
//            }else{
//                console.log(error);
//            }
//         })
        
//         console.log(random)
//     } catch (error) {
//         console.log(error)
//     }
// })


// // GET donor by ID
// app.get('/donor/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const donor = await pool.query('SELECT * FROM Donor WHERE donor_id = $1', [id]);
//         if (donor.length === 0) {
//             res.status(404).json({ error: 'Donor not found' });
//         } else {
//             res.json(donor.rows);
//         }
        
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });




// app.post('/donor', async (req, res) => {
//     const donor_id = generateRandomId();
//     console.log(donor_id);
//     const { Name, Age, Gender, Blood_Type, Contact_Info } = req.body;
//     console.log(req.body);
//     try {
//         const newDonor = await pool.query(
//             'INSERT INTO Donor (donor_id ,Name, Age, Gender, Blood_Type, Contact_Info) VALUES ($1, $2, $3, $4, $5,$6) RETURNING *', 
//             [donor_id, Name, Age, Gender, Blood_Type, Contact_Info]
//         );

//         res.status(201).json(newDonor.rows);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// function generateRandomId(char) {
//     const prefix = 'D';
//     const randomNumber = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
//     const formattedNumber = String(randomNumber).padStart(3, '0'); // Pad the number with leading zeros if necessary
//     return prefix + formattedNumber;
// }


// // PUT update donor by ID
// app.put('/donor/:id', async (req, res) => {
//     console.log(req.params)
//     console.log(req.body)
//     const { id } = req.params;
//     const { Donor_ID, Name, Age, Gender, Blood_Type, Contact_Info } = req.body;
//     try {
//         const updatedDonor = await pool.query(
//             'UPDATE Donor SET Name = $1, Age = $2, Gender = $3 , Blood_type=$4 , Contact_Info=$5  WHERE donor_id = $6 RETURNING *',
//             [ Name, Age, Gender, Blood_Type, Contact_Info, id]
//         );
//         if (updatedDonor.length === 0) {
//             res.status(404).json({ error: 'Donor not found' });
//         } else {
//             res.json(updatedDonor.rows);
//         }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // DELETE donor by ID
// app.delete('/donor/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const deletedDonor = await pool.query('DELETE FROM Donor WHERE donor_id = $1 RETURNING *', [id]);
//         if (deletedDonor.length === 0) {
//             res.status(404).json({ error: 'Donor not found' });
//         } else {
//             res.json({ message: 'Donor deleted successfully' });
//         }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });






// //Recipient
// app.get('/recipient', async (req, res) => {
//     try {
//         const recipients = await pool.query('SELECT * FROM Recipient');
//         res.json(recipients.rows);
//         console.log('Retrieved all recipients:', recipients.rows);
//     } catch (error) {
//         console.error('Error retrieving recipients:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.get('/recipient/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const recipient = await pool.query('SELECT * FROM Recipient WHERE recipient_id = $1', [id]);
//         if (recipient.rows.length === 0) {
//             res.status(404).json({ error: 'Recipient not found' });
//         } else {
//             res.json(recipient.rows);
//             console.log('Retrieved recipient by ID:', recipient.rows);
//         }
//     } catch (error) {
//         console.error('Error retrieving recipient by ID:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.post('/recipient', async (req, res) => {
//     const recipient_id = RandomId('R');
//     const { name, age, gender, blood_type, contact_info } = req.body;
//     try {
//         const newRecipient = await pool.query(
//             'INSERT INTO Recipient (recipient_id, name, age, gender, blood_type, contact_info) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
//             [recipient_id,name, age, gender, blood_type, contact_info]
//         );

//         // Check if a recipient was successfully inserted
//         if (newRecipient.rows.length === 0) {
//             // If no recipient was inserted, respond with an appropriate error message
//             return res.status(500).json({ error: 'Failed to add recipient' });
//         }

//         // Respond with the newly inserted recipient
//         res.status(201).json(newRecipient.rows[0]);
//         console.log('Added recipient:', newRecipient.rows[0]);
//     } catch (error) {
//         // Handle any errors that occurred during the insertion process
//         console.error('Error adding recipient:', error);
//         res.status(500).json({ error: error.message });
//     }
// });


// function RandomId(char) {
//     const prefix = 'R';
//     const randomNumber = Math.floor(Math.random() * 1000); // Generate a random number between 0 and 999
//     const formattedNumber = String(randomNumber).padStart(3, '0'); // Pad the number with leading zeros if necessary
//     return prefix + formattedNumber;
// }



// app.put('/recipient/:id', async (req, res) => {
   
//     const { id } = req.params;
//     const { name, age, gender, blood_type, contact_info } = req.body;
//     try {
//         // Check if all required fields are provided
//         if (!name || !age || !gender || !blood_type || !contact_info) {
//             return res.status(400).json({ error: 'All fields are required' });
//         }

//         const updatedRecipient = await pool.query(
//             'UPDATE Recipient SET name = $1, age = $2, gender = $3, blood_type = $4, contact_info = $5 WHERE recipient_id = $6 RETURNING *',
//             [name, age, gender, blood_type, contact_info, id]
//         );

//         // Check if a recipient with the given ID exists
//         if (updatedRecipient.rows.length === 0) {
//             return res.status(404).json({ error: 'Recipient not found' });
//         }

//         res.json(updatedRecipient.rows[0]);
//         console.log('Updated recipient:', updatedRecipient.rows[0]);
//     } catch (error) {
//         console.error('Error updating recipient:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// app.delete('/recipient/:id', (req, res) => {
//     const id = req.params.id;
//     const query = 'DELETE FROM Recipient WHERE recipient_id = $1 RETURNING *';
//     pool.query(query, [id], (err, result) => {
//         if (!err) {
//             if (result.rows.length === 0) {
//                 res.status(404).json({ error: "Recipient not found" });
//             } else {
//                 res.json({ message: "Recipient deleted successfully" });
//             }
//         } else {
//             console.error("Error executing query:", err);
//             res.status(500).json({ error: "Error deleting Recipient" });
//         }
//     });
// });



// // CRUD operations for Users table
// app.get('/users', async (req, res) => {
//     try {
//         const users = await pool.query('SELECT * FROM Users');
//         res.json(users.rows);
//         console.log('Retrieved all users:', users.rows);
//     } catch (error) {
//         console.error('Error retrieving users:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.get('/user/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const user = await pool.query('SELECT * FROM Users WHERE id = $1', [id]);
//         if (user.rows.length === 0) {
//             res.status(404).json({ error: 'User not found' });
//         } else {
//             res.json(user.rows);
//             console.log('Retrieved user by ID:', user.rows);
//         }
//     } catch (error) {
//         console.error('Error retrieving user by ID:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.post('/users', async (req, res) => {
//     const { user_id, email, username, password, role, created_at } = req.body;
//     try {
//         const newUser = await pool.query('INSERT INTO Users (user_id, email, username, password, role, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [user_id, email, username, password, role, created_at]);
//         res.status(201).json(newUser.rows);
//         console.log('Created new user:', newUser.rows);
//     } catch (error) {
//         console.error('Error creating new user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// app.put('/users/:id', async (req, res) => {
//     const { id } = req.params;
//     const { user_id, email, username, password, role, created_at } = req.body;
//     try {
//         const updatedUser = await pool.query('UPDATE Users SET  email=$1, username=$2, password=$3, role=$4, created_at=$5  WHERE user_id = $6 RETURNING *', [ email, username, password, role, created_at, user_id]);
//         if (updatedUser.rows.length === 0) {
//             res.status(404).json({ error: 'User not found' });
//         } else {
//             res.json(updatedUser.rows);
//             console.log('Updated user:', updatedUser.rows);
//         }
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.delete('/users/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const deletedUser = await pool.query('DELETE FROM Users WHERE id = $1 RETURNING *', [id]);
//         if (deletedUser.rows.length === 0) {
//             res.status(404).json({ error: 'User not found' });
//         } else {
//             res.json(deletedUser.rows);
//             console.log('Deleted user:', deletedUser.rows);
//         }
//     } catch (error) {
//         console.error('Error deleting user:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });






// app.post('/signup', async (req, res) => {
//     const { email, password, userType } = req.body;
//     try {
//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);
//         // Store user data in the database
//         await pool.query('INSERT INTO Users (email, password, user_type) VALUES ($1, $2, $3)', [email, hashedPassword, userType]);
//         res.status(201).send("User created successfully");
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).send("Error creating user");
//     }
// });

// // Login endpoint
// app.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         // Fetch user data from the database
//         const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
//         const user = result.rows[0];
//         if (!user) {
//             return res.status(400).send("Invalid email or password");
//         }
//         // Compare passwords
//         const validPassword = await bcrypt.compare(password, user.password);
//         if (!validPassword) {
//             return res.status(400).send("Invalid email or password");
//         }
//         // Generate JWT token
//         const token = jwt.sign({ userId: user.user_id }, 'your_secret_key');
//         // Save login data
//         await pool.query('INSERT INTO UserLogin (user_id) VALUES ($1)', [user.user_id]);
//         res.header('auth-token', token).send(token);
//     } catch (error) {
//         console.error('Error logging in:', error);
//         res.status(500).send("Internal server error");
//     }
// });


// // CRUD operations for UserLogin table
// app.get('/userlogins', async (req, res) => {
//     try {
//         const userLogins = await pool.query('SELECT * FROM UserLogin');
//         res.json(userLogins.rows);
//         console.log('Retrieved all user logins:', userLogins.rows);
//     } catch (error) {
//         console.error('Error retrieving user logins:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.get('/userlogins/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const userLogin = await pool.query('SELECT * FROM UserLogin WHERE id = $1', [id]);
//         if (userLogin.rows.length === 0) {
//             res.status(404).json({ error: 'User login not found' });
//         } else {
//             res.json(userLogin.rows[0]);
//             console.log('Retrieved user login by ID:', userLogin.rows);
//         }
//     } catch (error) {
//         console.error('Error retrieving user login by ID:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.post('/userlogins', async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         const newUserLogin = await pool.query('INSERT INTO UserLogin (username, password) VALUES ($1, $2) RETURNING *', [username, password]);
//         res.status(201).json(newUserLogin.rows);
//         console.log('Created new user login:', newUserLogin.rows);
//     } catch (error) {
//         console.error('Error creating new user login:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.put('/userlogins/:id', async (req, res) => {
//     const { id } = req.params;
//     const { username, password } = req.body;
//     try {
//         const updatedUserLogin = await pool.query('UPDATE UserLogin SET username = $1, password = $2 WHERE id = $3 RETURNING *', [username, password, id]);
//         if (updatedUserLogin.rows.length === 0) {
//             res.status(404).json({ error: 'User login not found' });
//         } else {
//             res.json(updatedUserLogin.rows);
//             console.log('Updated user login:', updatedUserLogin.rows);
//         }
//     } catch (error) {
//         console.error('Error updating user login:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.delete('/userlogins/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const deletedUserLogin = await pool.query('DELETE FROM UserLogin WHERE id = $1 RETURNING *', [id]);
//         if (deletedUserLogin.rows.length === 0) {
//             res.status(404).json({ error: 'User login not found' });
//         } else {
//             res.json(deletedUserLogin.rows[0]);
//             console.log('Deleted user login:', deletedUserLogin.rows);
//         }
//     } catch (error) {
//         console.error('Error deleting user login:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // CRUD operations for Administrators table
// app.get('/administrators', async (req, res) => {
//     try {
//         const administrators = await pool.query('SELECT * FROM Administrators');
//         res.json(administrators.rows);
//         console.log('Retrieved all administrators:', administrators.rows);
//     } catch (error) {
//         console.error('Error retrieving administrators:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.get('/administrators/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const AdministratorById = await pool.query('SELECT * FROM Administrators WHERE administrator_id = $1', [id]);
//         if (AdministratorById.length === 0) {
//             res.status(404).json({ error: 'Administrator not found' });
//         } else {
//             res.json(AdministratorById.rows);
//         }
        
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });



// app.post('/administrators', async (req, res) => {
//     const { administrator_id, administrator_name, email, password, created_at } = req.body;
//     try {
//         const newAdministrator = await pool.query('INSERT INTO Administrators (administrator_id, administrator_name, email, password, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *', [administrator_id, administrator_name, email, password, created_at]);
//         res.status(201).json(newAdministrator.rows[0]); // Accessing the first row of the result
//         console.log('Created new administrator:', newAdministrator.rows[0]);
//     } catch (error) {
//         console.error('Error creating new administrator:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// app.put('/administrators/:id', async (req, res) => {
//     const { id } = req.params;
//     const { administrator_name, email, password, created_at } = req.body;
//     try {
//         const updatedAdministrator = await pool.query('UPDATE Administrators SET administrator_name = $1, email = $2, password = $3, created_at = $4 WHERE administrator_id = $5 RETURNING *', [administrator_name, email, password, created_at, id]);
//         if (updatedAdministrator.rows.length === 0) {
//             res.status(404).json({ error: 'Administrator not found' });
//         } else {
//             res.json(updatedAdministrator.rows[0]); // Sending only the first row
//             console.log('Updated administrator:', updatedAdministrator.rows[0]);
//         }
//     } catch (error) {
//         console.error('Error updating administrator:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// app.delete('/administrators/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const deletedAdministrator = await pool.query('DELETE FROM Administrators WHERE administrator_id = $1 RETURNING *', [id]);
//         if (deletedAdministrator.rows.length === 0) {
//             res.status(404).json({ error: 'Administrator not found' });
//         } else {
//             res.json(deletedAdministrator.rows[0]); // Sending only the first row
//             console.log('Deleted administrator:', deletedAdministrator.rows[0]);
//         }
//     } catch (error) {
//         console.error('Error deleting administrator:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });



// // CREATE operation
// app.post('/bloodbank', async (req, res) => {
//     const { bank_id, name, contact_info } = req.body;
//     try {
//         // Check if all required fields are provided
//         if (!bank_id || !name || !contact_info) {
//             return res.status(400).json({ error: 'All fields are required' });
//         }

//         const newBloodBank = await pool.query(
//             'INSERT INTO Blood_Bank (Bank_ID, Name, Contact_Info) VALUES ($1, $2, $3) RETURNING *',
//             [bank_id, name, contact_info]
//         );

//         res.status(201).json(newBloodBank.rows[0]);
//         console.log('Added blood bank:', newBloodBank.rows[0]);
//     } catch (error) {
//         console.error('Error adding blood bank:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // READ operation
// app.get('/bloodbank', async (req, res) => {
//     try {
//         const bloodBanks = await pool.query('SELECT * FROM Blood_Bank');
//         res.json(bloodBanks.rows);
//     } catch (error) {
//         console.error('Error fetching blood banks:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // UPDATE operation
// app.put('/bloodbank/:id', async (req, res) => {
//     const { id } = req.params;
//     const { name, contact_info } = req.body;
//     try {
//         const updatedBloodBank = await pool.query(
//             'UPDATE Blood_Bank SET Name = $1, Contact_Info = $2 WHERE Bank_ID = $3 RETURNING *',
//             [name, contact_info, id]
//         );

//         if (updatedBloodBank.rows.length === 0) {
//             return res.status(404).json({ error: 'Blood bank not found' });
//         }

//         res.json(updatedBloodBank.rows[0]);
//         console.log('Updated blood bank:', updatedBloodBank.rows[0]);
//     } catch (error) {
//         console.error('Error updating blood bank:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // DELETE operation
// app.delete('/bloodbank/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const deletedBloodBank = await pool.query(
//             'DELETE FROM Blood_Bank WHERE Bank_ID = $1 RETURNING *',
//             [id]
//         );

//         if (deletedBloodBank.rows.length === 0) {
//             return res.status(404).json({ error: 'Blood bank not found' });
//         }

//         res.json(deletedBloodBank.rows[0]);
//         console.log('Deleted blood bank:', deletedBloodBank.rows[0]);
//     } catch (error) {
//         console.error('Error deleting blood bank:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });



// app.post('/bloodinventory', async (req, res) => {
//     const { inventory_id, bank_id, blood_type, quantity, expiry_date } = req.body;
//     try {
//         const newRecord = await pool.query(
//             'INSERT INTO blood_inventory (inventory_id, bank_id, blood_type, quantity, expiry_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//             [inventory_id, bank_id, blood_type, quantity, expiry_date]
//         );
//         res.status(201).json(newRecord.rows[0]);
//     } catch (error) {
//         console.error('Error creating record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// // READ operation
// app.get('/bloodinventory', async (req, res) => {
//     try {
//         const bloodInventory = await pool.query('SELECT * FROM blood_inventory');
//         res.json(bloodInventory.rows);
//     } catch (error) {
//         console.error('Error fetching blood inventory:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // UPDATE operation
// app.put('/bloodinventory/:inventory_id', async (req, res) => {
//     const { inventory_id } = req.params;
//     const { bank_id, blood_type, quantity, expiry_date } = req.body;
//     try {
//         const updatedRecord = await pool.query(
//             'UPDATE blood_inventory SET bank_id = $1, blood_type = $2, quantity = $3, expiry_date = $4 WHERE inventory_id = $5 RETURNING *',
//             [bank_id, blood_type, quantity, expiry_date, inventory_id]
//         );
//         if (updatedRecord.rowCount === 0) {
//             return res.status(404).json({ error: 'Record not found' });
//         }
//         res.json(updatedRecord.rows[0]);
//     } catch (error) {
//         console.error('Error updating record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // DELETE operation
// app.delete('/bloodinventory/:inventory_id', async (req, res) => {
//     const { inventory_id } = req.params;
//     try {
//         const deletedRecord = await pool.query('DELETE FROM blood_inventory WHERE inventory_id = $1 RETURNING *', [inventory_id]);
//         if (deletedRecord.rowCount === 0) {
//             return res.status(404).json({ error: 'Record not found' });
//         }
//         res.json({ message: 'Record deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });



// // CREATE operation
// app.post('/request', async (req, res) => {
//     const { request_id, request_date, blood_type, quantity, status, recipient_id } = req.body;
//     try {
//         // Check if all required fields are provided
//         if (!request_id || !request_date || !blood_type || !quantity || !status || !recipient_id) {
//             return res.status(400).json({ error: 'All fields are required' });
//         }

//         const newRequest = await pool.query(
//             'INSERT INTO Request (Request_ID, Request_Date, Blood_Type, Quantity, Status, Recipient_ID) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
//             [request_id, request_date, blood_type, quantity, status, recipient_id]
//         );

//         res.status(201).json(newRequest.rows[0]);
//         console.log('Added request:', newRequest.rows[0]);
//     } catch (error) {
//         console.error('Error adding request:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // READ operation
// app.get('/request', async (req, res) => {
//     try {
//         const requests = await pool.query('SELECT * FROM Request');
//         res.json(requests.rows);
//     } catch (error) {
//         console.error('Error fetching requests:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // UPDATE operation
// app.put('/request/:id', async (req, res) => {
//     const { id } = req.params;
//     const { request_date, blood_type, quantity, status, recipient_id } = req.body;
//     try {
//         const updatedRequest = await pool.query(
//             'UPDATE Request SET Request_Date = $1, Blood_Type = $2, Quantity = $3, Status = $4, Recipient_ID = $5 WHERE Request_ID = $6 RETURNING *',
//             [request_date, blood_type, quantity, status, recipient_id, id]
//         );

//         if (updatedRequest.rows.length === 0) {
//             return res.status(404).json({ error: 'Request not found' });
//         }

//         res.json(updatedRequest.rows[0]);
//         console.log('Updated request:', updatedRequest.rows[0]);
//     } catch (error) {
//         console.error('Error updating request:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // DELETE operation
// app.delete('/request/:id', async (req, res) => {
//     const { id } = req.params;
//     try {
//         const deletedRequest = await pool.query(
//             'DELETE FROM Request WHERE Request_ID = $1 RETURNING *',
//             [id]
//         );

//         if (deletedRequest.rows.length === 0) {
//             return res.status(404).json({ error: 'Request not found' });
//         }

//         res.json(deletedRequest.rows[0]);
//         console.log('Deleted request:', deletedRequest.rows[0]);
//     } catch (error) {
//         console.error('Error deleting request:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.post('/donorhealthhistory', async (req, res) => {
//     const { healthhistoryid, medicalconditions, medications, allergies, pastsurgeries, donorid } = req.body;
//     try {
//         const newRecord = await pool.query(
//             'INSERT INTO donorhealthhistory (healthhistoryid, medicalconditions, medications, allergies, pastsurgeries, donorid) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
//             [healthhistoryid, medicalconditions, medications, allergies, pastsurgeries, donorid]
//         );
//         res.status(201).json(newRecord.rows[0]);
//     } catch (error) {
//         console.error('Error creating record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // READ operation
// app.get('/donorhealthhistory', async (req, res) => {
//     try {
//         const donorHealthHistories = await pool.query('SELECT * FROM donorHealthHistory');
//         res.json(donorHealthHistories.rows);
//     } catch (error) {
//         console.error('Error fetching donor health histories:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // UPDATE operation
// app.put('/donorhealthhistory/:healthhistoryid', async (req, res) => {
//     const { healthhistoryid } = req.params;
//     const { medicalconditions, medications, allergies, pastsurgeries, donorid } = req.body;
//     try {
//         const updatedRecord = await pool.query(
//             'UPDATE donorhealthhistory SET medicalconditions = $1, medications = $2, allergies = $3, pastsurgeries = $4, donorid = $5 WHERE healthhistoryid = $6 RETURNING *',
//             [medicalconditions, medications, allergies, pastsurgeries, donorid, healthhistoryid]
//         );
//         if (updatedRecord.rowCount === 0) {
//             return res.status(404).json({ error: 'Record not found' });
//         }
//         res.json(updatedRecord.rows[0]);
//     } catch (error) {
//         console.error('Error updating record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// // DELETE operation
// app.delete('/donorhealthhistory/:healthhistoryid', async (req, res) => {
//     const { healthhistoryid } = req.params;
//     try {
//         const deletedRecord = await pool.query('DELETE FROM donorhealthhistory WHERE healthhistoryid = $1 RETURNING *', [healthhistoryid]);
//         if (deletedRecord.rowCount === 0) {
//             return res.status(404).json({ error: 'Record not found' });
//         }
//         res.json({ message: 'Record deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });



// app.post('/donationhistory', async (req, res) => {
//     const { donationhistoryid, donationdate, bloodtype, quantity, hemoglobinlevel, donationstatus, donorid, donationid } = req.body;
//     try {
//         const newRecord = await pool.query(
//             'INSERT INTO donationhistory (donationhistoryid, donationdate, bloodtype, quantity, hemoglobinlevel, donationstatus, donorid, donationid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
//             [donationhistoryid, donationdate, bloodtype, quantity, hemoglobinlevel, donationstatus, donorid, donationid]
//         );
//         res.status(201).json(newRecord.rows[0]);
//     } catch (error) {
//         console.error('Error creating record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });
  
//   // READ operation
//   app.get('/donationhistory', async (req,res) => {
//     try {
//         const history = await pool.query("SELECT * FROM donationhistory",(error,result)=>{
//            if(!error){
//             res.json(result.rows);
//            }else{
//                console.log(error);
//            }
//         })
        
//         console.log(history)
//     } catch (error) {
//         console.log(error)
//     }
// })

  
//   // UPDATE operation
//   app.put('/donationhistory/:donationhistoryid', async (req, res) => {
//     const { donationhistoryid } = req.params;
//     const { donationdate, bloodtype, quantity, hemoglobinlevel, donationstatus, donorid, donationid } = req.body;
//     try {
//         const updatedRecord = await pool.query(
//             'UPDATE donationhistory SET donationdate = $1, bloodtype = $2, quantity = $3, hemoglobinlevel = $4, donationstatus = $5, donorid = $6, donationid = $7 WHERE donationhistoryid = $8 RETURNING *',
//             [donationdate, bloodtype, quantity, hemoglobinlevel, donationstatus, donorid, donationid, donationhistoryid]
//         );
//         if (updatedRecord.rowCount === 0) {
//             return res.status(404).json({ error: 'Record not found' });
//         }
//         res.json(updatedRecord.rows[0]);
//     } catch (error) {
//         console.error('Error updating record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

//   // DELETE operation
//   app.delete('/donationhistory/:donationhistoryid', async (req, res) => {
//     const { donationhistoryid } = req.params;
//     try {
//         const deletedRecord = await pool.query('DELETE FROM donationhistory WHERE donationhistoryid = $1 RETURNING *', [donationhistoryid]);
//         if (deletedRecord.rowCount === 0) {
//             return res.status(404).json({ error: 'Record not found' });
//         }
//         res.json({ message: 'Record deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });



//   // CRUD operations

// // READ operation
// app.get('/donoreligibility', async (req, res) => {
//     try {
//         const donor_eligibility = await pool.query('SELECT * FROM donor_eligibility');
//         res.json(donor_eligibility.rows);
//     } catch (error) {
//         console.error('Error fetching Donor Eligibity:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });
  

//   // CREATE operation
//   app.post('/donoreligibility', async (req, res) => {
//     const { eligibilityid, donorid, donationid, eligibililtystatus, comment } = req.body;
//     try {
//         const newRecord = await pool.query(
//             'INSERT INTO donor_eligibility (eligibilityid, donorid, donationid, eligibililtystatus, comment) VALUES ($1, $2, $3, $4, $5) RETURNING *',
//             [eligibilityid, donorid, donationid, eligibililtystatus, comment]
//         );
//         res.status(201).json(newRecord.rows[0]);
//     } catch (error) {
//         console.error('Error creating record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

  
//   // UPDATE operation
//   app.put('/donoreligibility/:eligibilityid', async (req, res) => {
//     const { eligibilityid } = req.params;
//     const { donorid, donationid, eligibililtystatus, comment } = req.body;
//     try {
//         const updatedRecord = await pool.query(
//             'UPDATE donor_eligibility SET donorid = $1, donationid = $2, eligibililtystatus = $3, comment = $4 WHERE eligibilityid = $5 RETURNING *',
//             [donorid, donationid, eligibililtystatus, comment, eligibilityid]
//         );
//         if (updatedRecord.rowCount === 0) {
//             return res.status(404).json({ error: 'Record not found' });
//         }
//         res.json(updatedRecord.rows[0]);
//     } catch (error) {
//         console.error('Error updating record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

  
//   // DELETE operation
//   app.delete('/donoreligibility/:eligibilityid', async (req, res) => {
//     const { eligibilityid } = req.params;
//     try {
//         const deletedRecord = await pool.query('DELETE FROM donor_eligibility WHERE eligibilityid = $1 RETURNING *', [eligibilityid]);
//         if (deletedRecord.rowCount === 0) {
//             return res.status(404).json({ error: 'Record not found' });
//         }
//         res.json({ message: 'Record deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// // READ operation
// app.get('/bloodtests', async (req, res) => {
//     try {
//         const blood_test = await pool.query('SELECT * FROM blood_test');
//         res.json(blood_test.rows);
//     } catch (error) {
//         console.error('Error fetching Blood Tests:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.get('/bloodtests/:testid', async (req, res) => {
//     const { testid } = req.params;
//     try {
//       const { rows } = await pool.query('SELECT * FROM blood_test WHERE testid = $1', [testid]);
//       res.json(rows[0]);
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });

// app.post('/bloodtests', async (req, res) => {
//     const { testid, testdate, bloodtype, hemoglobinlevel, donorid, donationid, recipientid } = req.body;
//     try {
//         const newRecord = await pool.query(
//             'INSERT INTO blood_test (testid, testdate, bloodtype, hemoglobinlevel, donorid, donationid, recipientid) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
//             [testid, testdate, bloodtype, hemoglobinlevel, donorid, donationid, recipientid]
//         );
//         res.status(201).json(newRecord.rows[0]);
//     } catch (error) {
//         console.error('Error creating record:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// app.put('/bloodtests/:testid', async (req, res) => {
//     const { testid } = req.params;
//     const { testdate, bloodtype, hemoglobinlevel, donorid, donationid, recipientid } = req.body;
//     try {
//       await pool.query(
//         'UPDATE blood_test SET testdate = $1, bloodtype = $2, hemoglobinlevel = $3, donorid = $4, donationid = $5, recipientid = $6 WHERE testid = $7',
//         [testdate, bloodtype, hemoglobinlevel, donorid, donationid, recipientid, testid]
//       );
//       res.json({ message: 'Blood test updated successfully' });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });


// app.delete('/bloodtests/:testid', async (req, res) => {
//     const { testid } = req.params;
//     try {
//       await pool.query('DELETE FROM blood_test WHERE testid = $1', [testid]);
//       res.json({ message: 'Blood test deleted successfully' });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  
// //READ operation
// app.get('/transfusion', async (req, res) => {
//     try {
//         const transfusion = await pool.query('SELECT * FROM transfusion');
//         res.json(transfusion.rows);
//     } catch (error) {
//         console.error('Error fetching transfusion:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// app.get('/transfusion/:transfusionid', async (req, res) => {
//     const { transfusionid } = req.params;
//     try {
//       const { rows } = await pool.query('SELECT * FROM transfusion WHERE transfusionid = $1', [transfusionid]);
//       res.json(rows[0]);
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  
//   // Create a new transfusion
//   app.post('/transfusion', async (req, res) => {
//     const { transfusionid, recipientid, hospital_id, donationid, transfusiondate, bloodtype, quantity, status } = req.body;
//     try {
//       await pool.query(
//         'INSERT INTO transfusion (transfusionid, recipientid, hospital_id, donationid, transfusiondate, bloodtype, quantity, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
//         [transfusionid, recipientid, hospital_id, donationid, transfusiondate, bloodtype, quantity, status]
//       );
//       res.status(201).json({ message: 'Transfusion created successfully' });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  
//   // Update a transfusion
//   app.put('/transfusion/:transfusionid', async (req, res) => {
//     const { transfusionid } = req.params;
//     const { recipientid, hospital_id, donationid, transfusiondate, bloodtype, quantity, status } = req.body;
//     try {
//       await pool.query(
//         'UPDATE transfusion SET recipientid = $1, hospital_id = $2, donationid = $3, transfusiondate = $4, bloodtype = $5, quantity = $6, status = $7 WHERE transfusionid = $8',
//         [recipientid, hospital_id, donationid, transfusiondate, bloodtype, quantity, status, transfusionid]
//       );
//       res.json({ message: 'Transfusion updated successfully' });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  
//   // Delete a transfusion
//   app.delete('/transfusion/:transfusionid', async (req, res) => {
//     const { transfusionid } = req.params;
//     try {
//       await pool.query('DELETE FROM transfusion WHERE transfusionid = $1', [transfusionid]);
//       res.json({ message: 'Transfusion deleted successfully' });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   });
  




// app.listen(10000, ()=>{
//     console.log("Server is listening at port 10000")
// })

