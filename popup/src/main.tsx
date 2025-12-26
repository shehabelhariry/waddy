import { createRoot } from "react-dom/client";
import "./index.css";
import { ConfigProvider, theme } from "antd";
import JobTracker from "./components/job-tracker/job-tracker";
import { BrowserRouter, Route, Routes } from "react-router";
import Settings from "./components/settings/settings";
import Layout from "./components/layout/layout";
import { ApiKeyProvider } from "./contexts/api-key-context";

createRoot(document.getElementById("root")!).render(
  <ApiKeyProvider>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: "#079fc0",
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
    </BrowserRouter>
  </ApiKeyProvider>
);
