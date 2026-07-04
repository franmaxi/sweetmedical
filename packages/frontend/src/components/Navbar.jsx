import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout, Menu, Space, Button, Drawer, Grid } from "antd";
import { useAuth } from "../context/AuthContext";
import {
  ScheduleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  HomeOutlined,
  SearchOutlined,
  MenuOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import NotificacionesDropdown from "./NotificacionesDropdown";
import SelectorIdioma from "./SelectorIdioma";
import MiPerfilDropdown from "./MiPerfilDropdown";

const { Header } = Layout;
const { useBreakpoint } = Grid;


const Logo = () => (
  <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
    <span
      style={{
        width: 36, height: 36, borderRadius: "50%", background: "#be123c",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={22} height={22}>
        <path
          fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
          d="M 78 30 C 78 13 22 13 22 50 C 22 82 78 82 78 50 C 78 28 35 28 35 55 C 35 73 62 73 62 50 C 62 40 50 40 50 52"
        />
      </svg>
    </span>
    <span style={{ fontSize: 18, fontWeight: 700, color: "#be123c" }}>Sweet Medical</span>
  </Link>
);

const AuthButtons = ({ user, onLogout }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (user) {
    return <MiPerfilDropdown />;
  }

  return (
    <Space size={8}>
      <Button onClick={() => navigate("/login")}>{t("navbar.ingresar")}</Button>
      <Button type="primary" onClick={() => navigate("/registro")}>{t("navbar.registrarse")}</Button>
    </Space>
  );
};

const DrawerAuth = ({ user, onLogout, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  if (user) {
    return (
      <Button block danger onClick={onLogout}>
        {t("navbar.logout")}
      </Button>
    );
  }

  return (
    <>
      <Button block onClick={() => handleNavigate("/login")}>{t("navbar.ingresar")}</Button>
      <Button block type="primary" onClick={() => handleNavigate("/registro")}>{t("navbar.registrarse")}</Button>
    </>
  );
};


export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, logout } = useAuth();

  const esMobile = !screens.md;

  const handleLogout = () => { logout(); navigate("/"); };
  const handleLogoutDesdeDrawer = () => { setDrawerOpen(false); handleLogout(); };



const allItems = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: <Link to="/">{t("navbar.inicio")}</Link>,
    roles: ["*"],
  },
  {
    key: "/buscar",
    icon: <SearchOutlined />,
    label: <Link to="/buscar">{t("navbar.buscar")}</Link>,
    roles: ["usuario"],
  },
  {
    key: "/mis-turnos",
    icon: <ScheduleOutlined />,
    label: <Link to="/mis-turnos">{t("navbar.misTurnos")}</Link>,
    roles: ["usuario"],
  },
  {
    key: "/agenda",
    icon: <CalendarOutlined />,
    label: <Link to="/agenda">{t("navbar.agenda")}</Link>,
    roles: ["medico"],
  },
  {
    key: "/disponibilidades",
    icon: <ClockCircleOutlined />,
    label: <Link to="/disponibilidades">{t("navbar.disponibilidades")}</Link>,
    roles: ["medico"],
  },
  {
    key: "/mis-servicios",
    icon: <ClockCircleOutlined />,
    label: <Link to="/mis-servicios">{t("navbar.misServicios")}</Link>,
    roles: ["medico"],
  }
];

const rol = user?.role ?? "guest";
const items = allItems.filter(({ roles }) => 
  roles.includes("*") || roles.includes(rol));

  return (
    <Header
      style={{
        background: "#fff", 
        borderBottom: "1px solid #f0f0f0",
        padding: "0 clamp(12px, 4vw, 32px)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        position: "sticky",
        top: 0,
        zIndex: 100,
        height: 64,
      }}
    >
      <Logo/>

      {!esMobile && (
        <Menu
          mode="horizontal"
          items={items}
          selectedKeys={[location.pathname]}
          style={{ flex: 1, borderBottom: "none", background: "transparent", minWidth: 0 }}
        />
      )}

      <Space size="small" style={{ marginLeft: "auto" }}>
        <SelectorIdioma />
        <NotificacionesDropdown />
        {esMobile
          ? <Button type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
          : <AuthButtons user={user} onLogout={handleLogout} />
        }
      </Space>

      <Drawer
        title={t("navbar.menu")}
        placement="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={260}
      >
        <Menu
          mode="vertical"
          items={items}
          selectedKeys={[location.pathname]}
          onClick={() => setDrawerOpen(false)}
          style={{ borderInlineEnd: "none" }}
        />
        <Space direction="vertical" style={{ width: "100%" }}>
          <DrawerAuth
            user={user}
            onLogout={handleLogoutDesdeDrawer}
            onClose={() => setDrawerOpen(false)}
          />
        </Space>
      </Drawer>
    </Header>
  );
}