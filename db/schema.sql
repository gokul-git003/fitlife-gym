
-- schema.sql

CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'trainer', 'member'))
);

CREATE TABLE IF NOT EXISTS Members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS Trainers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    name TEXT NOT NULL,
    specialty TEXT,
    FOREIGN KEY(user_id) REFERENCES Users(id)
);

CREATE TABLE IF NOT EXISTS MembershipPlans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    price REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS Memberships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    plan_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'expired', 'cancelled')),
    FOREIGN KEY(member_id) REFERENCES Members(id),
    FOREIGN KEY(plan_id) REFERENCES MembershipPlans(id)
);

CREATE TABLE IF NOT EXISTS Attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    check_in_time TEXT NOT NULL,
    check_out_time TEXT,
    status TEXT NOT NULL CHECK(status IN ('checked_in', 'checked_out')),
    FOREIGN KEY(member_id) REFERENCES Members(id)
);

CREATE TABLE IF NOT EXISTS Payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    date TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK(status IN ('completed', 'pending', 'failed')),
    FOREIGN KEY(member_id) REFERENCES Members(id)
);

CREATE TABLE IF NOT EXISTS WorkoutPlans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trainer_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    details TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY(trainer_id) REFERENCES Trainers(id),
    FOREIGN KEY(member_id) REFERENCES Members(id)
);

CREATE TABLE IF NOT EXISTS Classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trainer_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    schedule_time TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    FOREIGN KEY(trainer_id) REFERENCES Trainers(id)
);

CREATE TABLE IF NOT EXISTS ClassBookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    member_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('booked', 'cancelled', 'attended', 'waitlist')),
    FOREIGN KEY(class_id) REFERENCES Classes(id),
    FOREIGN KEY(member_id) REFERENCES Members(id)
);

CREATE TABLE IF NOT EXISTS TrainerAttendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trainer_id INTEGER NOT NULL,
    check_in_time TEXT NOT NULL,
    check_out_time TEXT,
    status TEXT NOT NULL CHECK(status IN ('checked_in', 'checked_out')),
    FOREIGN KEY(trainer_id) REFERENCES Trainers(id)
);

CREATE TABLE IF NOT EXISTS WorkoutExercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    sets INTEGER,
    reps INTEGER,
    completed INTEGER DEFAULT 0 CHECK(completed IN (0, 1)),
    FOREIGN KEY(workout_id) REFERENCES WorkoutPlans(id)
);
