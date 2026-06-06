import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  App as AntApp,
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
} from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
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
            <Title level={3} style={{ margin: 0 }}>Iniciar sesión</Title>
            <Text type="secondary">Ingresá con tu usuario para gestionar tus turnos.</Text>
          </Space>

          <Form layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="nombreUsuario"
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
            </Button>
          </Form>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Text type="secondary">¿No tenés cuenta? </Text>
            <Link to="/registro">Registrate</Link>
          </div>
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
