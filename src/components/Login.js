import React, { useState, useContext } from 'react';
import { db, auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import UserContext from '../UserContext';
import { Dropdown } from 'bootstrap';

function Login() {
  const { setUser } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [establishmentData, setEstablishmentData] = useState(null); 
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };  
  const passwordToggleStyle = {
    position: 'absolute',
    right: '10px',
    top: '40%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const handleCreate = () => {
    navigate("/Create");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (user) {
        let collectionName = '';

        if (userType === 'agents') {
          collectionName = 'agents';
        } else if (userType === 'establishment') {
          collectionName = 'establishments';
        } else {
          alert('Please select a valid account type.');
          return;
        }

        const collectionRef = query(collection(db, collectionName), where('email', '==', email));
        const querySnapshot = await getDocs(collectionRef);

        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUser(userData);

          alert('Login successful!');

          if (userType === 'agents') {
            navigate('/ViewSpace');
          } else {
            navigate('/Dashboard');
          }
        } else {
          alert('User not found. Please try again.');
        }
      } else {
        alert('User not found. Please try again.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in. Please try again.');
    }
  };



  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: 'white',
  };
  const selectStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
    fontFamily: 'Georgina'
  };
  const formContainerStyle = {
    backgroundColor: 'white',
    marginTop:'100px',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)',
    width: '400px',
    textAlign: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
    fontFamily:'Georgina'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#1877f2',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
  };

  const buttonStyle2 = {
    width: '100%',
    padding: '12px',
    backgroundColor: 'green',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '18px',
  };
  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: 'black',
    color: 'white',
    width: '100%',
  };

  const logoStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
  };


  return (
    <div style={containerStyle}>
        <div style={navbarStyle}>
        <div style={logoStyle}>SpotWise Parking Management</div>
      </div>
      <div style={formContainerStyle}>
         <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          style={selectStyle}
        >
          <option value="" >Please select type of account</option>
          <option value="agents">Operator</option>
          <option value="establishment">Establishment</option>
        </select>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              placeholder="Username or Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}

          />
          {password.length > 0 && ( 
            <span style={passwordToggleStyle} onClick={togglePasswordVisibility}>
              {showPassword ? (
                <FontAwesomeIcon icon={faEyeSlash} />
              ) : (
                <FontAwesomeIcon icon={faEye} />
              )}
            </span>
          )}
        </div>
          <button type="submit" style={buttonStyle}>
            Log In
          </button>
          <p style={{ marginTop: '10px', fontSize: '14px' }}>
           <a href="/forget">Forget Password?</a>
          </p>
          <button type="submit" style={buttonStyle2} onClick={handleCreate}>
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}
export default Login;