import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';
import AgentManagement from './AgentManagement';
import RechargeCredit from './RechargeCredit';
import Lottie from 'lottie-react';
import weronzAnimation from '../assets/weronz.json';
import { CardSpotlight } from "../components/ui/card-spotlight";
import { isTokenValid } from '../utils/tokenUtils';

const Dashboard = () => {
    const navigate = useNavigate();
    const [letterCount, setLetterCount] = useState(0);
    const [prevLetterCount, setPrevLetterCount] = useState(0);

    const [userCount, setUserCount] = useState(0);
    const [prevUserCount, setPrevUserCount] = useState(0);

    const [pendingUserCount, setPendingUserCount] = useState(0);
    const [prevPendingUserCount, setPrevPendingUserCount] = useState(0);

    const [verifiedUsers, setVerifiedUsers] = useState([]);

    const [amountReceived, setAmountReceived] = useState(0);
    const [prevAmountReceived, setPrevAmountReceived] = useState(0);
    const [unauthorizedAmount, setUnauthorizedAmount] = useState(0);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.apiUrl}/users/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const users = Array.isArray(response.data)
                ? response.data
                : response.data.users || [];

            const verified = users.filter(user => user.verificationStatus === true);
            const pending = users.filter(user => user.verificationStatus === false);

            setPrevUserCount(userCount);
            setPrevPendingUserCount(pendingUserCount);

            setUserCount(verified.length);
            setPendingUserCount(pending.length);
            setVerifiedUsers(verified);
        } catch (error) {
            console.error('Failed to fetch user count:', error);
        }
    };

    const fetchLetters = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.apiUrl}/users/letters`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = response.data;
            let total = 0;
            let unauthorized = 0;

            const letters = Array.isArray(data) ? data : data.letters || [];

            total = letters.length;
            unauthorized = letters.filter(letter => letter.authorized === false).length;

            setPrevLetterCount(letterCount);
            setLetterCount(total);

            setPrevAmountReceived(amountReceived);
            setAmountReceived(total * 10000);
            setUnauthorizedAmount(unauthorized * 10000);
        } catch (error) {
            console.error('Failed to fetch letter count:', error);
        }
    };

    useEffect(() => {
        if (!isTokenValid()) {
            navigate('/login');
            return;
        }

        fetchLetters();
        fetchUsers();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-black text-white p-6 font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute w-full h-full top-0 left-0 pointer-events-none">
                <div className="absolute top-10 left-10 w-72 h-72 bg-white/20 rounded-full blur-[80px]"></div>
                <div className="absolute bottom-10 right-16 w-96 h-96 bg-white/20 rounded-full blur-[100px]"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/10 rounded-full blur-[120px] transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Header with Logout */}
            <div className="mb-6 relative z-10 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <button
                    onClick={() => {
                        localStorage.removeItem('token');
                        navigate('/login');
                    }}
                    className="text-white hover:text-red-500 transition-all cursor-pointer"
                    title="Logout"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 002 2h3a2 2 0 002-2V7a2 2 0 00-2-2h-3a2 2 0 00-2 2v1" />
                    </svg>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6 relative z-10">
                <StatCard title="Letters Generated" value={letterCount} previous={prevLetterCount} />
                <StatCard title="Pending Users" value={pendingUserCount} previous={prevPendingUserCount} />
                <StatCard title="Total Users" value={userCount} previous={prevUserCount} />
                <StatCard
                    title="Amount Received"
                    value={`₹${amountReceived.toLocaleString()}`}
                    previous={prevAmountReceived}
                    isAmount
                    unauthorizedAmount={unauthorizedAmount}
                />
            </div>

            {/* Components */}
            <div className="grid grid-cols-3 gap-4 mb-6 relative z-10">
                <div>
                    <RechargeCredit users={verifiedUsers} refreshUsers={fetchUsers} />
                </div>
                <div className="col-span-2">
                    <AgentManagement onStatusChange={fetchUsers} />
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-[2px] z-10">
                <span className="text-xs text-white/80">Crafted By WeronzTech</span>
                <Lottie
                    animationData={weronzAnimation}
                    loop
                    autoplay
                    style={{ height: '40px', width: '40px' }}
                />
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ title, value, previous, isAmount = false, unauthorizedAmount = 0 }) => {
    const getChange = () => {
        const current = typeof value === 'string' ? Number(value.replace(/[^\d]/g, '')) : value;
        const prev = typeof previous === 'string' ? Number(previous.replace(/[^\d]/g, '')) : previous;

        if (title === "Pending Users") {
            if (current === 0) return { arrow: '▲', color: 'text-green-400', label: '0' };
            if (current >= 1 && current <= 3) return { arrow: '▼', color: 'text-yellow-400', label: current.toString() };
            if (current > 3) return { arrow: '▼', color: 'text-red-400', label: current.toString() };
        }

        if (prev === 0) return { arrow: '▲', color: 'text-green-400', label: '100%' };

        const diff = current - prev;
        const percent = ((diff / prev) * 100).toFixed(1);
        const direction = diff >= 0 ? '▲' : '▼';
        const color = diff >= 0 ? 'text-green-400' : 'text-red-400';
        return { arrow: direction, color, label: `${percent}%` };
    };

    const { arrow, color, label } = getChange();
    const numericValue = typeof value === 'string' ? Number(value.replace(/[^\d]/g, '')) : value;
    const authorizedAmount = numericValue - unauthorizedAmount;

    return (
        <CardSpotlight className="h-full cursor-pointer">
            <div className="p-4 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm text-gray-400">{title}</h3>
                    {title === 'Amount Received' && (
                        <span className="text-green-400 text-xs"> +{authorizedAmount.toLocaleString()} </span>
                    )}
                </div>
                <div className="text-2xl font-bold flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                        <span>{value}</span>
                        <span className={`text-sm ${color}`}>{arrow} {label}</span>
                    </div>
                    {title === 'Amount Received' && unauthorizedAmount > 0 && (
                        <span className="text-sm text-yellow-400">( -{unauthorizedAmount.toLocaleString()} )</span>
                    )}
                </div>
            </div>
        </CardSpotlight>
    );
};

export default Dashboard;
