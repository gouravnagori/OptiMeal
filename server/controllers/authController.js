import User from '../models/User.js';
import Mess from '../models/Mess.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req, res) => {
    const { name, email, password, role, messCode, messName, location, phone, gender } = req.body;

    // Generate random cartoon avatar based on gender
    const randomSeed = Math.floor(Math.random() * 100); // Random number for variety

    // Different avatar styles for variety
    const avatarStyles = ['adventurer', 'adventurer-neutral', 'avataaars', 'big-ears', 'big-smile', 'bottts', 'fun-emoji', 'lorelei', 'micah', 'miniavs', 'personas'];
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];

    let avatar;
    if (gender === 'female') {
        // Female cartoon avatars
        avatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${name}${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    } else if (gender === 'male') {
        // Male cartoon avatars
        avatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${name}${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
    } else {
        // Neutral avatars for 'other' or 'prefer_not_to_say'
        avatar = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${name}${randomSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Handle Manager Registration
        if (role === 'manager') {
            if (!messName || !messCode) {
                return res.status(400).json({ message: 'Mess Name and Mess Code required for Manager' });
            }
            const messExists = await Mess.findOne({ messCode });
            if (messExists) {
                return res.status(400).json({ message: 'Mess Code already taken' });
            }

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'manager',
                phone,
                gender,
                avatar
            });

            const mess = await Mess.create({
                name: messName,
                messCode,
                managerId: user._id,
                location
            });

            // Update user with own mess (optional, but good for quick access)
            user.messId = mess._id;

            // Generate verification token
            const verificationToken = user.generateEmailVerificationToken();
            await user.save({ validateBeforeSave: false });

            try {
                await sendVerificationEmail(user.email, user.name, verificationToken);
            } catch (err) {
                console.error('Email send failed:', err);
            }

            const token = generateToken(user._id);

            res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });
            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                gender: user.gender,
                avatar: user.avatar,
                messId: mess._id,
                messName: mess.name,
                messCode: mess.messCode,
                location: mess.location
            });
        }

        // Handle Student Registration
        if (role === 'student') {
            if (!messCode) {
                return res.status(400).json({ message: 'Mess Code required to join' });
            }

            const mess = await Mess.findOne({ messCode });
            if (!mess) {
                return res.status(404).json({ message: 'Invalid Mess Code' });
            }

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: 'student',
                messId: mess._id,
                isVerified: false, // Must be verified by manager
                phone,
                gender,
                avatar
            });

            // Generate verification token
            const verificationToken = user.generateEmailVerificationToken();
            await user.save({ validateBeforeSave: false });

            try {
                await sendVerificationEmail(user.email, user.name, verificationToken);
            } catch (err) {
                console.error('Email send failed:', err);
            }

            const token = generateToken(user._id);
            res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

            return res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                gender: user.gender,
                avatar: user.avatar,
                messId: mess._id,
                messName: mess.name,
                messCode: mess.messCode,
                isVerified: false
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);

    try {
        let user;
        try {
            user = await User.findOne({ email });
            console.log("User finding result:", user ? "Found" : "Not Found");
        } catch (dbError) {
            console.error("DB Find User Error:", dbError);
            throw new Error(`DB Error (Find User): ${dbError.message}`);
        }

        if (user) {
            let isMatch = false;
            try {
                isMatch = await bcrypt.compare(password, user.password);
                console.log("Password match:", isMatch);
            } catch (bcryptError) {
                console.error("Bcrypt Error:", bcryptError);
                throw new Error(`Bcrypt Error: ${bcryptError.message}`);
            }

            if (isMatch) {
                const token = generateToken(user._id);
                res.cookie('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 * 1000 });

                let mess = null;
                if (user.messId) {
                    try {
                        mess = await Mess.findById(user.messId);
                        console.log("Mess lookup:", mess ? "Found" : "Not Found");
                    } catch (messError) {
                        console.error("Mess DB Error:", messError);
                        // Don't crash login if mess lookup fails, just log it
                    }
                }

                return res.json({
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    gender: user.gender,
                    avatar: user.avatar,
                    messId: user.messId,
                    messName: mess ? mess.name : undefined,
                    messCode: mess ? mess.messCode : undefined,
                    location: mess ? mess.location : undefined,
                    isVerified: user.isVerified
                });
            }
        }

        console.log("Login failed: Invalid credentials");
        res.status(401).json({ message: 'Invalid email or password' });

    } catch (error) {
        console.error("CRITICAL LOGIN ERROR:", error);
        res.status(500).json({
            message: `Server Error Details: ${error.message}`,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', { expires: new Date(0) });
    res.status(200).json({ message: 'Logged out successfully' });
};



export const verifyAllStudents = async (req, res) => {
    const { messId } = req.body;
    console.log('Verifying students for messId:', messId);
    try {
        const result = await User.updateMany(
            { messId: new mongoose.Types.ObjectId(messId), role: 'student', isVerified: false },
            { $set: { isVerified: true } }
        );
        console.log('Verification result:', result);
        res.status(200).json({ message: `Verified ${result.modifiedCount} students`, count: result.modifiedCount });
    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ message: 'Error verifying students', error: error.message });
    }
};

export const getUnverifiedCount = async (req, res) => {
    const { messId } = req.query;
    console.log('Fetching unverified count for messId:', messId);
    try {
        const count = await User.countDocuments({ messId: new mongoose.Types.ObjectId(messId), role: 'student', isVerified: false });
        console.log('Count:', count);
        res.status(200).json({ count });
    } catch (error) {
        console.error('Count Error:', error);
        res.status(500).json({ message: 'Error fetching unverified count', error: error.message });
    }
};
// ... (existing code)

export const getUnverifiedStudents = async (req, res) => {
    const { messId } = req.query;
    try {
        const students = await User.find({
            messId: new mongoose.Types.ObjectId(messId),
            role: 'student',
            isVerified: false
        }).select('name email phone _id'); // Select fields to display

        res.status(200).json(students);
    } catch (error) {
        console.error('Fetch Students Error:', error);
        res.status(500).json({ message: 'Error fetching unverified students', error: error.message });
    }
};

export const verifyStudent = async (req, res) => {
    const { studentId } = req.body;
    try {
        await User.findByIdAndUpdate(studentId, { isVerified: true });
        res.status(200).json({ message: 'Student Verified Successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying student' });
    }
};

export const deleteStudent = async (req, res) => {
    const { studentId } = req.query; // Using query for DELETE usually, or params
    try {
        await User.findByIdAndDelete(studentId);
        res.status(200).json({ message: 'Student Rejected/Deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting student' });
    }
};

export const verifyEmail = async (req, res) => {
    const { token } = req.query;
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.error('Verify Email Error:', error);
        res.status(500).json({ message: 'Error verifying email' });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with this email' });
        }

        const resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        try {
            await sendPasswordResetEmail(user.email, user.name, resetToken);
            res.status(200).json({ message: 'Reset link sent to email' });
        } catch (err) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successfully!' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Error resetting password' });
    }
};
