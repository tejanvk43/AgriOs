import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, User, Search, Filter } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', mobileNumber: '', password: '', role: 'GODOWN_MANAGER', state: 'Maharashtra', district: 'Nagpur', mandal: 'Nagpur Rural', godownCapacity: '' });
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newUser)
            });
            if (response.ok) {
                setShowModal(false);
                fetchUsers();
                setNewUser({ name: '', mobileNumber: '', password: '', role: 'GODOWN_MANAGER', state: 'Maharashtra', district: 'Nagpur', mandal: 'Nagpur Rural', godownCapacity: '' });
                alert("User created successfully");
            } else {
                alert("Failed to create user");
            }
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            console.log("Delete User:", userId);
            alert("Delete functionality to be implemented in backend");
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(filter.toLowerCase()) ||
        user.mobileNumber.includes(filter) ||
        user.role.toLowerCase().includes(filter.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center animate-pulse">Loading Users...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Management</h1>
                <div className="flex gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-2 focus:ring-green-500"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors flex items-center gap-2"
                    >
                        + Add Official
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 dark:text-white">Create New User</h2>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Name" required value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                            <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Mobile Number" required value={newUser.mobileNumber} onChange={e => setNewUser({ ...newUser, mobileNumber: e.target.value })} />
                            <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" type="password" placeholder="Password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                            <select className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                                <option value="GODOWN_MANAGER">Godown Manager</option>
                                <option value="GOV_BODY_OFFICER">Govt. Officer</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                            </select>

                            {newUser.role === 'GODOWN_MANAGER' && (
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Godown Capacity (Tonnes)"
                                    required
                                    value={newUser.godownCapacity || ''}
                                    onChange={e => setNewUser({ ...newUser, godownCapacity: e.target.value })}
                                />
                            )}

                            <input className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Assigned Mandal/Location" value={newUser.mandal} onChange={e => setNewUser({ ...newUser, mandal: e.target.value })} />
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create User</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                                <User size={20} className="text-gray-500" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.mobileNumber}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${user.role === 'SUPER_ADMIN' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            user.role === 'GODOWN_MANAGER' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                user.role === 'GOV_BODY_OFFICER' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    'bg-green-50 text-green-700 border-green-200'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 dark:text-gray-400">
                                        {user.assigned_mandal || user.mandal || 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Active</span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        {user.role === 'FARMER' && (
                                            <button
                                                onClick={() => navigate(`/admin/farmer/${user.id}`)}
                                                className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-medium whitespace-nowrap"
                                            >
                                                View Details
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
