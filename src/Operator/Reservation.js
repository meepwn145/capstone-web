import React, { useState, useEffect, useContext } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from "../config/firebase";
import UserContext from '../UserContext';

const Reservation = () => {
  const { user } = useContext(UserContext);
  const [reservationRequests, setReservationRequests] = useState([]);
  const [historyLog, setHistoryLog] = useState([]);
  const [selectedReservation, setSelectedReservation] = useState(null);

  const fetchReservations = async (managementName) => {
    const q = query(collection(db, 'reservations'), where('managementName', '==', managementName));
    try {
      const querySnapshot = await getDocs(q);
      const reservations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name, // Assuming 'managementName' corresponds to the name to be displayed
        plateNumber: doc.data().carPlate,
        floor: doc.data().slotId.charAt(0), // Assuming slotId format is such that the first character is the floor
        slot: doc.data().slotId.slice(1), // Assuming slotId format is such that the rest is the slot
        timeOfRequest: new Date(doc.data().timestamp.seconds * 1000).toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: 'numeric' })
      }));
      setReservationRequests(reservations);
    } catch (error) {
      console.error("Error fetching reservations: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      if (currentUser && user?.managementName) {
        // The user is logged in. Fetch the reservations corresponding to their managementName.
        fetchReservations(user.managementName);
      } else {
        // User is signed out or managementName is not available
        setReservationRequests([]);
      }
    });

    // Clean up the subscription on unmount
    return () => unsubscribe();
  }, [user?.managementName]);


  useEffect(() => {
    // Save reservationRequests to localStorage whenever it changes
    localStorage.setItem('reservationRequests', JSON.stringify(reservationRequests));
  }, [reservationRequests]);

  useEffect(() => {
    // Load history log from localStorage on component mount
    const storedHistoryLog = JSON.parse(localStorage.getItem('historyLog'));
    if (storedHistoryLog) {
      setHistoryLog(storedHistoryLog);
    }
  }, []);
  const handleReservation = (accepted, name, plateNumber, floor, slot, timeOfRequest, index) => {
    const status = accepted ? 'Accepted' : 'Declined';

    // Update history log
    const logEntry = {
      status,
      name,
      plateNumber,
      floor,
      slot,
      timeOfRequest,
    };

    setHistoryLog([logEntry, ...historyLog]);

    // Save history log to localStorage
    localStorage.setItem('historyLog', JSON.stringify([logEntry, ...historyLog]));

    // Remove the request from reservationRequests
    const updatedRequests = [...reservationRequests];
    updatedRequests.splice(index, 1);
    setReservationRequests(updatedRequests);

    // Set selected reservation for details display
    setSelectedReservation({
      status,
      name,
      plateNumber,
      floor,
      slot,
      timeOfRequest,
    });
  };

  const HistoryLog = () => (
    <div className="history-log mt-4" style={{ maxHeight: '200px', overflowY: 'scroll' }}>
      {historyLog.map((logEntry, index) => (
        <div className={`alert ${logEntry.status === 'Accepted' ? 'alert-success' : 'alert-danger'} mt-2`} key={index}>
          <strong>{logEntry.status}:</strong> {logEntry.name} requested a reservation on {logEntry.timeOfRequest}. Plate Number: {logEntry.plateNumber}, Floor: {logEntry.floor}, Slot: {logEntry.slot}
        </div>
      ))}
    </div>
  );

  const ReservationRequest = ({ request, index }) => (
    <div className="reservation-request mb-4 border p-3 rounded bg-light" key={request.plateNumber}>
      <h4 className="mb-0">Name: {request.name}</h4>
      <p className="text-muted mb-2">Time of Request: {request.timeOfRequest}</p>
      <p>Plate Number: {request.plateNumber}</p>
      <p>Floor Number: {request.floor}</p>
      <p>Slot Number: {request.slot}</p>
      <div className="d-flex flex-column align-items-center mt-2">
        <button className="btn btn-success" onClick={() => handleReservation(true, request.name, request.plateNumber, request.floor, request.slot, request.timeOfRequest, index)}>Accept Reservation</button>
        <button className="btn btn-danger mt-2" onClick={() => handleReservation(false, request.name, request.plateNumber, request.floor, request.slot, request.timeOfRequest, index)}>Decline Reservation</button>
      </div>
    </div>
  );

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="ViewSpace">
            SpotWise Parking Management System
          </a>
        </div>
      </nav>
      <div className="container mt-5 d-flex flex-column align-items-center justify-content-center">
        <h2 className="text-center mb-4">Parking Reservation Management</h2>
        <div className="reservation-requests d-flex flex-column align-items-center mb-4" style={{ width: '300px', height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px', background: 'white' }}>
          {reservationRequests.length === 0 ? (
            <p>No reservation</p>
          ) : (
            reservationRequests.map((request, index) => (
              <ReservationRequest request={request} index={index} key={request.plateNumber} />
            ))
          )}
        </div>
        <h3 className="mb-3 mt-4 text-center">Accepted/Declined Reservations</h3>
        <HistoryLog />
      </div>
    </div>
  );
};

export default Reservation;