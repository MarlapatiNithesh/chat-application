import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useGetCurrentUser from "./customHook/getCurrentUser";
import useGetOtherUsers from "./customHook/getOtherUsers";
import { io } from "socket.io-client";
import { serverUrl } from "./main";
import { setOnlineUsers, setSocket } from "./redux/userSlice";

import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
  useGetCurrentUser();
  useGetOtherUsers();

  const dispatch = useDispatch();
  const { userData, loading, socket } = useSelector((state) => state.user);


  useEffect(() => {
    // If no user, close socket and clear from redux
    if (!userData?._id) {
      if (socket) {
        socket.close();
        dispatch(setSocket(null));
      }
      return; // exit early if no user
    }

    // Create new socket connection with userId query param
    const socketio = io(serverUrl, {
      query: { userId: userData._id },
    });

    // Save socket instance in Redux store
    dispatch(setSocket(socketio));

    // Listen to online users event
    socketio.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    // Cleanup on unmount or when userData changes
    return () => {
      socketio.close();
      dispatch(setSocket(null));
    };
  }, [userData, dispatch]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <p className="text-xl font-semibold text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!userData ? <Login /> : <Navigate to="/" />}
      />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/profile" />}
      />
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to="/login" />}
      />
      <Route
        path="/profile"
        element={userData ? <Profile /> : <Navigate to="/signup" />}
      />
    </Routes>
  );
}

export default App;
