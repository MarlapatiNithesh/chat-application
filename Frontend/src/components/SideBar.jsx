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
} from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

function SideBar() {
  const { userData, otherUsers, selectedUser, onlineUsers, searchData } =
    useSelector((state) => state.user);
  const [search, setSearch] = useState(false);
  const [input, setInput] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      dispatch(setUserData(null));
      dispatch(setOtherUsers(null));
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const handlesearch = async () => {
    try {
      if (!input) return;
      const result = await axios.get(
        `${serverUrl}/api/user/search?query=${input}`,
        { withCredentials: true }
      );
      dispatch(setSearchData(result.data));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    handlesearch();
  }, [input]);

  // Sidebar visibility: 
  // On large screens, sidebar always visible
  // On smaller screens, hide sidebar if a user is selected to maximize chat area
  const isSidebarVisible = window.innerWidth >= 1024 || !selectedUser;

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
          {searchData?.length === 0 ? (
            <p className="text-center text-gray-500">No users found</p>
          ) : (
            searchData?.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-4 p-2 hover:bg-[#78cae5] cursor-pointer rounded-lg"
                onClick={() => {
                  dispatch(setSelectedUser(user));
                  setInput("");
                  setSearch(false);
                }}
              >
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white flex justify-center items-center">
                  <img
                    src={user.image || dp}
                    alt={user.name || user.userName}
                    className="object-cover w-full h-full"
                  />
                  {onlineUsers?.includes(user._id) && (
                    <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 shadow-md shadow-gray-500"></span>
                  )}
                </div>
                <h2 className="font-semibold text-gray-800 text-lg">
                  {user.name || user.userName}
                </h2>
              </div>
            ))
          )}
        </div>
      )}

      {/* Sidebar Header */}
      <div className="bg-[#20c7ff] rounded-b-[30%] shadow-lg shadow-gray-400 p-5 flex flex-col justify-center px-6">
        <h1 className="text-white font-bold text-3xl mb-4 select-none">chatly</h1>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-gray-800 font-bold text-2xl select-none">
            Hii, {userData?.name || "user"}
          </h2>
          <button
            aria-label="Go to profile"
            className="w-14 h-14 rounded-full overflow-hidden shadow-lg shadow-gray-500 bg-white cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <img
              src={userData?.image || dp}
              alt="User profile"
              className="object-cover w-full h-full"
            />
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {!search && (
            <button
              aria-label="Open search"
              className="w-14 h-14 rounded-full bg-white shadow-lg shadow-gray-500 flex justify-center items-center cursor-pointer"
              onClick={() => setSearch(true)}
            >
              <IoIosSearch className="w-6 h-6" />
            </button>
          )}
          {search && (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 bg-white rounded-full px-5 py-3 shadow-lg shadow-gray-500 flex-grow"
            >
              <IoIosSearch className="w-6 h-6 text-gray-600" />
              <input
                type="text"
                placeholder="Search users..."
                className="flex-grow outline-none border-0 text-base"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                autoFocus
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  setSearch(false);
                  setInput("");
                }}
              >
                <RxCross2 className="w-6 h-6 cursor-pointer text-gray-600" />
              </button>
            </form>
          )}

          {/* Online users preview (only when not searching) */}
          {!search &&
            otherUsers
              ?.filter((user) => onlineUsers?.includes(user._id))
              .map((user) => (
                <button
                  key={user._id}
                  onClick={() => dispatch(setSelectedUser(user))}
                  className="relative w-14 h-14 rounded-full overflow-hidden bg-white shadow-lg shadow-gray-500 flex justify-center items-center cursor-pointer"
                  aria-label={`Chat with ${user.name || user.userName}`}
                >
                  <img
                    src={user.image || dp}
                    alt={user.name || user.userName}
                    className="object-cover w-full h-full"
                  />
                  <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 shadow-md shadow-gray-500"></span>
                </button>
              ))}
        </div>
      </div>

      {/* Users List */}
      <div className="h-[calc(100vh-20rem)] overflow-y-auto mt-5 px-6 flex flex-col gap-4">
        {otherUsers?.map((user) => (
          <button
            key={user._id}
            onClick={() => dispatch(setSelectedUser(user))}
            className="flex items-center gap-4 bg-white rounded-full shadow-lg shadow-gray-500 p-2 hover:bg-[#78cae5] transition-colors duration-200"
            aria-label={`Select chat with ${user.name || user.userName}`}
          >
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-white shadow-lg shadow-gray-500 flex justify-center items-center">
              <img
                src={user.image || dp}
                alt={user.name || user.userName}
                className="object-cover w-full h-full"
              />
              {onlineUsers?.includes(user._id) && (
                <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-green-500 shadow-md shadow-gray-500"></span>
              )}
            </div>
            <h2 className="text-gray-800 font-semibold text-lg">
              {user.name || user.userName}
            </h2>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
