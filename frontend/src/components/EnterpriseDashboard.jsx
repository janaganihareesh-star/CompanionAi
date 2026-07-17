import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiShield, FiSettings, FiActivity, FiUserPlus, FiLock } from 'react-icons/fi';

const EnterpriseDashboard = () => {
    const [activeTab, setActiveTab] = useState('members');
    
    const teamMembers = [
        { id: 1, name: 'Alice Admin', email: 'alice@company.com', role: 'admin' },
        { id: 2, name: 'Bob Manager', email: 'bob@company.com', role: 'manager' },
        { id: 3, name: 'Charlie Dev', email: 'charlie@company.com', role: 'member' },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <FiShield className="text-blue-500" /> Closer-AI Enterprise
                        </h1>
                        <p className="text-gray-400 mt-2">Manage your organization's workspaces and security</p>
                    </div>
                    <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2">
                        <FiUserPlus /> Invite Users
                    </button>
                </div>

                {/* Dashboard layout */}
                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="w-64 flex flex-col gap-2">
                        <button onClick={() => setActiveTab('members')} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'members' ? 'bg-gray-800 text-blue-400 font-semibold' : 'hover:bg-gray-800 text-gray-400'}`}>
                            <FiUsers /> Members & Roles
                        </button>
                        <button onClick={() => setActiveTab('security')} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'security' ? 'bg-gray-800 text-blue-400 font-semibold' : 'hover:bg-gray-800 text-gray-400'}`}>
                            <FiLock /> Security & SSO
                        </button>
                        <button onClick={() => setActiveTab('audit')} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'audit' ? 'bg-gray-800 text-blue-400 font-semibold' : 'hover:bg-gray-800 text-gray-400'}`}>
                            <FiActivity /> Audit Logs
                        </button>
                        <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-gray-800 text-blue-400 font-semibold' : 'hover:bg-gray-800 text-gray-400'}`}>
                            <FiSettings /> Workspace Settings
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-gray-900 rounded-xl border border-white/10 p-6 min-h-[500px]">
                        {activeTab === 'members' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-xl font-semibold mb-6">Team Members</h2>
                                <div className="overflow-hidden rounded-lg border border-white/10">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-800">
                                                <th className="p-4 border-b border-white/10 font-medium text-gray-400">Name</th>
                                                <th className="p-4 border-b border-white/10 font-medium text-gray-400">Email</th>
                                                <th className="p-4 border-b border-white/10 font-medium text-gray-400">Role (RBAC)</th>
                                                <th className="p-4 border-b border-white/10 font-medium text-gray-400">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teamMembers.map(member => (
                                                <tr key={member.id} className="hover:bg-gray-800/50 transition-colors">
                                                    <td className="p-4 border-b border-white/5">{member.name}</td>
                                                    <td className="p-4 border-b border-white/5 text-gray-400">{member.email}</td>
                                                    <td className="p-4 border-b border-white/5">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                            member.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                            member.role === 'manager' ? 'bg-yellow-500/20 text-yellow-400' :
                                                            'bg-green-500/20 text-green-400'
                                                        }`}>
                                                            {member.role.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 border-b border-white/5">
                                                        <button className="text-blue-400 hover:text-blue-300">Edit</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                        
                        {activeTab === 'security' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-xl font-semibold mb-6">Single Sign-On (SSO)</h2>
                                <div className="bg-gray-800/50 p-6 rounded-lg border border-white/5 flex items-start gap-4">
                                    <div className="p-3 bg-gray-900 rounded-lg text-blue-500"><FiShield size={24} /></div>
                                    <div>
                                        <h3 className="font-semibold text-lg">SAML 2.0 Integration</h3>
                                        <p className="text-gray-400 mt-1 mb-4 text-sm">Allow users to log in using your organization's identity provider (Okta, Azure AD, Google Workspace).</p>
                                        <button className="bg-white text-black font-semibold px-4 py-2 rounded-lg">Configure SSO</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnterpriseDashboard;
