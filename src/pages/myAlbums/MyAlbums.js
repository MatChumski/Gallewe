import "./MyAlbums.css";
import * as ReactDOM from "react-dom";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { context } from "../../context";
import {
  getUserAlbums,
  createAlbum,
  getAlbum,
  deleteAlbum
} from "../../dbHandler";

export function MyAlbums() {
  const navigate = useNavigate();
  const myAlbumsContext = useContext(context);

  const [listSet, setListSet] = useState(0);

  const [albumList, setAlbumList] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  //console.log("context: ", context);
  //console.log("homeContext: ", homeContext.user);

  function updateAlbums(albums) {
    setAlbumList(albums);
  }

  function navToProfile(user) {
    navigate(`/profile/${user}`);
  }
  function navToAlbum(album_id) {
    navigate(`/album/${album_id}`);
  }

  function showCreating() {
    setCreating(true);
    setDeleting(false);
  }
  function hideCreating() {
    setCreating(false);
  }

  function showDeleting() {
    setDeleting(true);
    setCreating(false);
  }
  function hideDeleting() {
    setDeleting(false);
  }

  async function getAlbums() {
    setAlbumList(null);
    setListSet(0);
    let albums = await getUserAlbums(myAlbumsContext.user.username);
    if (albums) {
      updateAlbums(albums);
      setListSet(1);
    } else {
      setListSet(2);
    }
  }

  // Gets all the albums the user is joined in
  useEffect(() => {
    if (myAlbumsContext.user) {
      //console.log(myAlbumsContext.user.username);
      getAlbums();
    }
  }, [myAlbumsContext.user]);

  // Component for creating a new album
  function CreateAlbum() {
    const [albumName, setAlbumName] = useState("");
    const [privacy, setPrivacy] = useState("");

    const createContext = useContext(context);

    function handleOnChangeAlbumName(event) {
      setAlbumName(event.target.value);
    }

    function handleOnChangePrivacy(event) {
      setPrivacy(event.target.value);
    }

    // Creates the new album
    async function create() {
      let iAlbumName = albumName;
      let iPrivacy = privacy;
      let creator = createContext.user.username;
      // All album id's follow the format: AlbumName@CreatorUsername
      let album_id = `${iAlbumName}@${creator}`;

      let nameRegex = new RegExp("[0-9a-zA-Z]+$", "i");

      // Checks that all the info is filled
      if (iAlbumName == "" || iPrivacy == "" || iPrivacy == "Select") {
        alert("Please fill in all the fields");
        return;
      }

      // Checks that the album name is valid
      if (!nameRegex.test(iAlbumName)) {
        alert("Please enter a valid album name (No special characters)");
        return;
      }

      // Checks if that exact album already exists, checking its id
      let albumExists = await getAlbum("album_id", album_id);
      //console.log("albumExists: ", albumExists);

      if (albumExists !== false) {
        alert("You have already created this album");
        return;
      }

      await createAlbum(iAlbumName, creator, iPrivacy, album_id);

      getAlbums();
    }

    return (
      <div className="subMenu">
        <div className="subMenuTitle">Create Album</div>
        <input
          id="albumName"
          type="text"
          className="formInput"
          required
          pattern="[0-9A-Za-Z]+$"
          title="Please enter a valid album name (No special characters)"
          value={albumName}
          onChange={handleOnChangeAlbumName}
          placeholder="Album Name"
        />
        <select
          id="privacy"
          className="formInput mb-15"
          required
          style={{
            height: "29px",
            width: "93%",
            fontSize: "12pt",
            fontFamily: "Lato"
          }}
          onChange={handleOnChangePrivacy}
          value={privacy}
          placeholder="Privacy"
        >
          <option selected>Select</option>
          <option>Public</option>
          <option>Restricted</option>
          <option>Private</option>
        </select>

        <button
          id="create"
          className="formButton submitButton"
          onClick={create}
        >
          Create
        </button>
        <button className="formButton cancelButton" onClick={hideCreating}>
          Cancel
        </button>
      </div>
    );
  }

  // Component for deleteing an album created by the current user
  function DeleteAlbum() {
    const [albumName, setAlbumName] = useState("");

    const deleteContext = useContext(context);

    let myAlbums = [];

    // Gets the list of albums created by the user
    if (albumList) {
      for (let i = 0; i < albumList.length; i++) {
        if (albumList[i].creator === deleteContext.user.username) {
          let option = <option key={i}>{albumList[i].album_name}</option>;
          myAlbums.push(option);
        }
      }
    }

    function handleOnChangeAlbumName(event) {
      setAlbumName(event.target.value);
    }

    // Deletes an album
    async function deleteAlb() {
      let iAlbumName = albumName;
      let album_id;

      if (iAlbumName == "" || iAlbumName == "Select") {
        alert("Please fill in all the fields");
        return;
      }

      // Gets the id of the selected album name
      for (let i = 0; i < albumList.length; i++) {
        if (iAlbumName === albumList[i].album_name) {
          album_id = albumList[i].album_id;
          break;
        }
      }

      console.log("album_id: ", album_id);

      await deleteAlbum(album_id);

      getAlbums();
    }
    return (
      <div className="subMenu">
        <div className="subMenuTitle">Delete Album</div>
        <select
          id="albumName"
          className="formInput mb-15"
          required
          style={{
            height: "29px",
            width: "93%",
            fontSize: "12pt",
            fontFamily: "Lato"
          }}
          onChange={handleOnChangeAlbumName}
          value={albumName}
        >
          <option selected>Select</option>
          {myAlbums}
        </select>

        <button
          id="delete"
          className="formButton submitButton"
          onClick={deleteAlb}
        >
          Delete
        </button>
        <button className="formButton cancelButton" onClick={hideDeleting}>
          Cancel
        </button>
      </div>
    );
  }

  // Component that shows the albums and its creator
  function AlbumTable() {
    let col1 = [];
    let col2 = [];

    // Create the items of the table
    for (let i = 0; i < albumList.length; i++) {
      let d1 = (
        <div
          key={i}
          className="item"
          onClick={() => navToAlbum(albumList[i].album_id)}
        >
          {albumList[i].album_name}
        </div>
      );
      let d2 = (
        <div
          key={i}
          className="item"
          onClick={() => navToProfile(albumList[i].creator)}
        >
          {albumList[i].creator}
        </div>
      );

      col1.push(d1);
      col2.push(d2);
    }

    return (
      <div className="albumList">
        <div className="table">
          <div id="col1" className="col">
            <div className="itemTitle">Name</div>
            {col1}
          </div>
          <div id="col2" className="col">
            <div className="itemTitle">Creator</div>
            {col2}
          </div>
        </div>
      </div>
    );
  }

  // Component for the side menu
  function SideOptions() {
    return (
      <div id="sideOptions">
        <div>
          <button className="formButton regButton" onClick={showCreating}>
            Create Album
          </button>
          <button className="formButton regButton" onClick={showDeleting}>
            Delete Album
          </button>
        </div>
        {creating && <CreateAlbum />}
        {deleting && <DeleteAlbum />}
      </div>
    );
  }

  if (myAlbumsContext.user) {
    return (
      <div className="containerMyAlbum bs">
        <div className="contentMyAlbum">
          <SideOptions />
          <div className="containerTitle">My Albums</div>
          {listSet === 0 && <div id="albumList">Loading...</div>}
          {listSet === 1 && <AlbumTable />}
          {listSet === 2 && (
            <div id="albumList">
              Here will be your albums when you join to any of them
            </div>
          )}
        </div>
      </div>
    );
  }
}
