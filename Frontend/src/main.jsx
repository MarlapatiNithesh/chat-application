import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

import { store } from "./redux/store.js"; // removed persistor import

// Dynamically route to local backend during development, but Render backend in production
export const serverUrl = import.meta.env.MODE === "development" 
    ? "http://localhost:3000" 
    : "https://chat-application-4wcv.onrender.com";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
