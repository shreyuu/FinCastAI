"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mysql2_1 = __importDefault(require("mysql2"));
// Initialize express app
const app = (0, express_1.default)();
const router = express_1.default.Router();
const PORT = 3001;
// Use CORS and JSON middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// MySQL Database connection
const db = mysql2_1.default.createConnection({
    host: 'localhost',
    user: 'root', // Your MySQL username
    password: 'Siddhesh@05', // Your MySQL password
    database: 'signup_db' // Database you created
});
// Connect to MySQL
db.connect((err) => {
    if (err) {
        console.error('Could not connect to MySQL:', err);
        process.exit(1); // Exit if MySQL connection fails
    }
    console.log('Connected to MySQL');
});
// Create user handler
const createUserHandler = (req, res) => {
    const { name, email, password, dob, gender } = req.body;
    if (!name || !email || !password || !dob || !gender) {
        res.status(400).json({ error: 'All fields are required.' });
        return;
    }
    // Check if the user already exists
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            res.status(500).json({ error: 'Server error.' });
            return;
        }
        if (Array.isArray(results) && results.length > 0) {
            // User already exists
            res.status(409).json({ error: 'User already exists.' });
            return;
        }
        // Insert new user into the database
        const insertQuery = 'INSERT INTO users (name, email, password, dob, gender) VALUES (?, ?, ?, ?, ?)';
        db.query(insertQuery, [name, email, password, dob, gender], (err, results) => {
            if (err) {
                console.error('Error inserting user:', err);
                res.status(500).json({ error: 'Server error.' });
                return;
            }
            // The results here are an array of ResultSetHeader
            const insertId = results.insertId;
            res.status(201).json({
                message: 'User created successfully',
                user: { id: insertId, name, email, dob, gender },
            });
        });
    });
};
// Register the route
router.post('/users', createUserHandler);
// Register router with the app
app.use(router);
app.post('/users/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }
        const user = results[0];
        // Compare the plain text password directly without bcrypt
        if (user.password !== password) {
            return res.status(401).json({ error: 'Incorrect password.' });
        }
        // Optionally remove password before sending user info
        delete user.password;
        res.status(200).json({ message: 'Login successful', user });
    });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
