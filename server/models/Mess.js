import mongoose from 'mongoose';

const messSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    messCode: {
        type: String,
        required: true,
        unique: true
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    location: {
        type: String
    },
    totalStudents: {
        type: Number,
        default: 0
    },
    // Meal Timings & Request Deadlines
    mealTimings: {
        breakfast: {
            servingStart: { type: String, default: '07:30' },
            servingEnd: { type: String, default: '09:30' },
            requestDeadline: { type: String, default: '07:00' }
        },
        lunch: {
            servingStart: { type: String, default: '12:00' },
            servingEnd: { type: String, default: '14:00' },
            requestDeadline: { type: String, default: '11:00' }
        },
        highTea: {
            servingStart: { type: String, default: '17:00' },
            servingEnd: { type: String, default: '18:00' },
            requestDeadline: { type: String, default: '16:00' }
        },
        dinner: {
            servingStart: { type: String, default: '19:30' },
            servingEnd: { type: String, default: '21:30' },
            requestDeadline: { type: String, default: '19:00' }
        }
    }
}, {
    timestamps: true
});

const Mess = mongoose.model('Mess', messSchema);

export default Mess;
