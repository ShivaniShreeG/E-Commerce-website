import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/wishlist/${userId}`)
      .then(res => res.json())
      .then(data => setWishlist(data))
      .catch(err => {
        console.error("Error fetching wishlist:", err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load wishlist.',
        });
      });
  }, [userId]);

  const handleBuyNow = (productId, price) => {
  Swal.fire({
    title: 'Proceed to Buy?',
    text: 'Do you want to place an order for this item?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, Buy Now',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#28a745',
    cancelButtonColor: '#d33',
  }).then((result) => {
    if (result.isConfirmed) {
      navigate(`/placeorder?productId=${productId}&price=${price}&quantity=1`);
    }
  });
};


  const handleRemove = (productId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This item will be removed from your wishlist.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!',
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`http://localhost:5000/api/wishlist`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, productId }),
        })
          .then(res => res.json())
          .then(() => {
            setWishlist(prev => prev.filter(item => item.id !== productId));
            Swal.fire({
              icon: 'success',
              title: 'Removed',
              text: 'Item removed from wishlist.',
              timer: 1500,
              showConfirmButton: false,
            });
          })
          .catch(err => {
            console.error('Error removing wishlist item:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to remove item.',
            });
          });
      }
    });
  };

  const styles = {
    body: {
      margin: 0,
      fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
      background: 'linear-gradient(to right, #ff9a9e, #fad0c4)',
      minHeight: '100vh',
    },
    container: {
      padding: '40px 20px',
      textAlign: 'center',
    },
    title: {
      fontSize: '2.5rem',
      color: '#333',
      marginBottom: '30px',
      fontWeight: 'bold',
    },
    grid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '24px',
      justifyContent: 'center',
      padding: '2rem',
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      padding: '20px',
      width: '100%',
      maxWidth: '300px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    },
    image: {
      width: '100%',
      height: '200px',
      objectFit: 'cover',
      borderRadius: '12px',
      marginBottom: '15px',
    },
    name: {
      fontSize: '1.3rem',
      fontWeight: 'bold',
      color: '#000',
      margin: '10px 0 5px',
    },
    description: {
      fontSize: '0.95rem',
      color: '#555',
      marginBottom: '10px',
    },
    price: {
      fontSize: '0.95rem',
      color: '#000',
      fontWeight: 'bold',
      marginBottom: '10px',
    },
    actions: {
      display: 'flex',
      justifyContent: 'space-around',
      marginTop: '15px',
    },
    button: {
      backgroundColor: '#ff66b2',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 14px',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background-color 0.3s ease',
    },
  };

  return (
    <div style={styles.body}>
      <Navbar />
      <div style={styles.container}>
        <h2 style={styles.title}>Your Wishlist</h2>
        {wishlist.length === 0 ? (
          <p>Your wishlist is empty.</p>
        ) : (
          <div style={styles.grid}>
            {wishlist.map(item => (
              <div key={item.id} style={styles.card}>
                <img
                  src={`http://localhost:5000/${item.image_url}`}
                  alt={item.name}
                  style={styles.image}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150";
                  }}
                />
                <h3 style={styles.name}>{item.name}</h3>
                <p style={styles.description}>{item.description}</p>
                <p style={styles.price}>₹{item.price}</p>
                <div style={styles.actions}>
                  <button
                    style={styles.button}
                    onClick={() => handleBuyNow(item.id, item.price)}
                  >
                    Buy Now
                  </button>
                  <button
                    style={styles.button}
                    onClick={() => handleRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
