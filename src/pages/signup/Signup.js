import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";
import bcrypt from "bcryptjs";
import { signupUser, getUser } from "../../dbHandler";

export function Signup() {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [checkPwd, setCheckPwd] = useState("");
  const [email, setEmail] = useState("");

  let navigate = useNavigate();

  // Navigation methods
  function navCancel() {
    navigate("/");
  }

  // Form input change handlers
  function handleOnChangeUsername(event) {
    setUsername(event.target.value);
    console.log(username);
  }

  function handleOnChangePwd(event) {
    setPwd(event.target.value);
    console.log(pwd);
  }

  function handleOnChangeCheckPwd(event) {
    setCheckPwd(event.target.value);
    console.log(checkPwd);
  }

  function handleOnChangeEmail(event) {
    setEmail(event.target.value);
    console.log(email);
  }

  // Singup the user with the input data
  async function signup() {
    let iUsername = username;
    let iPwd = pwd;
    let iCheckPwd = checkPwd;
    let iEmail = email;

    let userRegex = new RegExp("[0-9a-zA-Z]+$", "i");
    let emailRegex = new RegExp("[^s@]+@[^s@]+.[^s@]+$", "i");

    // Checks if all the fields are filled
    if (iUsername == "" || iPwd == "" || iCheckPwd == "" || iEmail == "") {
      alert("Please fill in all the fields");
      return;
    }

    // Checks that the username doesn't have special characters
    if (!userRegex.test(iUsername)) {
      alert("Please enter a valid username (No special characters)");
      return;
    }

    // Checks that the email address is valid
    if (!emailRegex.test(iEmail)) {
      alert("Please enter a valid email address");
      return;
    }

    // Checks that the password has at least 8 characters
    if (iPwd.length < 8) {
      alert("Please enter a password with at least 8 characters");
      return;
    }

    // Checks that both passwords match
    if (iPwd !== iCheckPwd) {
      alert("The passwords are not the same");
      return;
    }

    // Checks if the username is already taken
    let userExists = await getUser(iUsername, "username");

    if (userExists !== false) {
      alert("The username is already taken");
      return;
    }

    // Checks if the email is already taken
    let eExists = await getUser(iEmail, "email");

    if (eExists !== false) {
      alert("The email is already taken");
      return;
    }

    let rounds = 10;
    let hashPwd = await bcrypt.hash(iPwd, rounds);

    // Creates the new account
    if (signupUser(iUsername, hashPwd, iEmail)) {
      alert("Account Succesfully Created, now you can Log In");
      navCancel();
    } else {
      alert("Something went wrong");
    }
  }

  return (
    <div className="container bs">
      <div className="containerTitle">Create Your Account</div>
      <div className="content">
        <input
          id="username"
          type="text"
          className="formInput"
          required
          pattern="[0-9A-Za-Z]+$"
          title="Please enter a valid username (No special characters)"
          value={username}
          onChange={handleOnChangeUsername}
          placeholder="Username"
        />
        <input
          id="pwd"
          type="password"
          className="formInput"
          required
          value={pwd}
          onChange={handleOnChangePwd}
          placeholder="Password"
        />
        <input
          id="repeatPwd"
          type="password"
          className="formInput mb-15"
          required
          value={checkPwd}
          onChange={handleOnChangeCheckPwd}
          placeholder="Repeat Password"
        />
        <input
          id="email"
          type="email"
          className="formInput mb-15"
          required
          value={email}
          onChange={handleOnChangeEmail}
          placeholder="E-Mail"
        />

        <button
          id="signup"
          className="formButton submitButton"
          onClick={signup}
        >
          Sign Up
        </button>
        <button className="formButton cancelButton" onClick={navCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
