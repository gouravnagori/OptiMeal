import { useState, useEffect } from 'react';

const LiveClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="hidden md:flex flex-col items-end mr-4">
            <div className="text-xl font-mono font-bold text-white tracking-widest leading-none">
                {formatTime(time)}
            </div>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                {formatDate(time)}
            </div>
        </div>
    );
};

export default LiveClock;
