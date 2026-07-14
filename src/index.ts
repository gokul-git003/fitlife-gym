import express from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import trainerRoutes from './routes/trainer.routes';
import memberRoutes from './routes/member.routes';
import workoutRoutes from './routes/workout.routes';
import membershipRoutes from './routes/membership.routes';
import attendanceRoutes from './routes/attendance.routes';
import reportRoutes from './routes/report.routes';
import userRoutes from './routes/user.routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/member', memberRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/memberships', membershipRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/user', userRoutes);
// We'll rename the dashboard fetch in the frontend from /api/reports/dashboard to /api/admin/dashboard

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve frontend in production
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;

import prisma from './utils/db';
import bcrypt from 'bcrypt';

const seedAdmin = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const adminExists = await prisma.user.findUnique({ where: { username: 'admin' } });
    if (!adminExists) {
      await prisma.user.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          name: 'System Admin',
          role: 'admin',
        },
      });
      console.log('Seeded default admin account');
    } else {
      // Force reset the password to admin123 so the user can always log in
      await prisma.user.update({
        where: { username: 'admin' },
        data: { password: hashedPassword, role: 'admin' }
      });
    }
  } catch (error) {
    console.error('Failed to seed admin:', error);
  }
};

app.listen(PORT, async () => {
  await seedAdmin();
  console.log(`Server is running on port ${PORT}`);
});
