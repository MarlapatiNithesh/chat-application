import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearUserData } from "../redux/userSlice";
import { serverUrl } from "../main";
import { setmessages } from "../redux/messageSlice";

const useGetMessages = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.user);


  useEffect(() => {
    if (!selectedUser) {
      dispatch(setmessages([])); // Clear messages if no user is selected
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/message/get/${selectedUser._id}`,
          { withCredentials: true }
        );
        setmessages(response.data.messages); // Dispatch the messages array to the Redux store
        // Dispatch only the messages array
      } catch (error) {
        dispatch(clearUserData());
        console.error("Error fetching messages:", error);
      }
    };

    fetchUser();
  }, [selectedUser, dispatch]);
};

export default useGetMessages;
