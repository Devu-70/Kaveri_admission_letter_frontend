import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config/config.js';
import { FaCoins, FaArrowDown, FaWallet, FaTrash, FaArrowUp, FaArrowDown as FaDemote, FaTrashAlt, FaTrashRestoreAlt, FaRegTrashAlt } from 'react-icons/fa';
import { isTokenValid } from '../utils/tokenUtils';
import GeneratedLetters from '../Pages/GeneratedLetters';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AgentDetails = () => {
    const { kaveriId } = useParams();
    const navigate = useNavigate();
    const [agentData, setAgentData] = useState(null);
    const [letters, setLetters] = useState([]);
    const [creditLogs, setCreditLogs] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalSearchQuery, setModalSearchQuery] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showEnlargedModal, setShowEnlargedModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isChangingRole, setIsChangingRole] = useState(false);
    const [isSuspending, setIsSuspending] = useState(false);
    const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !isTokenValid()) {
            localStorage.removeItem('token');
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const agentRes = await axios.get(`${config.apiUrl}/users/${kaveriId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setAgentData(agentRes.data);

                Promise.all([
                    axios.get(`${config.apiUrl}/users/letters/${kaveriId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                        .then(res => setLetters(res.data))
                        .catch(err => {
                            console.error('Error fetching letters:', err);
                            setLetters([]);
                        }),

                    axios.get(`${config.apiUrl}/users/credit-logs/${kaveriId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    })
                        .then(res => {
                            setCreditLogs(Array.isArray(res.data?.logs) ? res.data.logs : []);
                        })
                        .catch(err => {
                            console.error('Error fetching credit logs:', err);
                            setCreditLogs([]);
                        })
                ]);
            } catch (err) {
                console.error('Error fetching agent data:', err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            }
        };

        fetchData();
    }, [kaveriId, navigate]);

    const handleRoleChange = async () => {
        const newRole = agentData?.user.role === 'agent' ? 'admin' : 'agent';
        const action = newRole === 'admin' ? 'promoted' : 'demoted';
        setIsChangingRole(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${config.apiUrl}/users/verify/${kaveriId}`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAgentData(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    role: newRole
                }
            }));
            setShowRoleChangeModal(false);
            toast.success(`User successfully ${action} to ${newRole}!`, {
                position: "bottom-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            console.error(`Error changing user role:`, err);
            toast.error(`Failed to ${action} user. Please try again.`, {
                position: "bottom-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsChangingRole(false);
        }
    };

    const handleSuspendToggle = async () => {
        const action = agentData?.user.isSuspended ? 'restored' : 'suspended';
        setIsSuspending(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${config.apiUrl}/users/verify/${kaveriId}`,
                { isSuspended: !agentData?.user.isSuspended },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setAgentData(prev => ({
                ...prev,
                user: {
                    ...prev.user,
                    isSuspended: !prev.user.isSuspended
                }
            }));
            setShowSuspendModal(false);
            toast.success(`User successfully ${action}!`, {
                position: "bottom-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } catch (err) {
            console.error(`Error toggling suspend status:`, err);
            toast.error(`Failed to ${action} user. Please try again.`, {
                position: "bottom-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        } finally {
            setIsSuspending(false);
        }
    };

    const renderRechargeLogs = () => {
        const filteredLogs = creditLogs
            .slice()
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
            .filter((log) => {
                const query = searchQuery.toLowerCase();
                const amountMatch = log.amount.toString().includes(query);
                const date = new Date(log.addedAt);
                const formatted1 = date.toLocaleDateString('en-GB');
                const formatted2 = date.toISOString().split('T')[0];
                const dateMatch = formatted1.includes(query) || formatted2.includes(query);
                return amountMatch || dateMatch;
            });

        if (filteredLogs.length === 0) {
            return <p className="text-gray-400">No recharges found.</p>;
        }

        return filteredLogs.map((log, index) => (
            <div
                key={index}
                className="border-b border-white/10 pb-4 flex justify-between items-start"
            >
                <div className="flex flex-col">
                    <p className="text-green-600 font-bold text-xl">{log.amount}</p>
                    <p className="text-sm text-gray-400">Credit Added</p>
                </div>
                <div className="text-right">
                    <p className="text-white text-sm">
                        {new Date(log.addedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                        {new Date(log.addedAt).toLocaleTimeString()}
                    </p>
                </div>
            </div>
        ));
    };

    const renderModalRechargeLogs = () => {
        const filteredLogs = creditLogs
            .slice()
            .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
            .filter((log) => {
                const query = modalSearchQuery.toLowerCase();
                const amountMatch = log.amount.toString().includes(query);
                const date = new Date(log.addedAt);
                const formatted1 = date.toLocaleDateString('en-GB');
                const formatted2 = date.toISOString().split('T')[0];
                const dateMatch = formatted1.includes(query) || formatted2.includes(query);
                return amountMatch || dateMatch;
            });

        if (filteredLogs.length === 0) {
            return <div className="text-gray-400 text-center py-12">No recharges found.</div>;
        }

        return filteredLogs.map((log, index, arr) => (
            <div
                key={index}
                className={`flex justify-between items-center pb-4 ${index !== arr.length - 1 ? 'border-b border-white/10' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <FaCoins className="text-green-700 text-xl" />
                    </div>
                    <div>
                        <p className="text-green-600 font-bold text-lg">+{log.amount}</p>
                        <p className="text-sm text-gray-400">Credit Added</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-white text-sm">
                        {new Date(log.addedAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                        {new Date(log.addedAt).toLocaleTimeString()}
                    </p>
                </div>
            </div>
        ));
    };

    if (!agentData) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="text-white">Loading agent details...</div>
            </div>
        );
    }

    const { user, credits, availableCredits } = agentData;

    return (
        <div className="fixed inset-0 bg-black overflow-auto">
            <div className="fixed top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/5 blur-3xl -z-0"></div>
            <div className="fixed bottom-1/3 right-1/3 w-80 h-80 rounded-full bg-white/5 blur-3xl -z-0"></div>
            <div className="fixed top-1/3 right-1/4 w-48 h-48 rounded-full bg-white/3 blur-2xl -z-0"></div>

            <div className="relative z-10 p-6 max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex flex-col gap-6 flex-1">
                        {/* Agent Details */}
                        <div className="bg-neutral-900 rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="pl-3 border-l-4 border-green-500">
                                    <h3 className="text-xl font-semibold text-gray-300">Agent Details</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {user.role === 'agent' && !user.isSuspended && (
                                        <button
                                            onClick={() => setShowRoleChangeModal(true)}
                                            disabled={isChangingRole}
                                            className="flex items-center gap-1 px-3 py-1 cursor-pointer bg-green-600 hover:bg-green-700 text-white text-sm rounded-md transition-colors disabled:opacity-50"
                                        >
                                            {isChangingRole ? (
                                                'Processing...'
                                            ) : (
                                                <>
                                                    <FaArrowUp className="text-xs" />
                                                    Promote
                                                </>
                                            )}
                                        </button>
                                    )}
                                    {user.role === 'admin' && !user.isSuspended && (
                                        <button
                                            onClick={() => setShowRoleChangeModal(true)}
                                            disabled={isChangingRole}
                                            className="flex items-center gap-2 px-3 py-1 cursor-pointer bg-amber-500 hover:bg-amber-600 text-white text-sm rounded-md transition-colors disabled:opacity-50"
                                        >
                                            {isChangingRole ? (
                                                'Processing...'
                                            ) : (
                                                <>
                                                    <FaDemote className="text-xs" />
                                                    Demote
                                                </>
                                            )}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => setShowSuspendModal(true)}
                                        disabled={isSuspending}
                                        className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center transition-colors disabled:opacity-50
                                        ${user.isSuspended ? "bg-green-200 hover:bg-green-300" : "bg-red-200 hover:bg-red-300"}`}
                                        title={user.isSuspended ? "Restore User" : "Suspend User"}
                                    >
                                        {isSuspending ? (
                                            <div className={`w-4 h-4 border-2 ${user.isSuspended ? "border-green-800" : "border-red-800"} border-t-transparent rounded-full animate-spin`}></div>
                                        ) : user.isSuspended ? (
                                            <FaTrashRestoreAlt className="text-green-800 dark:text-green-900" />
                                        ) : (
                                            <FaRegTrashAlt className="text-red-800 dark:text-red-900" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 text-2xl font-bold text-white mt-4">
                                {user.name}
                                <span
                                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${user.verificationStatus
                                        ? user.isSuspended
                                            ? 'bg-yellow-200 text-yellow-900'
                                            : 'bg-green-200 text-green-900'
                                        : 'bg-red-200 text-red-900'
                                        }`}
                                >
                                    {user.verificationStatus
                                        ? user.isSuspended
                                            ? 'Suspended'
                                            : 'Verified'
                                        : 'Blocked'}
                                </span>
                            </div>

                            <div className="text-sm font-medium mb-4">
                                <span className="text-amber-400">{user.role}</span>
                                <span className="text-gray-300"> | {user.kaveriId}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-200 mb-6">
                                <div>
                                    <p className="text-sm text-gray-400">Email</p>
                                    <p>{user.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Contact</p>
                                    <p>{user.contact}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Consultancy</p>
                                    <p>
                                        {user.consultancyName}
                                        <span className="text-gray-400"> | {user.consultancyLocation}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                                <div className="p-4 rounded-lg bg-neutral-800 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center">
                                        <FaCoins className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">{credits.totalCredits}</p>
                                        <p className="text-sm text-gray-400">Total Credits</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-neutral-800 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center">
                                        <FaArrowDown className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">{credits.usedCredits}</p>
                                        <p className="text-sm text-gray-400">Used Credits</p>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-neutral-800 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full border border-white flex items-center justify-center">
                                        <FaWallet className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-white">{availableCredits}</p>
                                        <p className="text-sm text-gray-400">Available</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recharge History */}
                        <div className="bg-neutral-900 rounded-lg p-6 h-55 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                <div className="pl-3 border-l-4 border-green-500">
                                    <h3 className="text-md font-semibold text-gray-300">Recharge History</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                    {showSearch && (
                                        <input
                                            type="text"
                                            placeholder="Search amount or date"
                                            className="px-2 py-1 rounded bg-neutral-800 text-white border border-white/20 focus:outline-none"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    )}

                                    <div
                                        className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer"
                                        onClick={() => {
                                            setShowSearch(!showSearch);
                                            setSearchQuery('');
                                        }}
                                    >
                                        {showSearch ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z" />
                                            </svg>
                                        )}
                                    </div>

                                    <div
                                        className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer"
                                        onClick={() => {
                                            setShowEnlargedModal(true);
                                            setModalSearchQuery('');
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3 3h18v18H3z" fill="none" />
                                            <path d="M5 15h4v4H5zM15 5h4v4h-4zM5 5h4v4H5zM15 15h4v4h-4z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mt-4">
                                {creditLogs.length === 0 ? (
                                    <p className="text-gray-400">No recharge history available.</p>
                                ) : (
                                    renderRechargeLogs()
                                )}
                            </div>
                        </div>
                    </div>

                    <GeneratedLetters letters={letters} />
                </div>
            </div>

            {/* Enlarged Modal */}
            {showEnlargedModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="bg-neutral-900 w-full max-w-2xl max-h-[80vh] p-6 rounded-lg overflow-y-auto custom-scrollbar relative flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg text-white font-semibold">Recharge History</h2>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Search amount or date"
                                    className="px-3 py-1 rounded-full bg-neutral-800 text-white border border-white/20 focus:outline-none text-sm"
                                    value={modalSearchQuery}
                                    onChange={(e) => setModalSearchQuery(e.target.value)}
                                />
                                <div
                                    className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 cursor-pointer"
                                    onClick={() => setShowEnlargedModal(false)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="text-white text-sm font-medium mb-2 border-b border-white/10 pb-1">
                            All credit recharge transactions
                        </div>

                        <div className="space-y-4 flex-1 overflow-y-auto p-3">
                            {renderModalRechargeLogs()}
                        </div>

                        <div className="pt-4 mt-4 border-t border-white/10 text-right text-gray-400 text-xs">
                            Showing recent recharge history
                        </div>
                    </div>
                </div>
            )}

            {/* Role Change Confirmation Modal */}
            {showRoleChangeModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="bg-neutral-900 w-full max-w-md p-6 rounded-lg">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            {user.role === 'agent' ? 'Promote to Admin' : 'Demote to Agent'}
                        </h2>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to {user.role === 'agent' ? 'promote' : 'demote'} {user.name}?
                            {user.role === 'agent' ? ' This will grant them admin privileges.' : ' This will remove their admin privileges.'}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowRoleChangeModal(false)}
                                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRoleChange}
                                disabled={isChangingRole}
                                className={`px-4 py-2 ${user.role === 'agent' ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'} text-white rounded-md transition-colors disabled:opacity-50`}
                            >
                                {isChangingRole ? 'Processing...' : (user.role === 'agent' ? 'Promote' : 'Demote')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Suspend/Restore Confirmation Modal */}
            {showSuspendModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="bg-neutral-900 w-full max-w-md p-6 rounded-lg">
                        <h2 className="text-lg font-semibold text-white mb-4">
                            {user.isSuspended ? 'Restore User' : 'Suspend User'}
                        </h2>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to {user.isSuspended ? 'restore' : 'suspend'} {user.name}?
                            {user.isSuspended ? ' This will allow them to access the system again.' : ' This will prevent them from accessing the system.'}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowSuspendModal(false)}
                                className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSuspendToggle}
                                disabled={isSuspending}
                                className={`px-4 py-2 ${user.isSuspended ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-md transition-colors disabled:opacity-50`}
                            >
                                {isSuspending ? 'Processing...' : (user.isSuspended ? 'Restore' : 'Suspend')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgentDetails;