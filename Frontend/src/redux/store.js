import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import messageSlice from "./messageSlice";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ["userData", "otherUsers", "selectedUser", "onlineUsers", "unreadCounts", "lastActivity"], // only persist these keys in user slice state
};

const messagePersistConfig = {
  key: "message",
  storage,
  whitelist: ["messages"], // adjust according to your messageSlice state keys
};

const persistedUserReducer = persistReducer(userPersistConfig, userSlice);
const persistedMessageReducer = persistReducer(messagePersistConfig, messageSlice);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    message: persistedMessageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist actions you want to ignore for serializableCheck
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, "user/setSocket"],
        ignoredPaths: ["user.socket"],
      },
    }),
});

export const persistor = persistStore(store);
