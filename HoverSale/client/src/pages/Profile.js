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

  const inputStyle = {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    width: '100%',
    marginBottom: '10px',
  };

  const labelStyle = {
    fontWeight: '600',
    marginBottom: '5px',
    display: 'block',
    color: '#333',
  };

  return (
    <div style={{
      background: "linear-gradient(to right, #ff758c, #ffb88c)",
      minHeight: '100vh',
      padding: '40px 20px',
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        maxWidth: '900px',
        margin: '0 auto',
        borderRadius: '20px',
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
        padding: '30px 40px'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#2c3e50',
          marginBottom: '30px',
          fontSize: '28px',
          letterSpacing: '1px'
        }}>
          My Profile
        </h2>

        {isEditing ? (
          <form onSubmit={handleSubmit} style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
          }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" name="full_name" value={form.full_name} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Username</label>
              <input type="text" name="username" value={form.username} style={inputStyle} readOnly disabled />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" name="email" value={form.email} style={inputStyle} readOnly disabled />
            </div>
            <div>
              <label style={labelStyle}>Phone Number</label>
              <input type="text" name="phone" value={form.phone} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <input type="text" name="address" value={form.address} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle} required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date of Birth</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Profile Picture</label>
              <input type="file" name="profile_pic" accept="image/*" onChange={handleChange} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / span 2', textAlign: 'center', marginTop: '10px' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 30px',
                  background: '#27ae60',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: '0.3s',
                }}
              >
                Save Profile
              </button>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', gap: '30px', alignItems: 'center', justifyContent: 'center' }}>
            {profile?.profile_pic && (
              <img
                src={`http://localhost:5000/uploads/${profile?.profile_pic}`}
                alt="Profile"
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '5px solid #2980b9',
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <p><strong>Full Name:</strong> {profile?.full_name}</p>
              <p><strong>Username:</strong> {profile?.username}</p>
              <p><strong>Email:</strong> {profile?.email}</p>
              <p><strong>Phone:</strong> {profile?.phone}</p>
              <p><strong>Address:</strong> {profile?.address}</p>
              <p><strong>Gender:</strong> {profile?.gender}</p>
              <p><strong>DOB:</strong> {new Date(profile?.dob).toLocaleDateString()}</p>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  marginTop: '20px',
                  padding: '12px 25px',
                  background: '#2980b9',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: '0.3s',
                }}
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
