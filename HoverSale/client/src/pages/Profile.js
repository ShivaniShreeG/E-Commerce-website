import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const Profile = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    profile_pic: null,
    user_id: localStorage.getItem("userId"),
  });

  useEffect(() => {
    const id = localStorage.getItem("userId");
    fetch(`http://localhost:5000/api/profile/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setProfile(data);
          setForm(prev => ({
            ...prev,
            full_name: data.full_name || '',
            username: data.username || '',
            email: data.email || '',
            phone: data.phone || '',
            dob: data.dob || '',
            gender: data.gender || '',
            address: data.address || '',
            profile_pic: data.profile_pic || null,
          }));
          setIsEditing(!(data.full_name || data.dob || data.gender || data.phone || data.address || data.profile_pic));
        }
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch profile. Please try again later.'
        });
      });
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profile_pic') {
      setForm(prev => ({ ...prev, profile_pic: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && key !== 'username' && key !== 'email') {
        formData.append(key, value);
      }
    });

    try {
      const res = await fetch(`http://localhost:5000/api/profile/edit`, {
        method: 'POST',
        body: formData
      });
      const msg = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Profile Saved',
          text: msg.message
        });
        setIsEditing(false);
        setProfile({ ...form });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: msg.message || 'Unable to save profile.'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Something went wrong while saving your profile.'
      });
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-400 to-orange-300 min-h-screen py-10 px-4 font-sans">
      <div className="bg-white max-w-4xl mx-auto rounded-3xl shadow-xl p-8 md:p-12">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-8">My Profile</h2>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Full Name</label>
              <input type="text" name="full_name" value={form.full_name} onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Username</label>
              <input type="text" name="username" value={form.username} readOnly disabled
                className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Email</label>
              <input type="email" name="email" value={form.email} readOnly disabled
                className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100" />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Phone Number</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300" required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300" required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300" required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Date of Birth</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300" required />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Profile Picture</label>
              <input type="file" name="profile_pic" accept="image/*" onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300" />
            </div>
            <div className="col-span-full text-center mt-4">
              <button type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300">
                Save Profile
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col md:flex-row items-center gap-8 justify-center text-gray-800">
            {profile?.profile_pic && (
              <img
                src={`http://localhost:5000/uploads/${profile?.profile_pic}`}
                alt="Profile"
                className="w-40 h-40 rounded-full object-cover border-4 border-blue-600 shadow-md"
              />
            )}
            <div className="text-left">
              <p><strong>Full Name:</strong> {profile?.full_name}</p>
              <p><strong>Username:</strong> {profile?.username}</p>
              <p><strong>Email:</strong> {profile?.email}</p>
              <p><strong>Phone:</strong> {profile?.phone}</p>
              <p><strong>Address:</strong> {profile?.address}</p>
              <p><strong>Gender:</strong> {profile?.gender}</p>
              <p><strong>DOB:</strong> {new Date(profile?.dob).toLocaleDateString()}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
