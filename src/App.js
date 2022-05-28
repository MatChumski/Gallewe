import { Routes, Route } from "react-router-dom";
import { useEffect, useContext } from "react";
import { Home } from "./pages/home/Home";
import { Login } from "./pages/login/Login";
import { Signup } from "./pages/signup/Signup";
import { Profile } from "./pages/profile/Profile";
import { MyAlbums } from "./pages/myAlbums/MyAlbums";
import { Search } from "./pages/search/Search";
import { Album } from "./pages/album/Album";
import { Reports } from "./pages/reports/Reports";
import { Header } from "./header";
import { context } from "./context";
import "./styles.css";

export default function App() {
  const appContext = useContext(context);

  /* 
  Extracts the current user from the browser's local storage.
  If the user exists, it converts it to JSON and saves it
  inside de app's context
  */
  useEffect(() => {
    let currentUser = localStorage.getItem("user");

    if (currentUser) {
      let userJSON = JSON.parse(currentUser);
      console.log("currentUser: ", userJSON);
      appContext.login(userJSON);
    }
  }, []);

  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />}>
          <Route path="/profile/:user" element={<Profile />} />
        </Route>
        <Route path="/album" element={<Album />}>
          <Route path="/album/:album_id" element={<Album />} />
        </Route>
        <Route path="/search" element={<Search />}>
          <Route path="/search/:query" element={<Search />} />
        </Route>
        <Route path="/myAlbums" element={<MyAlbums />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </div>
  );
}
