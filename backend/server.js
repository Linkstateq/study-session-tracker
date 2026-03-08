const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// enable CORS so frontend can communicate with backend
app.use(cors());

// parse JSON request bodies
app.use(express.json());

// Create database connection
const db = new sqlite3.Database("./database.db");

// Create table if it doesn't exist
db.run(`
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject TEXT,
    duration INTEGER,
    date TEXT,
    productivity INTEGER
)
`);

// Test route
app.get("/", (req, res) => {
    res.send("Study Session Tracker Backend Running");
});

// Get all sessions
app.get("/sessions", (req, res) => {

    db.all("SELECT * FROM sessions", (err, rows) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(rows);
    });

});

// Add session
app.post("/sessions", (req, res) => {

    const { subject, duration, date, productivity } = req.body;

    db.run(
        `INSERT INTO sessions(subject,duration,date,productivity)
         VALUES(?,?,?,?)`,
        [subject, duration, date, productivity],
        function (err) {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Session added",
                id: this.lastID
            });

        }
    );

});

// Update a session
app.put("/sessions/:id", (req, res) => {

    const id = req.params.id;
    const { subject, duration, date, productivity } = req.body;

    db.run(
        `UPDATE sessions 
         SET subject=?, duration=?, date=?, productivity=? 
         WHERE id=?`,
        [subject, duration, date, productivity, id],
        function (err) {

            if (err) {
                return res.status(500).json(err);
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "Session not found" });
            }

            res.json({ message: "Session updated successfully" });

        }
    );

});

// Delete session
app.delete("/sessions/:id", (req, res) => {

    const id = req.params.id;

    db.run("DELETE FROM sessions WHERE id=?", [id], function (err) {

        if (err) {
            return res.status(500).json(err);
        }

        res.json({ message: "Session deleted" });

    });

});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});