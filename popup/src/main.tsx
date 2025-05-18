import { createRoot } from "react-dom/client";
import "./index.css";
import JobTracker from "./JobTracker/JobTracker";
import { ConfigProvider, theme } from "antd";

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
