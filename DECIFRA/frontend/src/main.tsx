import React from "react";
import ReactDOM  from 'react-dom/client';
import Home from "./pages/index";
import "./styles/index.css";

const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(<Home />);

