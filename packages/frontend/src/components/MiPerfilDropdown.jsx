import { Button, Dropdown } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

export default function MiPerfilDropdown() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const menu = {
    items: [
      {
        key: "perfil",
        label: t("perfil.titulo") || "Mi perfil",
        icon: <UserOutlined />,
        onClick: () => navigate("/mi-perfil"),
      },
      {
        key: "logout",
        label: t("navbar.logout") || "Cerrar sesión",
        icon: <LogoutOutlined />,
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
      <Button
        type="text"
        style={{
          color: "#111827",
          fontWeight: 600,
          padding: "0 8px",
          border: "1px solid #d9d9d9",
          borderRadius: 8,
          background: "#fff",
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <UserOutlined />
          {user.displayName || user.username}
        </span>
      </Button>
    </Dropdown>
  );
}
