import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticateToken } from '../middleware/auth';
import { permissionsByRole, Role, ROLES } from '../config/permissions'; // Import ROLES for validation

const router = Router();
const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// Get all users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    // Mask passwords before sending user data
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create a new user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { username, email, password, role, department } = req.body;

    // Validate input
    if (!username || !email || !password || !role) {
      return res.status(400).json({ error: 'Username, email, password, and role are required' });
    }

    // Validate role
    if (!ROLES.includes(role as Role)) {
      return res.status(400).json({ error: 'Invalid role provided' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Get default permissions for the role
    const defaultPermissions = permissionsByRole[role as Role] || [];

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role as Role, // Ensure role is of Role type
        department,
        permissions: JSON.stringify(defaultPermissions), // Store permissions as JSON string
        // createdAt and updatedAt are handled by Prisma schema defaults
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = newUser; // Omit password from response
    res.status(201).json(userWithoutPassword);
  } catch (e: any) { // Changed error to e and typed as any
    console.error('Error creating user:', e);
    // Check for specific Prisma errors if necessary, e.g., unique constraint
    // Assuming 'e' can have 'code' and 'meta' properties if it's a Prisma error.
    if (e && e.code === 'P2002' && e.meta && e.meta.target) {
        return res.status(400).json({ error: `User with this ${e.meta.target.join(', ')} already exists.` });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router; 