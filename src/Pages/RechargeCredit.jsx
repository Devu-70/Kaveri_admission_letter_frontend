import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import config from '../config/config';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import Lottie from 'lottie-react';
import successAnimation from '../assets/success.json';
import rechargeSuccessSound from '../assets/recharge_Success.mp3'; 

const RechargeCredit = ({ users: usersProp, refreshUsers }) => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [amount, setAmount] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [errors, setErrors] = useState({ name: '', amount: '' });
    const [showSuccess, setShowSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        setUsers(usersProp || []);
    }, [usersProp]);

    const filteredUsers = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return users.filter(user => user.name?.toLowerCase().includes(term));
    }, [users, searchTerm]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        setSearchTerm(user.name);
        setErrors(prev => ({ ...prev, name: '' }));
        setShowDropdown(false);
    };

    const validate = () => {
        const errs = { name: '', amount: '' };
        let valid = true;

        if (!selectedUser) {
            errs.name = 'Name is required';
            valid = false;
        }

        if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
            errs.amount = 'Valid amount is required';
            valid = false;
        }

        setErrors(errs);
        return valid;
    };

    const handleRecharge = async () => {
        if (!validate()) return;
        setIsLoading(true);

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${config.apiUrl}/users/credits/add-total`,
                {
                    kaveriId: selectedUser.kaveriId,
                    amount: Number(amount),
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setShowSuccess(true);

            // ✅ Play success sound
            const audio = new Audio(rechargeSuccessSound);
            audio.play();

            setSelectedUser(null);
            setSearchTerm('');
            setAmount('');

            if (refreshUsers) {
                refreshUsers(); // Refresh user list after recharge
            }

            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err) {
            console.error('Recharge failed:', err);
            alert('Recharge failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black/30 backdrop-blur-md border border-white/20 p-6 rounded-lg relative w-full max-w-xl mx-auto">
            <style>{`
                @keyframes flowText {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
            `}</style>

            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold bg-gradient-to-r from-white via-gray-400 to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-[flowText_3s_linear_infinite]">
                    Recharge Credit
                </h2>
                <AiOutlineInfoCircle
                    className="text-white text-xl"
                    title="Recharge user credits here"
                />
            </div>

            {showSuccess ? (
                <div className="flex justify-center items-center h-60">
                    <Lottie animationData={successAnimation} loop={false} />
                </div>
            ) : (
                <>
                    {/* Search Field */}
                    <div className="mb-4 relative mt-6">
                        <label className="block text-sm mb-1 text-white">Name</label>
                        <input
                            type="text"
                            placeholder="Search user..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                            className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                        )}
                        {showDropdown && filteredUsers.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-black border border-white/10 rounded-md max-h-44 overflow-auto shadow-lg custom-scrollbar">
                                {filteredUsers.map((user) => (
                                    <li
                                        key={user.kaveriId}
                                        className="px-4 py-2 hover:bg-white/10 cursor-pointer text-white"
                                        onClick={() => handleUserSelect(user)}
                                    >
                                        <div className="font-medium">{user.name}</div>
                                        {user.consultancyName && (
                                            <div className="text-white/60 text-sm">{user.consultancyName}</div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Amount Field */}
                    <div className="mb-6">
                        <label className="block text-sm mb-1 text-white">Amount</label>
                        <input
                            type="number"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => {
                                setAmount(e.target.value);
                                setErrors(prev => ({ ...prev, amount: '' }));
                            }}
                            className="w-full px-3 py-2 rounded-md bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none"
                        />
                        {errors.amount && (
                            <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                        )}
                    </div>

                    {/* Recharge Button */}
                    <div>
                        <button
                            onClick={handleRecharge}
                            disabled={isLoading}
                            className={`w-full flex justify-center items-center bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-md transition duration-200 ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <svg
                                    className="animate-spin h-5 w-5 text-black"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    />
                                </svg>
                            ) : (
                                'Recharge'
                            )}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default RechargeCredit;
