import { createRoot } from "react-dom/client";
import "./index.css";
import { ConfigProvider, theme } from "antd";
import JobTracker from "./JobTracker/JobTracker";

createRoot(document.getElementById("root")!).render(
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      token: {
        colorPrimary: "#08f4d3",
      },
    }}
  >
    <JobTracker />
  </ConfigProvider>
);
