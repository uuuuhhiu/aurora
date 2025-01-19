const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('ratings.db'); // This will create a file called ratings.db

// Middleware to parse JSON
app.use(bodyParser.json());

// Serve the frontend (you can adjust this to your folder structure)
app.use(express.static(path.join(__dirname, 'public')));

// Create the ratings table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        avatar TEXT,
        stars INTEGER,
        text TEXT
    )`);
});

// Endpoint to submit a rating
app.post('/submit-rating', (req, res) => {
    const { stars, text } = req.body;

    // For simplicity, we'll use a default avatar
    const avatar = 'https://example.com/default-avatar.png'; // Replace with real avatar URL if available

    const stmt = db.prepare("INSERT INTO ratings (avatar, stars, text) VALUES (?, ?, ?)");
    stmt.run(avatar, stars, text, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error saving rating.' });
        }
        res.status(200).json({ message: 'Rating submitted successfully!' });
    });
});

// Endpoint to fetch all ratings
app.get('/ratings', (req, res) => {
    db.all("SELECT * FROM ratings ORDER BY id DESC", [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error retrieving ratings.' });
        }
        res.json(rows);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
