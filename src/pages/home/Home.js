import "./Home.css";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useContext } from "react";
import { context } from "../../context";

export function Home() {
  const homeContext = useContext(context);

  //console.log("context: ", context);
  //console.log("homeContext: ", homeContext.user);

  if (homeContext.user) {
    return (
      <div className="container homeContainer bs mt-65">
        <div className="containerTitle">Welcome Back</div>
        <div className="content">
          <div>{homeContext.user.username}</div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="container homeContainer bs mt-65">
        <div className="containerTitle">Welcome</div>
        <div className="content homeContent">
          Please log in or create your account
        </div>
      </div>
    );
  }
}
