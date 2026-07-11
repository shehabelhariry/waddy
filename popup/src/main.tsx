import { createRoot } from "react-dom/client";
import "./index.css";
import { ConfigProvider, theme } from "antd";
import JobTracker from "./components/job-tracker/job-tracker";

import { MemoryRouter as Router, Route, Routes } from "react-router";
import Settings from "./components/settings/settings";
import Layout from "./components/layout/layout";
import { ApiKeyProvider } from "./contexts/api-key-context";

createRoot(document.getElementById("root")!).render(
  <ApiKeyProvider>
    <Router>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "#603297",
            colorInfo: "#603297",
            colorLink: "#603297",
            colorText: "#0a083b",
            colorTextHeading: "#0a083b",
            borderRadius: 8,
          },
        }}
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<JobTracker />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </ConfigProvider>
    </Router>
  </ApiKeyProvider>
);
