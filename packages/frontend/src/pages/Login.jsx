import { useState } from "react";
<<<<<<< HEAD
import { useNavigate, Link, useLocation } from "react-router-dom";
=======
import { useNavigate, Link } from "react-router-dom";
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
import {
  App as AntApp,
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
<<<<<<< HEAD
  Select,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
=======
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
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
<<<<<<< HEAD
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { message } = AntApp.useApp();
  const [cargando, setCargando] = useState(false);

  const from = location.state?.from?.pathname ?? "/";

  const onFinish = async (values) => {
    setCargando(true);
    await login({ username: values.nombreUsuario, role: values.role ?? "usuario" });
    setTimeout(() => {
      setCargando(false);
      message.success(t("login.success"));
      navigate(from, { replace: true });
=======
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [cargando, setCargando] = useState(false);

  // Mock: solo simula el flujo, no valida contra ningún backend.
  const onFinish = () => {
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      message.success("Sesión iniciada (mock)");
      navigate("/");
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
    }, 400);
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
<<<<<<< HEAD
            <Title level={3} style={{ margin: 0 }}>{t("login.titulo")}</Title>
            <Text type="secondary">{t("login.subtitulo")}</Text>
=======
            <Title level={3} style={{ margin: 0 }}>Iniciar sesión</Title>
            <Text type="secondary">Ingresá con tu usuario para gestionar tus turnos.</Text>
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
          </Space>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="nombreUsuario"
<<<<<<< HEAD
              label={t("login.labelUsuario")}
              rules={[{ required: true, message: t("login.errorUsuario") }]}
            >
              <Input prefix={<UserOutlined />} placeholder={t("login.placeholderUsuario")} autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label={t("login.labelPassword")}
              rules={[{ required: true, message: t("login.errorPassword") }]}
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
=======
              label="Usuario"
              rules={[{ required: true, message: "Ingresá tu usuario" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="ej. ana.garcia" autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Contraseña"
              rules={[{ required: true, message: "Ingresá tu contraseña" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="••••" autoComplete="current-password" />
            </Form.Item>
            <Button type="primary" htmlType="submit" block loading={cargando}>
              Ingresar
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
            </Button>
          </Form>

          <div style={{ marginTop: 16, textAlign: "center" }}>
<<<<<<< HEAD
            <Text type="secondary">{t("login.noCuenta")} </Text>
            <Link to="/registro">{t("login.registrate")}</Link>
=======
            <Text type="secondary">¿No tenés cuenta? </Text>
            <Link to="/registro">Registrate</Link>
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
          </div>
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
