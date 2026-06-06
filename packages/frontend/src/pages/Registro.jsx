import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  App as AntApp,
  Layout,
  Card,
  Form,
  Input,
  Button,
  Select,
  Tabs,
  Typography,
  Space,
} from "antd";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getObrasSociales,
  getPlanes,
  getEspecialidadesGenericas,
  getSedes,
} from "../mocks";

const { Title, Text } = Typography;

export default function Registro() {
  return (
    <AntApp>
      <RegistroInner />
    </AntApp>
  );
}

function RegistroInner() {
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
        <Card style={{ width: "100%", maxWidth: 540 }} bordered>
          <Space direction="vertical" size={4} style={{ marginBottom: 16 }}>
            <Title level={3} style={{ margin: 0 }}>Crear cuenta</Title>
            <Text type="secondary">Elegí el tipo de cuenta que querés crear.</Text>
          </Space>

          <Tabs
            defaultActiveKey="paciente"
            items={[
              { key: "paciente", label: "Soy paciente", children: <FormularioPaciente /> },
              { key: "medico", label: "Soy médico", children: <FormularioMedico /> },
            ]}
          />

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Text type="secondary">¿Ya tenés cuenta? </Text>
            <Link to="/login">Ingresá</Link>
          </div>
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

function FormularioPaciente() {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [obrasSociales, setObrasSociales] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [obraSocialId, setObraSocialId] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    getObrasSociales().then(setObrasSociales);
  }, []);

  useEffect(() => {
    if (obraSocialId == null) { setPlanes([]); return; }
    getPlanes({ obraSocialId }).then(setPlanes);
  }, [obraSocialId]);

  const onFinish = () => {
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      message.success("Cuenta de paciente creada (mock)");
      navigate("/login");
    }, 400);
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item name="nombre" label="Nombre completo" rules={[{ required: true, message: "Ingresá tu nombre" }]}>
        <Input placeholder="Ana García" />
      </Form.Item>
      <Form.Item name="dni" label="DNI" rules={[{ required: true, message: "Ingresá tu DNI" }]}>
        <Input placeholder="30123456" />
      </Form.Item>
      <Form.Item name="nombreUsuario" label="Usuario" rules={[{ required: true, message: "Elegí un usuario" }]}>
        <Input placeholder="ana.garcia" autoComplete="username" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Contraseña"
        rules={[
          { required: true, message: "Ingresá una contraseña" },
          { min: 4, message: "Mínimo 4 caracteres" },
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Form.Item name="obraSocialId" label="Obra social" rules={[{ required: true, message: "Elegí una obra social" }]}>
        <Select
          placeholder="Elegí una obra social"
          options={obrasSociales.map((o) => ({ value: o.id, label: o.nombre }))}
          onChange={(v) => setObraSocialId(v)}
        />
      </Form.Item>
      <Form.Item name="planId" label="Plan (opcional)">
        <Select
          placeholder={planes.length ? "Elegí un plan" : "Elegí primero la obra social"}
          allowClear
          disabled={!planes.length}
          options={planes.map((p) => ({ value: p.id, label: p.nombre }))}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={cargando}>
        Crear cuenta
      </Button>
    </Form>
  );
}

function FormularioMedico() {
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [especialidades, setEspecialidades] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    getEspecialidadesGenericas().then(setEspecialidades);
    getSedes().then(setSedes);
  }, []);

  const onFinish = () => {
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      message.success("Cuenta de médico creada (mock)");
      navigate("/login");
    }, 400);
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item name="nombre" label="Nombre completo" rules={[{ required: true, message: "Ingresá tu nombre" }]}>
        <Input placeholder="Dra. Rebecca Rose" />
      </Form.Item>
      <Form.Item name="matricula" label="Matrícula" rules={[{ required: true, message: "Ingresá tu matrícula" }]}>
        <Input placeholder="MN 12345" />
      </Form.Item>
      <Form.Item name="nombreUsuario" label="Usuario" rules={[{ required: true, message: "Elegí un usuario" }]}>
        <Input placeholder="rrose" autoComplete="username" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Contraseña"
        rules={[
          { required: true, message: "Ingresá una contraseña" },
          { min: 4, message: "Mínimo 4 caracteres" },
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Form.Item
        name="especialidadGenericaId"
        label="Especialidad"
        rules={[{ required: true, message: "Elegí una especialidad" }]}
      >
        <Select
          placeholder="Elegí una especialidad"
          options={especialidades.map((e) => ({ value: e.id, label: e.nombre }))}
        />
      </Form.Item>
      <Form.Item
        name="sedesIds"
        label="Sedes donde atendés"
        rules={[{ required: true, message: "Elegí al menos una sede" }]}
      >
        <Select
          mode="multiple"
          placeholder="Elegí una o más sedes"
          options={sedes.map((s) => ({ value: s.id, label: s.nombre }))}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={cargando}>
        Crear cuenta
      </Button>
    </Form>
  );
}
