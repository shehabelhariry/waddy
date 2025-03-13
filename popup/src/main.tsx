import { createRoot } from "react-dom/client";
import "./index.css";
import JobTracker from "./JobTracker/JobTracker";

createRoot(document.getElementById("root")!).render(<JobTracker />);
