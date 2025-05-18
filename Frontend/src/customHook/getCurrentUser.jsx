import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUserData, clearUserData, setLoading } from "../redux/userSlice";
import { serverUrl } from "../main";

const useGetCurrentUser = () => {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUser = async () => {
      dispatch(setLoading(true)); // start loading
      try {
        const response = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
        });
        dispatch(setUserData(response.data));
      } catch (error) {
        dispatch(clearUserData()); // reset user
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
