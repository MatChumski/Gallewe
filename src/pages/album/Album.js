import "./Album.css";
import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createPost,
  getAlbum,
  getRelation,
  joinAlbum,
  leaveAlbum,
  deleteAlbum,
  getPosts,
  getAlbumUsers,
  changeRole,
  deletePost,
  kickUser,
  loadImage,
  uploadIcon
} from "../../dbHandler";
import { context } from "../../context";

export function Album() {
  const navigate = useNavigate();
  const params = useParams();
  const albumContext = useContext(context);

  /*
  0 = Working
  1 = Success
  2 = Fail
  */
  const [album, setAlbum] = useState(null);
  const [albumFound, setAlbumFound] = useState(0);

  const [posts, setPosts] = useState(null);
  const [postsFound, setPostsFound] = useState(0);
  //const [lastIndex, setLastIndex] = useState(0);

  const [albumCreator, setAlbumCreator] = useState(null);
  const [albumName, setAlbumName] = useState(null);
  const [albumID, setAlbumID] = useState(null);

  const [creatingPost, setCreatingPost] = useState(false);
  function showCreatingPost() {
    if (albumContext.user) {
      if (userJoined) {
        setCreatingPost(true);
      } else {
        alert("Join to the album in order to post");
      }
    } else {
      alert("Please Log In in order to post");
    }
  }
  function hideCreatingPost() {
    setCreatingPost(false);
  }

  const [relation, setRelation] = useState(null);
  const [userJoined, setUserJoined] = useState(null);
  const [userList, setUserList] = useState(null);

  const [deletingAlbum, setDeletingAlbum] = useState(false);
  function showDeletingAlbum() {
    setDeletingAlbum(true);
  }
  function hideDeletingAlbum() {
    setDeletingAlbum(false);
  }

  const [moderatorsPopup, setModeratorsPopup] = useState(false);
  function showModeratorsPopup() {
    setModeratorsPopup(true);
  }
  function hideModeratorsPopup() {
    setModeratorsPopup(false);
  }

  const [iconPopup, setIconPopup] = useState(false);
  function showIconPopup() {
    setIconPopup(true);
  }
  function hideIconPopup() {
    setIconPopup(false);
  }

  function refresh() {
    location.reload();
  }

  // Sets the album data
  useEffect(() => {
    if (album) {
      setAlbumFound(1);
      let album_name = album[0].album_name;
      let album_id = album[0].album_id;
      let album_creator = album[0].creator;

      setAlbumCreator(album_creator);
      setAlbumID(album_id);
      setAlbumName(album_name);
    } else {
      setAlbumFound(2);
    }
  }, [album]);

  // Gets the users of the album
  useEffect(() => {
    if (album) {
      searchUsers(album[0].album_id);
    }
  }, [album]);

  // Gets the Album
  useEffect(() => {
    if (params.album_id) {
      searchAlbum(params.album_id);
    }
  }, [params.album_id]);

  // Gets the Relation between the user and the Album
  useEffect(() => {
    if (albumContext.user && albumFound === 1) {
      searchRelation(albumContext.user.username, albumID);
    } else {
      setRelation(null);
      setUserJoined(false);
    }
  }, [albumContext.user, albumFound]);

  // Gets the posts and icon
  useEffect(() => {
    if (albumID) {
      searchPosts(albumID);
      displayIcon();
    }
  }, [albumID]);

  function navToProfile(user) {
    navigate(`/profile/${user}`);
  }

  // Gets the relation between the user and the Album
  async function searchRelation(user, album) {
    let result = await getRelation(user, album);
    let _relation = result[0];
    setRelation(_relation);

    //console.log("_relation: ", _relation);
    if (!_relation) {
      setRelation("guest");
      setUserJoined(false);
    } else {
      setUserJoined(true);
    }
  }

  // Shows the icon
  function displayIcon() {
    console.log("here");
    let thisIcon = `icon_${albumID}`;
    loadImage("albumIcons", thisIcon, "album_icon");
  }

  // Gets the users of the album
  async function searchUsers(album) {
    let users = await getAlbumUsers(album);
    if (users) {
      console.log("users: ", users);
      setUserList(users);
    }
  }

  // Gets the album
  async function searchAlbum(album) {
    setAlbumFound(0);
    let _album = await getAlbum("album_id", album);
    setAlbum(_album);
  }

  // Gets the posts
  async function searchPosts(album) {
    setPostsFound(0);
    let _posts = await getPosts(album);
    //console.log("_posts", _posts);
    let _posts2 = [];

    if (_posts) {
      _posts.forEach((element) => {
        let original = element;
        let copy = { ...original, date: element.date.toDate() };
        _posts2.push(copy);
      });

      //console.log("_posts2:", _posts2);
      _posts2
        .sort(function (a, b) {
          /* console.log("a: ", a);
      console.log("b: ", b); */
          return a.date - b.date;
        })
        .reverse();
      //console.log("_posts2 sort:", _posts2);
    }
    if (_posts) {
      setPostsFound(1);
      setPosts(_posts2);
    } else {
      setPostsFound(2);
      setPosts(null);
    }
  }

  async function joinUser() {
    if (albumContext.user) {
      await joinAlbum(
        albumID,
        albumName,
        albumContext.user.username,
        albumCreator,
        "user"
      );
      refresh();
    } else {
      alert("Please Log In in order to join to this album");
    }
  }

  async function leaveUser() {
    await leaveAlbum(albumID, albumContext.user.username);
    refresh();
  }

  function ModeratorsPopup() {
    const [adding, setAdding] = useState(null);
    const [removing, setRemoving] = useState(null);

    function handleOnChangeAdding(event) {
      setAdding(event.target.value);
    }
    function handleOnChangeRemoving(event) {
      setRemoving(event.target.value);
    }

    let users = [];
    let moderators = [];

    for (let i = 0; i < userList.length; i++) {
      if (userList[i].role === "user") {
        let user = <option key={i}>{userList[i].user}</option>;
        users.push(user);
      }
    }
    //console.log(users);
    for (let i = 0; i < userList.length; i++) {
      if (userList[i].role === "moderator") {
        let moderator = <option key={i}>{userList[i].user}</option>;
        moderators.push(moderator);
      }
    }
    //console.log(moderators);

    async function addModerator() {
      let iAdding = adding;

      if (iAdding == "" || iAdding == "Select") {
        alert("Please fill in all the fields");
        return;
      }

      let result = await changeRole(iAdding, "moderator", albumID);
      if (result) {
        alert(`${iAdding} Successfully Added as Moderator`);
        hideModeratorsPopup();
        refresh();
      } else {
        alert("Something went wrong, please try again");
      }
    }
    async function removeModerator() {
      let iRemoving = removing;

      if (iRemoving == "" || iRemoving == "Select") {
        alert("Please fill in all the fields");
        return;
      }

      let result = await changeRole(iRemoving, "user", albumID);
      if (result) {
        alert(`${iRemoving} Successfully Removed as Moderator`);
        hideModeratorsPopup();
        refresh();
      } else {
        alert("Something went wrong, please try again");
      }
    }

    return (
      <div className="superPopup">
        <div className="moderatorPopup ">
          <div className="moderatorTitle">Moderators</div>
          <div className="moderatorContent">
            <div className="formArea">
              <div className="formTitle">Add Moderator</div>
              <select
                className="formInput mb-15"
                onChange={handleOnChangeAdding}
                value={adding}
                style={{
                  height: "29px",
                  width: "93%",
                  fontSize: "12pt",
                  fontFamily: "Lato"
                }}
              >
                <option selected>Select</option>
                {users}
              </select>
              <button
                className="formButton submitButton"
                onClick={addModerator}
              >
                Add
              </button>
            </div>
            <div className="formArea">
              <div className="formTitle">Remove Moderator</div>
              <select
                className="formInput mb-15"
                onChange={handleOnChangeRemoving}
                value={removing}
                style={{
                  height: "29px",
                  width: "93%",
                  fontSize: "12pt",
                  fontFamily: "Lato"
                }}
              >
                <option selected>Select</option>
                {moderators}
              </select>
              <button
                className="formButton submitButton"
                onClick={removeModerator}
              >
                Remove
              </button>
            </div>
          </div>
          <div style={{ width: "30%", marginTop: "10px" }}>
            <button
              className="formButton cancelButton"
              onClick={hideModeratorsPopup}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  function DeleteAlbumPopup() {
    async function deleteAlb() {
      await deleteAlbum(albumID);
      setDeletingAlbum(false);
      navigate("/");
    }

    return (
      <div className="superPopup">
        <div
          className="popup bs"
          style={{ paddingTop: "20px", paddingBottom: "20px" }}
        >
          <div>Are you sure you want to DELETE this album?</div>
          <div>This action cannot be reversed</div>
          <div style={{ width: "50%", display: "block", marginTop: "15px" }}>
            <button className="formButton yes mr-10" onClick={deleteAlb}>
              Yes
            </button>
            <button className="formButton no" onClick={hideDeletingAlbum}>
              No
            </button>
          </div>
        </div>
      </div>
    );
  }

  function CreatePopup() {
    let file = document.getElementById("uploadPost");

    const [newTitle, setNewTitle] = useState("");

    const [createDisplay, setCreateDisplay] = useState(null);
    const [createFileName, setCreateFileName] = useState("File Not Selected");

    function updateDisplay(newJSX) {
      setCreateDisplay(newJSX);
    }
    function updateFileName(name) {
      setCreateFileName(name);
    }

    function handleOnChangeTitle(event) {
      setNewTitle(event.target.value);
      console.log(newTitle);
    }

    // Calls the click function of the input file element
    function chooseFile() {
      file.click();
    }

    file.addEventListener("change", updateImageDisplay);

    async function post() {
      let file = document.getElementById("uploadPost").files[0];
      let user = albumContext.user.username;
      let random = Math.floor(Math.random() * (99999 - 1)) + 1;
      let album_id = params.album_id;
      let title = newTitle;
      let fileType = file.type;

      /* if (file) {
        console.log("file: ", file);
      }

      console.log("newTitle: ", newTitle);
      console.log("fileType: ", fileType);
 */
      if (!title) {
        alert("Please create a title for your post");
        return;
      }

      /* console.log("file: ", file);
      console.log("user: ", user);
      console.log("album_id: ", album_id);
      console.log("title: ", title); */

      //console.log("file: ", file);
      // If there is a file selected, it is uploaded in the database
      if (file) {
        // album_id_username_filename_random
        //console.log("fileType: ", fileType);
        let fileName = `${params.album_id}_${user}_${file.name}_${random}`;
        let result = await createPost(
          file,
          fileName,
          user,
          album_id,
          title,
          fileType
        );
        if (result) {
          alert("Post Created");
          //console.log(result);
          hideCreatingPost();
          refresh();
        }
      } else {
        alert("Please select a file first");
      }
    }

    /* 
    Displays the file that the user selected from their device
    */
    function updateImageDisplay() {
      // If there is a file selected, proceeds to update
      if (file.files[0]) {
        //console.log(file.files[0].name);
        let fileName = file.files[0].name;

        let isVideo = false;
        let isImage = false;

        // Regular expression for the allowed file formats
        let imageExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
        let videoExtensions = /(\.mp4)$/i;

        if (imageExtensions.exec(fileName)) {
          isImage = true;
        } else if (videoExtensions.exec(fileName)) {
          isVideo = true;
        }

        if (isImage || isVideo) {
          let source = URL.createObjectURL(file.files[0]);
          let display;
          if (isImage) {
            display = <img id="selectedFile" src={source} alt="NF" />;
          } else {
            display = <video id="selectedFile" controls src={source} />;
          }

          updateDisplay(display);
          updateFileName(fileName);
        } else {
          file.value = "";
          updateDisplay(null);
          updateFileName("File Not Selected");
          alert("File Type Not Allowed");
        }
      }
    }

    return (
      <div className="superPopup">
        <div className="createPopup ">
          <div className="createTitle">Create Post</div>
          <div className="postTemplate">
            <div className="postTemplateInfo">
              <input
                className="formInput"
                placeholder="Post Title"
                value={newTitle}
                onChange={handleOnChangeTitle}
              />
            </div>
            <div id="postPlaceholder" className="postPlaceholder">
              {createDisplay}
            </div>
            <div id="curFileName">{createFileName}</div>
          </div>
          <div style={{ width: "50%", marginTop: "15px" }}>
            <button className="formButton submitButton" onClick={chooseFile}>
              Upload File
            </button>
            <button className="formButton submitButton" onClick={post}>
              Post
            </button>
            <button
              className="formButton cancelButton"
              onClick={hideCreatingPost}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  function PostList() {
    let _posts = posts;
    let postlist = [];

    function Post(props) {
      const [deletingPost, setDeletingPost] = useState(false);
      const [kickingUser, setKickingUser] = useState(false);
      const [options, setOptions] = useState(false);

      let posterMember = false;
      for (let i = 0; i < userList.length; i++) {
        if (userList[i].user == props.poster) {
          posterMember = true;
        }
      }

      function showDeletingPost() {
        setDeletingPost(true);
      }
      function hideDeletingPost() {
        setDeletingPost(false);
      }
      function showKickingUser() {
        setKickingUser(true);
      }
      function hideKickingUser() {
        setKickingUser(false);
      }

      function DeletePostPopup() {
        async function deleteP(postID) {
          console.log("postID: ", postID);
          let result = await deletePost(postID);
          if (result) {
            alert("Post Deleted Successfully");
            hideDeletingPost();
            refresh();
          }
        }

        return (
          <div className="superSmallPopup">
            <div
              className="smallPopup bs"
              style={{ paddingTop: "20px", paddingBottom: "20px" }}
            >
              <div>Are you sure you want to DELETE this post?</div>
              <div>This action cannot be reversed</div>
              <div
                style={{ width: "50%", display: "block", marginTop: "15px" }}
              >
                <button
                  className="formButton yes mr-10"
                  onClick={() => {
                    deleteP(props.id);
                  }}
                >
                  Yes
                </button>
                <button className="formButton no" onClick={hideDeletingPost}>
                  No
                </button>
              </div>
            </div>
          </div>
        );
      }

      function KickUserPopup() {
        async function kick(user) {
          console.log("user: ", user);
          let result = await kickUser(user, albumID);
          if (result) {
            alert(`${user} has been kicked`);
            hideDeletingPost();
            refresh();
          }
        }

        return (
          <div className="superSmallPopup">
            <div
              className="smallPopup bs"
              style={{ paddingTop: "20px", paddingBottom: "20px" }}
            >
              <div>Are you sure you want to KICK {props.poster}?</div>
              <div
                style={{ width: "50%", display: "block", marginTop: "15px" }}
              >
                <button
                  className="formButton yes mr-10"
                  onClick={() => {
                    kick(props.poster);
                  }}
                >
                  Yes
                </button>
                <button className="formButton no" onClick={hideKickingUser}>
                  No
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="post" id={props.id}>
          {deletingPost && <DeletePostPopup />}
          {kickingUser && <KickUserPopup />}
          <div className="postTop">
            <div className="postInfo">
              <div id="poster">
                By:
                <div onClick={() => navToProfile(props.poster)}>
                  {props.poster}
                </div>
              </div>
              <div id="postDate">
                {props.day} <div>{props.hour}</div>
              </div>
              <div id="postTitle">{props.title}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              {relation &&
                (relation.role === "creator" ||
                  relation.role === "moderator" ||
                  albumContext.user.role === "admin" ||
                  props.poster === albumContext.user.username) && (
                  <div>
                    <button
                      className="postOptionsButton"
                      onClick={(event) => {
                        setOptions((prevState) => {
                          if (prevState) {
                            event.target.innerHTML = "+";
                          } else {
                            event.target.innerHTML = "-";
                          }
                          return !prevState;
                        });
                      }}
                    >
                      +
                    </button>

                    {options && (
                      <div className="postOptionsDropdown">
                        <button onClick={showDeletingPost}>Delete Post</button>
                        {(relation.role === "creator" ||
                          relation.role === "moderator") &&
                          props.poster !== albumContext.user.username &&
                          props.poster !== albumCreator &&
                          posterMember && (
                            <button onClick={showKickingUser}>Kick User</button>
                          )}
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>
          <div className="postContent">
            {props.type === "image" && (
              <img alt={props.title} src={props.source} />
            )}
            {props.type === "video" && (
              <video controls alt={props.title} src={props.source} />
            )}
          </div>
        </div>
      );
    }

    for (let i = 0; i < _posts.length; i++) {
      let poster = _posts[i].poster;
      let date = _posts[i].date;
      let title = _posts[i].title;
      let fileType = String(_posts[i].file_type);
      let id = _posts[i].post_id;
      let type;

      if (fileType[0] === "i") {
        type = "image";
      } else if (fileType[0] === "v") {
        type = "video";
      }

      let source = _posts[i].file_url;

      let day = date.toDateString();
      let hour = date.toLocaleTimeString();

      /* console.log(day);
      console.log(hour); */

      /* console.log("poster: ", poster);
      console.log("date: ", date);
      console.log("title: ", title);
      console.log("type: ", type);
      console.log("source: ", source); */

      let newPost = (
        <Post
          id={id}
          key={i}
          poster={poster}
          day={day}
          hour={hour}
          title={title}
          type={type}
          source={source}
        />
      );

      postlist.push(newPost);
    }

    return <div className="contentAlbum">{postlist}</div>;
  }

  function AlbumIconPopup() {
    let file = document.getElementById("uploadIcon");

    // Calls the click function of the input file element
    function chooseFile() {
      file.click();
    }

    async function changeIcon() {
      let file = document.getElementById("uploadIcon").files[0];

      //console.log("file: ", file);
      // If there is a file selected, it is uploaded in the database
      if (file) {
        uploadIcon(albumID, file).then((result) => {
          //console.log("result: ", result);
          if (result) {
            alert("Album Icon Changed Successfully");
            hideIconPopup();
            displayIcon();
          } else {
            alert("Something went wrong");
          }
        });
      } else {
        alert("Please select a file first");
      }
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
          <button className="formButton submitButton" onClick={changeIcon}>
            Accept
          </button>
          <button className="formButton cancelButton" onClick={hideIconPopup}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {creatingPost && <CreatePopup />}
      {deletingAlbum && <DeleteAlbumPopup />}
      {moderatorsPopup && <ModeratorsPopup />}
      {iconPopup && <AlbumIconPopup />}
      <input type="file" id="uploadPost" hidden />
      <input type="file" id="uploadIcon" hidden />
      <div className="containerAlbum bs">
        <div className="titleFrame">
          <div className="albumInfo">
            <div className="albumPic">
              {relation && relation.role === "creator" && (
                <button id="change" onClick={showIconPopup}>
                  Change Album Icon
                </button>
              )}
              <img
                id="album_icon"
                src={require("../../img/loading.gif")}
                alt="album_icon"
              />
            </div>
            <div className="albumTitle">
              {albumFound === 0 && <div id="name">Loading...</div>}
              {albumFound === 2 && (
                <div id="name">This Album Does not Exist</div>
              )}
              {albumFound === 1 && album && (
                <div>
                  <div id="name">{albumName}</div>
                  <div id="creator">
                    Creator:
                    <div onClick={() => navToProfile(albumCreator)}>
                      {albumCreator}
                    </div>
                  </div>
                  <div id="id">ID: {albumID}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {albumFound === 1 && (
          <div className="contentAlbum">
            <div className="options">
              {userJoined && relation && relation.role !== "creator" && (
                <button
                  className="optionButton alt joined"
                  style={{ float: "right" }}
                  onClick={leaveUser}
                >
                  <span>Joined</span>
                </button>
              )}
              {!userJoined && (
                <button
                  className="optionButton alt"
                  style={{ float: "right" }}
                  onClick={joinUser}
                >
                  Join
                </button>
              )}

              {albumContext.user && albumContext.user.role === "admin" && (
                <div className="optionInterface">Admin Interface</div>
              )}
              {albumContext.user &&
                albumContext.user.role !== "admin" &&
                relation &&
                relation.role === "creator" && (
                  <div className="optionInterface">Creator Interface</div>
                )}
              {albumContext.user &&
                albumContext.user.role !== "admin" &&
                relation &&
                relation.role === "moderator" && (
                  <div className="optionInterface">Moderator Interface</div>
                )}

              {((relation && relation.role === "creator") ||
                (albumContext.user && albumContext.user.role === "admin")) && (
                <button
                  className="optionButton delete"
                  style={{ float: "right" }}
                  onClick={showDeletingAlbum}
                >
                  Delete Album
                </button>
              )}
              {relation && relation.role === "creator" && (
                <button
                  className="optionButton"
                  style={{ float: "right" }}
                  onClick={showModeratorsPopup}
                >
                  Moderators
                </button>
              )}

              <button
                className="optionButton"
                style={{ float: "right" }}
                onClick={showCreatingPost}
              >
                Create Post
              </button>
            </div>
            {postsFound === 0 && (
              <div className="contentAlbum">
                <div className="containerAlbumTitle">Loading...</div>
              </div>
            )}
            {postsFound === 1 && <PostList />}
            {postsFound === 2 && (
              <div className="contentAlbum">
                <div className="containerAlbumTitle">
                  This album doesn't have any posts
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
