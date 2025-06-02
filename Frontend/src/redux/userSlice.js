import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  otherUsers: [],
  selectedUser: null,
  onlineUsers: [],           // Make sure default is an empty array
  unreadCounts: {},
  lastActivity: {},
  searchData: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData(state, action) {
      state.userData = action.payload;
    },
    setOtherUsers(state, action) {
      state.otherUsers = action.payload || [];
    },
    setSelectedUser(state, action) {
      state.selectedUser = action.payload;
    },
    setOnlineUsers(state, action) {
      state.onlineUsers = Array.isArray(action.payload) ? action.payload : [];
    },
    setUnreadCounts(state, action) {
      state.unreadCounts = action.payload || {};
    },
    setLastActivity(state, action) {
      state.lastActivity = action.payload || {};
    },
    setSearchData(state, action) {
      state.searchData = action.payload || [];
    },
  },
});

export const {
  setUserData,
  setOtherUsers,
  setSelectedUser,
  setOnlineUsers,
  setUnreadCounts,
  setLastActivity,
  setSearchData,
} = userSlice.actions;

export default userSlice.reducer;
