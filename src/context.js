import { createMockUserToken } from "@firebase/util";
import { createContext, useState } from "react";

export const context = createContext();

export function AppContext(props) {
  let [user, setUser] = useState(null);

  function createUser(user) {
    let userJson = JSON.stringify(user);
    localStorage.setItem("user", userJson);
  }

  function login(user) {
    //console.log(user);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("user");
    setUser(null);
  }

  let newContext = {
    user,
    login,
    logout,
    createUser
  };

  return (
    <context.Provider value={newContext}>{props.children}</context.Provider>
  );
}
