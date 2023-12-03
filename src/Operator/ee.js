import React, { useState, useEffect, useContext} from 'react';
import { Button, Modal, Form} from 'react-bootstrap';
import { Dropdown, DropdownButton } from 'react-bootstrap';
import { Link, } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import { db } from "../config/firebase";
import { collection, getDocs, query, where, serverTimestamp,addDoc, setDoc, doc, getDoc} from 'firebase/firestore';
import SearchForm from './SearchForm';
import UserContext from '../UserContext';
import { useNavigate } from 'react-router-dom';
import './space.css';


const ParkingSlot = () => {
    const styles = {
        welcomeMessage: {
          position: "absolute",
          top: "10px",
          right: "10px",
          margin: "0",
          color: "#fff",
          fontFamily: "Rockwell, sans-serif",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
        },
        icon: {
          marginRight: "5px",
        },
      };
      const { user } = useContext(UserContext);
  const maxZones = 5;
  const initialSlotSets = [{ title: 'Zone 1', slots: Array(15).fill(false) }];
  
  const initialTotalSpaces = initialSlotSets.map(zone => zone.slots.length).reduce((total, spaces) => total + spaces, 0);

  const [slotSets, setSlotSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const totalParkingSpaces = slotSets.reduce((total, slotSet) => total + slotSet.slots.length, 0);
const availableParkingSpaces = slotSets.reduce((available, slotSet) => {
  return available + slotSet.slots.filter(slot => !slot.occupied).length;
}, 0);

  


useEffect(() => {
  const fetchData = async () => {
    if (!user || !user.managementName) {
      console.log('No user logged in or management name is missing');
      return;
    }

    setIsLoading(true);
    try {
      const parkingLogsRef = collection(db, 'logs');
      const parkingLogsQuery = query(parkingLogsRef, where('managementName', '==', user.managementName), where('timeOut', '==', null));
      const parkingLogsSnapshot = await getDocs(parkingLogsQuery);

      // Create a map of occupied slots
      const occupiedSlots = new Map();
      parkingLogsSnapshot.forEach(doc => {
        const data = doc.data();
        occupiedSlots.set(data.slotId, doc.id); // Map slotId to the document ID
      });

      const collectionRef = collection(db, 'establishments');
      const q = query(collectionRef, where('managementName', '==', user.managementName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const establishmentData = querySnapshot.docs[0].data();

        let newSlotSets = [];

        // Check if establishmentData has floorDetails
        if (Array.isArray(establishmentData.floorDetails) && establishmentData.floorDetails.length > 0) {
          newSlotSets = establishmentData.floorDetails.map(floor => ({
            title: floor.floorName,
            slots: Array.from({ length: parseInt(floor.parkingLots) }, (_, i) => ({ id: i })),
          }));
        } else if (establishmentData.totalSlots) {
          // If there are no floorDetails, use totalSlots to create slots
          newSlotSets = [{
            title: 'General Parking',
            slots: Array.from({ length: parseInt(establishmentData.totalSlots) }, (_, i) => ({ id: i })),
          }];
        }

        // Fetch occupancy data for each slot
       newSlotSets.forEach(slotSet => {
          slotSet.slots.forEach(slot => {
            if (occupiedSlots.has(slot.id)) { // Check if the slot is occupied
              slot.occupied = true;
              slot.logDocId = occupiedSlots.get(slot.id); // Save the Firestore document ID for later reference
            } else {
              slot.occupied = false;
            }
          });
        });

        setSlotSets(newSlotSets);
      } else {
        console.log('No such establishment!');
      }
    } catch (error) {
      console.error('Error fetching establishment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, [user]);
  
  

  
  
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [zoneAvailableSpaces, setZoneAvailableSpaces] = useState(
    initialSlotSets.map(zone => zone.slots.length)
  );


  const [recordFound, setRecordFound] = useState(true); 
  const [userFound, setUserFound] = useState(true);
  const searchInFirebase = async (searchInput) => {
    try {
      const collectionRef = collection(db, 'user');
      const q = query(collectionRef, where('carPlateNumber', '==', searchInput));
      const querySnapshot = await getDocs(q);
  
      const user = querySnapshot.docs.find(doc => doc.data().carPlateNumber === searchInput);
  
      if (user) {
        console.log('Found user:', user.data());
        setUserPlateNumber(user.data().carPlateNumber);
        setUserDetails(user.data());
        setUserFound(true);
      } else {
        console.log('User not found.');
        setUserDetails({}); 
        setUserPlateNumber(searchInput);
        setUserFound(false); 
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  const navigate = useNavigate();

  const handleButtonClick = () => {
  navigate("/Reservation");
 };

  

  const rows = 5;
  const cols = 3;

  const handleNext = () => {
    if (currentSetIndex < slotSets.length - 1) {
      setCurrentSetIndex(currentSetIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentSetIndex > 0) {
      setCurrentSetIndex(currentSetIndex - 1);
    }
  };

  const [showModal, setShowModal] = useState(false); 
  const [selectedSlot, setSelectedSlot] = useState(null); 
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedPlateNumber, setSelectedPlateNumber] = useState(""); 
  const [agent, setAgentName] = useState (user.firstName || "");
  const [agentL, setAgentLName] = useState (user.lastName || "");
  const [managementName, setManagementName] = useState (user.managementName || "");
  const fullName = `${agent} ${agentL}`;
  const [errorMessage, setErrorMessage] = useState("");
  
  const addToLogs = async (userDetails) => {
    try {
      const logsCollectionRef = collection(db, 'logs'); 
      const timestamp = serverTimestamp();
      const logData = {
        ...userDetails,
        paymentStatus: 'Pending',
        timeIn: timestamp,
        timeOut: null,
        agent: fullName,
        managementName: managementName,
      };
  
      const docRef = await addDoc(logsCollectionRef, logData);
      console.log('Log added with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding log: ', error);
    }
  };
  
  const [userDetails, setUserDetails] = useState({});
  const [userPlateNumber, setUserPlateNumber] = useState("");
  const handleAddToSlot = (carPlateNumber, slotIndex) => {
    if (!carPlateNumber || carPlateNumber.trim() === "") {
      setErrorMessage("Please enter a plate number.");
      return;
    }
    if (!userFound) {
      const confirmAssign = window.confirm("No record found. Do you want to proceed?");
      if (!confirmAssign) {
        return;
      }
    }
    setSelectedPlateNumber(carPlateNumber);
    setShowModal(false);
  
    const updatedSets = [...slotSets];
    const timestamp = new Date();
  
    const updatedUserDetails = {
      carPlateNumber,
      email: userDetails?.email || "",
      contactNumber: userDetails?.contactNumber || "",
      carPlateNumber: userDetails?.carPlateNumber || carPlateNumber,
      car: userDetails?.car || "",
      gender: userDetails?.gender || "",
      age: userDetails?.age || "",
      address: userDetails?.address || "",
      name: userDetails?.name || "",
      timestamp,
    };
  
    updatedSets[currentSetIndex].slots[slotIndex] = {
      text: carPlateNumber,
      occupied: true,
      timestamp: timestamp,
      userDetails: updatedUserDetails,
    };
  
    setSlotSets(updatedSets);
  
    setZoneAvailableSpaces((prevSpaces) => {
      const updatedSpaces = [...prevSpaces];
      updatedSpaces[currentSetIndex]--;
      return updatedSpaces;
    });
  
    addToLogs(updatedUserDetails);
    setErrorMessage("");
  };
  

  const handleSlotClick = (index) => {
    setSelectedSlot(index);
    setShowModal(true);
    setUserDetails(slotSets[currentSetIndex].slots[index]?.userDetails || null);
  };
  
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const handleExitSlot = async (slotIndex) => {
    if (!slotSets[currentSetIndex].slots[slotIndex].occupied) {
      setErrorMessage("This slot is already empty.");
      return;
    }
    setSelectedSlot(slotIndex);
    setShowExitConfirmation(true);
    const updatedSets = [...slotSets];
    updatedSets[currentSetIndex].slots[slotIndex] = {
      text: slotIndex + 1, 
      occupied: false,
      timestamp: null,
      userDetails: null,
    };
    setSlotSets(updatedSets);
  
    setZoneAvailableSpaces((prevSpaces) => {
      const updatedSpaces = [...prevSpaces];
      updatedSpaces[currentSetIndex]++;
      return updatedSpaces;
    });
    const logData = {
      carPlateNumber: userDetails.carPlateNumber,
      timeOut: serverTimestamp(),
      paymentStatus: 'Paid',
    };
  
    try {
      const logsCollectionRef = collection(db, 'logs');
      const q = query(logsCollectionRef, where('carPlateNumber', '==', userDetails.carPlateNumber));
      const querySnapshot = await getDocs(q);
  
      querySnapshot.forEach(async (doc) => {
        const docRef = doc.ref;
        await setDoc(docRef, logData, { merge: true });
      });
    } catch (error) {
      console.error('Error updating logs: ', error);
    }
  
    setErrorMessage('');
  };

  const handleConfirmExit = () => {
    setShowExitConfirmation(false);
  };
  const handleCancelExit = () => {
    setShowExitConfirmation(false); 
  };
  

  return (
    <div style={{ textAlign: 'center' }}>
        < nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#003851" }}>
        <div className="container">
          <Link className="navbar-brand" to="/">
            SpotWise Parking Management System
          </Link>
          <p style={styles.welcomeMessage}>
            <DropdownButton 
            variant="outline-light"
                alignRight
                title={<FaUserCircle style={styles.icon} />}
                id="dropdown-menu"
              >
                <Dropdown.Item href="OperatorDashboard"><img
                        src="dashboard.jpg"
                        alt="Operator Dashboard Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Records</Dropdown.Item>
                      <Dropdown.Item href="OperatorProfile">
                <img
                        src="opname.jpg"
                        alt="Operator Profile Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item href="/"><img
                        src="logout.png"
                        alt="Operator Logout Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Logout</Dropdown.Item>
              </DropdownButton>
              </p>
        </div>
      </nav>
      <div style={{ textAlign: 'center', fontSize: '15px', marginTop:'10px', marginBottom:'15px'}}>
      {slotSets.length > 0 && (
     <div>
     <h3>{slotSets[currentSetIndex].title}</h3>
     </div>
       )}
       {slotSets.length === 0 && !isLoading && <div>No parking zones available.</div>}
     </div>
        <div className='parkingGrid'
       
      >
        {slotSets[currentSetIndex] && slotSets[currentSetIndex].slots && slotSets[currentSetIndex].slots.map((slot, index) => (
  <div
    key={index}
    style={{
      width: '90px',
      height: '80px',
      backgroundColor: slot.occupied ? 'red' : 'green',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      marginLeft: '35px',
    }}
    onClick={() => handleSlotClick(index)}
    >
    {slot.occupied ? (
      <div>
        <div>{slot.userDetails ? slot.userDetails.carPlateNumber : slot.text}</div>
      </div>
    ) : (
      index + 1
    )}
  </div>
))}
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Parking Slot {selectedSlot + 1}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
  {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
 
  {selectedSlot !== null && (
  <SearchForm
  onSearch={searchInFirebase}
  onSelectSlot={(carPlateNumber) => handleAddToSlot(carPlateNumber, selectedSlot)}
  onExitSlot={() => handleExitSlot(selectedSlot)}
  selectedSlot={selectedSlot}
  userDetails={userDetails}
/>

  )}
{selectedSlot !== null && userDetails !== null && (
  <div style={{ marginTop: '10px' }}>
    <h4>User Details:</h4>
    <p>Email: {userDetails.email}</p>
    <p>Contact Number: {userDetails.contactNumber}</p>
    <p>Car Plate Number: {userDetails.carPlateNumber}</p>
    <p>Gender: {userDetails.gender}</p>
    <p>Age: {userDetails.age}</p>
    <p>Address: {userDetails.address}</p>
    {slotSets[currentSetIndex].slots[selectedSlot].timestamp && (
      <p>Timestamp: {slotSets[currentSetIndex].slots[selectedSlot].timestamp.toString()}</p>
    )}
  </div>
)}
  </Modal.Body>
  <Modal.Footer>
  {recordFound ? null : <div style={{ color: 'red' }}>No record found for this car plate number.</div>}
  </Modal.Footer>
</Modal>
    <Modal show={showExitConfirmation} onHide={handleCancelExit}>
      <Modal.Header closeButton>
        <Modal.Title>Confirmation</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to vacant this slot?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancelExit}>
          No
        </Button>
        <Button variant="primary" onClick={handleConfirmExit}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>

    <div style={{ textAlign: 'center', marginTop: '10px' }}>
      <Button onClick={handleButtonClick}>Manage Reservation</Button>
    </div>
    
      <div style={{textAlign: 'center', fontFamily:'Georgina', fontSize:'15px', marginTop:'10px'}}>
          <span>  Total Parking Spaces: {totalParkingSpaces}</span>
          <br />
          <span> Available Spaces: {availableParkingSpaces}</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: '5px', fontSize:'15px'}}>
            <div style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'green', marginRight: '10px' }}></div>
                <span>Available</span>
                     <div style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: 'red', marginLeft: '20px', marginRight: '10px' }}></div>
                 <span>Occupied</span>
            </div>
      <div style={{textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginTop: '5px', marginLeft:'450px', marginBottom:'5px'}}>
          <Button onClick={handlePrev} style={{ marginRight: '20px', backgroundColor: 'gray' }}>Prev</Button>
          <Button onClick={handleNext}>Next</Button>
        </div>
    </div>
    
  );
};

export default ParkingSlot;