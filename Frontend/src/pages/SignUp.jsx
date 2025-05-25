import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { serverUrl } from "../main";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import useGetOtherUsers from "../customHook/getOtherUsers";

function SignUp() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [show, setShow] = useState(false);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { refetch: refetchOtherUsers } = useGetOtherUsers();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!userName || !email || !password) {
      setErr("All fields are required");
      return;
    }

    setLoading(true);
    setErr("");

    try {
      const response = await axios.post(
        `${serverUrl}/api/auth/signup`,
        { userName, email, password },
        { withCredentials: true }
      );

      dispatch(setUserData(response.data));
       if (refetchOtherUsers) {
        refetchOtherUsers();
      }
      navigate("/profile");

      setUserName("");
      setEmail("");
      setPassword("");
    } catch (error) {
      console.log(error);
      setErr(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-200 flex items-center justify-center">
      <div className="w-full max-w-[500px] h-[600px] bg-white rounded-lg shadow-lg flex flex-col gap-8">
        <div className="w-full h-[200px] bg-[#20c7ff] rounded-b-[30%] shadow-md flex items-center justify-center">
          <h1 className="text-gray-600 font-bold text-3xl">
            Welcome to <span className="text-white">chatly</span>
          </h1>
        </div>

        <form
          onSubmit={handleSignUp}
          className="w-full flex flex-col gap-5 items-center px-4"
          autoComplete="off"
        >
          {/* Prevent browser autofill */}
          <input type="text" name="hidden" autoComplete="username" className="hidden" />
          <input type="password" name="hidden" autoComplete="new-password" className="hidden" />

          <input
            type="text"
            name="username"
            placeholder="Username"
            autoComplete="off-new"
            className="input-style"
            onChange={(e) => setUserName(e.target.value)}
            value={userName}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="off-new"
            className="input-style"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
          <div className="input-style relative">
            <input
              type={show ? "text" : "password"}
              name="password"
              placeholder="Password"
              autoComplete="new-password"
              className="w-full h-full outline-none bg-white text-gray-700 text-lg appearance-none
                         [&::-ms-reveal]:hidden [&::-ms-clear]:hidden
                         [&::-webkit-credentials-auto-fill-button]:hidden
                         [&::-webkit-textfield-decoration-container]:hidden"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />
            <span
              className="absolute top-2.5 right-5 text-[#20c7ff] text-sm font-semibold cursor-pointer"
              onClick={() => setShow((prev) => !prev)}
            >
              {show ? "Hide" : "Show"}
            </span>
          </div>

          {err && <p className="text-red-500 text-sm">* {err}</p>}

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-[#20c7ff] rounded-2xl shadow-md text-lg w-52 mt-4 font-semibold hover:shadow-inner disabled:opacity-60"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>

          <p className="text-sm cursor-pointer mt-2" onClick={() => navigate("/login")}>
            Already have an account?{" "}
            <span className="text-[#20c7ff] font-bold">Login</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
