import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const register = async (req, res) => {
    try {
        const { firstName, lastName, fullName, email, password, role } = req.body;

        // Support both formats: firstName/lastName OR fullName
        let first = firstName;
        let last = lastName;

        if (!first && fullName && typeof fullName === 'string') {
            // If fullName is provided instead, split it
            const nameParts = fullName.trim().split(' ');
            first = nameParts[0];
            last = nameParts.slice(1).join(' ') || '';
        }

        // Validate required fields
        if (!first || !email || !password) {
            return res.status(400).json({
                error: "Please fill in all required fields."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters long."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.users.create({
            data: {
                firstName: first,
                lastName: last || '',
                email,
                password: hashedPassword,
                role: role || 'CLIENT'
            }
        });

        res.status(201).json({
            message: "Account created successfully!",
            userId: user.id
        });
    } catch (error) {
        console.error("Registration error:", error);

        // Handle duplicate email error
        if (error.code === 'P2002') {
            return res.status(400).json({
                error: "An account with this email already exists. Please log in instead."
            });
        }

        res.status(500).json({
            error: "Unable to create account. Please try again later."
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.users.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ error: "No account found with this email address. Please register first." });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ error: "Incorrect password. Please try again." });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const logout = async (req, res) => {
    // Since we're using JWT, logout is handled client-side by removing the token
    res.json({ message: "Logout successful" });
};

const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                companyName: true,
                rating: true,
                walletBalance: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { firstName, lastName, companyName } = req.body;

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(companyName !== undefined && { companyName })
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                companyName: true,
                rating: true,
                walletBalance: true
            }
        });

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { register, login, logout, getProfile, updateProfile };