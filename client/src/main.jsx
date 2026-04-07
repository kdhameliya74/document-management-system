import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "@/App.jsx";
import { Provider } from "react-redux";
import { store } from "@/shared/store/store.js";

import { fetchUser } from "@/features/auth/store/auth.slice.js";
store.dispatch(fetchUser());

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
