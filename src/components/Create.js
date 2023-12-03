import React, { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

function Create() {
  const [managementName, setManagementName] = useState('');
  const [companyAddress, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [numberOfParkingLots, setNumberOfParkingLots] = useState('');
  const [parkingPay, setParkingPayment] = useState('');
  const [contact, setContact] = useState('');
  const [isApproved, setIsApproved] = useState (false);
  const [numberOfFloors, setNumberOfFloors] = useState(0);
  const [floorDetails, setFloorDetails] = useState([]);
  const [totalSlot, setTotalSlot] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const navigate = useNavigate();


  const handleNumberOfFloorsChange = (e) => {
    const value = e.target.value;
    setNumberOfFloors(value);

    // If "0", prepare to accept parking slots
    if (value === '0') {
      setFloorDetails([]);
    } else if (value >= 2) {
      // Create an array for floor details
      setFloorDetails(Array.from({ length: value }, () => ({ floorName: '', parkingLots: '' })));
    } else {
      // Clear any existing data if the value is not "0" or >= 2
      setFloorDetails([]);
      setNumberOfParkingLots('');
    }
  };

  const handleFloorDetailsChange = (index, key, value) => {
    const updatedFloorDetails = floorDetails.map((detail, i) => {
      if (i === index) {
        return { ...detail, [key]: value };
      }
      return detail;
    });
    setFloorDetails(updatedFloorDetails);
  };


  const handleFileChange = (event) => {
    setSelectedFiles([...event.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!managementName || !companyAddress || !email || !password || !contact || !parkingPay) {
      alert("Please fill out all fields.");
      return; // Stop the function if validation fails
    }
  
    // Check if the document is uploaded
    if (!selectedFiles) {
      alert("Please upload a document.");
      return; // Stop the function if validation fails
    }
  
    // Initialize total slots as 0.
    let totalSlots = 0;
  
    // If the number of floors is 0, parse the individual number of parking lots.
    if (numberOfFloors === '0' || numberOfFloors === '1') {
      if (!numberOfParkingLots) {
        alert("Please enter the number of parking slots.");
        return; // Stop the function if validation fails
      }
      totalSlots = parseInt(numberOfParkingLots, 10) || 0; // Ensure the value is a number.
    } else {
      if (floorDetails.some(floor => !floor.floorName || !floor.parkingLots)) {
        alert("Please fill out all floor details.");
        return; // Stop the function if validation fails
      }
      // For 2 or more floors, sum up the parking lots for each floor.
      totalSlots = floorDetails.reduce((acc, curr) => {
        return acc + (parseInt(curr.parkingLots, 10) || 0); // Ensure each value is a number.
      }, 0);
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const uploadPromises = selectedFiles.map(file => {
        const fileRef = ref(storage, `documents/${user.uid}/${file.name}`);
        return uploadBytes(fileRef, file).then(() => getDownloadURL(fileRef));
      });
  
      const fileURLs = await Promise.all(uploadPromises);

      // Construct the document to be saved
      const establishmentData = {
        email,
        companyAddress,
        contact,
        managementName,
        parkingPay,
        password,
        numberOfFloors: parseInt(numberOfFloors, 10), // Ensure this is a number
        floorDetails,
        totalSlots, // Save the calculated total slots
        isApproved: false,
        fileURLs, // Save file URLs
      };
  
      // Save to pendingEstablishments in Firestore
      await setDoc(doc(db, "pendingEstablishments", user.uid), establishmentData);
  
      alert('We are currently processing your account. Please wait for admin approval. Thank you!');
      navigate("/");
      // You may also want to reset the form fields here if necessary
    } catch (error) {
      console.error('Error creating account:', error);
      alert(error.message);
    }
  };
  

  const handleParkingTypeChange = (e) => {
    setNumberOfParkingLots(e.target.value);
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around', // This will put some space between your containers
    minHeight: '100vh',
    backgroundColor: '#e6e6fa',
    padding: '20px',
    gap: '10px',
  };
  

  const formContainerStyle = {
    backgroundColor: '#ffffff', // Pure white for clarity
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', // Softer shadow
    width: '450px',
    marginTop: '30px',
    width: '40%',
    minHeight: '500px',
  };

  const inputGroupStyle = {
    marginBottom: '20px', // More space between inputs
  };

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd', // Lighter border
    borderRadius: '8px', // More rounded corners
    fontSize: '16px',
    color: '#333', // Darker font for contrast
  };

  const buttonStyle = {
    width: '100%',
    padding: '15px',
    backgroundColor: '#32cd32', // Lively green button
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    transition: 'background-color 0.3s', // Smooth transition for hover effect
  };

  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#333', // Dark grey for a softer look
    color: 'white',
    width: '100%',
  };

  const logoStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
  };

  const additionalContainerStyle = {
    backgroundColor: '#ffffff', // Consistent with formContainerStyle
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)', // Consistent shadow effect
    width: '450px',
    marginTop: '20px', // Space from the previous container
    marginBottom: '20px', // Space to the bottom
    width: '30%',
    minHeight: '500px',
  };

  const fileInputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    fontSize: '16px',
    color: '#333',
    marginBottom: '20px', // Space after the file input
  };


  return (
    <div>
    <div style={navbarStyle}>
      <div style={logoStyle}>SpotWise Parking Management</div>
    </div>
    <div style={containerStyle}>
      <div style={formContainerStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '18px'}}>Create a New Account</h2>
        <form onSubmit={handleSubmit}>
          <div style={inputGroupStyle}>
            <input
              type="text"
              placeholder="Management Name"
              value={managementName}
              onChange={(e) => setManagementName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <input
              type="text"
              placeholder="Address"
              value={companyAddress}
              onChange={(e) => setAddress(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <input
              type='text'
              placeholder="Contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <input
              type='text'
              placeholder="Parking Payment"
              value={parkingPay}
              onChange={(e) => setParkingPayment(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
          <label htmlFor="documentUpload">Please upload your BIR Document</label>
          <input
            type="file"
            id="documentUpload"
            onChange={handleFileChange}
            multiple
            style={fileInputStyle}
          />
        </div>
          <button type="submit" style={buttonStyle}>
            Sign Up
          </button>
        </form>
      </div>
      <div style={additionalContainerStyle}>
      <div style={inputGroupStyle}>
              <label htmlFor="numberOfFloors">Number of Floors</label>
              <input
                type="number"
                id="numberOfFloors"
                min="0"
                value={numberOfFloors}
                onChange={handleNumberOfFloorsChange}
                style={inputStyle}
              />
            </div>
            {numberOfFloors === '0' || numberOfFloors === '1' && (
              <div style={inputGroupStyle}>
                <label htmlFor="parkingSlots">Number of Parking Slots Available</label>
                <input
                  type="number"
                  id="parkingSlots"
                  value={numberOfParkingLots}
                  onChange={(e) => setNumberOfParkingLots(e.target.value)}
                  required
                  style={inputStyle}
                />
              </div>
            )}
            {numberOfFloors >= 2 && floorDetails.map((floor, index) => (
              <div key={index} style={inputGroupStyle}>
                <input
                  type="text"
                  placeholder={`Name for Floor ${index + 1}`}
                  value={floor.floorName}
                  onChange={(e) => handleFloorDetailsChange(index, 'floorName', e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="number"
                  placeholder={`Parking lots for Floor ${index + 1}`}
                  value={floor.parkingLots}
                  onChange={(e) => handleFloorDetailsChange(index, 'parkingLots', e.target.value)}
                  style={inputStyle}
                />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default Create;