import { motion } from 'framer-motion';
import { MdOutlineFoodBank, MdAttachMoney, MdPeople, MdCo2 } from 'react-icons/md';

const StatCard = ({ label, value, unit, icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="p-5 rounded-2xl bg-gray-800/50 border border-gray-700 backdrop-blur-sm"
    >
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-4 text-xl`}>
            {icon}
        </div>
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <h4 className="text-2xl font-bold text-white mt-1">
            {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
        </h4>
    </motion.div>
);

const WasteOMeter = () => {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 border border-gray-800 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-8 bg-primary rounded-full inline-block"></span>
                        Waste-o-Meter
                    </h2>
                    <p className="text-gray-400 mt-1">Real-time impact of your smart choices.</p>
                </div>
                <div className="px-4 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-500/30 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live Updates
                </div>
            </div>

            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 border border-gray-700/50 rounded-3xl">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-purple-500/20">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Coming Soon</h3>
                <p className="text-gray-400 max-w-sm">
                    We are building advanced AI analytics to help you track and reduce waste effectively.
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 opacity-20 pointer-events-none">
                <StatCard
                    label="Food Saved"
                    value="0"
                    unit="kg"
                    color="bg-green-500/20 text-green-500"
                    icon={<MdOutlineFoodBank />}
                />
                <StatCard
                    label="Money Saved"
                    value="₹0"
                    unit=""
                    color="bg-blue-500/20 text-blue-500"
                    icon={<MdAttachMoney />}
                />
                <StatCard
                    label="People Fed (NGO)"
                    value="0"
                    unit=""
                    color="bg-purple-500/20 text-purple-500"
                    icon={<MdPeople />}
                />
                <StatCard
                    label="CO2 Avoided"
                    value="0"
                    unit="kg"
                    color="bg-orange-500/20 text-orange-500"
                    icon={<MdCo2 />}
                />
            </div>
        </div>
    );
};

export default WasteOMeter;
