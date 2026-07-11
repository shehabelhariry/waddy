import { HomeOutlined, SettingOutlined } from "@ant-design/icons";
import { NavLink, Outlet } from "react-router";
import Logo from "../../assets/logo.png";

function linkClass({
  isActive,
  isPending,
}: {
  isActive: boolean;
  isPending: boolean;
}) {
  return isPending ? "pending" : isActive ? "active" : "";
}

export default function Layout() {
  return (
    <div className="main-layout">
      <nav className="top-nav">
        <NavLink
          className={({ isActive, isPending }) =>
            linkClass({ isActive, isPending })
          }
          to="/"
        >
          <HomeOutlined style={{ fontSize: 22 }} />
        </NavLink>
        <NavLink
          className={({ isActive, isPending }) =>
            linkClass({ isActive, isPending })
          }
          to="/settings"
        >
          <SettingOutlined style={{ fontSize: 22 }} />
        </NavLink>
      </nav>
      <div className="main-content">
        <div className="header">
          <div className="logo-container">
            <img
              className="waddy-logo"
              src={Logo}
              alt="Waddy Job applications logo"
            />
          </div>
        </div>
        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
