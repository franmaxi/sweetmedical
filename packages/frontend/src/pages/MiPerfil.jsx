import { Card, Typography, Descriptions, Button, Space } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

export default function MiPerfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 16px" }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={2} style={{ marginBottom: 4 }}>
              {t("perfil.titulo") || "Mi perfil"}
            </Title>
            <Text type="secondary">
              {t("perfil.descripcion") || "Administrá tus datos de cuenta y sesión."}
            </Text>
          </div>

          <Descriptions bordered column={{ xs: 1, md: 2 }}>
            <Descriptions.Item label={t("perfil.nombre") || "Nombre"}>
              {user.displayName || user.username}
            </Descriptions.Item>
            <Descriptions.Item label={t("perfil.usuario") || "Usuario"}>
              {user.username}
            </Descriptions.Item>
            <Descriptions.Item label={t("perfil.rol") || "Rol"}>
              {user.role === "usuario" ? "Paciente" : user.role || "Usuario"}
            </Descriptions.Item>
          </Descriptions>

          <Button danger onClick={handleLogout}>
            {t("navbar.logout")}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
