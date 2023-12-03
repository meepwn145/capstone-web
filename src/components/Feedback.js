import React, { useState, useEffect } from 'react';
import { fetchAllFeedback, fetchFeedbackById } from './FeedbackAPI.js';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { FaUserCircle } from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, deleteDoc } from "firebase/firestore";

const FeedbackPage = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [clickedFeedbackIds, setClickedFeedbackIds] = useState([]);
  const itemsPerPage = 5;

  const [managementName, setManagementName] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        const userDocRef = doc(db, "establishments", uid);
        getDoc(userDocRef).then((docSnapshot) => {
          if (docSnapshot.exists()) {
            setManagementName(docSnapshot.data().managementName);
          } else {
           
            console.log("No such document!");
          }
        });
      } else {
       
        setManagementName(null);
      }
    });
  
    return unsubscribe; 
  }, []);

  useEffect(() => {
    if (managementName) {
      fetchAllFeedback()
        .then((data) => {
          const relevantFeedback = data.filter((feedback) => feedback.managementName === managementName);
          setFeedbackList(relevantFeedback);
        })
        .catch((error) => {
          console.error('Error fetching feedback:', error);
        });
    }
  }, [managementName]);

  const handleFeedbackClick = (id) => {
    console.log(`Feedback ID clicked: ${id}`); 
    fetchFeedbackById(id)
      .then((data) => {
        setSelectedFeedback(data);
      })
      .catch((error) => {
        console.error('Error fetching feedback:', error);
      });
  };

  const handleDeleteFeedback = async (id) => {
    const confirmed = window.confirm('Are you sure you want to delete this feedback?');
    if (confirmed) {
      try {
       
        const docRef = doc(db, 'feedback', id);
        await deleteDoc(docRef);
  
        const updatedFeedbackList = feedbackList.filter((feedback) => feedback.id !== id);
        setFeedbackList(updatedFeedbackList);
  
        const updatedClickedIds = clickedFeedbackIds.filter((clickedId) => clickedId !== id);
        localStorage.setItem('clickedFeedbackIds', JSON.stringify(updatedClickedIds));
        setClickedFeedbackIds(updatedClickedIds);
  
        if (selectedFeedback && selectedFeedback.id === id) {
          setSelectedFeedback(null);
        }
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  useEffect(() => {
    const clickedIds = JSON.parse(localStorage.getItem('clickedFeedbackIds')) || [];
    setClickedFeedbackIds(clickedIds);
  }, []);

  const totalPages = Math.ceil(feedbackList.length / itemsPerPage);
  const pageFeedbackList = feedbackList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const feedbackListItemStyle = {
    cursor: 'pointer',
    padding: '5px 0',
    borderBottom: '1px solid #ccc',
    fontFamily: 'Georgina',
    marginTop: '10px',
  };

  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: 'black',
    color: 'white',
    width: '100%',
  };

  const logoStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    fontFamily: 'Georgina',
    marginLeft: '50px'
  };

  const styles = {
    mainContainer: {
      marginTop: '50px',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      marginTop: '70px'
    },
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
    feedbackContainer: {
      padding: '20px',
      backgroundColor: '#f9f9f9',
      borderRadius: '5px',
      border: '1px solid #ccc',
      marginTop: '30px',
    },
  };

  const para = {
    fontFamily: 'Georgina',
    marginTop: '10px',
  };


  return (
    <div>
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#003851", marginBottom:'20px' }}>
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
              <Dropdown.Item href="Dashboard"><img
                        src="dashboard.jpg"
                        alt="Operator Dashboard Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Dashboard</Dropdown.Item>
              <Dropdown.Item href="AgentSchedule"><img
                        src="calendar.webp"
                        alt="Agent Schedule"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Agent Schedule </Dropdown.Item> 
              <Dropdown.Item href="AgentRegistration"><img
                        src="registerA.jpg"
                        alt="Agent Register"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Register Ticket Operator</Dropdown.Item> 
              <Dropdown.Item href="TicketInfo"><img
                        src="infoPark.png"
                        alt="Parking Info"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Ticket Information</Dropdown.Item>
                      <Dropdown.Item href="Profiles"><img
                        src="pofile.jpg"
                        alt="Management Details"
                        style={{ width: '20px', marginRight: '10px'}}
                      />View Profile</Dropdown.Item>
              <Dropdown.Item href="Tracks"><img
                        src="management.jpg"
                        alt="Management Details"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Management Details</Dropdown.Item>    
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
    <div style={styles.mainContainer}>
      <h1 style={{ textAlign: 'center', fontFamily: 'Georgina', fontSize: '32px' }}>
        Customer Feedback
              </h1>
      <div style={{ display: 'flex' }}>
        <div style={{ ...styles.feedbackContainer, flex: 1 }}>
          <div style={navbarStyle}>
            <div style={logoStyle}> 
           FEEDBACK LIST</div>
          </div>
          <ul>
            {pageFeedbackList.map((feedback) => {
              const isClicked = clickedFeedbackIds.includes(feedback.id);
              const listItemStyle = {
                ...feedbackListItemStyle,
                backgroundColor: isClicked ? '#f0f0f0' : 'transparent', 
              };

              return (
                <li
                key={feedback.id}
                onClick={() => handleFeedbackClick(feedback.id)} 
                style={listItemStyle}
              >
                {feedback.email}
              </li>
              );
            })}
          </ul>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
              Previous Page
            </button>
            <span style={{ margin: '0 10px' }}>Page {currentPage}</span>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next Page
            </button>
          </div>
        </div>
        <div style={{ ...styles.feedbackContainer, flex: 1, marginLeft: '20px' }}> 
  {selectedFeedback ? (
    <div>
      <div style={navbarStyle}>
        <div style={logoStyle}> FEEDBACK DETAILS </div>
      </div>
      <div style={para}>
        <p>Company Address: {selectedFeedback.companyAddress}</p>
        <p>Email: {selectedFeedback.email}</p>
        <p>Created at: {new Date(selectedFeedback.createdAt.seconds * 1000).toLocaleDateString()}</p>
        <p>Message: {selectedFeedback.message}</p>
        <button onClick={() => handleDeleteFeedback(selectedFeedback.id)}>
          Delete Feedback
        </button>
      </div>
    </div>
  ) : (
    <p style={{ fontFamily: 'Georgina', textAlign: 'center' }}>Select a feedback entry to view details.</p>
  )}
</div>
      </div>
    </div>
    </div>
  );
};

export default FeedbackPage;