import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendEmail from '../utils/email.js';

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

        // Send Welcome Email
        await sendEmail({
            to: email,
            subject: 'Welcome to FreelanceHub!',
            text: `Hi ${first}, welcome to FreelanceHub! We're excited to have you on board.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">Welcome to FreelanceHub!</h2>
                    <p>Hi ${first},</p>
                    <p>We're thrilled to have you join our community of freelancers and clients.</p>
                    <p>Get started by setting up your profile or browsing available jobs.</p>
                    <br>
                    <p>Best regards,</p>
                    <p>The FreelanceHub Team</p>
                </div>
            `
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

        // Send Login Alert Email
        await sendEmail({
            to: user.email,
            subject: 'New Login to FreelanceHub',
            text: `Hi ${user.firstName}, we detected a new login to your account.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2563eb;">New Login Detected</h2>
                    <p>Hi ${user.firstName},</p>
                    <p>We detected a new login to your FreelanceHub account.</p>
                    <p>Time: ${new Date().toLocaleString()}</p>
                    <br>
                    <p>If this wasn't you, please reset your password immediately.</p>
                </div>
            `
        });

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
                phone: true,      // Added
                location: true,   // Added
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
        const { firstName, lastName, companyName, phone, location } = req.body;

        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                ...(firstName && { firstName }),
                ...(lastName && { lastName }),
                ...(companyName !== undefined && { companyName }),
                ...(phone !== undefined && { phone }),       // Added
                ...(location !== undefined && { location })  // Added
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                companyName: true,
                phone: true,      // Added
                location: true,   // Added
                rating: true,
                walletBalance: true
            }
        });

        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Moved to top


// ... imports

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

        // Send Email via Microservice
        const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
        await sendEmail({
            to: email,
            subject: 'Password Reset Request - FreelanceHub',
            text: `You requested a password reset. Click here to reset your password: ${resetUrl}`,
            html: `
                <h3>Password Reset Request</h3>
                <p>You requested a password reset for your FreelanceHub account.</p>
                <p>Click the link below to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });

        console.log(`[EMAIL SENT] Password Reset Link for ${email}`);

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