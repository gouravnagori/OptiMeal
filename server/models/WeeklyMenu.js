import mongoose from 'mongoose';

const mealSchema = {
    breakfast: { type: [String], default: [] },
    lunch: { type: [String], default: [] },
    highTea: { type: [String], default: [] },
    dinner: { type: [String], default: [] }
};

const weeklyMenuSchema = mongoose.Schema({
    messId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mess',
        required: true,
        unique: true
    },
    monday: mealSchema,
    tuesday: mealSchema,
    wednesday: mealSchema,
    thursday: mealSchema,
    friday: mealSchema,
    saturday: mealSchema,
    sunday: mealSchema
}, {
    timestamps: true
});

const WeeklyMenu = mongoose.model('WeeklyMenu', weeklyMenuSchema);

export default WeeklyMenu;
