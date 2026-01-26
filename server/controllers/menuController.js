import Groq from "groq-sdk";
import DailyMenu from "../models/DailyMenu.js";
import WeeklyMenu from "../models/WeeklyMenu.js";
import Mess from "../models/Mess.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const generateMenu = async (req, res) => {
    const { messId } = req.body;

    try {
        const mess = await Mess.findById(messId);
        if (!mess) {
            return res.status(404).json({ message: "Mess not found" });
        }

        const prompt = `
            You are an expert nutritionist and mess manager. Create a 1-day balanced Indian menu (Breakfast, Lunch, High Tea, Dinner) for a student mess.
            Goal: Minimize food waste by choosing popular yet cost-effective dishes.
            Format STRICTLY as JSON:
            {
                "breakfast": ["item1", "item2"],
                "lunch": ["item1", "item2", "item3"],
                "highTea": ["item1", "item2"],
                "dinner": ["item1", "item2"]
            }
            Do not include any explanation, only the JSON.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
        });

        const aiResponse = completion.choices[0]?.message?.content || "{}";
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const menuData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

        return res.status(200).json(menuData);

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ message: "Failed to generate menu", error: error.message });
    }
};

// Save a specific date overrides (DailyMenu)
export const saveMenu = async (req, res) => {
    const { messId, date, breakfast, lunch, highTea, dinner } = req.body;
    try {
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        const menu = await DailyMenu.findOneAndUpdate(
            { messId, date: queryDate },
            { breakfast, lunch, highTea, dinner },
            { upsert: true, new: true }
        );
        res.status(200).json(menu);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to save menu" });
    }
};

// Save Weekly Menu (Template)
export const saveWeeklyMenu = async (req, res) => {
    const { messId, weeklyMenu } = req.body; // weeklyMenu object with keys monday, tuesday, etc.
    try {
        const menu = await WeeklyMenu.findOneAndUpdate(
            { messId },
            { ...weeklyMenu },
            { upsert: true, new: true }
        );
        res.status(200).json(menu);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to save weekly menu" });
    }
};

// Get Weekly Menu
export const getWeeklyMenu = async (req, res) => {
    const { messId } = req.query;
    try {
        const menu = await WeeklyMenu.findOne({ messId });
        res.status(200).json(menu || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch weekly menu" });
    }
};

// Get Effective Menu for a Date (DailyOverride OR WeeklyTemplate)
export const getMenu = async (req, res) => {
    const { messId, date } = req.query;
    try {
        const queryDate = new Date(date);
        queryDate.setHours(0, 0, 0, 0);

        // 1. Check for Specific Daily Override
        const dailyMenu = await DailyMenu.findOne({ messId, date: queryDate });
        if (dailyMenu) {
            return res.status(200).json(dailyMenu);
        }

        // 2. Fallback to Weekly Template
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = days[queryDate.getDay()]; // e.g. "monday"

        const weeklyMenu = await WeeklyMenu.findOne({ messId });

        if (weeklyMenu && weeklyMenu[dayName]) {
            return res.status(200).json(weeklyMenu[dayName]);
        }

        // 3. Default Empty
        res.status(200).json({
            breakfast: [],
            lunch: [],
            highTea: [],
            dinner: []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch menu" });
    }
};
