import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { BiLogOutCircle } from "react-icons/bi";
import dp from "../assets/dp.png";
import axios from "axios";
import {
  setOtherUsers,
  setSearchData,
  setSelectedUser,
  setUserData,
} from "../redux/userSlice";
import { serverUrl } from "../main";

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
      console.log(error);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!input.trim()) return;
    try {
      const { data } = await axios.get(
        `${serverUrl}/api/user/search?query=${encodeURIComponent(input)}`,
        { withCredentials: true }
      );
      dispatch(setSearchData(data));
    } catch (error) {
      console.log(error);
    }
  }, [input]);

  useEffect(() => {
    if (input.trim()) {
      handleSearch();
    }
  }, [input, handleSearch]);

  const handleSelectUser = (user) => {
    dispatch(setSelectedUser(user));
    setInput("");
    setSearch(false);
  };

  return (
    <div
      className={`lg:w-[30%] w-full h-full bg-slate-200 relative overflow-hidden ${
        !selectedUser ? "block" : "hidden"
      } lg:block`}
    >
      {/* Logout Button */}
      <div
        className="w-[60px] h-[60px] rounded-full bg-[#20c7ff] text-gray-700 fixed bottom-5 left-3 shadow-lg flex items-center justify-center cursor-pointer"
        onClick={handleLogOut}
      >
        <BiLogOutCircle className="w-6 h-6" />
      </div>

      {/* Search Overlay */}
      {input.length > 0 && (
        <div className="absolute top-[250px] bg-white w-full h-[500px] z-[150] overflow-y-auto shadow-lg flex flex-col items-center gap-2 pt-5">
          {searchData?.map((user) => (
            <div
              key={user._id}
              className="w-[95%] h-[70px] px-3 flex items-center gap-5 hover:bg-[#78cae5] border-b-2 border-gray-400 cursor-pointer"
              onClick={() => handleSelectUser(user)}
            >
              <div className="relative">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden">
                  <img src={user.image || dp} alt="dp" className="h-full w-full object-cover" />
                </div>
                {onlineUsers?.includes(user._id) && (
                  <span className="absolute bottom-1 right-0 w-3 h-3 bg-[#3aff20] rounded-full shadow-md" />
                )}
              </div>
              <h1 className="text-gray-800 font-semibold text-lg">
                {user.name || user.userName}
              </h1>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="h-[300px] bg-[#20c7ff] rounded-b-[30%] shadow-lg px-5 flex flex-col justify-center gap-4">
        <h1 className="text-white text-2xl font-bold">chatly</h1>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Hi, {userData.name || "User"}</h2>
          <div
            className="w-[60px] h-[60px] bg-white rounded-full overflow-hidden shadow-lg cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <img src={userData.image || dp} alt="profile" className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4 overflow-x-auto py-4">
          {!search ? (
            <div
              className="w-[60px] h-[60px] bg-white rounded-full shadow-lg flex justify-center items-center cursor-pointer"
              onClick={() => setSearch(true)}
            >
              <IoIosSearch className="w-6 h-6" />
            </div>
          ) : (
            <form className="w-full h-[60px] bg-white rounded-full px-4 shadow-lg flex items-center gap-2">
              <IoIosSearch className="w-6 h-6" />
              <input
                type="text"
                className="flex-1 h-full outline-none text-lg"
                placeholder="Search users..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <RxCross2 className="w-6 h-6 cursor-pointer" onClick={() => { setInput(""); setSearch(false); }} />
            </form>
          )}

          {/* Show only online users if not searching */}
          {!search &&
            otherUsers?.map(
              (user) =>
                onlineUsers?.includes(user._id) && (
                  <div
                    key={user._id}
                    className="relative w-[60px] h-[60px] rounded-full bg-white shadow-lg cursor-pointer"
                    onClick={() => dispatch(setSelectedUser(user))}
                  >
                    <img src={user.image || dp} alt="dp" className="h-full w-full rounded-full" />
                    <span className="absolute bottom-1 right-0 w-3 h-3 bg-[#3aff20] rounded-full shadow-md" />
                  </div>
                )
            )}
        </div>
      </div>

      {/* All Users */}
      <div className="h-[calc(100%-370px)] overflow-y-auto flex flex-col items-center gap-5 mt-5 px-2 pb-20">
        {otherUsers?.map((user) => (
          <div
            key={user._id}
            className="w-full max-w-[95%] h-[60px] bg-white rounded-full shadow-lg px-4 flex items-center gap-5 cursor-pointer hover:bg-[#78cae5]"
            onClick={() => dispatch(setSelectedUser(user))}
          >
            <div className="relative">
              <div className="w-[60px] h-[60px] rounded-full overflow-hidden">
                <img src={user.image || dp} alt="dp" className="h-full w-full object-cover" />
              </div>
              {onlineUsers?.includes(user._id) && (
                <span className="absolute bottom-1 right-0 w-3 h-3 bg-[#3aff20] rounded-full shadow-md" />
              )}
            </div>
            <h1 className="text-gray-800 font-semibold text-lg">
              {user.name || user.userName}
            </h1>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SideBar;
