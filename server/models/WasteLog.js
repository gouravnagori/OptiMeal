import mongoose from 'mongoose';

const wasteLogSchema = new mongoose.Schema({
    messId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mess',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    mealType: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner'],
        required: true
    },
    preparedCount: Number, // Planned for 350
    consumedCount: Number, // Actually ate
    wasteWeightKg: Number, // Actual waste weighed
    donatedWeightKg: Number, // Sent to NGO
    monetaryLoss: Number // Estimated loss
}, { timestamps: true });

export default mongoose.model('WasteLog', wasteLogSchema);
