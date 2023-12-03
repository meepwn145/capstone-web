import React, { useState } from 'react';
import {Modal, ModalFooter} from 'react-bootstrap';

const SearchForm = ({ onSearch, onSelectSlot, onExitSlot, selectedSlot, userDetails, onClose }) => {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleAssignSlot = () => {
    if (userDetails) {
      onSelectSlot(userDetails.carPlateNumber, selectedSlot);
    } else {
      onSelectSlot(searchInput, selectedSlot);
    }
  };

  const handleExit = () => {
    onExitSlot(selectedSlot);
  };
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showExitModal, setExitModal] = useState(false);

  const closeModal = () => {
    setExitModal(false);
  };

  const closeModalSearch = () => {
    setShowSearchModal(false);
  };

  const closeModalAssign = () => {
    setShowAssignModal(false);
  };


  return (
    <div>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search Car Plate Number"
          style={{borderRadius:'5px'}}
        />
        <button
          className="searchButton"
          type="submit"
          style={{ marginTop: "10px", marginLeft: "50px", borderRadius:'5px', backgroundColor:'blue' }}
        >
          <img
            src="search.png"
            alt="Search"
            style={{ width: '20px', marginRight: '10px' }}
          />
          Search
        </button>
        <img
            src="info.png"
            alt="Info"
            style={{ width: '20px', justifyItems:'left', marginLeft:'10px' }}
            onClick={() => setShowSearchModal(true)}
          />
      </form>
       <Modal show={showSearchModal} onHide={() => setShowSearchModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{marginLeft:'140px', fontFamily:'Georgina', color:'green'}}>Search Instruction</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{fontFamily:'Georgina', color:'red'}}>
         When there is no record found, please exit! Enter a car plate number again, and assign it immediately!
        </Modal.Body>
        <ModalFooter>
          <button onClick={closeModalSearch} style={{color:'green', borderRadius:'5px'}}>Got it</button>
      </ModalFooter>
      </Modal>
      {selectedSlot !== null && (
        <div className="buttonContainer">
          <button className="assignButton" onClick={handleAssignSlot} style={{ marginTop: "20px", borderRadius:'5px', backgroundColor:'green' }}>
            <img
              src="assign.png"
              alt="Assign"
              style={{ width: '20px', marginRight: '10px' }}
            />
            Assign Slot
          </button>
          <img
            src="info.png"
            alt="Info"
            style={{ width: '20px', justifyItems:'left', marginLeft:'10px' }}
            onClick={() => setShowAssignModal(true)}
          />
           <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{marginLeft:'140px', fontFamily:'Georgina', color:'green'}}>Assign Instruction</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{fontFamily:'Georgina'}}>
       <h5 style={{textAlign:'center', color:'red'}}>Assigning a car plate number will require:</h5>
       * Whenever there is no record found, assign it immediately.
       <br></br>
       * When search is clicked, click the assign button to place the car plate number on the slot.
        </Modal.Body>
        <ModalFooter>
          <button onClick={closeModalAssign} style={{color:'green', borderRadius:'5px'}}>Got it</button>
      </ModalFooter>
      </Modal>
          <button className="exitButton" onClick={handleExit} style={{ marginTop: "20px", marginLeft:"20px", borderRadius:'5px', backgroundColor:'red' }}>
            <img
              src="exit.png"
              alt="Exit"
              style={{ width: '20px', marginRight: '10px' }}
            />
            Exit Slot
          </button>
          <img
            src="info.png"
            alt="Info"
            style={{ width: '20px', justifyItems:'left', marginLeft:'10px' }}
            onClick={() => setExitModal(true)}
          />
          <Modal show={showExitModal} onHide={() => setExitModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{marginLeft:'140px', fontFamily:'Georgina', color:'green'}}>Exit Instruction</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{fontFamily:'Georgina'}}>
        <h5 style={{textAlign:'center', color:'red'}}>Once exit button is clicked it will: </h5>
        * Immediately vacant the slot.
        <br></br>
        * Set the car plate number payment status in paid.
        <br></br>
        * It will only empty, when click and there is someone who occupied the slot.
        <br></br>
        </Modal.Body>
        <ModalFooter>
          <button onClick={closeModal} style={{color:'green', borderRadius:'5px'}}>Got it</button>
      </ModalFooter>
      </Modal>
        </div>
      )}
    </div>
  );
};

export default SearchForm;
