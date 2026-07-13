import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Get profile details
export const getProfile = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true
      }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update profile (name, username)
export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const { name, username } = req.body;
  
  try {
    // Check if new username is taken
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: userId } }
      });
      if (existing) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name, username },
      select: {
        id: true,
        username: true,
        name: true,
        role: true
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Update password
export const updatePassword = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  const { currentPassword, newPassword } = req.body;
  
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Upload avatar
export const uploadAvatar = async (req: Request, res: Response) => {
  const userId = req.params.userId as string;
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Create the public URL for the image
    const avatarUrl = `/uploads/${req.file.filename}`;
    
    // Update user in database
    const updated = await (prisma as any).user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        avatarUrl: true
      }
    });
    
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};
