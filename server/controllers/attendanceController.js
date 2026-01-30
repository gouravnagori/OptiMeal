import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import mongoose from 'mongoose';
import Mess from "../models/Mess.js";

// Get attendance for a specific student for today
export const getAttendance = async (req, res) => {
    const { studentId, date } = req.query;
    try {
        // Normalize date to start of day
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            studentId,
            date: queryDate
        });

        if (!attendance) {
            // Return default values if no record exists yet
            return res.status(200).json({
                breakfast: true,
                lunch: true,
                highTea: true,
                dinner: true
            });
        }

        res.status(200).json(attendance);
    } catch (error) {
        res.status(500).json({ message: "Error fetching attendance" });
    }
};



// Update attendance (toggle meal)
export const updateAttendance = async (req, res) => {
    const { studentId, messId, date, mealType, status } = req.body;

    try {
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        // Security Check: Enforce Deadlines
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Only enforce deadlines if updating for "Today"
        if (queryDate.getTime() === today.getTime()) {
            const mess = await Mess.findById(messId).select('mealTimings');
            if (mess && mess.mealTimings) {
                const timingKey = mealType === 'hightea' ? 'highTea' : mealType;
                const timing = mess.mealTimings[timingKey];

                if (timing && timing.requestDeadline) {
                    const now = new Date();
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

                    if (currentTime >= timing.requestDeadline) {
                        return res.status(400).json({
                            message: `Request for ${mealType} is closed. Deadline was ${timing.requestDeadline}`
                        });
                    }
                }
            }
        } else if (queryDate < today) {
            return res.status(400).json({ message: "Cannot change attendance for past dates" });
        }

        let attendance = await Attendance.findOne({ studentId, date: queryDate });

        if (!attendance) {
            attendance = new Attendance({
                studentId,
                messId,
                date: queryDate,
                breakfast: true,
                lunch: true,
                highTea: true,
                dinner: true
            });
        }

        attendance[mealType] = status;
        attendance.lastModifiedAt = Date.now();
        await attendance.save();

        res.status(200).json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating attendance" });
    }
};

// Get aggregated stats for Manager Dashboard
// Get aggregated stats for Manager Dashboard
export const getMessStats = async (req, res) => {
    const { messId, date } = req.query;

    try {
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        // 1. Get Total Verified Students in the Mess
        // We now import User directly
        const totalStudents = await User.countDocuments({
            messId: new mongoose.Types.ObjectId(messId),
            role: 'student',
            isVerified: true
        });

        // 2. Count Opt-Outs (False values) from Attendance collection
        const optOuts = await Attendance.aggregate([
            { $match: { messId: new mongoose.Types.ObjectId(messId), date: queryDate } },
            {
                $group: {
                    _id: null,
                    breakfastOptOut: { $sum: { $cond: [{ $eq: ["$breakfast", false] }, 1, 0] } },
                    lunchOptOut: { $sum: { $cond: [{ $eq: ["$lunch", false] }, 1, 0] } },
                    highTeaOptOut: { $sum: { $cond: [{ $eq: ["$highTea", false] }, 1, 0] } },
                    dinnerOptOut: { $sum: { $cond: [{ $eq: ["$dinner", false] }, 1, 0] } }
                }
            }
        ]);

        const opts = optOuts[0] || { breakfastOptOut: 0, lunchOptOut: 0, highTeaOptOut: 0, dinnerOptOut: 0 };

        // 3. Calculate Requests (Total - OptOuts)
        // Ensure we don't return negative numbers if database is inconsistent
        const stats = {
            breakfast: Math.max(0, totalStudents - opts.breakfastOptOut),
            lunch: Math.max(0, totalStudents - opts.lunchOptOut),
            highTea: Math.max(0, totalStudents - opts.highTeaOptOut),
            dinner: Math.max(0, totalStudents - opts.dinnerOptOut),
            totalStudents // Optional: return total count for reference
        };

        res.status(200).json(stats);

    } catch (error) {
        console.error("Stats Error:", error);
        res.status(500).json({ message: "Error fetching stats" });
    }
};
