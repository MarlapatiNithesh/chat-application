import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userData: null,
  otherUsers: [],
  selectedUser: null,
  onlineUsers: [],
  searchData: null,
  socket: null,
  loading: false,  // Added loading state
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setOtherUsers: (state, action) => {
      state.otherUsers = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setSearchData: (state, action) => {
      state.searchData = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setLoading: (state, action) => {  // New loading reducer
      state.loading = action.payload;
    },
    clearUserData: (state) => {
      state.userData = null;
      state.otherUsers = [];
      state.selectedUser = null;
      state.onlineUsers = [];
      state.searchData = null;
      state.socket = null;
      state.loading = false;
    },
  },
});

export const {
  setUserData,
  setOtherUsers,
  setSelectedUser,
  setOnlineUsers,
  setSearchData,
  setSocket,
  setLoading,   // Export setLoading here
  clearUserData,
} = userSlice.actions;

export default userSlice.reducer;
