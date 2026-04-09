import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setUserData, clearUserData, setLoading } from "../redux/userSlice";
import { serverUrl } from "../main";

const useGetCurrentUser = () => {
  const dispatch = useDispatch();
  const userData = useSelector((state) => state.user.userData);

  useEffect(() => {
    if (userData !== null) return;

    dispatch(setLoading(true));

    const source = axios.CancelToken.source();

    const fetchUser = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/user/current`, {
          withCredentials: true,
          cancelToken: source.token,
        });
        dispatch(setUserData(response.data));
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled", error.message);
        } else {
          dispatch(clearUserData());
          console.error("Error fetching current user:", error);
        }
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchUser();

    return () => {
      source.cancel("Operation canceled by the user.");
    };
  }, [dispatch, userData]);
};

export default useGetCurrentUser;
