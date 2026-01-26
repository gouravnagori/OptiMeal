import mongoose from 'mongoose';

const dailyMenuSchema = mongoose.Schema({
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
        type: [String], // Array of items
        default: []
    },
    lunch: {
        type: [String],
        default: []
    },
    highTea: {
        type: [String],
        default: []
    },
    dinner: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Compound index to ensure one menu per mess per day
dailyMenuSchema.index({ messId: 1, date: 1 }, { unique: true });

const DailyMenu = mongoose.model('DailyMenu', dailyMenuSchema);

export default DailyMenu;
