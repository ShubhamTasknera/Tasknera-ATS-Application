import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../config/prisma';
import { AuthRequest, UserRole } from '../middleware/authMiddleware';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId: string, email: string, role: UserRole, organizationId: string = 'org-tasknera'): string => {
  const secret = process.env.JWT_SECRET || 'ats_tasknera_super_secret_jwt_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  return jwt.sign({ userId, email, role, organizationId }, secret, { expiresIn: expiresIn as any });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, organizationId } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Please provide email and password' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Please provide a valid email address' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      res.status(400).json({ error: 'User with this email already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Determine initial role: if first user in DB, bootstrap as ADMIN, otherwise default to requested valid role or MEMBER
    const userCount = await prisma.user.count();
    let assignedRole: UserRole = userCount === 0 ? 'ADMIN' : 'MEMBER';

    if (role && ['ADMIN', 'MEMBER', 'TEAM_LEADER'].includes(role.toUpperCase())) {
      assignedRole = role.toUpperCase() as UserRole;
    }

    const resolvedOrgId = organizationId ? String(organizationId).trim() : 'org-tasknera';

    // Create user in Supabase DB via Prisma
    const user = await prisma.user.create({
      data: {
        name: name ? name.trim() : null,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: assignedRole,
        organizationId: resolvedOrgId
      }
    });

    // Generate token with organizationId
    const token = generateToken(user.id, user.email, user.role as UserRole, user.organizationId || 'org-tasknera');

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId || 'org-tasknera',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/signin
export const signin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Please provide email and password' });
      return;
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const userRole = (user.role as UserRole) || 'MEMBER';
    const orgId = user.organizationId || 'org-tasknera';

    // Generate token with organizationId
    const token = generateToken(user.id, user.email, userRole, orgId);

    res.status(200).json({
      message: 'Signed in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
        teamId: user.teamId,
        organizationId: orgId,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Signin Error:', error);
    res.status(500).json({ error: 'Server error during signin' });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        teamId: true,
        organizationId: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('GetMe Error:', error);
    res.status(500).json({ error: 'Server error fetching user profile' });
  }
};

// @desc    Authenticate with Google OAuth / SSO (Google Identity Services)
// @route   POST /api/auth/google
export const googleSignin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, idToken } = req.body;
    const tokenToVerify = credential || idToken;

    if (!tokenToVerify) {
      res.status(400).json({ error: 'Google credential (ID token) is required' });
      return;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('[Google Auth] GOOGLE_CLIENT_ID is not configured in backend environment.');
      res.status(500).json({ error: 'Google OAuth is not configured on the server' });
      return;
    }

    // Cryptographically verify Google ID Token with Google's public certs
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: tokenToVerify,
        audience: clientId,
      });
      payload = ticket.getPayload();
    } catch (verifyErr: any) {
      console.error('[Google Auth] ID Token Verification Failed:', verifyErr?.message || verifyErr);
      res.status(401).json({ error: 'Invalid or expired Google authentication token' });
      return;
    }

    if (!payload || !payload.email) {
      res.status(401).json({ error: 'Google token did not contain an email address' });
      return;
    }

    if (!payload.email_verified) {
      res.status(403).json({ error: 'Google email address is not verified' });
      return;
    }

    const cleanEmail = payload.email.toLowerCase().trim();
    const verifiedName = payload.name ? payload.name.trim() : (cleanEmail.split('@')[0] || 'User');

    // Find or create user in Supabase DB via Prisma
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      const userCount = await prisma.user.count();
      const isAdminEmail = cleanEmail === 'admin@tasknera.com' || cleanEmail === 'admin@ats.tasknera.com';
      const assignedRole: UserRole = (userCount === 0 || isAdminEmail) ? 'ADMIN' : 'MEMBER';
      const randomPassword = await bcrypt.hash(`google_sso_${Date.now()}_${Math.random()}`, 10);

      user = await prisma.user.create({
        data: {
          name: verifiedName,
          email: cleanEmail,
          password: randomPassword,
          role: assignedRole,
          organizationId: 'org-tasknera'
        }
      });
      console.log(`[Google Auth] Created new user: ${cleanEmail} (${assignedRole})`);
    } else {
      console.log(`[Google Auth] Existing user authenticated: ${cleanEmail} (${user.role})`);
    }

    const userRole = (user.role as UserRole) || 'MEMBER';
    const orgId = user.organizationId || 'org-tasknera';
    const token = generateToken(user.id, user.email, userRole, orgId);

    res.status(200).json({
      message: 'Google authentication successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: userRole,
        teamId: user.teamId,
        organizationId: orgId,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ error: 'Server error during Google authentication' });
  }
};


