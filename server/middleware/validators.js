import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Registration validation rules
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),

    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['student', 'manager']).withMessage('Invalid role'),

    handleValidationErrors
];

// Login validation rules
export const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),

    handleValidationErrors
];

// Password reset request validation
export const forgotPasswordValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),

    handleValidationErrors
];

// Password reset validation
export const resetPasswordValidation = [
    body('token')
        .notEmpty().withMessage('Reset token is required'),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
        .matches(/\d/).withMessage('Password must contain at least one number'),

    handleValidationErrors
];

// Manager registration extra validation
export const managerRegistrationValidation = [
    body('messName')
        .if(body('role').equals('manager'))
        .trim()
        .notEmpty().withMessage('Mess name is required for managers')
        .isLength({ min: 2, max: 100 }).withMessage('Mess name must be 2-100 characters'),

    body('messCode')
        .if(body('role').equals('manager'))
        .trim()
        .notEmpty().withMessage('Mess code is required for managers')
        .isLength({ min: 4, max: 20 }).withMessage('Mess code must be 4-20 characters')
        .isAlphanumeric().withMessage('Mess code must be alphanumeric'),

    body('location')
        .if(body('role').equals('manager'))
        .trim()
        .notEmpty().withMessage('Location is required for managers'),

    handleValidationErrors
];

// Student registration extra validation
export const studentRegistrationValidation = [
    body('messCode')
        .if(body('role').equals('student'))
        .trim()
        .notEmpty().withMessage('Mess code is required to join a mess'),

    handleValidationErrors
];
