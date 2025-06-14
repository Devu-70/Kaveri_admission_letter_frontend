import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config/config';
import { useNavigate } from 'react-router-dom';
import '../../src/App.css';

const AgentManagement = ({ onStatusChange }) => {
    const [agents, setAgents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSuspended, setShowSuspended] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchAgents();
    }, [showSuspended]);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`${config.apiUrl}/users/getall`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const users = Array.isArray(res.data) ? res.data : res.data.users || [];

            const filteredUsers = users.filter(user =>
                showSuspended ? user.isSuspended : !user.isSuspended
            );

            setAgents(filteredUsers);
        } catch (err) {
            console.error('Error fetching agents:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyStatus = async (kaveriId, status, e) => {
        e.stopPropagation();

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${config.apiUrl}/users/verify/${kaveriId}`,
                { verificationStatus: status },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            console.log('✅ Update successful:', response.data);

            setAgents(prev =>
                prev.map(agent =>
                    agent.kaveriId === kaveriId
                        ? { ...agent, verificationStatus: status }
                        : agent
                )
            );

            if (onStatusChange) {
                onStatusChange();
            }
        } catch (err) {
            console.error(`❌ Error updating verification status for ${kaveriId}:`, err.response?.data || err.message);
        }
    };

    const filteredAgents = agents.filter(agent =>
        agent.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const goToDetails = (agent) => {
        navigate(`/agent-details/${agent.kaveriId}`);
    };

    return (
        <div className="bg-transparent backdrop-blur-md border border-white/20 p-0 rounded-lg h-96 overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-black/50 backdrop-blur-md p-4 border-b border-white/20 z-10">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Agent Management</h2>
                    <div className="flex items-center space-x-6">
                        <label className="text-sm flex items-center space-x-2 text-white">
                            <input
                                type="checkbox"
                                checked={showSuspended}
                                onChange={() => setShowSuspended(prev => !prev)}
                                className="accent-green-500 w-4 h-4"
                            />
                            <span className='text-neutral-400'>Show Suspended Users</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Search by name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-sm px-3 py-1 rounded bg-neutral-400 border border-black/10 text-black placeholder-black"
                        />
                    </div>
                </div>
            </div>


            {/* Content */}
            <div className="overflow-y-auto h-[calc(100%-64px)] px-6 py-4 custom-scrollbar">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : filteredAgents.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-10">No agents found.</div>
                ) : (
                    <ul className="space-y-3 text-sm">
                        {filteredAgents.map(agent => (
                            <li
                                key={agent._id}
                                className="border-b border-white/5 pb-2 flex justify-between items-center cursor-pointer"
                                onClick={() => goToDetails(agent)}
                            >
                                <div>
                                    <div className={`font-medium ${showSuspended ? 'text-red-500' : ''}`}>
                                        {agent.name || 'Unnamed'}
                                    </div>
                                    <div className="text-gray-400 text-xs">{agent.email}</div>
                                </div>
                                {agent.verificationStatus ? (
                                    <button
                                        className="cursor-pointer bg-red-100 text-red-700 px-3 py-1 rounded text-xs font-semibold transition hover:bg-red-700 hover:text-white"
                                        onClick={(e) => handleVerifyStatus(agent.kaveriId, false, e)}
                                    >
                                        Block User
                                    </button>
                                ) : (
                                    <button
                                        className="cursor-pointer bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-semibold transition hover:bg-green-700 hover:text-white"
                                        onClick={(e) => handleVerifyStatus(agent.kaveriId, true, e)}
                                    >
                                        Verify User
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AgentManagement;
