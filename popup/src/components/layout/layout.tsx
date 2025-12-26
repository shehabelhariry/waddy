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
      <div className="side-nav">
        <NavLink
          className={({ isActive, isPending }) =>
            linkClass({ isActive, isPending })
          }
          to="/"
        >
          <HomeOutlined size={40} style={{ fontSize: 24 }} />
        </NavLink>
        <NavLink
          className={({ isActive, isPending }) =>
            linkClass({ isActive, isPending })
          }
          to="/settings"
        >
          <SettingOutlined size={40} style={{ fontSize: 24 }} />
        </NavLink>
      </div>
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
