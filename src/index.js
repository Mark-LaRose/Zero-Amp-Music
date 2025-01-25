import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux"; // Import Redux Provider
import store from "./redux/store"; // Import the Redux store

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    {/* Wrap App in the Redux Provider to make the store available */}
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);