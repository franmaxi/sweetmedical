import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
<<<<<<< HEAD
import { useTranslation } from "react-i18next";
=======
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
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
<<<<<<< HEAD
  const { t } = useTranslation();

=======
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
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
<<<<<<< HEAD
            <Title level={3} style={{ margin: 0 }}>{t("registro.titulo")}</Title>
            <Text type="secondary">{t("registro.subtitulo")}</Text>
=======
            <Title level={3} style={{ margin: 0 }}>Crear cuenta</Title>
            <Text type="secondary">Elegí el tipo de cuenta que querés crear.</Text>
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
          </Space>

          <Tabs
            defaultActiveKey="paciente"
            items={[
<<<<<<< HEAD
              { key: "paciente", label: t("registro.tabPaciente"), children: <FormularioPaciente /> },
              { key: "medico", label: t("registro.tabMedico"), children: <FormularioMedico /> },
=======
              { key: "paciente", label: "Soy paciente", children: <FormularioPaciente /> },
              { key: "medico", label: "Soy médico", children: <FormularioMedico /> },
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
            ]}
          />

          <div style={{ marginTop: 16, textAlign: "center" }}>
<<<<<<< HEAD
            <Text type="secondary">{t("registro.yaTenesCuenta")} </Text>
            <Link to="/login">{t("registro.ingresa")}</Link>
=======
            <Text type="secondary">¿Ya tenés cuenta? </Text>
            <Link to="/login">Ingresá</Link>
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
          </div>
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

function FormularioPaciente() {
<<<<<<< HEAD
  const { t } = useTranslation();
=======
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
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
<<<<<<< HEAD
    if (obraSocialId == null) {
      setPlanes([]);
      return;
    }
=======
    if (obraSocialId == null) { setPlanes([]); return; }
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
    getPlanes({ obraSocialId }).then(setPlanes);
  }, [obraSocialId]);

  const onFinish = () => {
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
<<<<<<< HEAD
      message.success(t("registro.successPaciente"));
=======
      message.success("Cuenta de paciente creada (mock)");
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
      navigate("/login");
    }, 400);
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
<<<<<<< HEAD
      <Form.Item name="nombre" label={t("registro.paciente.nombreLabel")} rules={[{ required: true, message: t("registro.paciente.errorNombre") }]}> 
        <Input placeholder={t("registro.paciente.placeholderNombre")} />
      </Form.Item>
      <Form.Item name="dni" label={t("registro.paciente.dniLabel")} rules={[{ required: true, message: t("registro.paciente.errorDni") }]}> 
        <Input placeholder={t("registro.paciente.placeholderDni")} />
      </Form.Item>
      <Form.Item name="nombreUsuario" label={t("registro.paciente.usuarioLabel")} rules={[{ required: true, message: t("registro.paciente.errorUsuario") }]}> 
        <Input placeholder={t("registro.paciente.placeholderUsuario")} autoComplete="username" />
      </Form.Item>
      <Form.Item
        name="password"
        label={t("registro.paciente.passwordLabel")}
        rules={[
          { required: true, message: t("registro.paciente.errorPassword") },
          { min: 4, message: t("registro.paciente.errorPasswordMin") },
        ]}
      >
        <Input.Password autoComplete="new-password" placeholder={t("registro.paciente.placeholderPassword")} />
      </Form.Item>
      <Form.Item name="obraSocialId" label={t("registro.paciente.obraSocialLabel")} rules={[{ required: true, message: t("registro.paciente.errorObraSocial") }]}> 
        <Select
          placeholder={t("registro.paciente.placeholderObraSocial")}
=======
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
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
          options={obrasSociales.map((o) => ({ value: o.id, label: o.nombre }))}
          onChange={(v) => setObraSocialId(v)}
        />
      </Form.Item>
<<<<<<< HEAD
      <Form.Item name="planId" label={t("registro.paciente.planLabel")}>
        <Select
          placeholder={planes.length ? t("registro.paciente.placeholderPlan") : t("registro.paciente.placeholderPlanFirst")}
=======
      <Form.Item name="planId" label="Plan (opcional)">
        <Select
          placeholder={planes.length ? "Elegí un plan" : "Elegí primero la obra social"}
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
          allowClear
          disabled={!planes.length}
          options={planes.map((p) => ({ value: p.id, label: p.nombre }))}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={cargando}>
<<<<<<< HEAD
        {t("registro.paciente.botonCrear")}
=======
        Crear cuenta
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
      </Button>
    </Form>
  );
}

function FormularioMedico() {
<<<<<<< HEAD
  const { t } = useTranslation();
=======
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
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
<<<<<<< HEAD
      message.success(t("registro.successMedico"));
=======
      message.success("Cuenta de médico creada (mock)");
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
      navigate("/login");
    }, 400);
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
<<<<<<< HEAD
      <Form.Item name="nombre" label={t("registro.medico.nombreLabel")} rules={[{ required: true, message: t("registro.medico.errorNombre") }]}> 
        <Input placeholder={t("registro.medico.placeholderNombre")} />
      </Form.Item>
      <Form.Item name="matricula" label={t("registro.medico.matriculaLabel")} rules={[{ required: true, message: t("registro.medico.errorMatricula") }]}> 
        <Input placeholder={t("registro.medico.placeholderMatricula")} />
      </Form.Item>
      <Form.Item name="nombreUsuario" label={t("registro.medico.usuarioLabel")} rules={[{ required: true, message: t("registro.medico.errorUsuario") }]}> 
        <Input placeholder={t("registro.medico.placeholderUsuario")} autoComplete="username" />
      </Form.Item>
      <Form.Item
        name="password"
        label={t("registro.medico.passwordLabel")}
        rules={[
          { required: true, message: t("registro.medico.errorPassword") },
          { min: 4, message: t("registro.medico.errorPasswordMin") },
        ]}
      >
        <Input.Password autoComplete="new-password" placeholder={t("registro.medico.placeholderPassword")} />
      </Form.Item>
      <Form.Item
        name="especialidadGenericaId"
        label={t("registro.medico.especialidadLabel")}
        rules={[{ required: true, message: t("registro.medico.errorEspecialidad") }]}
      >
        <Select
          placeholder={t("registro.medico.placeholderEspecialidad")}
=======
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
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
          options={especialidades.map((e) => ({ value: e.id, label: e.nombre }))}
        />
      </Form.Item>
      <Form.Item
        name="sedesIds"
<<<<<<< HEAD
        label={t("registro.medico.sedesLabel")}
        rules={[{ required: true, message: t("registro.medico.errorSedes") }]}
      >
        <Select
          mode="multiple"
          placeholder={t("registro.medico.placeholderSedes")}
=======
        label="Sedes donde atendés"
        rules={[{ required: true, message: "Elegí al menos una sede" }]}
      >
        <Select
          mode="multiple"
          placeholder="Elegí una o más sedes"
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
          options={sedes.map((s) => ({ value: s.id, label: s.nombre }))}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={cargando}>
<<<<<<< HEAD
        {t("registro.medico.botonCrear")}
=======
        Crear cuenta
>>>>>>> 599d3f314c801ee8364d29a73f6eaae853455a7b
      </Button>
    </Form>
  );
}
