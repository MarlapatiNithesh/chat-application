import React, { useRef, useState } from 'react';
import dp from "../assets/dp.png";
import { IoCameraOutline } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../main';
import { setUserData } from '../redux/userSlice';

function Profile() {
  const { userData } = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [name, setName] = useState(userData?.name || "");
  const [frontendImage, setFrontendImage] = useState(userData?.image || dp);
  const [backendImage, setBackendImage] = useState(null);
  const image = useRef();
  const [saving, setSaving] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
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

      setSaving(false);
      dispatch(setUserData(result.data));
      navigate("/");
    } catch (error) {
      console.log(error);
      setSaving(false);
    }
  };

  return (
    <div className='w-full h-[100vh] bg-slate-200 flex flex-col justify-center items-center gap-[20px]'>
      
      {/* Back arrow - only visible on mobile */}
      <div className='fixed top-[20px] left-[20px] cursor-pointer block md:hidden' onClick={() => navigate("/")}>
        <IoIosArrowRoundBack className='w-[50px] h-[50px] text-gray-600' />
      </div>

      {/* Profile Picture Section */}
      <div className='bg-white rounded-full border-4 border-[#20c7ff] shadow-gray-400 shadow-lg relative' onClick={() => image.current.click()}>
        <div className='w-[200px] h-[200px] rounded-full overflow-hidden flex justify-center items-center'>
          <img src={frontendImage} alt="Profile" className='h-[100%]' />
        </div>
        <div className='absolute bottom-4 text-gray-700 right-4 w-[35px] h-[35px] rounded-full bg-[#20c7ff] flex justify-center items-center shadow-gray-400 shadow-lg'>
          <IoCameraOutline className='text-gray-700 w-[25px] h-[25px]' />
        </div>
      </div>

      {/* Profile Form */}
      <form
        className='w-[95%] max-w-[500px] flex flex-col gap-[20px] items-center justify-center'
        onSubmit={handleProfile}
      >
        <input type="file" accept='image/*' ref={image} hidden onChange={handleImage} />
        <input
          type="text"
          placeholder="Enter your name"
          className='w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-white rounded-lg shadow-gray-400 shadow-lg text-gray-700 text-[19px]'
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <input
          type="text"
          readOnly
          className='w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-white rounded-lg shadow-gray-400 shadow-lg text-gray-400 text-[19px]'
          value={userData?.userName}
        />
        <input
          type="email"
          readOnly
          className='w-[90%] h-[50px] outline-none border-2 border-[#20c7ff] px-[20px] py-[10px] bg-white rounded-lg shadow-gray-400 shadow-lg text-gray-400 text-[19px]'
          value={userData?.email}
        />
        <button
          className='px-[20px] py-[10px] bg-[#20c7ff] rounded-2xl shadow-gray-400 shadow-lg text-[20px] w-[200px] mt-[20px] font-semibold hover:shadow-inner'
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}

export default Profile;
