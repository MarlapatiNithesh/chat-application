import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearUserData, setOtherUsers } from "../redux/userSlice";
import { serverUrl } from "../main";

const useGetOtherUsers = () => {
  const dispatch = useDispatch();
  const { otherUsers, userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/user/others`,
          { withCredentials: true }
        );
        dispatch(setOtherUsers(response.data));
      } catch (error) {
        dispatch(clearUserData()); // reset user & stop loading
        console.error("Error fetching other users:", error);
      }
    };

    // Only fetch if userData exists and otherUsers is not loaded yet
    if (userData?._id && !otherUsers) {
      fetchUser();
    }
  }, [userData, otherUsers, dispatch]);
};

export default useGetOtherUsers;
