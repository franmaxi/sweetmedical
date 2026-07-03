import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  App as AntApp,
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Select,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const { Title, Text } = Typography;

export default function Login() {
  return (
    <AntApp>
      <LoginInner />
    </AntApp>
  );
}

function LoginInner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { message } = AntApp.useApp();
  const [cargando, setCargando] = useState(false);

  const from = location.state?.from?.pathname ?? "/";

  const onFinish = async (values) => {
    setCargando(true);
    try {
      await login({ nombreUsuario: values.nombreUsuario, password: values.password });
      message.success(t("login.success"));
      navigate(from, { replace: true });
    } catch {
      message.error(t("login.errorCredenciales"));
    } finally {
      setCargando(false);
    }
  };

  return (
    <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <Layout.Content
        style={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(24px, 5vw, 48px) 16px",
        }}
      >
        <Card style={{ width: "100%", maxWidth: 420 }} bordered>
          <Space direction="vertical" size={4} style={{ marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>{t("login.titulo")}</Title>
            <Text type="secondary">{t("login.subtitulo")}</Text>
          </Space>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="nombreUsuario"
              label={t("login.labelUsuario")}
              rules={[{ required: true, message: t("login.errorUsuario") }]}
            >
              <Input prefix={<UserOutlined />} placeholder={t("login.placeholderUsuario")} autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label={t("login.labelPassword")}
              rules={[{ required: true, message: t("login.errorPassword") },
                { min: 8, message: t("login.errorPasswordLength") }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder={t("login.placeholderPassword")} autoComplete="current-password" />
            </Form.Item>
            <Form.Item
              name="role"
              label={t("login.labelRol")}
              initialValue="usuario"
            >
              <Select
                options={[
                  { value: "usuario", label: t("login.rolePaciente") },
                  { value: "medico", label: t("login.roleMedico") },
                  { value: "admin", label: t("login.roleAdmin") },
                ]}
              />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={cargando}>
              {t("login.botonIngresar")}
            </Button>
          </Form>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Text type="secondary">{t("login.noCuenta")} </Text>
            <Link to="/registro">{t("login.registrate")}</Link>
          </div>
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
