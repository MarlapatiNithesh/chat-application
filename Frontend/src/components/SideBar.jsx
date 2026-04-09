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
  const { userData, otherUsers, selectedUser, onlineUsers = [], searchData } =
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
      console.log(error);
    }
  };

  const handleSearch = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/user/search?query=${input}`,
        { withCredentials: true }
      );
      dispatch(setSearchData(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (input) handleSearch();
  }, [input]);

  const displayName = (user) => user?.name || user?.userName || "Unknown";

  return (
    <div
      className={`lg:w-[30%] w-full h-full overflow-hidden lg:block bg-gray-100 relative ${
        !selectedUser ? "block" : "hidden"
      }`}
    >
      {/* Logout Button */}
      <div
        className="w-14 h-14 rounded-full fixed bottom-5 left-3 z-50 bg-[#20c7ff] flex justify-center items-center shadow-md text-white cursor-pointer"
        onClick={handleLogOut}
      >
        <BiLogOutCircle className="w-6 h-6" />
      </div>

      {/* Search Results */}
      {input.length > 0 && (
        <div className="absolute top-[250px] bg-white w-full max-h-[500px] overflow-y-auto pt-4 z-40 shadow-lg">
          {searchData?.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-4 px-4 py-3 border-b hover:bg-blue-100 cursor-pointer"
              onClick={() => {
                dispatch(setSelectedUser(user));
                setInput("");
                setSearch(false);
              }}
            >
              <div className="relative w-12 h-12">
                <img
                  src={user.image || dp}
                  alt="profile"
                  className="rounded-full w-full h-full object-cover"
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <p className="font-medium text-gray-800">{displayName(user)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Header Section */}
      <div className="w-full h-[280px] bg-[#20c7ff] rounded-b-[30%] shadow-md px-5 py-6 text-white">
        <h1 className="font-bold text-2xl mb-2">chatly</h1>
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-xl">Hi, {displayName(userData)}</h2>
          <div
            onClick={() => navigate("/profile")}
            className="w-14 h-14 bg-white rounded-full overflow-hidden shadow cursor-pointer"
          >
            <img
              src={userData.image || dp}
              alt="profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Search or Online User Avatars */}
        <div className="flex items-center gap-3 overflow-x-auto mt-5 pb-2">
          {!search ? (
            <button
              className="w-14 h-14 bg-white rounded-full flex justify-center items-center shadow"
              onClick={() => setSearch(true)}
            >
              <IoIosSearch className="w-6 h-6 text-gray-700" />
            </button>
          ) : (
            <div className="flex items-center bg-white w-full rounded-full px-4 py-2 shadow">
              <IoIosSearch className="text-xl text-gray-600" />
              <input
                className="flex-1 outline-none px-2 text-gray-800"
                placeholder="Search users..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <RxCross2
                className="text-xl cursor-pointer"
                onClick={() => {
                  setInput("");
                  setSearch(false);
                }}
              />
            </div>
          )}

          {!search &&
            otherUsers?.map(
              (user) =>
                onlineUsers.includes(user._id) && (
                  <div
                    key={`online-${user._id}`}
                    className="relative w-14 h-14 rounded-full bg-white shadow overflow-hidden cursor-pointer"
                    onClick={() => dispatch(setSelectedUser(user))}
                  >
                    <img
                      src={user.image || dp}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  </div>
                )
            )}
        </div>
      </div>

      {/* All Users List */}
      <div className="mt-5 px-4 space-y-3 overflow-y-auto h-[calc(100%-280px)] pb-10">
        {otherUsers?.map((user) => (
          <div
            key={`chat-${user._id}`}
            className="flex items-center gap-4 bg-white p-3 rounded-full shadow hover:bg-blue-100 cursor-pointer"
            onClick={() => dispatch(setSelectedUser(user))}
          >
            <div className="relative w-14 h-14">
              <img
                src={user.image || dp}
                alt="profile"
                className="rounded-full w-full h-full object-cover"
              />
              {onlineUsers.includes(user._id) && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              )}
            </div>
            <p className="font-semibold text-gray-800 text-lg">
              {displayName(user)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
