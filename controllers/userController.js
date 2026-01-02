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

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            // Security: Don't reveal if user exists
            return res.json({ message: "If an account with that email exists, we sent you a reset link." });
        }

        // Generate simple token (in production use crypto.randomBytes)
        // For now using time + random ID for simplicity
        const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.users.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });

        // Mock Email Service
        console.log(`[EMAIL MOCK] Password Reset Link for ${email}: http://localhost:3000/reset-password?token=${resetToken}`);

        res.json({ message: "If an account with that email exists, we sent you a reset link." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to process request" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: "Token and new password are required" });
        }

        const user = await prisma.users.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });

        if (!user) {
            return res.status(400).json({ error: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.users.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });

        res.json({ message: "Password reset successful. You can now login with your new password." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to reset password" });
    }
};

export { register, login, logout, getProfile, updateProfile, forgotPassword, resetPassword };