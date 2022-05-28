import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  Timestamp,
  query,
  where,
  QuerySnapshot,
  get,
  deleteDoc,
  orderBy,
  updateDoc,
  getDoc
} from "firebase/firestore";

// Fundamental stuff for Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDqCxroe4UMDaMGSXdEiMmW37NGE14A4wM",
  authDomain: "gallewe-7aa00.firebaseapp.com",
  projectId: "gallewe-7aa00",
  storageBucket: "gallewe-7aa00.appspot.com",
  messagingSenderId: "527693798814",
  appId: "1:527693798814:web:4d32d591a8e14841874a8f",
  measurementId: "G-865QFMNFRT"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const firestore = getFirestore(app);

// Collections within the databse
const postsCol = collection(firestore, "posts");
const usersCol = collection(firestore, "users");
const albumsCol = collection(firestore, "albums");
const albumsUsersCol = collection(firestore, "albums_users");

/* 
Checks if an specific item exists within a collection, and if it does,
returns a list with all the matches
col = Collection
data = Category that is going to be searched within the collection
value = Value to match with the data
*/
async function thingExists(col, data, value) {
  //console.log("value:", value);
  //console.log("data:", data);
  const q = query(col, where(data, "==", value));
  let result = [];

  return getDocs(q)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        //console.log("doc.data: ", doc.data());
        result.push(doc.data());
      });
      //console.log(result);
      if (result.length > 0) {
        return result;
      }
      return false;
    })
    .catch((error) => {
      return error;
    });
}

// Searchs for an user
export async function getUser(data, userID) {
  let result = await thingExists(usersCol, data, userID);
  return result;
}

// Creates a new user in the users collection
export async function signupUser(username, pwd, email) {
  let creation = Timestamp.now();
  let docRef = doc(usersCol, username);

  try {
    setDoc(docRef, {
      username: username,
      pwd: pwd,
      email: email,
      creation: creation,
      role: "user",
      pfp: `pfp_${username}`
    });
    return true;
  } catch (error) {
    alert("Murió\n" + error);
    return false;
  }
}

export async function deleteUser(user) {
  let userDoc = doc(usersCol, user);

  const qAlbumsJoined = query(albumsUsersCol, where("user", "==", user));
  let albumsJoined = await getDocs(qAlbumsJoined);
  console.log("albumsJoined: ", albumsJoined.docs.length);

  if (albumsJoined.docs.length > 0) {
    for (let i = 0; i < albumsJoined.docs.length; i++) {
      let joinedDoc = albumsJoined.docs[i].ref;
      //console.log("joinedDoc: ", joinedDoc);
      await deleteDoc(joinedDoc).catch((error) => {
        alert("Error Deleting Relations: ", error);
        return false;
      });
    }
  }

  let albumsCreated = await thingExists(albumsCol, "creator", user);

  console.log("albumsCreated:", albumsCreated);
  if (albumsCreated.length > 0) {
    for (let i = 0; i < albumsCreated.length; i++) {
      let albumDoc = doc(albumsCol, albumsCreated[i].album_id);

      let qUsers = query(albumsUsersCol, where("creator", "==", user));
      let users = await getDocs(qUsers);
      //console.log("users: ", users.docs.length);

      if (users.docs.length > 0) {
        for (let i = 0; i < users.docs.length; i++) {
          let relation = users.docs[i].ref;
          //console.log("relation: ", relation);
          await deleteDoc(relation).catch((error) => {
            alert("Error Deleting Album Relations: ", error);
            return false;
          });
        }
      }

      //console.log("albumDoc: ", albumDoc);
      await deleteDoc(albumDoc).catch((error) => {
        alert("Error Deleting Albums: ", error);
        return false;
      });
    }
  }

  await deleteDoc(userDoc).catch((error) => {
    alert("Error: ", error);
    return false;
  });

  return true;
}

// Loads an image within an specified <img> element
export function loadImage(col, imageName, imgId) {
  let imageRef = ref(storage, `${col}/${imageName}`);
  let img = document.getElementById(imgId);
  console.log("img: ", img);

  if (img) {
    getDownloadURL(imageRef)
      .then((url) => {
        img.src = url;
      })
      .catch((error) => {
        img.src = require("./img/pfp_default.png");
      });
  }
}

