import "./Search.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { getAlbum, getUser } from "../../dbHandler";

export function Search() {
  const navigate = useNavigate();
  const params = useParams();

  /*
  0 = Searching
  1 = Something found
  2 = Nothing found
  */
  const [foundAlbum, setFoundAlbum] = useState(0);
  const [foundUser, setFoundUser] = useState(0);
  const [albumList, setAlbumList] = useState(null);
  const [albumListID, setAlbumListID] = useState(null);
  const [userList, setUserList] = useState(null);

  function updateAlbums(albums) {
    setAlbumList(albums);
  }
  function updateAlbumsID(albums) {
    setAlbumListID(albums);
  }

  function updateUsers(users) {
    setUserList(users);
  }

  function refresh() {
    setFoundAlbum(0);
    setFoundUser(0);
    setUserList(null);
    setAlbumList(null);
    setAlbumListID(null);
  }

  function navToProfile(user) {
    navigate(`/profile/${user}`);
  }
  function navToAlbum(album_id) {
    navigate(`/album/${album_id}`);
  }

  useEffect(() => {
    refresh();
    let query = params.query;
    //console.log("query: ", query);
    if (!query) {
      setFoundAlbum(2);
      setFoundUser(2);
    } else {
      let regexAlbumID = /[a-zA-Z]+[@]+.*/i;
      let albumSearchID = query;
      let albumSearchName = query;
      let userSearch = query;

      //console.log("qlength: ", query.length);
      let isID = regexAlbumID.test(query);

      if (isID) {
        //alert("is album id");
        let foundAt;
        let albumName = "";
        let creator = "";

        for (let i = 0; i < query.length; i++) {
          if (query[i] === "@") {
            foundAt = i;
            break;
          }
          albumName += query[i];
        }
        //console.log("albumName: ", albumName);

        for (let i = foundAt + 1; i < query.length; i++) {
          creator += query[i];
        }

        albumSearchName = albumName;
        userSearch = creator;
        //console.log("creator: ", creator);
      }

      if (isID) {
        getAlbum("album_id", albumSearchID).then((albums) => {
          //console.log("albumsID: ", albums);
          if (albums) {
            setFoundAlbum(1);
            updateAlbumsID(albums);
          } else {
            setFoundAlbum(2);
          }
        });
      }
      let foundAlbumsName = false;
      getAlbum("album_name", albumSearchName).then((albums) => {
        if (albums) {
          setFoundAlbum(1);
          foundAlbumsName = true;
          updateAlbums(albums);
        } else {
          foundAlbumsName = false;
        }
      });
      let foundAlbumsCreator = false;
      getAlbum("creator", userSearch).then((albums) => {
        if (albums) {
          setFoundAlbum(1);
          foundAlbumsCreator = true;
          updateAlbums(albums);
        } else {
          foundAlbumsCreator = false;
        }
      });
      if (!foundAlbumsName && !foundAlbumsCreator) {
        setFoundAlbum(2);
      }
      getUser("username", userSearch).then((users) => {
        //console.log("users: ", users);
        if (users) {
          setFoundUser(1);
          updateUsers(users);
        } else {
          setFoundUser(2);
        }
      });
    }
  }, [params.query]);

  function ResultsTable() {
    let col1 = [];
    let col2 = [];

    if (albumListID) {
      let first1 = (
        <div>
          <div
            key={0}
            className="item"
            onClick={() => navToAlbum(albumListID[0].album_id)}
          >
            {albumListID[0].album_id}
          </div>
          <div className="itemTitle">Other Albums</div>
        </div>
      );

      col1.push(first1);
    }

    // Create the items of the table
    if (albumList) {
      for (let i = 0; i < albumList.length; i++) {
        if (albumListID) {
          if (albumListID[0].album_id !== albumList[i].album_id) {
            let d1 = (
              <div
                key={i + 1}
                className="item"
                onClick={() => navToAlbum(albumList[i].album_id)}
              >
                {albumList[i].album_id}
              </div>
            );
            col1.push(d1);
          }
        } else {
          let d1 = (
            <div
              key={i + 1}
              className="item"
              onClick={() => navToAlbum(albumList[i].album_id)}
            >
              {albumList[i].album_id}
            </div>
          );
          col1.push(d1);
        }
      }
    }

    if (userList) {
      for (let i = 0; i < userList.length; i++) {
        let d2 = (
          <div
            key={i + 1}
            className="item"
            onClick={() => navToProfile(userList[i].username)}
          >
            {userList[i].username}
          </div>
        );
        col2.push(d2);
      }
    }

    return (
      <div className="resultList">
        <div className="table">
          <div id="col1" className="col">
            <div className="itemTitle">Album</div>
            {col1}
          </div>
          <div id="col2" className="col">
            <div className="itemTitle">User</div>
            {col2}
          </div>
        </div>
      </div>
    );
  }

  if (foundAlbum === 0 || foundUser === 0) {
    return (
      <div className="containerSearch homeContainer bs">
        <div className="containerTitle">
          Results for <br />
          <div style={{ fontSize: "16pt" }}>"{params.query}"</div>
        </div>
        <div className="contentSearch">Searching...</div>
      </div>
    );
  } else if (foundAlbum === 1 || foundUser === 1) {
    return (
      <div className="containerSearch homeContainer bs">
        <div className="containerTitle">
          Results for <br />
          <div style={{ fontSize: "16pt" }}>"{params.query}"</div>
        </div>
        <div className="contentSearch">
          <ResultsTable />
        </div>
      </div>
    );
  } else if (foundAlbum === 2 && foundUser === 2) {
    return (
      <div className="containerSearch homeContainer bs">
        <div className="containerTitle">
          Results for <br />
          <div style={{ fontSize: "16pt" }}>"{params.query}"</div>
        </div>
        <div className="contentSearch">
          <div>Nothing found</div>
        </div>
      </div>
    );
  }
}
