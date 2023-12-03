import React, {useContext, useState, useEffect}from "react";
import 'bootstrap/dist/css/bootstrap.css';
import { DropdownButton, Dropdown, Button } from 'react-bootstrap';
import { FaUserCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Card from 'react-bootstrap/Card';
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBListGroup,
  MDBListGroupItem,
} from 'mdb-react-ui-kit';
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faChartColumn, faAddressCard, faPlus, faCar, faUser, faCoins, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import UserContext from '../UserContext';
import {auth, db} from "../config/firebase"
import { getDocs, collection, query, where, doc, getDoc} from "firebase/firestore";


const listItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 15px",
  transition: "background-color 0.3s ease",
  cursor: "pointer",
  backgroundColor: "#bfd2d9",
};

const listItemHoverStyle = {
  backgroundColor: "#bfd2d9",
};

const Establishment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [parkingLogs, setParkingLogs] = useState([]);
  const [managementName, setManagementName] = useState(user.managementName || ""); 
  const [address, setAddress] = useState(user.companyAddress || ""); 
  const [totalUsers, setTotalUsers] = useState (0); 
  const [totalSlots, setTotalSlots] = useState (user.totalSlots || "");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const parkingPay = user.parkingPay;
  const totalRevenues = totalUsers * parkingPay;
  const updateInterval = 1000; 


  const userDocRef = auth.currentUser ? doc(db, 'establishments', auth.currentUser.uid) : null;

  useEffect(() => {
    if (userDocRef) {
      const fetchImageUrl = async () => {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfileImageUrl(userData.profileImageUrl);
        } else {
          console.log('No such document!');
        }
      };

      fetchImageUrl().catch(console.error);
    }
  }, [userDocRef]);

  useEffect(() => {
    let interval;
  
    const fetchParkingLogs = async () => {
      try {
        // Assuming you have a way to get the current user's managementName
        const currentUserManagementName = user.managementName;
        const logsCollectionRef = collection(db, 'logs');
        // Create a query against the collection.
        const q = query(logsCollectionRef, where("managementName", "==", currentUserManagementName));
  
        const querySnapshot = await getDocs(q);
        const logs = [];
        querySnapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() });
        });
  
        // Sort and slice the logs as before
        const sortedLogs = logs.sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn)).slice(0, 3);
        console.log('Logs fetched:', sortedLogs);
        setParkingLogs(sortedLogs);
      } catch (error) {
        console.error("Error fetching parking logs: ", error);
      }
    };
  
    // Initial fetch
    fetchParkingLogs();
    
    // Set an interval to fetch logs regularly
    interval = setInterval(fetchParkingLogs, updateInterval);
  
    // Clear interval on cleanup
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const fetchParkingLogs = async () => {
      try {
        // Assuming you have a way to get the current user's managementName
        const currentUserManagementName = user.managementName;
        const logsCollectionRef = collection(db, 'logs');
        // Create a query against the collection.
        const q = query(logsCollectionRef, where("managementName", "==", currentUserManagementName));
  
        const querySnapshot = await getDocs(q);
        const logs = [];
        querySnapshot.forEach((doc) => {
          logs.push({ id: doc.id, ...doc.data() });
        });
        setParkingLogs(logs);  // Set the fetched logs into the state
        const totalUser = logs.length;
        setTotalUsers(totalUser);
      } catch (error) {
        console.error("Error fetching parking logs: ", error);
      }
    };

  
    // Initial fetch
    if (user && user.managementName) {
      fetchParkingLogs();
    }
  }, [user, db]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is logged in
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;

          // Fetch user data from Firestore
          const doc = await db.collection("establishments").doc(userId).get();

          if (doc.exists) {
            const userData = doc.data();
            
            setManagementName(userData.managementName || "");
            setAddress(userData.address || "");
          } else {
            console.log("No user data found!");
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, []); 
  const establishmentData = location.state; 

  const handleButtonClick = () => {
    navigate("/TicketInfo");
  };

  const handleViewProfile = () => {
    navigate("/Profiles");
  };
  const handleAgentSchedule = () => {
    navigate("/AgentSchedule");
  };

  const handleRevenues = () => {
    navigate("/Tracks");
  };

  const handleRegister = () => {
    navigate("/AgentRegistration");
  };

  const handleFeed = () => {
    navigate("/Feedback");
  };

  const handleProfile = () => {
    navigate("/Profiles");
  };
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

  return (
    <section style={{ backgroundColor: '#3b89ac', minHeight: '100vh' }}>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#003851" }}>
        <div className="container">
          <Link className="navbar-brand" to="/Dashboard">
            SpotWise Parking Management System
          </Link>
          <p style={styles.welcomeMessage}>
          <DropdownButton 
                alignRight
                variant="outline-light"
                title={<FaUserCircle style={styles.icon} />}
                id="dropdown-menu"
              >
                <Dropdown.Item href="/"><img
                        src="logout.png"
                        alt="Operator Logout Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Logout</Dropdown.Item>
              </DropdownButton>
          </p>
        </div>
      </nav>
      <MDBContainer className="py-5">
        <MDBRow>
          <MDBCol lg="4">
          <MDBCard className="mb-4" style={{marginTop: '45px'}}>
              <MDBCardBody className="text-center" style={{backgroundColor:"#bfd2d9"}}>
                <p style={{fontFamily:"Georgina"}}>Administrator</p>
                <MDBCardImage
                 src={[profileImageUrl] || "default_placeholder.jpg"}
                  alt="Operator Profile Logo"
                  className="rounded-circle"
                  style={{ width: '70px', backgroundColor:"#003851"}}
                  fluid
                />
               <p className="text-muted mb-1" style={{ fontFamily: 'Georgina', marginTop: '15px' }}>
                  {managementName}
                </p>
                <p className="text-muted mb-4" style={{ fontFamily: 'Georgina' }}>
                  {address}
                </p>
                <Button onClick={handleProfile} style={{fontFamily:'Georgina'}}>View Profile</Button>
              </MDBCardBody>
            </MDBCard>

            <MDBCard className="mb-4 mb-lg-0" style={{backgroundColor:"#bfd2d9", marginTop: '40px'}}>
              <MDBCardBody className="p-0">
                <MDBListGroup flush className="rounded-3">
                  <MDBListGroupItem style={listItemStyle}
                    hover
                    className="d-flex justify-content-between align-items-center p-3"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}
                  >
                     <MDBCardText onClick={() => handleAgentSchedule()} style={{fontFamily:'Georgina', fontSize:'18px'}}>
                    <img
                        src="calendar.webp"
                        alt="Calendar"
                        style={{ width: '40px', marginRight: '30px'}}
                      /> 
                    Agent Schedule</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem style={listItemStyle}
                    hover
                    className="d-flex justify-content-between align-items-center p-3"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}
                  >
                     <MDBCardText onClick={() => handleRegister()} style={{fontFamily:'Georgina', fontSize:'18px'}}>
                    <img
                        src="registerA.jpg"
                        alt="User"
                        style={{ width: '40px', marginRight: '30px'}}
                      /> 
                   Register Ticket Operator</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem  style={listItemStyle}
                    hover
                    className="d-flex justify-content-between align-items-center p-3"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}
                  >
                  <MDBCardText onClick={() => handleButtonClick()} style={{fontFamily:'Georgina', fontSize:'18px'}}>
                   <img
                        src="infoPark.png"
                        alt="User"
                        style={{ width: '40px', marginRight: '30px'}}
                      /> 
                   Ticketing Information</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem style={listItemStyle}
                    hover
                    className="d-flex justify-content-between align-items-center p-3"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}
                  >
                    <MDBCardText onClick={() => handleViewProfile()} style={{fontFamily:'Georgina', fontSize:'18px'}}>
                        <img
                        src="pofile.jpg"
                        alt="Profile"
                        style={{ width: '40px', marginRight: '30px'}}
                      /> 
                  View Profile</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem style={listItemStyle}
                    hover
                    className="d-flex justify-content-between align-items-center p-3"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}
                  >
                    <MDBCardText onClick={() => handleRevenues()} style={{fontFamily:'Georgina', fontSize:'18px'}}>
                        <img
                        src="management.jpg"
                        alt="Management"
                        style={{ width: '40px', marginRight: '30px'}}
                      /> 
                  Management Details</MDBCardText>
                  </MDBListGroupItem>
                  <MDBListGroupItem style={listItemStyle}
                    hover
                    className="d-flex justify-content-between align-items-center p-3"
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = listItemHoverStyle.backgroundColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "inherit")}
                  >
                    <MDBCardText onClick={() => handleFeed()} style={{fontFamily:'Georgina', fontSize:'18px'}}>
                    <img
                        src="feedback.jpg"
                        alt="Feedback"
                        style={{ width: '40px', marginRight: '30px'}}
                      /> 
                    Feedback</MDBCardText>
                  </MDBListGroupItem>
                </MDBListGroup>
              </MDBCardBody>
            </MDBCard>
          </MDBCol> 
          <MDBCol lg="8">
            <p style={{fontFamily:'Courier New', textAlign:'center', fontSize:'20px', fontWeight:'bold'}}>Today's Information</p>
          <div className="row mt-3 ">
        <div className="col-md-3">
          <Card> 
            <Card.Body>
              <Card.Title style={{fontFamily:'Courier New', textAlign:'center'}}> <FontAwesomeIcon icon={faCar} color="green"/> Parking Availability</Card.Title>
              <Card.Text style={{ textAlign: 'center', margin: '0 auto', fontFamily:'Copperplate', fontSize:'20px' }}>{user.totalSlots}</Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <Card.Body>
              <Card.Title style={{fontFamily:'Courier New', textAlign:'center'}}><FontAwesomeIcon icon={faCoins} color="red"/> Total Revenues</Card.Title>
              <Card.Text style={{ textAlign: 'center', margin: '0 auto', fontFamily:'Copperplate', fontSize:'20px' }}>{totalRevenues}</Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <Card.Body>
              <Card.Title style={{fontFamily:'Courier New', textAlign:'center'}}><FontAwesomeIcon icon={faUser} color="blue" /> Total Users today</Card.Title>
              <Card.Text style={{ textAlign: 'center', margin: '0 auto', fontFamily:'Copperplate', fontSize:'20px' }}>{totalUsers} </Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <Card.Body>
              <Card.Title style={{fontFamily:'Courier New', textAlign:'center'}}><FontAwesomeIcon icon={faFileInvoiceDollar} color="orange"/> Parking Payment</Card.Title>
              <Card.Text style={{ textAlign: 'center', margin: '0 auto', fontFamily:'Copperplate', fontSize:'20px' }}>{user.parkingPay}</Card.Text>
            </Card.Body>
          </Card>
        </div>  
      </div>
            <MDBCard style={{marginTop:"50px", backgroundColor:"#bfd2d9", }}>
              <MDBCardBody>
              <MDBCardText className="mb-4"  style={{fontFamily:"Courier New"}}> <FontAwesomeIcon icon={faUser} /> <span className="text-primary font-italic me-1"> Recent Parking User</span></MDBCardText>
              <MDBRow>
                  {parkingLogs.map((log) => (
                    <MDBCol md="4" key={log.id}>
                      <MDBCard style={{ backgroundColor: "#bfd2d9" }}>
                        <img
                            src={log.profileImageUrl}
                          className="img-fluid"
                          alt="img"
                        />
                        <MDBCardBody style={{ fontFamily: "Times New Roman", fontSize: "15px" }}>
                          <MDBCardText>Name: {log.name} </MDBCardText>
                          <MDBCardText>Address: {log.address}</MDBCardText>
                          <MDBCardText>Vehicle: {log.car}</MDBCardText>
                          <MDBCardText>Vehicle Plate: {log.carPlateNumber}</MDBCardText>
                          <MDBCardText style={{color:"green"}}>Time in: {log.timeIn.toDate().toLocaleString()}</MDBCardText>
                          <MDBCardText style={{color: "red"}}>Time out: {log.timeOut.toDate().toLocaleString()}</MDBCardText>
                        </MDBCardBody>
                      </MDBCard>
                    </MDBCol>
                  ))}
                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section>
  );
};

export default Establishment;