/* 
Uploads an image into the profilePics storage folder
If there is already a profile picture, it is deleted first
and then the new one is uploaded 
*/
export async function uploadPFP(imageName, file) {
  let subirRef = ref(storage, "profilePics/" + imageName);

  deleteObject(subirRef)
    .then(() => {
      console.log("pfp replaced");
    })
    .catch((error) => {
      console.log("pfp first time");
    });

  return uploadBytes(subirRef, file)
    .then((storageRef) => {
      return true;
    })
    .catch((e) => {
      alert("Murió\n" + e);
      return false;
    });
}

/*
Gets the relation between an user and the albums it is joined to,
from the albums_users collection
*/
export async function getUserAlbums(user) {
  let result = thingExists(albumsUsersCol, "user", user);
  return result;
}

// Gets an specific album from thee albums collection
export async function getAlbum(data, album) {
  let result = thingExists(albumsCol, data, album);
  return result;
}
export async function getAlbumUsers(album_id) {
  let result = thingExists(albumsUsersCol, "album_id", album_id);
  return result;
}

/*
Creates a relation between an user and the album on the
albums_users collection
*/
export async function joinAlbum(album_id, album_name, user, creator, role) {
  let relationRef = doc(albumsUsersCol);

  console.log("enter join");

  await setDoc(relationRef, {
    album_id: album_id,
    album_name: album_name,
    user: user,
    creator: creator,
    role: role
  });

  await updateMembers(album_id);

  alert("Album Joined");
}

export async function leaveAlbum(album_id, user) {
  let qAlbums_users = query(
    albumsUsersCol,
    where("album_id", "==", album_id),
    where("user", "==", user)
  );

  const albums_usersSnapshot = await getDocs(qAlbums_users);
  //console.log("snapshot: ", albums_usersSnapshot.docs[0].ref);
  await deleteDoc(albums_usersSnapshot.docs[0].ref);

  await updateMembers(album_id);

  alert("Album Left");
}

async function updateMembers(album_id) {
  let albumRef = doc(albumsCol, album_id);
  let albumData = await thingExists(albumsUsersCol, "album_id", album_id);
  let albumMembers = albumData.length;

  await updateDoc(albumRef, {
    members: albumMembers
  }).catch((error) => {
    alert("Error: ", error);
    return false;
  });
}

export async function createPost(file, fileName, user, album, title, fileType) {
  let uploadRef = ref(storage, `posts/${fileName}`);
  let creation = Timestamp.now();
  let postsDoc = doc(postsCol);

  await uploadBytes(uploadRef, file)
    .then((snapshot) => {
      console.log("File Uploaded");
    })
    .catch((error) => {
      alert("Upload Error: ", error);
      return false;
    });

  let url = await getDownloadURL(ref(storage, `posts/${fileName}`)).catch(
    (error) => {
      alert("Upload Error: ", error);
      return false;
    }
  );
  //console.log(url);

  await setDoc(postsDoc, {
    post_id: fileName,
    album_id: album,
    poster: user,
    date: creation,
    file_url: url,
    title: title,
    file_type: fileType
  }).catch((error) => {
    alert("Upload Error: ", error);
    return false;
  });

  await updatePosts(album);

  return true;
}

export async function deletePost(post_id) {
  let q = query(postsCol, where("post_id", "==", post_id));
  let post = await thingExists(postsCol, "post_id", post_id);

  let album_id = post[0].album_id;

  const snapshot = await getDocs(q);
  await deleteDoc(snapshot.docs[0].ref).catch((error) => {
    alert("Error: ", error);
    return false;
  });

  let fileRef = ref(storage, `posts/${post_id}`);

  // Delete the file
  await deleteObject(fileRef).catch((error) => {
    alert("Error: ", error);
    return false;
  });

  await updatePosts(album_id);

  return true;
}

