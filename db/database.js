const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'gym.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error connecting to database', err);
    } else {
        console.log('Connected to SQLite database.');
        initDB();
    }
});

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, password_hash: hash };
}

function verifyPassword(password, hash, salt) {
    const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
}

function initDB() {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error executing schema:', err);
        } else {
            console.log('Database schema initialized.');
            seedDB();
        }
    });
}

function seedDB() {
    // Check if admin exists, if not seed initial data
    db.get('SELECT id FROM Users WHERE username = ?', ['admin'], (err, row) => {
        if (!row) {
            console.log('Seeding initial data...');
            const adminAuth = hashPassword('admin123');
            const trainerAuth = hashPassword('trainer123');
            const memberAuth = hashPassword('member123');

            // Insert admin
            db.run(`INSERT INTO Users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)`, 
                ['admin', adminAuth.password_hash, adminAuth.salt, 'admin']);

            // Insert trainer
            db.run(`INSERT INTO Users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)`, 
                ['trainer', trainerAuth.password_hash, trainerAuth.salt, 'trainer'], function() {
                db.run(`INSERT INTO Trainers (user_id, name, specialty) VALUES (?, ?, ?)`, 
                    [this.lastID, 'Sarah Jenkins', 'Yoga & HIIT']);
            });

            // Insert member
            db.run(`INSERT INTO Users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)`, 
                ['member', memberAuth.password_hash, memberAuth.salt, 'member'], function() {
                const memberUserId = this.lastID;
                db.run(`INSERT INTO Members (user_id, name, email) VALUES (?, ?, ?)`, 
                    [memberUserId, 'John Doe', 'john@example.com'], function() {
                        const memberId = this.lastID;
                        // Insert Plan
                        db.run(`INSERT INTO MembershipPlans (name, duration_days, price) VALUES (?, ?, ?)`, 
                            ['Monthly Pro', 30, 49.99], function() {
                                const planId = this.lastID;
                                const startDate = new Date().toISOString();
                                const endDate = new Date(Date.now() + 30*24*60*60*1000).toISOString();
                                // Insert Membership
                                db.run(`INSERT INTO Memberships (member_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)`,
                                    [memberId, planId, startDate, endDate, 'active']);
                        });
                });
            });
        }
    });
}

// Wrapper for queries to use Promises
const dbHelper = {
    get: (sql, params = []) => new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => err ? reject(err) : resolve(row));
    }),
    all: (sql, params = []) => new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows));
    }),
    run: (sql, params = []) => new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this); // Resolves with { lastID, changes }
        });
    })
};

module.exports = {
    db,
    dbHelper,
    hashPassword,
    verifyPassword
};
