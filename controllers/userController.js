import { prisma } from '../lib/prisma.ts';
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'

const registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, role } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.users.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role
            }
        });
        res.status(201).json({ message: "User registered successfully", userId: user.id })

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const emailHtml = `
          <div style="font-family: sans-serif; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 20px;">
              <h2 style="text-align: center; color: #333;">Welcome to FreelanceHub!</h2>
              <p>Hi ${firstName} ${lastName},</p>
              <p>Thank you for registering at FreelanceHub! We're excited to have you on board.</p>
              <p>Best regards,</p>
              <p><strong>The FreelanceHub Team</strong></p>
            </div>
          </div>
        `;

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to FreelanceHub!',
            html: emailHtml
        });

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await prisma.users.findUnique({
            where: {
                email
            }
        });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email
            }
        })



    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const logoutUser = async (req, res) => {
    try {
        res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body

        if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token required' })
        }
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
        const user = await prisma.users.findUnique({
            where: {
                id: decoded.userId
            }
        })

        if (!user) {
            return res.status(401).json({ error: 'User not found' })
        }

        const newAccessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '15m' }
        )

        res.json({
            accessToken: newAccessToken
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.userId; // From authorize middleware
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                rating: true,
                walletBalance: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
    const updateUserProfile = async (req, res) => {
        try {
            const userId = req.user.userId;
            const { firstName, lastName, email } = req.body;

            const updateData = {};
            if (firstName) updateData.firstName = firstName;
            if (lastName) updateData.lastName = lastName;
            if (email) updateData.email = email;

            const updatedUser = await prisma.users.update({
                where: { id: userId },
                data: updateData,
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    role: true,
                    rating: true,
                    walletBalance: true,
                    createdAt: true
                }
            });

            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    const deleteUser = async (req, res) => {
        try {
            await prisma.users.delete({
                where: { id: parseInt(req.params.id) }
            })
            res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message })
        }

    }


    export {
        registerUser,
        loginUser,
        logoutUser,
        refreshToken,
        deleteUser,
        getUserProfile
    }