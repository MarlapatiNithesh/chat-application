import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  otherUsers: [],
  selectedUser: null,
  onlineUsers: [],
  unreadCounts: {},
  lastActivity: {},
  searchData: [],
  socket: null, // ✅ added socket state
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData(state, action) {
      state.userData = action.payload;
    },
    clearUserData(state) {
      state.userData = null;
      state.selectedUser = null;
      state.otherUsers = [];
      state.onlineUsers = [];
      state.unreadCounts = {};
      state.lastActivity = {};
      state.searchData = [];
      state.socket = null; // ✅ clear socket on logout
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
    setSocket(state, action) {
      state.socket = action.payload;
    },
  },
});

export const {
  setUserData,
  clearUserData,
  setOtherUsers,
  setSelectedUser,
  setOnlineUsers,
  setUnreadCounts,
  setLastActivity,
  setSearchData,
  setSocket, // ✅ now exported properly
} = userSlice.actions;

export default userSlice.reducer;
