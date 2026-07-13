import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getPlans = async (req: Request, res: Response) => {
  try {
    const plans = await prisma.membershipPlan.findMany();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createPlan = async (req: Request, res: Response) => {
  const { name, duration, price } = req.body;
  try {
    await prisma.membershipPlan.create({ data: { name, duration: Number(duration), price: Number(price) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
  try {
    await prisma.membershipPlan.delete({ where: { id: String(req.params.id) } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  const { name, duration, price } = req.body;
  try {
    await prisma.membershipPlan.update({ 
      where: { id: String(req.params.id) }, 
      data: { name, duration: Number(duration), price: Number(price) } 
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const assignMembership = async (req: Request, res: Response) => {
  const { member_id, plan_id } = req.body;
  try {
    const plan = await prisma.membershipPlan.findUnique({ where: { id: plan_id } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    
    const startDate = new Date();
    const endDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
    
    await prisma.membership.create({
      data: {
        memberId: member_id,
        planId: plan_id,
        startDate,
        endDate,
        status: 'active'
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const renewMembership = async (req: Request, res: Response) => {
  const { member_id, plan_id } = req.body;
  try {
    await prisma.membership.updateMany({
      where: { memberId: member_id, status: 'active' },
      data: { status: 'cancelled' }
    });
    
    const plan = await prisma.membershipPlan.findUnique({ where: { id: plan_id } });
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    
    const startDate = new Date();
    const endDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000);
    
    await prisma.membership.create({
      data: {
        memberId: member_id,
        planId: plan_id,
        startDate,
        endDate,
        status: 'active'
      }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
