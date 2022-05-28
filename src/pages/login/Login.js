import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../dbHandler";
import { context } from "../../context";
import bcrypt from "bcryptjs";
import "./Login.css";

export function Login() {
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const loginContext = useContext(context);

  let navigate = useNavigate();

  function navLogin() {
    //console.log("newUser:", newUser);
    navigate("/");
  }

  function navCancel() {
    navigate("/");
  }

  function handleOnChangeUsername(event) {
    setUsername(event.target.value);
    //console.log(username);
  }

  function handleOnChangePwd(event) {
    setPwd(event.target.value);
    //console.log(pwd);
  }

  async function login() {
    let iUserID = username;
    let iPwd = pwd;

    if (iUserID == "" || iPwd == "") {
      alert("Please fill in all the fields");
      return;
    }

    /* console.log(iUserID);
    console.log(iPwd); */

    let found = false;

    let user = await getUser("username", iUserID);

    if (user !== false && user.length !== 0) {
      //console.log("is user");
      found = true;
    } else {
      //console.log("Username not found");
    }

    if (!found) {
      user = await getUser("email", iUserID);

      if (user !== false && user.length !== 0) {
        //console.log("is email");
        found = true;
      } else {
        //console.log("Email not found");
      }
    }

    if (!found) {
      alert("User not found");
      return;
    } else {
      if (!(await bcrypt.compare(iPwd, user[0].pwd))) {
        alert("Wrong password");
        return false;
      } else {
        let result = user;
        //console.log("result:", result);
        alert("Successful login");

        setUsername(user[0].username);
        loginContext.login(user[0]);
        loginContext.createUser(user[0]);

        //console.log(user[0].username);
        //console.log(username);

        navLogin(user);
      }
    }
  }

  return (
    <div className="container bs mt-65">
      <div className="containerTitle">Log In</div>
      <div className="content">
        <input
          id="username"
          type="text"
          className="formInput"
          value={username}
          onChange={handleOnChangeUsername}
          placeholder="Username/E-Mail"
        />
        <input
          id="password"
          type="password"
          className="formInput mb-15"
          value={pwd}
          onChange={handleOnChangePwd}
          placeholder="Password"
        />

        <button className="formButton submitButton" onClick={login}>
          Login
        </button>
        <button className="formButton cancelButton" onClick={navCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
