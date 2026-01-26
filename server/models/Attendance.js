import mongoose from 'mongoose';

const attendanceSchema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    messId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mess',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    breakfast: {
        type: Boolean,
        default: true
    },
    lunch: {
        type: Boolean,
        default: true
    },
    highTea: {
        type: Boolean,
        default: true
    },
    dinner: {
        type: Boolean,
        default: true
    },
    lastModifiedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure a student has only one attendance record per day
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
