import { useState, StrictMode } from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import campaigns from './campaigns';
import Calendar from "./Calendar";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <Calendar campaigns={campaigns} />
  </StrictMode>,
  rootElement
);
