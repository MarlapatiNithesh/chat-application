import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearUserData } from "../redux/userSlice";
import { setMessages } from "../redux/messageSlice"; // ✅ Correct import (uppercase M)
import { serverUrl } from "../main";

const useGetMessages = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (!selectedUser) {
      dispatch(setMessages([])); // ✅ Clear messages when no user is selected
      return;
    }

    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `${serverUrl}/api/message/get/${selectedUser._id}`,
          { withCredentials: true }
        );
        dispatch(setMessages(response.data.messages)); // ✅ Properly dispatch messages
      } catch (error) {
        console.error("Error fetching messages:", error);
        dispatch(clearUserData()); // Log user out on failure
      }
    };

    fetchMessages();
  }, [selectedUser, dispatch]);
};

export default useGetMessages;