async function updatePosts(album_id) {
  let albumRef = doc(albumsCol, album_id);
  let albumData = await thingExists(postsCol, "album_id", album_id);
  let albumPosts = albumData.length;

  await updateDoc(albumRef, {
    posts: albumPosts
  }).catch((error) => {
    alert("Error: ", error);
    return false;
  });
}

/* 
Creates a new album on the albums collection, and sets the relation
between the creator and the new album
*/
export async function createAlbum(album_name, creator, privacy, album_id) {
  let creation_date = Timestamp.now();
  let albumRef = doc(albumsCol, album_id);
  let iconName = `icon_${album_id}`;

  await setDoc(albumRef, {
    album_id: album_id,
    album_name: album_name,
    creation_date: creation_date,
    creator: creator,
    members: 1,
    posts: 0,
    privacy: privacy,
    icon: iconName
  })
    .then(async () => {
      await joinAlbum(album_id, album_name, creator, creator, "creator");
    })
    .catch((error) => {
      alert("Error");
      return;
    });

  alert("Album Created");
}

/* 
Deletes an album from the albums collection and deletes
all the relations between the users and the album
*/
export async function deleteAlbum(album_id) {
  let albumDoc = doc(albumsCol, album_id);
  let qAlbums_users = query(albumsUsersCol, where("album_id", "==", album_id));

  await deleteDoc(albumDoc);
  alert("Album Deleted");

  const albums_usersSnapshot = await getDocs(qAlbums_users);
  albums_usersSnapshot.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    //console.log(doc.ref);
    deleteDoc(doc.ref);
  });
  alert("Relations Deleted");
}

export async function getPosts(album_id) {
  //console.log("album_id: ", album_id);
  let result = thingExists(postsCol, "album_id", album_id);
  return result;
}

export async function getRelation(user, album) {
  const q = query(
    albumsUsersCol,
    where("user", "==", user),
    where("album_id", "==", album)
  );
  let result = [];

  return getDocs(q)
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        //console.log("doc.data: ", doc.data());
        result.push(doc.data());
      });
      //console.log(result);
      if (result.length > 0) {
        return result;
      }
      return false;
    })
    .catch((error) => {
      return error;
    });
}

export async function changeRole(user, newRole, album_id) {
  let q = query(
    albumsUsersCol,
    where("user", "==", user),
    where("album_id", "==", album_id)
  );

  let snapshot = await getDocs(q);
  await updateDoc(snapshot.docs[0].ref, {
    role: newRole
  }).catch((error) => {
    alert("Error: ", error);
    return false;
  });

  return true;
}

export async function kickUser(user, album_id) {
  let q = query(
    albumsUsersCol,
    where("user", "==", user),
    where("album_id", "==", album_id)
  );

  const snapshot = await getDocs(q);
  if (snapshot.docs[0]) {
    await deleteDoc(snapshot.docs[0].ref).catch((error) => {
      alert("Error: ", error);
      return false;
    });
  }

  await updateMembers(album_id);

  return true;
}

export async function uploadIcon(album_id, file) {
  let imageName = `icon_${album_id}`;
  let subirRef = ref(storage, "albumIcons/" + imageName);

  deleteObject(subirRef)
    .then(() => {
      console.log("icon replaced");
    })
    .catch((error) => {
      console.log("icon first time");
    });

  return uploadBytes(subirRef, file)
    .then((storageRef) => {
      return true;
    })
    .catch((e) => {
      alert("Murió\n" + e);
      return false;
    });
}

export async function getAllUsers() {
  let snapshot = await getDocs(usersCol);
  let users = [];
  for (let i = 0; i < snapshot.docs.length; i++) {
    users.push(snapshot.docs[i].data());
  }

  return users;
}

export async function getAllPosts() {
  let snapshot = await getDocs(postsCol);
  let posts = [];
  for (let i = 0; i < snapshot.docs.length; i++) {
    posts.push(snapshot.docs[i].data());
  }

  return posts;
}

export async function getAllAlbums() {
  let snapshot = await getDocs(albumsCol);
  let albums = [];
  for (let i = 0; i < snapshot.docs.length; i++) {
    albums.push(snapshot.docs[i].data());
  }

  return albums;
}
