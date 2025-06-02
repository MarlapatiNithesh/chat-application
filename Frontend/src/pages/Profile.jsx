import React, { useRef, useState } from "react";
import dp from "../assets/dp.png";
import { IoCameraOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../main";
import { setUserData } from "../redux/userSlice";

function Profile() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState(userData?.name || "");
  const [frontendImage, setFrontendImage] = useState(userData?.image || dp);
  const [backendImage, setBackendImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const imageInputRef = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBackendImage(file);
      setFrontendImage(URL.createObjectURL(file));
    }
  };

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.put(`${serverUrl}/api/user/profile`, formData, {
        withCredentials: true,
      });

      dispatch(setUserData(result.data)); // Update redux state
      navigate("/"); // Redirect to sidebar view
    } catch (error) {
      console.error("Profile update failed:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center px-4 py-8">
      <button
        aria-label="Go back"
        onClick={() => navigate("/")}
        className="fixed top-5 left-5 p-2 rounded-full hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-[#20c7ff]"
      >
        <IoIosArrowRoundBack className="w-10 h-10 text-gray-700" />
      </button>

      <div
        className="relative mb-8 cursor-pointer rounded-full border-4 border-[#20c7ff] shadow-lg shadow-gray-400"
        onClick={() => imageInputRef.current.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && imageInputRef.current.click()}
        aria-label="Change profile picture"
      >
        <div className="w-44 h-44 md:w-52 md:h-52 rounded-full overflow-hidden flex justify-center items-center bg-white">
          <img
            src={frontendImage}
            alt={`${name || userData?.userName}'s profile`}
            className="object-cover w-full h-full"
            draggable={false}
          />
        </div>
        <div className="absolute bottom-3 right-3 w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#20c7ff] flex justify-center items-center shadow-md shadow-gray-400">
          <IoCameraOutline className="w-6 h-6 text-gray-700" />
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        hidden
        onChange={handleImage}
      />

      <form
        onSubmit={handleProfile}
        className="w-full max-w-md bg-white rounded-xl p-6 shadow-lg flex flex-col gap-6"
        noValidate
      >
        <label htmlFor="name" className="block font-semibold text-gray-700">
          Name
          <input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full px-4 py-3 border-2 border-[#20c7ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#20c7ff] text-gray-800 text-lg"
            required
          />
        </label>

        <label htmlFor="username" className="block font-semibold text-gray-400">
          Username
          <input
            id="username"
            type="text"
            value={userData?.userName || ""}
            readOnly
            className="mt-2 w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-400 text-lg cursor-not-allowed"
          />
        </label>

        <label htmlFor="email" className="block font-semibold text-gray-400">
          Email
          <input
            id="email"
            type="email"
            value={userData?.email || ""}
            readOnly
            className="mt-2 w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-400 text-lg cursor-not-allowed"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className={`mt-4 w-full py-3 rounded-xl font-semibold text-white shadow-lg transition ${
            saving
              ? "bg-[#a1d9ff] cursor-not-allowed"
              : "bg-[#20c7ff] hover:bg-[#0da5e5] active:bg-[#187bbd]"
          }`}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </main>
  );
}

export default Profile;
