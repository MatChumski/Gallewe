import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loadImage, uploadPFP, getUser, deleteUser } from "../../dbHandler";
import { context } from "../../context";
import "./Profile.css";

export function Profile() {
  const params = useParams();
  const [pfpPopup, setPfpPopup] = useState(false);

  const profileContext = useContext(context);

  //console.log("context: ", context);
  //console.log("profileContext: ", profileContext.user);

  // Changes the profile picture
  function displayPfp(thisPfp, img) {
    loadImage("profilePics", thisPfp, img);
  }

  // Once the profileContext is loaded, updates the profile picture
  useEffect(() => {
    if (profileContext.user) {
      let effectPfp = profileContext.user.pfp;

      //setPfp(effectPfp);

      console.log("pfp: ", effectPfp);

      displayPfp(effectPfp, "picDisplay");
    }
  }, [profileContext.user]);

  /* 
  Component for the profile info when the profile is
  the one of the logged in user
  Allows changing the profile picture
  */
  function UserProfile() {
    const username = profileContext.user.username;
    const email = profileContext.user.email;

    //console.log("Profile user:", username);
    //console.log("PFP id: ", pfp);

    function showProfileChange() {
      let tag = document.getElementById("pfpChange");
      tag.style.opacity = "100%";
    }

    function hideProfileChange() {
      let tag = document.getElementById("pfpChange");
      tag.style.opacity = "0%";
    }

    // ProfilePicPopup for changing the profile picture
    function ProfilePicPopup() {
      let file = document.getElementById("upload");

      // Calls the click function of the input file element
      function chooseFile() {
        file.click();
      }

      file.addEventListener("change", updateImageDisplay);

      /* 
      Displays the file that the user selected from their device
      */
      function updateImageDisplay() {
        // If there is a file selected, proceeds to update
        if (file.files[0]) {
          //console.log(file.files[0].name);

          // Regular expression for the allowed file formats
          let allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
          let fileName = document.getElementById("curFileName");
          let picDisplay = document.getElementById("placeholder");

          /* 
          If the file has a valid extension, the <img> element is updated
          and the name of the file is displayed below
          */
          if (!allowedExtensions.exec(file.files[0].name)) {
            file.value = "";
            fileName.innerHTML = "File not Selected";
            picDisplay.src = require("../../img/pfpPlaceholder.png");
            alert("File Type Not Allowed");
          } else {
            fileName.innerHTML = file.files[0].name;
            picDisplay.src = URL.createObjectURL(file.files[0]);
          }
        }
      }

      return (
        <div className="popup bs">
          <div className="profilePic">
            <img
              id="placeholder"
              src={require("../../img/pfpPlaceholder.png")}
              alt="PFP"
            />
          </div>
          <div id="curFileName">File not Selected</div>
          <div style={{ width: "60%" }}>
            <button className="formButton submitButton" onClick={chooseFile}>
              Select File
            </button>
            <button className="formButton submitButton" onClick={changePfp}>
              Accept
            </button>
            <button
              className="formButton cancelButton"
              onClick={closePopupWindow}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    function openPopupWindow() {
      setPfpPopup(true);
    }
    function closePopupWindow() {
      setPfpPopup(false);
    }

    // Updates the profile picture in the database
    async function changePfp() {
      let file = document.getElementById("upload").files[0];

      //console.log("file: ", file);
      // If there is a file selected, it is uploaded in the database
      if (file) {
        uploadPFP(profileContext.user.pfp, file).then((result) => {
          //console.log("result: ", result);
          if (result) {
            alert("Profile Picture Changed Successfully");
            closePopupWindow();
            displayPfp(profileContext.user.pfp, "picDisplay");
          } else {
            alert("Something went wrong");
          }
        });
      } else {
        alert("Please select a file first");
      }
    }

    return (
      <div>
        {pfpPopup && <ProfilePicPopup />}
        <input type="file" id="upload" hidden />
        <div className="container bs mt-65">
          <div className="containerTitle">Profile Info</div>

          <div className="profileContent" style={{ width: "90%" }}>
            <div
              id="pfp"
              className="profilePic"
              onMouseOver={showProfileChange}
              onMouseOut={hideProfileChange}
            >
              <button
                id="pfpChange"
                className="profileChange"
                onClick={openPopupWindow}
              >
                Change Profile Picture
              </button>
              <img
                id="picDisplay"
                src={require("../../img/loading.gif")}
                alt="pepe"
              />
            </div>
            <div>
              <div className="profileTab">
                <label>Username</label>
                <div>{username}</div>
              </div>
              <div className="profileTab">
                <label>E-Mail</label>
                <div>{email}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* 
  Component for the profile info when the profile is
  different from the one of the logged in user, or when
  there is no user logged in
  Doesn't allow changing the profile picture
  */
  function OtherProfile() {
    const [otherUser, setOtherUser] = useState(null);
    const [userFound, setUserFound] = useState(0);
    const [deleting, setDeleting] = useState(false);
    const navigate = useNavigate();

    function DeleteProfilePopup() {
      async function deleteProf() {
        let result = await deleteUser(otherUser.username);
        if (result) {
          alert(`User ${otherUser.username} deleted`);
          setDeleting(false);
          navigate("/");
        }
      }

      return (
        <div className="superPopup">
          <div
            className="popup bs"
            style={{ paddingTop: "20px", paddingBottom: "20px" }}
          >
            <div>Are you sure you want to DELETE this account?</div>
            <div>This action cannot be reversed</div>
            <div style={{ width: "50%", display: "block", marginTop: "15px" }}>
              <button className="formButton yes mr-10" onClick={deleteProf}>
                Yes
              </button>
              <button
                className="formButton no"
                onClick={() => {
                  setDeleting((prevState) => {
                    return !prevState;
                  });
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      );
    }

    useEffect(() => {
      getOtherUser(params.user);
    }, []);

    // Shows the profile picture of the user when it has been found
    useEffect(() => {
      if (otherUser) {
        displayPfp(otherUser.pfp, "picDisplay");
      }
    }, [otherUser]);

    // Gets the info of the user
    async function getOtherUser(user) {
      let _otherUser = await getUser("username", user);
      if (_otherUser) {
        setOtherUser(_otherUser[0]);
        setUserFound(1);
      } else {
        setUserFound(2);
      }
    }

    let otherUsername;
    let otherEmail;

    if (otherUser) {
      console.log("otherUser: ", otherUser);
      otherUsername = otherUser.username;
      otherEmail = otherUser.email;
    }
    return (
      <div>
        <input type="file" id="upload" hidden />
        {deleting && <DeleteProfilePopup />}
        {userFound === 0 && (
          <div className="container bs mt-65">
            <div className="containerTitle">Loading...</div>
          </div>
        )}
        {userFound === 1 && (
          <div className="container bs mt-65">
            <div className="containerTitle">Profile Info</div>

            <div className="profileContent" style={{ width: "90%" }}>
              <div id="pfp" className="profilePic">
                <img
                  id="picDisplay"
                  src={require("../../img/loading.gif")}
                  alt="pepe"
                />
              </div>
              <div>
                <div className="profileTab">
                  <label>Username</label>
                  <div>{otherUsername}</div>
                </div>
                <div className="profileTab">
                  <label>E-Mail</label>
                  <div>{otherEmail}</div>
                </div>
                {profileContext.user && profileContext.user.role === "admin" && (
                  <div className="profileTab">
                    <button
                      className="deleteButton"
                      onClick={() => {
                        setDeleting((prevState) => {
                          return !prevState;
                        });
                      }}
                    >
                      Delete User
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {userFound === 2 && (
          <div className="container bs mt-65">
            <div className="containerTitle">User not Found</div>
          </div>
        )}
      </div>
    );
  }

  if (profileContext.user && profileContext.user.username === params.user) {
    return <UserProfile />;
  } else {
    return <OtherProfile />;
  }
}
