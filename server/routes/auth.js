import express from 'express';
import {
    register,
    login,
    logout,
    verifyAllStudents,
    getUnverifiedCount,
    getUnverifiedStudents,
    verifyStudent,
    deleteStudent,
    getAllStudents,
    toggleStudentStatus,
    verifyEmail,
    forgotPassword,
    resetPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/verify-all', verifyAllStudents);
router.get('/get-unverified', getUnverifiedCount);

router.get('/get-unverified-list', getUnverifiedStudents);
router.post('/verify-student', verifyStudent);
router.delete('/delete-student', deleteStudent);

// Student Management Routes
router.get('/get-all-students', getAllStudents);
router.post('/toggle-student-status', toggleStudentStatus);

// Security Routes
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
