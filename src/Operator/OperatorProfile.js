import React, { useState, useEffect, useContext} from 'react';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { FaUserCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBTypography,
} from 'mdb-react-ui-kit';
import UserContext from '../UserContext';
import {auth, db} from "../config/firebase"
import { updateDoc, doc, getDoc } from 'firebase/firestore';
import { storage } from "../config/firebase";
import {ref, uploadBytes, getDownloadURL, listAll, list  } from "firebase/storage"
import {v4} from "uuid"; 

export default function EditButton() {
  const [isEditing, setIsEditing] = useState(false);
  const location = useLocation();
  const { user } = useContext(UserContext);
  const [name, setName] = useState(user.firstName || ""); 
  const [lastName, setLastName] = useState(user.lastName || ""); 
  const fullName = `${name} ${lastName}`;
  const [address, setAddress] = useState(user.address || ""); 
  const [email, setEmail] = useState(user.email || ""); 
  const [contactNumber, setContactNumber] = useState(user.phoneNumber || ""); 
  const [companyName, setCompanyName] = useState(user.managementName || ""); 
  const [companyAddress, setCompanyAddress] = useState(user.companyAddress || ""); 
  const [companyContact, setCompanyContact] = useState(user.companyContact || ""); 
  const [companyEmail, setCompanyEmail] = useState(user.companyEmail || ""); 
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const userDocRef = auth.currentUser ? doc(db, 'agents', auth.currentUser.uid) : null;

  const [imageUpload, setImageUpload] = useState(null);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const saveProfileImageUrl = async (url) => {
    if (userDocRef) {
      await updateDoc(userDocRef, {
        profileImageUrl: url,
      });
    }
  };


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

  const imagesListRef = ref(storage, "images/");
  const uploadFile = () => {
    if (imageUpload && auth.currentUser) {
      const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
      uploadBytes(imageRef, imageUpload).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          setProfileImageUrl(url); // Update the state to show the new image
          saveProfileImageUrl(url); // Save the image URL to Firestore
        });
      });
    }
  };
  
  useEffect(() => {
    listAll(imagesListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageUrls((prev) => [...prev, url]);
        });
      });
    });
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Check if user is logged in
        if (auth.currentUser) {
          const userId = auth.currentUser.uid;

          // Fetch user data from Firestore
          const doc = await db.collection("agents").doc(userId).get();

          if (doc.exists) {
            const userData = doc.data();
            
            setName(userData.name || "");
            setAddress(userData.address || "");
            setEmail(userData.email || "");
            setContactNumber(userData.contactNumber || "");
            setCompanyName(userData.managementName || "");
            setCompanyAddress(userData.companyAddress || "");
            setCompanyContact(userData.companyContact || "");
            setCompanyEmail(userData.companyEmail || "");
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

  const updateUserData = async () => {
    try {
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        const userDocRef = doc(db, 'agents', userId); 

        const updatedData = {
          firstName:name,
          address: address,
          email: email,
          phoneNumber:contactNumber,
        };

        await updateDoc(userDocRef, updatedData);

        console.log("User data updated/created successfully!");
      } else {
        console.error("User not authenticated");
      }
    } catch (error) {
      console.error("Error updating user data: ", error);
    }
};

  const toggleEditing = () => {
    setIsEditing(!isEditing);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    console.log(auth.currentUser);
    setIsEditing(false);
    updateUserData();
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
    <div className="gradient-custom-2" style={{ backgroundColor: '#3b89ac' }}>
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
              <Dropdown.Item href="OperatorDashboard"><img
                        src="dashboard.jpg"
                        alt="Operator Dashboard Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />Records</Dropdown.Item>
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
      <MDBContainer className="py-5 h-100">
        <MDBRow className="justify-content-center align-items-center h-100">
          <MDBCol lg="9" xl="7">
            <MDBCard>
            <div className="rounded-top text-white d-flex flex-row" style={{ backgroundColor: '#000', height: '200px' }}>
            <div className="ms-4 mt-5 d-flex flex-column" style={{ width: '120px' }}>
                  {/* Image display */}
                 <MDBCardImage 
              src={profileImageUrl || "default_placeholder.jpg"}
              alt="Profile"
              className="mt-4 mb-2 img-thumbnail"
              fluid style={{ width: '150px', zIndex: '1' }}
            />
        {isEditing && (
          <>
            <input 
              type="file"
              onChange={(event) => {
                setImageUpload(event.target.files[0]);
              }}
            />
            <button onClick={uploadFile}> Upload Image</button>
          </>
        )}
                </div>
                <div className="ms-3" style={{ marginTop: '130px', fontFamily:'Georgina'}}>
                  {isEditing ? (
                    <>
                      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{marginRight:'5px', marginBottom:'5px'}} />
                      <input type="text" placeholder="Location" value={address} onChange={(e) => setAddress(e.target.value)} />
                      <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{marginRight:'5px'}} />
                      <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} />
                    </>
                  ) : (
                    <>
                      <MDBTypography tag="h5">{fullName}</MDBTypography>
                      <MDBCardText>{address}</MDBCardText>
                      <MDBCardText>{email}</MDBCardText>
                      <MDBCardText>{contactNumber}</MDBCardText>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 text-black" style={{ backgroundColor: '#f8f9fa', fontFamily:'Georgina', }}>
                <MDBBtn outline color="dark" style={{ height: '36px', overflow: 'visible' }} onClick={isEditing ? handleSaveProfile : toggleEditing}><img
                        src="edit.jpg"
                        alt="Edit"
                        style={{ width: '20px', marginRight: '10px'}}
                      />
                  {isEditing ? 'Save Changes' : 'Edit Profile'}
                </MDBBtn>
              </div>
              <MDBCardBody className="text-black p-4" style={{fontFamily:'Georgina',}}>
                <div className="mb-5">
                  {isEditing ? (
                    <div className="p-4" style={{ backgroundColor: '#f8f9fa' } }>
                      <h4>Company's Information</h4>
                      <input type="text" readOnly placeholder="Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={{ marginRight:'5px', marginBottom:'5px'}}/>
                      <input type="text" readOnly placeholder="Location" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} style={{ marginRight:'5px'}}/>
                      <input type="text" readOnly placeholder="Contact Number" value={companyContact} onChange={(e) => setCompanyContact(e.target.value)} style={{ marginRight:'5px'}}/>
                    </div>
                  ) : (
                    <div className="p-4" style={{ backgroundColor: '#f8f9fa', fontFamily:'Georgina' }}>
                    <MDBCardText className="font-italic mb-1" style={{textAlign:'center', fontWeight:'bold'}}>AGENT'S INFORMATION</MDBCardText>
                      <MDBCardText className="font-italic mb-1">
                      <img
                        src="opname.jpg"
                        alt="Operator User Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />{name}</MDBCardText>
                      <MDBCardText className="font-italic mb-1"> <img
                        src="opa.png"
                        alt="Operator Address Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />
                        {address}</MDBCardText>
                      <MDBCardText className="font-italic mb-1"> <img
                        src="ope.jpg"
                        alt="Operator Email Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />
                        {email}</MDBCardText>
                      <MDBCardText className="font-italic mb-0"> <img
                        src="opcontact.png"
                        alt="Operator Contact Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />{contactNumber}</MDBCardText>
                    </div>
                  )}
                </div>
                <div className="p-4" style={{ backgroundColor: '#f8f9fa', fontFamily:'Georgina' }}>
                    <MDBCardText className="font-italic mb-1" style={{textAlign:'center', fontWeight:'bold'}}>CURRENTLY WORKS AT</MDBCardText>
                      <MDBCardText className="font-italic mb-1">
                      <img
                        src="esLogo.png"
                        alt="Operator User Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />{companyName}</MDBCardText>
                      <MDBCardText className="font-italic mb-1"> <img
                        src="esA.png"
                        alt="Operator Address Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />
                        {companyAddress}</MDBCardText>
                    
                      <MDBCardText className="font-italic mb-0"> <img
                        src="opcontact.png"
                        alt="Operator Contact Logo"
                        style={{ width: '20px', marginRight: '10px'}}
                      />{companyContact}</MDBCardText>
                    </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}