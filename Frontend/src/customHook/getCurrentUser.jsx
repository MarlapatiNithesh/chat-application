import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUserData, clearUserData } from "../redux/userSlice";
import { serverUrl } from "../main";


const useGetCurrentUser = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/user/current`,
          { withCredentials: true }
        );
        dispatch(setUserData(response.data));
      } catch (error) {
        dispatch(clearUserData()); // reset user & stop loading
        console.error("Error fetching current user:", error);
      } finally {
        dispatch(setLoading(false)); // stop loading
      }
    };

    if (!userData) {
      fetchUser();
    }
  }, [dispatch, userData]);
};

export default useGetCurrentUser;
