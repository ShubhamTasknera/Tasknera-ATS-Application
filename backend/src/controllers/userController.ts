import { Response } from 'express';
import prisma from '../config/prisma';
import { AuthRequest, UserRole } from '../middleware/authMiddleware';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (ADMIN)
export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            jobs: true,
            candidates: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error: any) {
    console.error('[User Controller] Error fetching users:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/users/:id/role
// @access  Private (ADMIN)
export const updateUserRole = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { role } = req.body;

    if (!role || !['ADMIN', 'MEMBER'].includes(role.toUpperCase())) {
      res.status(400).json({
        error: 'Invalid role provided. Role must be one of: "ADMIN", "MEMBER"'
      });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent removing the last admin
    if (targetUser.role === 'ADMIN' && role.toUpperCase() !== 'ADMIN') {
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      if (adminCount <= 1) {
        res.status(400).json({ error: 'Cannot demote the sole Administrator in the system' });
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role: role.toUpperCase() as UserRole },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: `User role updated to ${updatedUser.role}`,
      user: updatedUser
    });
  } catch (error: any) {
    console.error('[User Controller] Error updating user role:', error);
    res.status(500).json({ error: error.message || 'Failed to update user role' });
  }
};

// @desc    Assign user to a team (Admin only)
// @route   PATCH /api/users/:id/team
// @access  Private (ADMIN)
export const assignUserTeam = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { teamId } = req.body;

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { teamId: teamId || null },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      success: true,
      message: 'User team updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    console.error('[User Controller] Error updating user team:', error);
    res.status(500).json({ error: error.message || 'Failed to update user team' });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (ADMIN)
export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    if (req.user?.userId === id) {
      res.status(400).json({ error: 'You cannot delete your own admin account' });
      return;
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'User account removed successfully'
    });
  } catch (error: any) {
    console.error('[User Controller] Error deleting user:', error);
    res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
};
