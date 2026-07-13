const express = require('express');
const cors = require('cors');
const path = require('path');
const { dbHelper, hashPassword, verifyPassword } = require('./db/database');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// === AUTHENTICATION ===
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await dbHelper.get('SELECT * FROM Users WHERE username = ?', [username]);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        
        if (!verifyPassword(password, user.password_hash, user.salt)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        let profile = null;
        if (user.role === 'member') {
            profile = await dbHelper.get('SELECT * FROM Members WHERE user_id = ?', [user.id]);
        } else if (user.role === 'trainer') {
            profile = await dbHelper.get('SELECT * FROM Trainers WHERE user_id = ?', [user.id]);
        }
        
        res.json({
            id: user.id,
            username: user.username,
            role: user.role,
            profileId: profile ? profile.id : null,
            name: profile ? profile.name : user.username
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// === MEMBERS ===
app.get('/api/members', async (req, res) => {
    try {
        const members = await dbHelper.all(`
            SELECT m.*, u.username,
                   (SELECT status FROM Memberships WHERE member_id = m.id ORDER BY end_date DESC LIMIT 1) as membership_status,
                   (SELECT end_date FROM Memberships WHERE member_id = m.id ORDER BY end_date DESC LIMIT 1) as membership_end_date
            FROM Members m
            JOIN Users u ON m.user_id = u.id
        `);
        res.json(members);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/members', async (req, res) => {
    const { username, password, name, email, phone } = req.body;
    try {
        const auth = hashPassword(password);
        const userRes = await dbHelper.run(`INSERT INTO Users (username, password_hash, salt, role) VALUES (?, ?, ?, 'member')`, 
            [username, auth.password_hash, auth.salt]);
        
        const memberRes = await dbHelper.run(`INSERT INTO Members (user_id, name, email, phone) VALUES (?, ?, ?, ?)`,
            [userRes.lastID, name, email, phone]);
            
        res.json({ id: memberRes.lastID, name });
    } catch (err) { 
        res.status(400).json({ error: 'Username might already exist or invalid data' }); 
    }
});

app.delete('/api/members/:id', async (req, res) => {
    try {
        const memberId = req.params.id;
        const member = await dbHelper.get('SELECT user_id FROM Members WHERE id = ?', [memberId]);
        if (!member) return res.status(404).json({ error: 'Not found' });
        
        await dbHelper.run('DELETE FROM Memberships WHERE member_id = ?', [memberId]);
        await dbHelper.run('DELETE FROM Attendance WHERE member_id = ?', [memberId]);
        await dbHelper.run('DELETE FROM Members WHERE id = ?', [memberId]);
        await dbHelper.run('DELETE FROM Users WHERE id = ?', [member.user_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// === TRAINERS ===
app.get('/api/trainers', async (req, res) => {
    try {
        const trainers = await dbHelper.all('SELECT * FROM Trainers');
        res.json(trainers);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/trainers', async (req, res) => {
    const { username, password, name, specialty } = req.body;
    try {
        const auth = hashPassword(password);
        const userRes = await dbHelper.run(`INSERT INTO Users (username, password_hash, salt, role) VALUES (?, ?, ?, 'trainer')`, 
            [username, auth.password_hash, auth.salt]);
        
        const trainerRes = await dbHelper.run(`INSERT INTO Trainers (user_id, name, specialty) VALUES (?, ?, ?)`,
            [userRes.lastID, name, specialty]);
            
        res.json({ id: trainerRes.lastID, name });
    } catch (err) { 
        res.status(400).json({ error: 'Username might exist' }); 
    }
});

// === MEMBERSHIPS ===
app.delete('/api/trainers/:id', async (req, res) => {
    try {
        const trainerId = req.params.id;
        const trainer = await dbHelper.get('SELECT user_id FROM Trainers WHERE id = ?', [trainerId]);
        if (!trainer) return res.status(404).json({ error: 'Not found' });
        
        await dbHelper.run('DELETE FROM WorkoutPlans WHERE trainer_id = ?', [trainerId]);
        await dbHelper.run('DELETE FROM Classes WHERE trainer_id = ?', [trainerId]);
        await dbHelper.run('DELETE FROM Trainers WHERE id = ?', [trainerId]);
        await dbHelper.run('DELETE FROM Users WHERE id = ?', [trainer.user_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});
app.get('/api/plans', async (req, res) => {
    try {
        const plans = await dbHelper.all('SELECT * FROM MembershipPlans');
        res.json(plans);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/plans', async (req, res) => {
    const { name, duration_days, price } = req.body;
    try {
        await dbHelper.run('INSERT INTO MembershipPlans (name, duration_days, price) VALUES (?, ?, ?)', [name, duration_days, price]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/memberships/assign', async (req, res) => {
    const { member_id, plan_id } = req.body;
    try {
        const plan = await dbHelper.get('SELECT * FROM MembershipPlans WHERE id = ?', [plan_id]);
        const start_date = new Date().toISOString();
        const end_date = new Date(Date.now() + plan.duration_days * 24*60*60*1000).toISOString();
        
        await dbHelper.run('INSERT INTO Memberships (member_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
            [member_id, plan_id, start_date, end_date, 'active']);
            
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/memberships/upgrade', async (req, res) => {
    const { member_id, new_plan_id } = req.body;
    try {
        await dbHelper.run('UPDATE Memberships SET status = "cancelled" WHERE member_id = ? AND status = "active"', [member_id]);
        const plan = await dbHelper.get('SELECT * FROM MembershipPlans WHERE id = ?', [new_plan_id]);
        const start_date = new Date().toISOString();
        const end_date = new Date(Date.now() + plan.duration_days * 24*60*60*1000).toISOString();
        await dbHelper.run('INSERT INTO Memberships (member_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
            [member_id, new_plan_id, start_date, end_date, 'active']);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/memberships/renew', async (req, res) => {
    const { member_id, plan_id } = req.body;
    try {
        await dbHelper.run('UPDATE Memberships SET status = "cancelled" WHERE member_id = ? AND status = "active"', [member_id]);
        const plan = await dbHelper.get('SELECT * FROM MembershipPlans WHERE id = ?', [plan_id]);
        const start_date = new Date().toISOString();
        const end_date = new Date(Date.now() + plan.duration_days * 24*60*60*1000).toISOString();
        await dbHelper.run('INSERT INTO Memberships (member_id, plan_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
            [member_id, plan_id, start_date, end_date, 'active']);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// === ATTENDANCE ===
app.post('/api/checkin', async (req, res) => {
    const { member_id } = req.body;
    try {
        // Check active membership
        const ms = await dbHelper.get('SELECT * FROM Memberships WHERE member_id = ? ORDER BY end_date DESC LIMIT 1', [member_id]);
        const now = new Date();
        
        if (!ms || new Date(ms.end_date) < now) {
            return res.json({ status: 'denied', reason: 'Membership Expired or Not Found' });
        }
        
        await dbHelper.run('INSERT INTO Attendance (member_id, check_in_time, status) VALUES (?, ?, ?)',
            [member_id, now.toISOString(), 'checked_in']);
            
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/checkout', async (req, res) => {
    const { member_id } = req.body;
    try {
        await dbHelper.run('UPDATE Attendance SET check_out_time = ?, status = "checked_out" WHERE member_id = ? AND status = "checked_in"',
            [new Date().toISOString(), member_id]);
        res.json({ status: 'success' });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/attendance', async (req, res) => {
    try {
        const logs = await dbHelper.all(`
            SELECT a.*, m.name 
            FROM Attendance a 
            JOIN Members m ON a.member_id = m.id 
            ORDER BY a.check_in_time DESC LIMIT 50
        `);
        res.json(logs);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// === PAYMENTS ===
app.post('/api/payments', async (req, res) => {
    const { member_id, amount, description } = req.body;
    try {
        await dbHelper.run('INSERT INTO Payments (member_id, amount, date, description, status) VALUES (?, ?, ?, ?, ?)',
            [member_id, amount, new Date().toISOString(), description, 'completed']);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/payments', async (req, res) => {
    try {
        const payments = await dbHelper.all(`
            SELECT p.*, m.name 
            FROM Payments p 
            JOIN Members m ON p.member_id = m.id 
            ORDER BY p.date DESC
        `);
        res.json(payments);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// === WORKOUTS ===
app.get('/api/workouts/:member_id', async (req, res) => {
    try {
        const workouts = await dbHelper.all('SELECT w.*, t.name as trainer_name FROM WorkoutPlans w JOIN Trainers t ON w.trainer_id = t.id WHERE w.member_id = ? ORDER BY w.date DESC', [req.params.member_id]);
        for (let w of workouts) {
            w.exercises = await dbHelper.all('SELECT * FROM WorkoutExercises WHERE workout_id = ?', [w.id]);
        }
        res.json(workouts);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/workouts/trainer/:trainer_id', async (req, res) => {
    try {
        const workouts = await dbHelper.all('SELECT w.*, t.name as trainer_name FROM WorkoutPlans w JOIN Trainers t ON w.trainer_id = t.id WHERE w.trainer_id = ? ORDER BY w.date DESC', [req.params.trainer_id]);
        for (let w of workouts) {
            w.exercises = await dbHelper.all('SELECT * FROM WorkoutExercises WHERE workout_id = ?', [w.id]);
        }
        res.json(workouts);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/workouts', async (req, res) => {
    const { trainer_id, member_id, title, details, exercises } = req.body;
    try {
        const wRes = await dbHelper.run('INSERT INTO WorkoutPlans (trainer_id, member_id, title, details, date) VALUES (?, ?, ?, ?, ?)',
            [trainer_id, member_id, title, details, new Date().toISOString()]);
            
        if (exercises && exercises.length > 0) {
            for (let ex of exercises) {
                await dbHelper.run('INSERT INTO WorkoutExercises (workout_id, name, sets, reps) VALUES (?, ?, ?, ?)',
                    [wRes.lastID, ex.name, ex.sets, ex.reps]);
            }
        }
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/workouts/exercise/complete', async (req, res) => {
    const { exercise_id } = req.body;
    try {
        await dbHelper.run('UPDATE WorkoutExercises SET completed = 1 WHERE id = ?', [exercise_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// === CLASSES ===
app.get('/api/classes', async (req, res) => {
    try {
        const classes = await dbHelper.all('SELECT c.*, t.name as trainer_name FROM Classes c JOIN Trainers t ON c.trainer_id = t.id');
        for (let c of classes) {
            c.bookings = await dbHelper.all('SELECT * FROM ClassBookings WHERE class_id = ? AND status IN ("booked", "waitlist")', [c.id]);
        }
        res.json(classes);
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/classes', async (req, res) => {
    const { trainer_id, name, schedule_time, capacity } = req.body;
    try {
        await dbHelper.run('INSERT INTO Classes (trainer_id, name, schedule_time, capacity) VALUES (?, ?, ?, ?)',
            [trainer_id, name, schedule_time, capacity]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/classes/book', async (req, res) => {
    const { class_id, member_id } = req.body;
    try {
        const cls = await dbHelper.get('SELECT * FROM Classes WHERE id = ?', [class_id]);
        const bookedCount = (await dbHelper.get('SELECT COUNT(*) as count FROM ClassBookings WHERE class_id = ? AND status = "booked"', [class_id])).count;
        
        let status = 'booked';
        if (bookedCount >= cls.capacity) {
            status = 'waitlist';
        }
        
        await dbHelper.run('INSERT INTO ClassBookings (class_id, member_id, status) VALUES (?, ?, ?)',
            [class_id, member_id, status]);
        res.json({ success: true, status });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/classes/cancel', async (req, res) => {
    const { class_id, member_id } = req.body;
    try {
        await dbHelper.run('UPDATE ClassBookings SET status = "cancelled" WHERE class_id = ? AND member_id = ?', [class_id, member_id]);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// === REPORTS / DASHBOARD ===
app.get('/api/reports/dashboard', async (req, res) => {
    try {
        const totalMembers = (await dbHelper.get('SELECT COUNT(*) as count FROM Members')).count;
        
        const now = new Date().toISOString();
        const activeMembers = (await dbHelper.get('SELECT COUNT(*) as count FROM Memberships WHERE end_date >= ? AND status = "active"', [now])).count;
        
        const totalRevenue = (await dbHelper.get('SELECT SUM(amount) as sum FROM Payments WHERE status = "completed"')).sum || 0;
        
        res.json({
            totalMembers,
            activeMembers,
            totalRevenue
        });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/reports/full', async (req, res) => {
    try {
        const payments = await dbHelper.all('SELECT p.*, m.name as member_name FROM Payments p JOIN Members m ON p.member_id = m.id ORDER BY p.date DESC');
        const attendance = await dbHelper.all('SELECT a.*, m.name as member_name FROM Attendance a JOIN Members m ON a.member_id = m.id ORDER BY a.check_in_time DESC');
        const memberships = await dbHelper.all('SELECT ms.*, m.name as member_name, mp.name as plan_name FROM Memberships ms JOIN Members m ON ms.member_id = m.id JOIN MembershipPlans mp ON ms.plan_id = mp.id ORDER BY ms.start_date DESC');
        
        res.json({ payments, attendance, memberships });
    } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// Default fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
