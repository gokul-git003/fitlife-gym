import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { logAudit } from '../utils/audit';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '30d',
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, name, role } = req.body;

    const userExists = await prisma.user.findUnique({ where: { username } });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userCount = await prisma.user.count();
    let assignedRole = userCount === 0 ? 'admin' : (role || 'member');
    if (username.toLowerCase() === 'admin') {
      assignedRole = 'admin';
    }

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role: assignedRole,
      },
    });

    // Create profile based on role
    let profileId = null;
    if (user.role === 'member') {
      const p = await prisma.memberProfile.create({ data: { userId: user.id } });
      profileId = p.id;
    } else if (user.role === 'trainer') {
      const p = await prisma.trainerProfile.create({ data: { userId: user.id } });
      profileId = p.id;
    }

    res.status(201).json({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      profileId,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        memberProfile: true,
        trainerProfile: true
      }
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Auto-upgrade if username is admin but role is member (due to old bug)
      if (user.username.toLowerCase() === 'admin' && user.role !== 'admin') {
        await prisma.user.update({ where: { id: user.id }, data: { role: 'admin' } });
        user.role = 'admin';
      }

      let profileId = null;
      if (user.role === 'member' && user.memberProfile) profileId = user.memberProfile.id;
      if (user.role === 'trainer' && user.trainerProfile) profileId = user.trainerProfile.id;

      // Audit Log
      await logAudit('USER_LOGIN', user.id, user.role, `User ${user.username} logged in`);

      res.json({
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        profileId,
        token: generateToken(user.id, user.role),
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      select: { id: true, username: true, name: true, role: true },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { username, newPassword } = req.body;
    
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
};
