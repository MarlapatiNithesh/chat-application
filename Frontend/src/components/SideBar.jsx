import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import dp from "../assets/dp.png";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { BiLogOutCircle } from "react-icons/bi";
import { serverUrl } from "../main";
import axios from "axios";
import {
  setOtherUsers,
  setSearchData,
  setSelectedUser,
  setUserData,
  setOnlineUsers,
  setUnreadCounts,
  setLastActivity,
} from "../redux/userSlice";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

function SideBar() {
  const {
    userData,
    otherUsers,
    selectedUser,
    onlineUsers,
    unreadCounts,
    lastActivity,
    searchData,
  } = useSelector((state) => state.user);

  const [search, setSearch] = useState(false);
  const [input, setInput] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);

  // Socket connection and listeners
  useEffect(() => {
    if (!userData) {
      // If userData not available, redirect to login
      navigate("/login");
      return;
    }

    // Initialize socket
    const newSocket = io(serverUrl, {
      query: { userId: userData._id },
      transports: ["websocket"],
      reconnectionAttempts: 5,
      timeout: 5000,
    });

    setSocket(newSocket);

    newSocket.on("connect_error", (err) => {
      console.error("Socket connect_error:", err);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    newSocket.on("getOnlineUsers", ({ users, unreadCounts, lastActivity }) => {
      dispatch(setOnlineUsers(Array.isArray(users) ? users : []));
      dispatch(setUnreadCounts(unreadCounts || {}));
      dispatch(setLastActivity(lastActivity || {}));
    });

    newSocket.on("unreadCountsUpdate", (newUnreadCounts) => {
      dispatch(setUnreadCounts(newUnreadCounts || {}));
    });

    newSocket.on("lastActivityUpdate", (newLastActivity) => {
      dispatch(setLastActivity(newLastActivity || {}));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userData, dispatch, navigate]);

  // Fetch all other users once userData is loaded
  useEffect(() => {
    if (!userData) return;

    const fetchOtherUsers = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/user/others`, {
          withCredentials: true,
        });
        // Filter out current user from the list if included
        const filteredUsers = res.data.filter((user) => user._id !== userData._id);
        dispatch(setOtherUsers(filteredUsers));
      } catch (error) {
        console.error("Error fetching users:", error);
        // If unauthorized, logout user and redirect to login
        if (error.response && error.response.status === 401) {
          dispatch(setUserData(null));
          navigate("/login");
        }
      }
    };

    fetchOtherUsers();
  }, [userData, dispatch, navigate]);

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      dispatch(setOtherUsers([]));
      dispatch(setSelectedUser(null));
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    try {
      if (!input.trim()) {
        dispatch(setSearchData([]));
        return;
      }
      const result = await axios.get(
        `${serverUrl}/api/user/search?query=${encodeURIComponent(input.trim())}`,
        { withCredentials: true }
      );
      dispatch(setSearchData(result.data));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [input]);

  // When selecting a user reset unread count for that chat
  const handleSelectUser = (user) => {
    dispatch(setSelectedUser(user));
    if (socket && userData) {
      socket.emit("readMessages", { chatWith: user._id });
    }
    setSearch(false);
    setInput("");
  };

  // Show sidebar on large screens or when no user is selected (mobile)
  const isSidebarVisible = window.innerWidth >= 1024 || !selectedUser;

  // Sort users by lastActivity descending, fallback to name
  const sortedUsers = otherUsers
    ? [...otherUsers].sort((a, b) => {
        const aTime = lastActivity?.[a._id] || 0;
        const bTime = lastActivity?.[b._id] || 0;
        if (bTime !== aTime) return bTime - aTime;
        return (a.name || a.userName).localeCompare(b.name || b.userName);
      })
    : [];

  return (
    <div
      className={`${
        isSidebarVisible ? "block" : "hidden"
      } lg:block lg:w-1/3 w-full h-full bg-slate-200 relative`}
    >
      {/* Logout Button */}
      <button
        aria-label="Logout"
        className="fixed bottom-5 left-3 z-50 w-14 h-14 rounded-full bg-[#20c7ff] flex justify-center items-center shadow-lg shadow-gray-500 text-gray-700 cursor-pointer"
        onClick={handleLogOut}
      >
        <BiLogOutCircle className="w-6 h-6" />
      </button>

      {/* Search Result Dropdown */}
      {input.length > 0 && search && (
        <div className="absolute top-60 left-0 right-0 max-h-[400px] bg-white overflow-y-auto shadow-lg z-40 px-4 py-3 flex flex-col gap-3 rounded-b-lg">
          {searchData.length === 0 ? (
            <p className="text-center text-gray-500">No users found</p>
          ) : (
            searchData.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-4 p-2 hover:bg-[#78cae5] cursor-pointer rounded-lg"
                onClick={() => handleSelectUser(user)}
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white flex justify-center items-center">
                  <img
                    src={user.image || dp}
                    alt={user.name || user.userName}
                    className="object-cover w-full h-full"
                  />
                  {Array.isArray(onlineUsers) && onlineUsers.includes(user._id) && (
                    <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 shadow-md shadow-gray-500"></span>
                  )}
                </div>
                <h2 className="font-semibold text-gray-800 text-lg">
                  {user.name || user.userName}
                </h2>
                {unreadCounts?.[userData?._id]?.[user._id] > 0 && (
                  <span className="ml-auto bg-red-500 text-white rounded-full px-2 py-1 text-xs font-semibold">
                    {unreadCounts[userData._id][user._id]}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Sidebar Header */}
      <div className="w-full h-[70px] flex justify-between items-center px-6 shadow-md shadow-gray-400 sticky top-0 left-0 bg-white z-20">
        <div className="flex items-center gap-5">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white">
            <img
              src={userData?.image || dp}
              alt={userData?.name || userData?.userName}
              className="object-cover w-full h-full"
            />
            {Array.isArray(onlineUsers) && onlineUsers.includes(userData?._id) && (
              <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 shadow-md shadow-gray-500"></span>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            {userData?.name || userData?.userName}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="Search"
            className="text-gray-800 hover:text-blue-600 text-3xl"
            onClick={() => setSearch(!search)}
          >
            {search ? <RxCross2 /> : <IoIosSearch />}
          </button>
        </div>
      </div>

      {/* Search Input */}
      {search && (
        <div className="w-full px-5 mt-4">
          <input
            aria-label="Search users"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-md border border-gray-400 px-4 py-2"
            placeholder="Search by name or username"
            autoFocus
          />
        </div>
      )}

      {/* Users List */}
      <div className="max-h-[calc(100vh-160px)] overflow-y-auto mt-5">
        {sortedUsers.map((user) => (
          <div
            key={user._id}
            className={`flex items-center gap-4 p-3 hover:bg-[#78cae5] cursor-pointer rounded-lg ${
              selectedUser?._id === user._id ? "bg-[#59bdf2]" : ""
            }`}
            onClick={() => handleSelectUser(user)}
          >
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white flex justify-center items-center">
              <img
                src={user.image || dp}
                alt={user.name || user.userName}
                className="object-cover w-full h-full"
              />
              {Array.isArray(onlineUsers) && onlineUsers.includes(user._id) && (
                <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 shadow-md shadow-gray-500"></span>
              )}
            </div>
            <h2 className="font-semibold text-gray-800 text-lg">
              {user.name || user.userName}
            </h2>
            {unreadCounts?.[userData?._id]?.[user._id] > 0 && (
              <span className="ml-auto bg-red-500 text-white rounded-full px-2 py-1 text-xs font-semibold">
                {unreadCounts[userData._id][user._id]}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
