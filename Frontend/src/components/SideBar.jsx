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

// Utility Functions
const getImage = (url) => (url && url.trim() !== "" ? url : dp);
const getDisplayName = (user) => user?.name || user?.userName;

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

  const handlesearch = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/user/search?query=${encodeURIComponent(input)}`,
        { withCredentials: true }
      );
      dispatch(setSearchData(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  // Debounced Search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (input) handlesearch();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [input]);

  return (
    <aside
      className={`lg:w-[30%] w-full h-full overflow-hidden lg:block bg-slate-200 relative ${
        !selectedUser ? "block" : "hidden"
      }`}
    >
      {/* Search Results */}
      {input.length > 0 && (
        <div className="flex absolute top-[250px] bg-white w-full h-[500px] overflow-y-auto items-center pt-[20px] flex-col gap-[10px] z-[150] shadow-lg">
          {searchData?.map((user) => (
            <button
              key={user._id}
              className="w-[95%] h-[70px] flex items-center gap-[20px] px-[10px] hover:bg-[#78cae5] border-b-2 border-gray-400 cursor-pointer"
              onClick={() => {
                dispatch(setSelectedUser(user));
                setInput("");
                setSearch(false);
              }}
            >
              <div className="relative rounded-full bg-white flex justify-center items-center">
                <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex justify-center items-center">
                  <img
                    src={getImage(user.image)}
                    alt="user profile"
                    className="h-full"
                    onError={(e) => (e.target.src = dp)}
                  />
                </div>
                {onlineUsers?.includes(user._id) && (
                  <span className="w-[12px] h-[12px] rounded-full absolute bottom-[6px] right-[-1px] bg-[#3aff20] shadow-md"></span>
                )}
              </div>
              <h1 className="text-gray-800 font-semibold text-[20px] truncate">
                {getDisplayName(user)}
              </h1>
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="w-full h-[300px] bg-[#20c7ff] rounded-b-[30%] shadow-lg flex flex-col justify-center px-[20px]">
        <h1 className="text-white font-bold text-[25px]">chatly</h1>
        <div className="w-full flex justify-between items-center">
          <h1 className="text-gray-800 font-bold text-[25px]">
            Hii, {getDisplayName(userData) || "user"}
          </h1>
        </div>

        {/* Search + Online Users */}
        <div className="w-full flex items-center gap-[20px] overflow-y-auto py-[18px]">
          {!search ? (
            <button
              className="w-[60px] h-[60px] mt-[10px] rounded-full overflow-hidden flex justify-center items-center bg-white shadow-lg"
              onClick={() => setSearch(true)}
            >
              <IoIosSearch className="w-[25px] h-[25px]" />
            </button>
          ) : (
            <form
              onSubmit={(e) => e.preventDefault()}
              className="w-full h-[60px] bg-white shadow-lg flex items-center gap-[10px] mt-[10px] rounded-full overflow-hidden px-[20px] relative"
            >
              <IoIosSearch className="w-[25px] h-[25px]" />
              <input
                type="text"
                placeholder="search users..."
                className="w-full h-full p-[10px] text-[17px] outline-none border-0"
                onChange={(e) => setInput(e.target.value)}
                value={input}
              />
              <RxCross2
                className="w-[25px] h-[25px] cursor-pointer"
                onClick={() => {
                  setSearch(false);
                  setInput("");
                }}
              />
            </form>
          )}

          {!search &&
            otherUsers?.map(
              (user) =>
                onlineUsers?.includes(user._id) && (
                  <button
                    key={user._id}
                    className="relative rounded-full shadow-lg bg-white flex justify-center items-center mt-[10px] cursor-pointer"
                    onClick={() => dispatch(setSelectedUser(user))}
                  >
                    <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex justify-center items-center">
                      <img
                        src={getImage(user.image)}
                        alt="online user"
                        className="h-full"
                        onError={(e) => (e.target.src = dp)}
                      />
                    </div>
                    <span className="w-[12px] h-[12px] rounded-full absolute bottom-[6px] right-[-1px] bg-[#3aff20] shadow-md"></span>
                  </button>
                )
            )}
        </div>
      </div>

      {/* All Users */}
      <div className="w-full h-[calc(100%-420px)] overflow-auto pb-[100px] flex flex-col gap-[20px] items-center mt-[20px]">
        {otherUsers?.map((user) => (
          <button
            key={user._id}
            className="w-[95%] h-[60px] flex items-center gap-[20px] shadow-lg bg-white rounded-full hover:bg-[#78cae5] cursor-pointer"
            onClick={() => dispatch(setSelectedUser(user))}
          >
            <div className="relative rounded-full shadow-lg bg-white flex justify-center items-center mt-[10px]">
              <div className="w-[60px] h-[60px] rounded-full overflow-hidden flex justify-center items-center">
                <img
                  src={getImage(user.image)}
                  alt="user"
                  className="h-full"
                  onError={(e) => (e.target.src = dp)}
                />
              </div>
              {onlineUsers?.includes(user._id) && (
                <span className="w-[12px] h-[12px] rounded-full absolute bottom-[6px] right-[-1px] bg-[#3aff20] shadow-md"></span>
              )}
            </div>
            <h1 className="text-gray-800 font-semibold text-[20px] truncate">
              {getDisplayName(user)}
            </h1>
          </button>
        ))}
      </div>

      {/* Fixed Profile & Logout Buttons */}
      <div className="w-full absolute bottom-0 left-0 px-[10px] py-[15px] flex justify-between items-center bg-slate-200">
        <button
          className="w-[60px] h-[60px] rounded-full overflow-hidden flex justify-center items-center bg-white shadow-lg"
          onClick={() => navigate("/profile")}
        >
          <img
            src={getImage(userData?.image)}
            alt="your profile"
            className="h-full"
            onError={(e) => (e.target.src = dp)}
          />
        </button>

        <button
          className="w-[60px] h-[60px] rounded-full flex justify-center items-center bg-[#20c7ff] text-gray-700 shadow-lg"
          onClick={handleLogOut}
        >
          <BiLogOutCircle className="w-[25px] h-[25px]" />
        </button>
      </div>
    </aside>
  );
}

export default SideBar;
