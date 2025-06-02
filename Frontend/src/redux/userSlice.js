import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  loading: true,
  otherUsers: null,
  selectedUser: null,
  socket: null,
  onlineUsers: null,
  searchData: null,
  lastActivity: {},  // added this for last activity timestamps
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.loading = false;
    },
    clearUserData: (state) => {
      state.userData = null;
      state.loading = false;
    },
    setOtherUsers: (state, action) => {
      state.otherUsers = action.payload;
      state.loading = false;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
      state.loading = false;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
      state.loading = false;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
      state.loading = false;
    },
    setSearchData: (state, action) => {
      state.searchData = action.payload;
      state.loading = false;
    },
    setLastActivity: (state, action) => {
      state.lastActivity = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setUserData,
  clearUserData,
  setOtherUsers,
  setSelectedUser,
  setSocket,
  setOnlineUsers,
  setSearchData,
  setLastActivity,
} = userSlice.actions;

export default userSlice.reducer;
