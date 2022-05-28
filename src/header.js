import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { context } from "./context";
import "./styles.css";
import "./header.css";

export function Header() {
  let navigate = useNavigate();
  let headerContext = useContext(context);

  let [dropdownOpen, setDropdownOpen] = useState(false);
  let [logoutPopup, setLogoutPopup] = useState(false);
  let [search, setSearch] = useState("");

  //console.log("headerContext: ", headerContext.user);

  // Métodos de navegación
  function navToLogin() {
    setDropdownOpen(false);
    navigate("/login");
  }
  function navToSignup() {
    setDropdownOpen(false);
    navigate("/signup");
  }

  function navToHome() {
    setDropdownOpen(false);
    navigate("/");
  }

  function navToProfile() {
    setDropdownOpen(false);
    navigate(`/profile/${headerContext.user.username}`);
  }

  function navToSearch(event) {
    let key = event.key;
    if (key === "Enter") {
      if (search) {
        navigate(`/search/${search}`);
      }
    }
  }

  function navToMyAlbums() {
    setDropdownOpen(false);
    navigate("/myAlbums");
  }

  function navToReports() {
    setDropdownOpen(false);
    navigate("/reports");
  }

  function handleOnChangeSearch(event) {
    //console.log(search);
    setSearch(event.target.value);
  }

  // If an user is Logged In
  if (headerContext.user) {
    // Logout Popup Window
    function Logout() {
      setDropdownOpen(false);

      function logout() {
        setLogoutPopup(false);
        headerContext.logout();
        navigate("/");
      }

      return (
        <div className="superPopup">
          <div
            className="popup bs"
            style={{ paddingTop: "20px", paddingBottom: "20px" }}
          >
            <div>Are you sure you want to Log Out?</div>
            <div style={{ width: "50%", display: "block", marginTop: "15px" }}>
              <button className="formButton yes mr-10" onClick={logout}>
                Yes
              </button>
              <button className="formButton no" onClick={closeLogout}>
                No
              </button>
            </div>
          </div>
        </div>
      );
    }

    function openLogout() {
      setLogoutPopup(true);
    }
    function closeLogout() {
      setLogoutPopup(false);
    }

    // Small Dropdown for profile options
    function ProfileDropdown() {
      return (
        <div className="dropdown-content">
          <button onClick={navToProfile}>Profile</button>
          {headerContext.user.role === "admin" && (
            <button onClick={navToReports}>Reports</button>
          )}
          <button onClick={openLogout}>Log Out</button>
        </div>
      );
    }

    // Profile Dropdown Button
    function DropdownButton() {
      let color;
      if (dropdownOpen) {
        color = "rgb(0, 136, 143)";
      } else {
        color = "transparent";
      }
      return (
        <button
          id="profile"
          style={{ backgroundColor: color }}
          onClick={() => {
            setDropdownOpen((prevState) => {
              return !prevState;
            });
          }}
        >
          {headerContext.user.username}
        </button>
      );
    }

    return (
      <div>
        {logoutPopup && <Logout />}
        <div className="header">
          <ul>
            <li style={{ maxWidth: "100%" }}>
              <button style={{ fontWeight: "900" }} onClick={navToHome}>
                Gallewe
              </button>
            </li>
            <li style={{ marginLeft: "10px" }}>
              <input
                id="search"
                type="text"
                className="search"
                value={search}
                onChange={handleOnChangeSearch}
                onKeyPress={navToSearch}
                placeholder="Search..."
              />
            </li>
            <li className="dropbtn" style={{ float: "right" }}>
              <DropdownButton />
            </li>
            <li style={{ float: "right" }}>
              <button onClick={navToMyAlbums}>My Albums</button>
            </li>
          </ul>
          {dropdownOpen && <ProfileDropdown />}
        </div>
      </div>
    );
    // When there is no user Logged In
  } else {
    return (
      <div className="header">
        <ul>
          <li>
            <button style={{ fontWeight: "900" }} onClick={navToHome}>
              Gallewe
            </button>
          </li>
          <li style={{ marginLeft: "10px" }}>
            <input
              id="search"
              type="text"
              className="search"
              value={search}
              onChange={handleOnChangeSearch}
              onKeyPress={navToSearch}
              placeholder="Search..."
            />
          </li>
          <li style={{ float: "right" }}>
            <button onClick={navToLogin}>Log In</button>
          </li>
          <li style={{ float: "right" }}>
            <button onClick={navToSignup}>Sign Up</button>
          </li>
        </ul>
      </div>
    );
  }
}
