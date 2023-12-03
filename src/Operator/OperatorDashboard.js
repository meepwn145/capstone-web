import { useState, useEffect, useContext } from 'react';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUserCircle } from "react-icons/fa";
import { faCar, faCoins, faUser, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import {db} from "../config/firebase"
import {doc, getDoc, collection, query, where, getDocs} from 'firebase/firestore';
import UserContext from '../UserContext';

function OperatorDashboard() {
  const { user } = useContext(UserContext);
  const [agentFirst, setAgentFirstName] = useState(user.firstName || "");
  const [agentLastName, setAgentLastName] = useState(user.lastName || "");
  const agentFullName = `${agentFirst} ${agentLastName}`;
  const [data, setData] = useState([]);

  const [totalUsers, setTotalUsers] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();

  const [parkingPay, setParkingPay] = useState(0);
  const [numberOfParkingLots, setNumberOfParkingLots] = useState(0);
  const [totalSlots, setTotalSlots] = useState(0); 
  const [parkingLogs, setParkingLogs] = useState([]);
  const totalRevenues = totalUsers * parkingPay;
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

  useEffect(() => {
    // Async function to fetch the establishment's data
    const fetchEstablishmentData = async () => {
      try {
        // Query the 'establishments' collection for documents where 'managementName' matches the agent's 'managementName'
        const q = query(collection(db, 'establishments'), where('managementName', '==', user.managementName));
        const querySnapshot = await getDocs(q);
  
        console.log(`Found ${querySnapshot.docs.length} documents`); // Debug how many documents were found
  
        if (!querySnapshot.empty) {
          const establishmentData = querySnapshot.docs[0].data(); // Get the first document's data
          console.log('Establishment Data:', establishmentData); // Log the data to see what you received
          setParkingPay(establishmentData.parkingPay);
          setTotalSlots(establishmentData.totalSlots);
        } else {
          console.log('No matching establishment found!');
        }
      } catch (error) {
        console.error('Error fetching establishment data:', error);
      }
    };
  
    if (user && user.managementName) {
      fetchEstablishmentData();
    }
  }, [user]);

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

  
  
  return (
    <div style={{ backgroundColor: '#3b89ac', minHeight: "100vh"}}>
    <Container>
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#003851" }}>
        <div className="container">
          <Link className="navbar-brand" to="/">
            SpotWise Parking Management System
            </Link>
            <p style={styles.welcomeMessage}>
            <DropdownButton 
                alignRight
                variant="outline-light"
                title={<FaUserCircle style={styles.icon} />}
                id="dropdown-menu"
              >
                 <Dropdown.Item href="ViewSpace"><img
                        src="slot1.jpeg"
                        alt="Operator Parking Slot Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Dashboard</Dropdown.Item>
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
      <div className="container text-center" style={{ marginTop: '30px', fontFamily: 'Courier New', fontSize: '30px'}}>
        <p style={{color:'white'}}>Welcome {agentFullName}  </p>
      </div>
      <div className="row mt-3 ">
        <div className="col-md-3">
          <Card> 
            <Card.Body>
              <Card.Title style={{fontFamily:'Courier New', textAlign:'center'}}> <FontAwesomeIcon icon={faCar} color="green"/> Parking Availability</Card.Title>
              <Card.Text style={{ textAlign: 'center', margin: '0 auto', fontFamily:'Copperplate', fontSize:'20px' }}>{totalSlots}</Card.Text>
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
              <Card.Text style={{ textAlign: 'center', margin: '0 auto', fontFamily:'Copperplate', fontSize:'20px' }}>{totalUsers}</Card.Text>
            </Card.Body>
          </Card>
        </div>
        <div className="col-md-3">
          <Card>
            <Card.Body>
              <Card.Title style={{fontFamily:'Courier New', textAlign:'center'}}><FontAwesomeIcon icon={faFileInvoiceDollar} color="orange"/> Parking Payment</Card.Title>
              <Card.Text style={{ textAlign: 'center', margin: '0 auto', fontFamily:'Copperplate', fontSize:'20px' }}>{parkingPay}</Card.Text>
            </Card.Body>
          </Card>
        </div>  
      </div>
      <div style={{marginTop: '30px', textAlign: 'center', justifyContent: 'center',  width: '100%', fontFamily:'Garamond'}}>
          <Table responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Vehicle</th>
                <th>Plate No</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {parkingLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.name}</td>
                  <td>{log.car}</td>
                  <td>{log.carPlateNumber}</td>
                  <td>{new Date(log.timeIn.seconds * 1000).toLocaleString()}</td>
                  <td>{new Date(log.timeIn.seconds * 1000).toLocaleString()}</td>
                  <td style={{ color: log.paymentStatusColor }}>{log.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          </div>
    </Container>
    </div>
  );
}

export default OperatorDashboard;