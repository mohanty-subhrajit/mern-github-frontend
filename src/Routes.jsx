import React, { useEffect } from "react";
import {useNavigate, useRoutes} from 'react-router-dom'

// Pages List
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/user/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import IssueList from "./components/issues/IssueList";
import CreateIssue from "./components/issues/CreateIssue";
import IssueDetail from "./components/issues/IssueDetail";
import Starred from "./components/dashboard/Starred";
import CreateRepository from "./components/repository/CreateRepository";
import CommitHistory from "./components/commits/CommitHistory";
import CommitDetail from "./components/commits/CommitDetail";

// Auth Context
import { useAuth } from "./authContext";

const ProjectRoutes = ()=>{
    const {currentUser, setCurrentUser} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        const userIdFromStorage = localStorage.getItem("userId");

        if(userIdFromStorage && !currentUser){
            setCurrentUser(userIdFromStorage);
        }

        if(!userIdFromStorage && !["/auth", "/signup"].includes(window.location.pathname))
        {
            navigate("/auth");
        }

        if(userIdFromStorage && window.location.pathname=='/auth'){
            navigate("/");
        }
    }, [currentUser, navigate, setCurrentUser]);

    let element = useRoutes([
        {
            path:"/",
            element:<Dashboard/>
        },
        {
            path:"/auth",
            element:<Login/>
        },
        {
            path:"/signup",
            element:<Signup/>
        },
        {
            path:"/profile",
            element:<Profile/>
        },
        {
            path:"/starred",
            element:<Starred/>
        },
        {
            path:"/create-repository",
            element:<CreateRepository/>
        },
        {
            path:"/repo/:repoId/commits",
            element:<CommitHistory/>
        },
        {
            path:"/commit/:commitId",
            element:<CommitDetail/>
        },
        {
            path:"/repo/:repoId/issues",
            element:<IssueList/>
        },
        {
            path:"/repo/:repoId/issues/new",
            element:<CreateIssue/>
        },
        {
            path:"/issue/:issueId",
            element:<IssueDetail/>
        }
    ]);

    return element;
}

export default ProjectRoutes;