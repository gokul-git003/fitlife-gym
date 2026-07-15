import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { logAudit } from '../utils/audit';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalMembers = await prisma.user.count({ where: { role: 'member' } });
    const activeMembers = await prisma.membership.count({ where: { status: 'active' } });
    
    const payments = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'completed' }
    });
    
    res.json({
      totalMembers,
      activeMembers,
      totalRevenue: payments._sum.amount || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

export const getAdvancedStats = async (req: Request, res: Response) => {
  try {
    // 1. Revenue by month
    const payments = await prisma.payment.findMany({
      where: { status: 'completed' }
    });
    
    const revenueMap: Record<string, number> = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    payments.forEach(p => {
      const month = months[new Date(p.date).getMonth()];
      revenueMap[month] = (revenueMap[month] || 0) + p.amount;
    });

    const revenueData = months.map(m => ({ name: m, revenue: revenueMap[m] || 0 })).filter(m => m.revenue > 0 || m.name === months[new Date().getMonth()]);
    if (revenueData.length === 0) revenueData.push({ name: months[new Date().getMonth()], revenue: 0 });

    // 2. Membership growth
    const members = await prisma.user.findMany({
      where: { role: 'member' },
      select: { createdAt: true }
    });

    const membersMap: Record<string, number> = {};
    members.forEach(m => {
      const month = months[new Date(m.createdAt).getMonth()];
      membersMap[month] = (membersMap[month] || 0) + 1;
    });

    const membershipData = months.map(m => ({ name: m, members: membersMap[m] || 0 })).filter(m => m.members > 0 || m.name === months[new Date().getMonth()]);
    if (membershipData.length === 0) membershipData.push({ name: months[new Date().getMonth()], members: 0 });

    // 3. Class Popularity
    const classes = await prisma.class.findMany({
      include: {
        _count: {
          select: { bookings: true }
        }
      }
    });
    
    const classData = classes.map(c => ({
      name: c.name,
      bookings: c._count.bookings
    }));

    const totalBookings = classData.reduce((sum, c) => sum + c.bookings, 0);
    const classPopularity = totalBookings > 0 
      ? classData 
      : [{ name: 'No Bookings Yet', bookings: 1 }];

    // 4. Attendance Trends (Daily check-ins for last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const attendances = await prisma.attendance.findMany({
      where: { checkInTime: { gte: sevenDaysAgo } }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const attendanceMap: Record<string, number> = {};
    
    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      attendanceMap[days[d.getDay()]] = 0;
    }

    attendances.forEach(a => {
      const day = days[new Date(a.checkInTime).getDay()];
      if (attendanceMap[day] !== undefined) {
        attendanceMap[day]++;
      }
    });

    const attendanceData = Object.keys(attendanceMap).map(day => ({
      day,
      checkins: attendanceMap[day]
    }));

    res.json({
      revenueData,
      membershipData,
      classPopularity,
      attendanceData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch advanced stats' });
  }
};

export const getMembers = async (req: Request, res: Response) => {
  try {
    const members = await prisma.user.findMany({
      where: { role: 'member' },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
        memberProfile: {
          include: {
            memberships: {
              orderBy: { startDate: 'desc' },
              take: 1
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = members.map(m => {
      const activeMem = m.memberProfile?.memberships?.[0];
      return {
        ...m,
        membership_status: activeMem?.status || null,
        membership_end_date: activeMem?.endDate || null
      };
    });
    
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
};

export const getTrainers = async (req: Request, res: Response) => {
  try {
    const trainers = await prisma.user.findMany({
      where: { role: 'trainer' },
      select: {
        id: true,
        name: true,
        username: true,
        createdAt: true,
        trainerProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(trainers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trainers' });
  }
};

export const createMember = async (req: Request, res: Response) => {
  try {
    const { username, password, name, email, phone } = req.body;
    const userExists = await prisma.user.findUnique({ where: { username } });
    if (userExists) return res.status(400).json({ error: 'Username taken' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name, role: 'member' }
    });
    await prisma.memberProfile.create({ data: { userId: user.id } });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteMember = async (req: Request, res: Response) => {
  try {
    await prisma.memberProfile.deleteMany({ where: { userId: String(req.params.id) } });
    await prisma.user.delete({ where: { id: String(req.params.id) } });
    await logAudit('DELETE_MEMBER', null, 'admin', `Deleted member ${req.params.id}`);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateMember = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    
    await prisma.user.update({
      where: { id: id as string },
      data: { name }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createTrainer = async (req: Request, res: Response) => {
  try {
    const { username, password, name, specialty } = req.body;
    const userExists = await prisma.user.findUnique({ where: { username } });
    if (userExists) return res.status(400).json({ error: 'Username taken' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword, name, role: 'trainer' }
    });
    await prisma.trainerProfile.create({ data: { userId: user.id, specialty } });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTrainer = async (req: Request, res: Response) => {
  try {
    await prisma.trainerProfile.deleteMany({ where: { userId: String(req.params.id) } });
    await prisma.user.delete({ where: { id: String(req.params.id) } });
    await logAudit('DELETE_TRAINER', null, 'admin', `Deleted trainer ${req.params.id}`);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTrainer = async (req: Request, res: Response) => {
  try {
    const { name, specialty } = req.body;
    const { id } = req.params;
    
    await prisma.user.update({
      where: { id: id as string },
      data: { name }
    });
    
    if (specialty !== undefined) {
      await prisma.trainerProfile.updateMany({
        where: { userId: id as string },
        data: { specialty }
      });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getCalendarClasses = async (req: Request, res: Response) => {
  try {
    const classes = await prisma.class.findMany({
      include: { trainer: { include: { user: true } } }
    });
    const workouts = await prisma.workout.findMany({
      include: { 
        trainer: { include: { user: true } },
        member: { include: { user: true } }
      }
    });

    const formattedClasses = classes.map(c => ({
      id: `class-${c.id}`,
      type: 'class',
      name: c.name,
      startTime: c.startTime,
      trainer: { name: c.trainer?.user?.name }
    }));

    const formattedWorkouts = workouts.map(w => ({
      id: `workout-${w.id}`,
      type: 'workout',
      name: w.title,
      startTime: w.date,
      trainer: { name: w.trainer?.user?.name },
      member: { name: w.member?.user?.name }
    }));

    res.json([...formattedClasses, ...formattedWorkouts]);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await (prisma as any).gymSettings.findFirst();
    if (!settings) {
      settings = await (prisma as any).gymSettings.create({ data: {} });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { gymName, businessHoursStart, businessHoursEnd, allowMemberSignups, requireEmailVerify } = req.body;
    const settings = await (prisma as any).gymSettings.findFirst();
    
    let updated;
    if (settings) {
      updated = await (prisma as any).gymSettings.update({
        where: { id: settings.id },
        data: { gymName, businessHoursStart, businessHoursEnd, allowMemberSignups, requireEmailVerify }
      });
    } else {
      updated = await (prisma as any).gymSettings.create({
        data: { gymName, businessHoursStart, businessHoursEnd, allowMemberSignups, requireEmailVerify }
      });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await (prisma as any).auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100 // Get latest 100 for now
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
