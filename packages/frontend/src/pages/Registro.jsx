import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  registrarPacienteApi,
  registrarMedicoApi,
  getObrasSocialesApi,
  getPlanesPorObraSocialApi,
  getEspecialidadesGenericas,
  getSedes,
} from "../api/api";

const { Title, Text } = Typography;

export default function Registro() {
  return (
    <AntApp>
      <RegistroInner />
    </AntApp>
  );
}

function RegistroInner() {
  const { t } = useTranslation();

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
            <Title level={3} style={{ margin: 0 }}>{t("registro.titulo")}</Title>
            <Text type="secondary">{t("registro.subtitulo")}</Text>
          </Space>

          <Tabs
            defaultActiveKey="paciente"
            items={[
              { key: "paciente", label: t("registro.tabPaciente"), children: <FormularioPaciente /> },
              { key: "medico", label: t("registro.tabMedico"), children: <FormularioMedico /> },
            ]}
          />

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Text type="secondary">{t("registro.yaTenesCuenta")} </Text>
            <Link to="/login">{t("registro.ingresa")}</Link>
          </div>
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

function FormularioPaciente() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [obrasSociales, setObrasSociales] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [obraSocialId, setObraSocialId] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    getObrasSocialesApi()
      .then((res) => setObrasSociales(res.data ?? []))
      .catch(() => message.error(t("registro.errorCargarObrasSociales")));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!obraSocialId) {
      setPlanes([]);
      return;
    }
    getPlanesPorObraSocialApi(obraSocialId)
      .then((res) => setPlanes(res.data ?? []))
      .catch(() => setPlanes([]));
  }, [obraSocialId]);

  const onFinish = async (values) => {
    setCargando(true);
    try {
      await registrarPacienteApi({
        nombre: values.nombre,
        dni: values.dni,
        nombreUsuario: values.nombreUsuario,
        password: values.password,
        obraSocialId: values.obraSocialId,
        planId: values.planId,
      });
      message.success(t("registro.successPaciente"));
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message ?? t("registro.errorGenerico");
      message.error(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item name="nombre" label={t("registro.paciente.nombreLabel")} rules={[{ required: true, message: t("registro.paciente.errorNombre") }]}>
        <Input placeholder={t("registro.paciente.placeholderNombre")} />
      </Form.Item>
      <Form.Item name="dni" label={t("registro.paciente.dniLabel")} rules={[{ required: true, message: t("registro.paciente.errorDni") }]}>
        <Input type="number" placeholder={t("registro.paciente.placeholderDni")} />
      </Form.Item>
      <Form.Item name="nombreUsuario" label={t("registro.paciente.usuarioLabel")} rules={[{ required: true, message: t("registro.paciente.errorUsuario") }]}>
        <Input placeholder={t("registro.paciente.placeholderUsuario")} autoComplete="username" />
      </Form.Item>
      <Form.Item
        name="password"
        label={t("registro.paciente.passwordLabel")}
        rules={[
          { required: true, message: t("registro.paciente.errorPassword") },
          { min: 6, message: t("registro.paciente.errorPasswordMin") },
        ]}
      >
        <Input.Password autoComplete="new-password" placeholder={t("registro.paciente.placeholderPassword")} />
      </Form.Item>
      <Form.Item name="obraSocialId" label={t("registro.paciente.obraSocialLabel")} rules={[{ required: true, message: t("registro.paciente.errorObraSocial") }]}>
        <Select
          placeholder={t("registro.paciente.placeholderObraSocial")}
          options={obrasSociales.map((o) => ({ value: o._id, label: o.nombre }))}
          onChange={(v) => setObraSocialId(v)}
        />
      </Form.Item>
      <Form.Item name="planId" label={t("registro.paciente.planLabel")} rules={[{ required: true, message: t("registro.paciente.errorPlan") }]}>
        <Select
          placeholder={planes.length ? t("registro.paciente.placeholderPlan") : t("registro.paciente.placeholderPlanFirst")}
          disabled={!planes.length}
          options={planes.map((p) => ({ value: p._id, label: p.nombre }))}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={cargando}>
        {t("registro.paciente.botonCrear")}
      </Button>
    </Form>
  );
}

function FormularioMedico() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message } = AntApp.useApp();
  const [sedes, setSedes] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Las sedes se siguen cargando desde la API existente en api.js
    getSedes()
      .then((res) => setSedes(res.data ?? []))
      .catch(() => message.error(t("registro.errorCargarSedes")));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = async (values) => {
    setCargando(true);
    try {
      await registrarMedicoApi({
        nombre: values.nombre,
        matricula: values.matricula,
        nombreUsuario: values.nombreUsuario,
        password: values.password,
      });
      message.success(t("registro.successMedico"));
      navigate("/login");
    } catch (error) {
      const msg = error.response?.data?.message ?? t("registro.errorGenerico");
      message.error(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
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
          { min: 6, message: t("registro.medico.errorPasswordMin") },
        ]}
      >
        <Input.Password autoComplete="new-password" placeholder={t("registro.medico.placeholderPassword")} />
      </Form.Item>
      {/* Sedes: el back no las acepta en el create — se asignan luego desde el perfil */}
      {sedes.length > 0 && (
        <Form.Item label={t("registro.medico.sedesLabel")}>
          <Text type="secondary">{t("registro.medico.sedesInfo")}</Text>
        </Form.Item>
      )}
      <Button type="primary" htmlType="submit" block loading={cargando}>
        {t("registro.medico.botonCrear")}
      </Button>
    </Form>
  );
}
