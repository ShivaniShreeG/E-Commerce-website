import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import BASE_URL from '../api';

const Profile = () => {
  const [viewMode, setViewMode] = useState(true);
  const [form, setForm] = useState({
    full_name: '',
    dob: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    profile_pic: null,
    user_id: localStorage.getItem("userId"),
  });

  const loadProfile = () => {
    const id = localStorage.getItem("userId");
    fetch(`${BASE_URL}/api/profile/${id}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setForm(prev => ({
            ...prev,
            full_name: data.full_name || '',
            email: data.email || '',
            phone: data.phone || '',
            dob: data.dob || '',
            gender: data.gender || '',
            address: data.address || '',
            profile_pic: data.profile_pic || null,
          }));
        }
      })
      .catch(() => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to fetch profile.' });
      });
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'profile_pic') {
      setForm(prev => ({ ...prev, profile_pic: files[0] }));
    } else if (name === 'full_name') {
      const capitalized = value.replace(/\b\w/g, c => c.toUpperCase());
      setForm(prev => ({ ...prev, [name]: capitalized }));
    } else if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setForm(prev => ({ ...prev, [name]: digits }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('user_id', form.user_id);
      formData.append('full_name', form.full_name);
      formData.append('dob', form.dob);
      formData.append('gender', form.gender);
      formData.append('phone', form.phone);
      formData.append('address', form.address);
      if (form.profile_pic instanceof File) {
        formData.append('profile_pic', form.profile_pic);
      }

      const res = await fetch(`${BASE_URL}/api/profile/edit`, {
        method: 'POST',
        body: formData
      });

      const result = await res.json();
      if (res.ok) {
        Swal.fire('Success', result.message, 'success');
        setViewMode(true);
        loadProfile();
      } else {
        Swal.fire('Failed', result.message || 'Profile update failed.', 'error');
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Something went wrong.', 'error');
    }
  };

  return (
    <div className="bg-gradient-to-tr from-sky-100 via-sky-200 to-sky-300 min-h-screen py-10 px-4">
      <div className="bg-white max-w-3xl mx-auto rounded-3xl shadow-lg p-8 md:p-12">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-8">My Profile</h2>

        {viewMode ? (
          <>
            <div className="flex flex-col items-center text-center mb-6">
              {form.profile_pic ? (
                <img
                  src={form.profile_pic}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border shadow mb-4"
                />
              ) : (
                <img
                  src="/default-avatar.png"
                  alt="Default Avatar"
                  className="w-32 h-32 rounded-full object-cover border shadow mb-4"
                />
              )}
              <h3 className="text-2xl font-semibold">{form.full_name || '-'}</h3>
              <p className="text-gray-600">{form.email}</p>
            </div>

            <div className="space-y-4 text-gray-700 text-base">
              <ViewField label="Phone Number" value={form.phone} />
              <ViewField label="Address" value={form.address} />
              <ViewField label="Gender" value={form.gender} />
              <ViewField label="Date of Birth" value={form.dob} />
            </div>

            <div className="text-center mt-8">
              <button
                onClick={() => setViewMode(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
              >
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Full Name" name="full_name" value={form.full_name} onChange={handleChange} required />

            <div>
              <label className="block font-semibold mb-1 text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                readOnly
                className="w-full p-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <Input
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              type="text"
              maxLength={10}
              pattern="\d{10}"
              title="Phone number must be 10 digits"
            />
            <Input label="Address" name="address" value={form.address} onChange={handleChange} required />
            <Select label="Gender" name="gender" value={form.gender} onChange={handleChange} options={['Male', 'Female', 'Other']} required />
            <Input type="date" label="Date of Birth" name="dob" value={form.dob} onChange={handleChange} required />

            <div>
              <label className="block font-semibold mb-1 text-gray-700">Profile Picture</label>
              <input
                type="file"
                name="profile_pic"
                accept="image/*"
                onChange={handleChange}
                className="w-full p-3 rounded-lg border border-gray-300"
              />
            </div>

            <div className="col-span-full text-center mt-4 flex justify-center gap-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
              >
                Save Profile
              </button>
              <button
                type="button"
                onClick={() => setViewMode(true)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const ViewField = ({ label, value }) => (
  <div>
    <p className="font-semibold text-gray-800">{label}</p>
    <p className="text-gray-600">{value || '-'}</p>
  </div>
);

const Input = ({ label, name, value, onChange, required = false, type = 'text', ...rest }) => (
  <div>
    <label className="block font-semibold mb-1 text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
      {...rest}
    />
  </div>
);

const Select = ({ label, name, value, onChange, options, required = false }) => (
  <div>
    <label className="block font-semibold mb-1 text-gray-700">{label}</label>
    <select
      name={name}
      value={value || ''}
      onChange={onChange}
      required={required}
      className="w-full p-3 rounded-lg border border-gray-300"
    >
      <option value="" disabled hidden>
        Select {label}
      </option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

export default Profile;
