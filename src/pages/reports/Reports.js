import "./Reports.css";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { getAllUsers, getAllPosts, getAllAlbums } from "../../dbHandler";
import Plot from "react-plotly.js";

export function Reports() {
  const [albums, setAlbums] = useState(null);
  const [users, setUsers] = useState(null);
  const [posts, setPosts] = useState(null);

  const [dataSet, setDataSet] = useState(false);

  const [startDateUsers, setStartDateUsers] = useState("");
  const [startDateAlbums, setStartDateAlbums] = useState("");
  const [startDatePosts, setStartDatePosts] = useState("");

  const [finishDateUsers, setFinishDateUsers] = useState("");
  const [finishDateAlbums, setFinishDateAlbums] = useState("");
  const [finishDatePosts, setFinishDatePosts] = useState("");

  useEffect(() => {
    getAlbums();
    getUsers();
    getPosts();
  }, []);

  useEffect(() => {
    if (albums && posts && users) {
      setDataSet(true);
      setTotalUsers(users.length);
      setTotalAlbums(albums.length);
      setTotalPosts(posts.length);
    }
  }, [albums, users, posts]);

  useEffect(() => {
    if (dataSet) {
      let today = new Date().toISOString().split("T")[0];
      let weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo = weekAgo.toISOString().split("T")[0];

      setStartDateUsers(weekAgo);
      setStartDateAlbums(weekAgo);
      setStartDatePosts(weekAgo);

      setFinishDateUsers(today);
      setFinishDateAlbums(today);
      setFinishDatePosts(today);
    }
  }, [dataSet]);

  //Start Date Change
  function onChangeSDUsers(evt) {
    setStartDateUsers(evt.target.value);
  }
  function onChangeSDAlbums(evt) {
    setStartDateAlbums(evt.target.value);
  }
  function onChangeSDPosts(evt) {
    setStartDatePosts(evt.target.value);
  }

  //Finish Date Change
  function onChangeFDUsers(evt) {
    setFinishDateUsers(evt.target.value);
  }
  function onChangeFDAlbums(evt) {
    setFinishDateAlbums(evt.target.value);
  }
  function onChangeFDPosts(evt) {
    setFinishDatePosts(evt.target.value);
  }

  async function getAlbums() {
    let _albums = await getAllAlbums();
    if (_albums) {
      setAlbums(_albums);
    }
  }
  async function getUsers() {
    let _users = await getAllUsers();
    if (_users) {
      setUsers(_users);
    }
  }
  async function getPosts() {
    let _posts = await getAllPosts();
    if (_posts) {
      setPosts(_posts);
    }
  }

  // Users Report
  const [totalUsers, setTotalUsers] = useState(null);
  const [newUsers, setNewUsers] = useState(null);
  const [usersGrowth, setUsersGrowth] = useState(null);
  const [usersDates, setUsersDates] = useState([]);
  const [countDateUsers, setCountDateUsers] = useState([]);

  useEffect(() => {
    if (dataSet && startDateUsers && finishDateUsers) {
      let _users = users;

      let dates = [];
      let usersToStart = 0;

      let sval = document.getElementById("startDateUsers").value;
      let fval = document.getElementById("finishDateUsers").value;

      let start = new Date(sval).toISOString().split("T")[0];
      let finish = new Date(fval).toISOString().split("T")[0];

      for (let i = 0; i < _users.length; i++) {
        let date = _users[i].creation.toDate().toISOString().split("T")[0];
        //console.log("date:", date);
        if (date >= start && date <= finish) {
          dates.push(date);
        }
        if (date <= start) {
          usersToStart++;
        }
      }

      let _newUsers = dates.length;
      let _usersGrowth = Math.floor((_newUsers * 100) / totalUsers);

      dates.sort(function (a, b) {
        //console.log("a: ", a);
        //console.log("b: ", b);
        let a2 = new Date(a);
        let b2 = new Date(b);
        return a2 - b2;
      });

      let counts = {};
      dates.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
      });

      let uniqueDates = [...new Set(dates)];

      let _dateCounts = [];
      //console.log("start:", usersToStart);
      let count = usersToStart;
      for (let item in counts) {
        _dateCounts.push(count + counts[item]);
        count += counts[item];
      }

      setUsersDates(uniqueDates);
      //console.log("datesu", dates);

      setCountDateUsers(_dateCounts);
      //console.log(_dateCounts);
      //console.log(_newUsers);

      setNewUsers(_newUsers);
      setUsersGrowth(`${_usersGrowth}%`);
    }
  }, [dataSet, startDateUsers, finishDateUsers]);

  // Albums Report
  const [totalAlbums, setTotalAlbums] = useState(null);
  const [newAlbums, setNewAlbums] = useState(null);
  const [albumsGrowth, setAlbumsGrowth] = useState(null);
  const [albumCreators, setAlbumCreators] = useState(null);
  const [newCreators, setNewCreators] = useState(null);
  const [albumDates, setAlbumDates] = useState([]);
  const [countDateAlbums, setCountDateAlbums] = useState([]);

  useEffect(() => {
    if ((dataSet, startDateAlbums, finishDateAlbums)) {
      let _albums = albums;
      let dates = [];
      let datesToStart = 0;

      let sval = document.getElementById("startDateAlbums").value;
      let fval = document.getElementById("finishDateAlbums").value;

      let start = new Date(sval).toISOString().split("T")[0];
      let finish = new Date(fval).toISOString().split("T")[0];

      for (let i = 0; i < _albums.length; i++) {
        let date = _albums[i].creation_date
          .toDate()
          .toISOString()
          .split("T")[0];
        //console.log("date:", date);
        if (date >= start && date <= finish) {
          dates.push(date);
        }
        if (date < start) {
          datesToStart++;
        }
      }

      dates.sort(function (a, b) {
        let a2 = new Date(a);
        let b2 = new Date(b);
        return a2 - b2;
      });

      let counts = {};
      dates.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
      });

      let uniqueDates = [...new Set(dates)];

      //console.log("countsa:", counts);
      //console.log("datesa:", dates);

      let _dateCounts = [];
      let count = datesToStart;
      for (let item in counts) {
        _dateCounts.push(count + counts[item]);
        count += counts[item];
      }

      let creators = [];

      for (let i = 0; i < _albums.length; i++) {
        let found = creators.includes(_albums[i].creator);
        if (!found) {
          creators.push(_albums[i].creator);
        }
      }

      //console.log(_albums);

      let nCreators = [];
      let oldCreators = [];

      for (let i = 0; i < _albums.length; i++) {
        let date = _albums[i].creation_date.toDate();
        let isOld = oldCreators.includes(_albums[i].creator);

        //console.log("start:", start);
        let startDate = new Date(start);
        /* console.log("st", startDate);
        console.log("dt", date);
        console.log("old", isOld); */

        if (date < startDate && !isOld) {
          oldCreators.push(_albums[i].creator);
        }
      }

      console.log("old:", oldCreators);

      for (let i = 0; i < _albums.length; i++) {
        let date = _albums[i].creation_date.toDate();
        let isNew = !oldCreators.includes(_albums[i].creator);

        let startDate = new Date(start);
        let finishDate = new Date(finish);
        console.log("isnew", isNew);
        console.log("date", date);
        console.log("start", startDate);
        console.log("finish", finishDate);

        if (isNew && date >= startDate && date <= finishDate) {
          nCreators.push(_albums[i].creator);
        }
      }

      let uniqueCreators = [...new Set(nCreators)];

      console.log("new:", uniqueCreators);

      let _newAlbums = dates.length;
      let _albumsGrowth = Math.floor((_newAlbums * 100) / totalAlbums);
      let _albumCreators = creators.length;
      let _newCreators = uniqueCreators.length;

      //console.log(_newUsers);

      setAlbumDates(uniqueDates);
      setCountDateAlbums(_dateCounts);
      setNewAlbums(_newAlbums);
      setAlbumsGrowth(`${_albumsGrowth}%`);
      setAlbumCreators(_albumCreators);
      setNewCreators(_newCreators);
    }
  }, [dataSet, startDateAlbums, finishDateAlbums]);

  // Posts Report
  const [totalPosts, setTotalPosts] = useState(null);
  const [newPosts, setNewPosts] = useState(null);
  const [postsGrowth, setPostsGrowth] = useState(null);
  const [totalImages, setTotalImages] = useState(null);
  const [totalVideos, setTotalVideos] = useState(null);
  const [totalGifs, setTotalGifs] = useState(null);
  const [newImages, setNewImages] = useState(null);
  const [newVideos, setNewVideos] = useState(null);
  const [newGifs, setNewGifs] = useState(null);
  const [postDates, setPostDates] = useState([]);
  const [countDatePosts, setCountDatePosts] = useState([]);

  useEffect(() => {
    if ((dataSet, startDatePosts, finishDatePosts)) {
      let _posts = posts;
      let postsToStart = 0;

      let dates = [];

      let _totalImages = 0;
      let _totalVideos = 0;
      let _totalGifs = 0;

      let _newImages = 0;
      let _newVideos = 0;
      let _newGifs = 0;

      let sval = document.getElementById("startDatePosts").value;
      let fval = document.getElementById("finishDatePosts").value;

      let start = new Date(sval).toISOString().split("T")[0];
      let finish = new Date(fval).toISOString().split("T")[0];

      for (let i = 0; i < _posts.length; i++) {
        let date = _posts[i].date.toDate().toISOString().split("T")[0];
        //console.log("date:", date);
        let file_type = _posts[i].file_type;
        let type = file_type.split("/")[1];

        if (date >= start && date <= finish) {
          dates.push(date);

          //console.log("type:", type);
          if (type === "jpeg" || type === "png" || type === "jpg") {
            _newImages++;
          }
          if (type === "gif") {
            _newGifs++;
          }
          if (type === "mp4") {
            _newVideos++;
          }
        }

        if (type === "jpeg" || type === "png" || type === "jpg") {
          _totalImages++;
        }
        if (type === "gif") {
          _totalGifs++;
        }
        if (type === "mp4") {
          _totalVideos++;
        }

        if (date < start) {
          postsToStart++;
        }
      }

      dates.sort(function (a, b) {
        //console.log("a: ", a);
        //console.log("b: ", b);
        let a2 = new Date(a);
        let b2 = new Date(b);
        return a2 - b2;
      });

      let counts = {};
      dates.forEach(function (x) {
        counts[x] = (counts[x] || 0) + 1;
      });

      let uniqueDates = [...new Set(dates)];

      let _dateCounts = [];
      //console.log("start:", usersToStart);
      let count = postsToStart;
      for (let item in counts) {
        _dateCounts.push(count + counts[item]);
        count += counts[item];
      }

      /* let img = _newImages.length;
      let vid = _newVideos.length;
      let gf = _newGifs.length; */
      let _newPosts = dates.length;
      let _postsGrowth = Math.floor((_newPosts * 100) / totalPosts);

      //console.log("datesp:", dates);
      //console.log("countp:", _dateCounts);

      setPostDates(uniqueDates);
      setCountDatePosts(_dateCounts);

      setNewPosts(_newPosts);
      setPostsGrowth(`${_postsGrowth}%`);

      setNewImages(_newImages);
      setNewVideos(_newVideos);
      setNewGifs(_newGifs);

      setTotalImages(_totalImages);
      setTotalVideos(_totalVideos);
      setTotalGifs(_totalGifs);
    }
  }, [dataSet, startDatePosts, finishDatePosts]);

  return (
    <div className="containerReports bs">
      <div className="containerTitle">Reports</div>
      {dataSet && (
        <div className="contentReports">
          <div className="report">
            <div className="reportTitle">Users</div>
            <div className="reportContent">
              <div className="dates">
                <div>
                  Start Date:
                  <input
                    id="startDateUsers"
                    className="formInput"
                    type="date"
                    value={startDateUsers}
                    onChange={onChangeSDUsers}
                  />
                </div>
                <div>
                  Finish Date:
                  <input
                    id="finishDateUsers"
                    className="formInput"
                    type="date"
                    value={finishDateUsers}
                    onChange={onChangeFDUsers}
                  />
                </div>
              </div>
              <div className="data">
                <div className="info">
                  <div>
                    <div>Total Users:</div>
                    <label> {totalUsers}</label>
                  </div>
                  <div>
                    <div>New Users:</div>
                    <label> {newUsers}</label>
                  </div>
                  <div>
                    <div>Growth: </div>
                    <label>{usersGrowth}</label>
                  </div>
                </div>
                <div className="plotDiv">
                  <Plot
                    data={[
                      {
                        x: usersDates,
                        y: countDateUsers,
                        type: "scatter",
                        mode: "lines+markers",
                        marker: { color: "rgb(0, 200, 210)" }
                      }
                    ]}
                    layout={{
                      width: 320,
                      height: 240,
                      title: { text: "User Count", font: { size: "20" } },
                      paper_bgcolor: "rgb(31, 31, 31)",
                      plot_bgcolor: "rgb(41, 41, 41)",
                      margin: { b: 20, t: 50, r: 20, l: 25 },
                      font: {
                        color: "rgb(255,255,255)",
                        family: "'Lato', sans-serif"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="report">
            <div className="reportTitle">Albums</div>
            <div className="reportContent">
              <div className="dates">
                <div>
                  Start Date:
                  <input
                    id="startDateAlbums"
                    className="formInput"
                    type="date"
                    value={startDateAlbums}
                    onChange={onChangeSDAlbums}
                  />
                </div>
                <div>
                  Finish Date:
                  <input
                    id="finishDateAlbums"
                    className="formInput"
                    type="date"
                    value={finishDateAlbums}
                    onChange={onChangeFDAlbums}
                  />
                </div>
              </div>
              <div className="data">
                <div className="info">
                  <div>
                    <div>Total Albums: </div>
                    <label>{totalAlbums}</label>
                  </div>
                  <div>
                    <div>New Albums: </div>
                    <label>{newAlbums}</label>
                  </div>
                  <div>
                    <div>Growth: </div>
                    <label>{albumsGrowth}</label>
                  </div>
                  <br />
                  <div>
                    <div>Album Creators: </div>
                    <label>{albumCreators}</label>
                  </div>
                  <div>
                    <div>New Creators: </div>
                    <label>{newCreators}</label>
                  </div>
                </div>
                <div className="plotDiv">
                  <Plot
                    data={[
                      {
                        x: albumDates,
                        y: countDateAlbums,
                        type: "scatter",
                        mode: "lines+markers",
                        marker: { color: "rgb(0, 200, 210)" }
                      }
                    ]}
                    layout={{
                      width: 320,
                      height: 240,
                      title: { text: "Album Count", font: { size: "20" } },
                      paper_bgcolor: "rgb(31, 31, 31)",
                      plot_bgcolor: "rgb(41, 41, 41)",
                      margin: { b: 20, t: 50, r: 20, l: 25 },
                      font: {
                        color: "rgb(255,255,255)",
                        family: "'Lato', sans-serif"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="report">
            <div className="reportTitle">Posts</div>
            <div className="reportContent">
              <div className="dates">
                <div>
                  Start Date:
                  <input
                    id="startDatePosts"
                    className="formInput"
                    type="date"
                    value={startDatePosts}
                    onChange={onChangeSDPosts}
                  />
                </div>
                <div>
                  Finish Date:
                  <input
                    id="finishDatePosts"
                    className="formInput"
                    type="date"
                    value={finishDatePosts}
                    onChange={onChangeFDPosts}
                  />
                </div>
              </div>
              <div className="data">
                <div className="info">
                  <div>
                    <div>Total Posts:</div>
                    <label> {totalPosts}</label>
                  </div>
                  <div>
                    <div>New Posts:</div>
                    <label> {newPosts}</label>
                  </div>
                  <div>
                    <div>Growth:</div>
                    <label> {postsGrowth}</label>
                  </div>
                  <br />
                  <div>
                    <div>Total Images:</div>
                    <label> {totalImages}</label>
                  </div>
                  <div>
                    <div>New Images:</div>
                    <label> {newImages}</label>
                  </div>
                  <br />
                  <div>
                    <div>Total Videos:</div>
                    <label> {totalVideos}</label>
                  </div>
                  <div>
                    <div>New Videos:</div>
                    <label> {newVideos}</label>
                  </div>
                  <br />
                  <div>
                    <div>Total GIFs:</div>
                    <label> {totalGifs}</label>
                  </div>
                  <div>
                    <div>New GIFs:</div>
                    <label> {newGifs}</label>
                  </div>
                </div>
                <div className="plotDiv">
                  <Plot
                    data={[
                      {
                        x: postDates,
                        y: countDatePosts,
                        type: "scatter",
                        mode: "lines+markers",
                        marker: { color: "rgb(0, 200, 210)" }
                      }
                    ]}
                    layout={{
                      width: 320,
                      height: 240,
                      title: { text: "Post Count", font: { size: "20" } },
                      paper_bgcolor: "rgb(31, 31, 31)",
                      plot_bgcolor: "rgb(41, 41, 41)",
                      margin: { b: 20, t: 50, r: 20, l: 25 },
                      font: {
                        color: "rgb(255,255,255)",
                        family: "'Lato', sans-serif"
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {!dataSet && <div>Loading</div>}
    </div>
  );
}
