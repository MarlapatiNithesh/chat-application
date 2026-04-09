import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import useGetCurrentUser from "./customHook/getCurrentUser";
import useGetOtherUsers from "./customHook/getOtherUsers";
import { setOnlineUsers, setSocket } from "./redux/userSlice";
import { initializeSocket, closeSocket } from "./socket";

import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

function App() {
  const dispatch = useDispatch();
  const { userData, loading } = useSelector((state) => state.user);

  useGetCurrentUser();
  useGetOtherUsers();

  useEffect(() => {
    if (!userData?._id) {
      closeSocket();
      return;
    }

    const socketInstance = initializeSocket(userData._id);

    if (!socketInstance) {
      console.error("Socket initialization failed: socketInstance is null");
      return;
    }

    console.log("Socket initialized:", socketInstance);
    console.log("Socket ID:", socketInstance.id);
    dispatch(setSocket(socketInstance));

    socketInstance.on("getOnlineUsers", (users) => {
      dispatch(setOnlineUsers(users));
    });

    return () => {
      if (socketInstance) {
        socketInstance.off("getOnlineUsers"); // Remove listener on cleanup
      }
      closeSocket();
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
        element={!userData ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/signup"
        element={!userData ? <SignUp /> : <Navigate to="/profile" replace />}
      />
      <Route
        path="/"
        element={userData ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/profile"
        element={userData ? <Profile /> : <Navigate to="/signup" replace />}
      />
    </Routes>
  );
}

export default App;
