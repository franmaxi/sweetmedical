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
    getObrasSociales().then(setObrasSociales);
  }, []);

  useEffect(() => {
    if (obraSocialId == null) {
      setPlanes([]);
      return;
    }
    getPlanes({ obraSocialId }).then(setPlanes);
  }, [obraSocialId]);

  const onFinish = () => {
    setCargando(true);
    setTimeout(() => {
      setCargando(false);
      message.success(t("registro.successPaciente"));
      navigate("/login");
    }, 400);
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
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
          options={obrasSociales.map((o) => ({ value: o.id, label: o.nombre }))}
          onChange={(v) => setObraSocialId(v)}
        />
      </Form.Item>
      <Form.Item name="planId" label={t("registro.paciente.planLabel")}>
        <Select
          placeholder={planes.length ? t("registro.paciente.placeholderPlan") : t("registro.paciente.placeholderPlanFirst")}
          allowClear
          disabled={!planes.length}
          options={planes.map((p) => ({ value: p.id, label: p.nombre }))}
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
      message.success(t("registro.successMedico"));
      navigate("/login");
    }, 400);
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
          options={especialidades.map((e) => ({ value: e.id, label: e.nombre }))}
        />
      </Form.Item>
      <Form.Item
        name="sedesIds"
        label={t("registro.medico.sedesLabel")}
        rules={[{ required: true, message: t("registro.medico.errorSedes") }]}
      >
        <Select
          mode="multiple"
          placeholder={t("registro.medico.placeholderSedes")}
          options={sedes.map((s) => ({ value: s.id, label: s.nombre }))}
        />
      </Form.Item>
      <Button type="primary" htmlType="submit" block loading={cargando}>
        {t("registro.medico.botonCrear")}
      </Button>
    </Form>
  );
}
