import React, { useEffect, useState } from 'react';
import BASE_URL from '../api';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin');
    if (isAdmin !== 'true') {
      navigate('/admin-login');
    } else {
      fetchUsers();
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/users`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        console.error(data.error || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-semibold text-slate-700 mb-6">Registered Users</h1>

      <div className="bg-white p-4 shadow rounded-xl overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead className="text-gray-600 border-b">
            <tr>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Full Name</th>
              <th className="py-2 px-2">DOB</th>
              <th className="py-2 px-2">Gender</th>
              <th className="py-2 px-2">Phone</th>
              <th className="py-2 px-2">Profile Address</th>
              <th className="py-2 px-2">All Addresses</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-100">
                <td className="py-2 px-2">{user.email}</td>
                <td className="py-2 px-2">{user.full_name}</td>
                <td className="py-2 px-2">
                  {user.dob && user.dob !== '0000-00-00'
                    ? user.dob.slice(0, 10)
                    : 'N/A'}
                </td>
                <td className="py-2 px-2">{user.gender || 'N/A'}</td>
                <td className="py-2 px-2">{user.phone || 'N/A'}</td>
                <td className="py-2 px-2">{user.profile_address || 'N/A'}</td>
                <td className="py-2 px-2">{user.all_addresses || 'N/A'}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
