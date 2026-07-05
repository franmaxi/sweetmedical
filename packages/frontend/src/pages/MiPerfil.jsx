import { useEffect, useMemo, useState } from "react";
import { App as AntApp, Button, Card, Descriptions, Form, Input, Layout, Modal, Select, Space, Typography } from "antd";
import { EditOutlined, KeyOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getObrasSocialesApi, getPlanesPorObraSocialApi, getMedicoById, getPacienteById, updateMedico, updatePaciente } from "../api/api";
import { extraerMensajeError } from "../api/errorUtils";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function MiPerfil() {
  return (
    <AntApp>
      <MiPerfilInner />
    </AntApp>
  );
}

function MiPerfilInner() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { message } = AntApp.useApp();
  
  const [formDatos] = Form.useForm();
  const [formPassword] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [profile, setProfile] = useState(null);
  const [obrasSociales, setObrasSociales] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [obraSocialIdSeleccionada, setObraSocialIdSeleccionada] = useState(null);
  
  const [modalDatosAbierto, setModalDatosAbierto] = useState(false);
  const [modalPasswordAbierto, setModalPasswordAbierto] = useState(false);

  const isMedico = useMemo(() => user?.role === "medico", [user]);
  const isPaciente = useMemo(() => user?.role === "usuario" || user?.role === "paciente", [user]);
  const isAdmin = useMemo(() => user?.role === "admin", [user]);

  useEffect(() => {
    if (!user) return;

    const cargarDatos = async () => {
      try {
        setLoading(true);

        if (isMedico) {
          const res = await getMedicoById({ medicoId: user.userId });
          const payload = res?.data ?? res;
          setProfile(payload);

          if (payload.obraSocial?._id || payload.obraSocial) {
            setObraSocialIdSeleccionada(payload.obraSocial._id || payload.obraSocial);
          }
        } else if (isPaciente) {
          const res = await getPacienteById({ pacienteId: user.userId });
          const payload = res?.data ?? res;
          setProfile(payload);

          if (payload.obraSocial?._id || payload.obraSocial) {
            setObraSocialIdSeleccionada(payload.obraSocial._id || payload.obraSocial);
          }
        } else if (isAdmin) {
          setProfile({ nombre: user.displayName || user.username, usuario: { nombreUsuario: user.username } });
        }
      } catch (error) {
        message.error(t("perfil.errorCargar"));
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMedico, isPaciente, isAdmin, t, user]);

  useEffect(() => {
    getObrasSocialesApi()
      .then((res) => setObrasSociales(res.data ?? []))
      .catch(() => setObrasSociales([]));
  }, []);

  useEffect(() => {
    if (!obraSocialIdSeleccionada) {
      setPlanes([]);
      return;
    }

    getPlanesPorObraSocialApi(obraSocialIdSeleccionada)
      .then((res) => setPlanes(res.data ?? []))
      .catch(() => setPlanes([]));
  }, [obraSocialIdSeleccionada]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const roleKey = user?.role === "usuario" ? "paciente" : user?.role;
  const planLabel = profile?.plan?.nombre || (typeof profile?.plan === "string" ? planes.find((p) => p._id === profile.plan)?.nombre : undefined) || profile?.plan;
  const obraSocialLabel = profile?.obraSocial?.nombre || (typeof profile?.obraSocial === "string" ? obrasSociales.find((o) => o._id === profile.obraSocial)?.nombre : undefined) || profile?.obraSocial;

  const persistirPerfil = async (payload) => {
    if (Object.keys(payload).length === 0) {
      message.info(t("perfil.sinCambios"));
      return false;
    }

    try {
      if (isMedico) {
        await updateMedico({ medicoId: user.userId, payload });
      } else if (isPaciente) {
        await updatePaciente({ pacienteId: user.userId, payload });
      } else if (isAdmin) {
        setProfile((current) => ({
          ...current,
          ...(payload.nombre ? { nombre: payload.nombre } : {}),
          ...(payload.nombreUsuario
            ? { usuario: { ...current?.usuario, nombreUsuario: payload.nombreUsuario } }
            : {}),
        }));
      }

      message.success(t("perfil.success"));

      if (isMedico) {
        const res = await getMedicoById({ medicoId: user.userId });
        setProfile(res?.data ?? res);
      } else if (isPaciente) {
        const res = await getPacienteById({ pacienteId: user.userId });
        setProfile(res?.data ?? res);
      }

      return true;
    } catch (error) {
      message.error(extraerMensajeError(error, t("perfil.errorGuardar")));
      return false;
    }
  };

  const abrirEdicionDatos = () => {
    const obraSocialId = profile?.obraSocial?._id || profile?.obraSocial || undefined;

    formDatos.resetFields();
    formDatos.setFieldsValue({
      nombre: profile?.nombre || "",
      nombreUsuario: profile?.usuario?.nombreUsuario || user.username || "",
      ...(isPaciente
        ? {
            dni: profile?.dni,
            obraSocialId,
            planId: profile?.plan?._id || profile?.plan || undefined,
          }
        : {}),
      ...(isMedico ? { matricula: profile?.matricula || "" } : {}),
    });

    if (isPaciente && obraSocialId) {
      setObraSocialIdSeleccionada(obraSocialId);
    }

    setModalDatosAbierto(true);
  };

  const cerrarModalDatos = () => {
    setModalDatosAbierto(false);
    formDatos.resetFields();
  };

  const guardarEdicionDatos = async () => {
    let values;
    try {
      values = await formDatos.validateFields();
    } catch {
      return;
    }

    const payload = {};
    if (values.nombre?.trim() !== undefined) payload.nombre = values.nombre.trim();
    if (values.nombreUsuario?.trim() !== undefined) payload.nombreUsuario = values.nombreUsuario.trim();
    
    if (isPaciente) {
      if (values.dni !== undefined && values.dni !== "") payload.dni = Number(values.dni);
      payload.obraSocialId = values.obraSocialId || null;
      payload.planId = values.planId || null;
    }
    if (isMedico) {
      payload.matricula = values.matricula?.trim() || "";
    }

    setGuardando(true);
    const guardo = await persistirPerfil(payload);
    setGuardando(false);

    if (guardo) {
      setModalDatosAbierto(false);
      formDatos.resetFields();
    }
  };

  const abrirEdicionPassword = () => {
    formPassword.resetFields();
    setModalPasswordAbierto(true);
  };

  const cerrarModalPassword = () => {
    setModalPasswordAbierto(false);
    formPassword.resetFields();
  };

  const guardarEdicionPassword = async () => {
    let values;
    try {
      values = await formPassword.validateFields();
    } catch {
      return;
    }

    const payload = {
      passwordActual: values.passwordActual,
      passwordNueva: values.passwordNueva,
    };

    setGuardando(true);
    const guardo = await persistirPerfil(payload);
    setGuardando(false);

    if (guardo) {
      setModalPasswordAbierto(false);
      formPassword.resetFields();
    }
  };

  if (!user) {
    return (
      <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
        <Navbar />
        <Content style={{ minHeight: "70vh", padding: "clamp(24px, 5vw, 48px) 16px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <Card>
              <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <div>
                  <Title level={2} style={{ marginBottom: 4 }}>
                    {t("perfil.titulo")}
                  </Title>
                  <Text type="secondary">{t("perfil.descripcion")}</Text>
                </div>
                <Text>{t("perfil.loginRequired")}</Text>
                <Button type="primary" onClick={() => navigate("/login")}>
                  {t("navbar.ingresar")}
                </Button>
              </Space>
            </Card>
          </div>
        </Content>
        <Footer />
      </Layout>
    );
  }

  return (
    <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <Layout.Content
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "clamp(20px, 4vw, 32px) clamp(12px, 4vw, 24px)",
          width: "100%",
        }}
      >
        <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Title level={2} style={{ marginBottom: 0 }}>
              {t("perfil.titulo")}
            </Title>
            <Text type="secondary">{t("perfil.descripcion")}</Text>
          </div>
          <Space wrap>
            <Button type="primary" icon={<EditOutlined />} onClick={abrirEdicionDatos}>
              {t("perfil.editar")}
            </Button>
            {!isAdmin && (
              <Button icon={<KeyOutlined />} onClick={abrirEdicionPassword}>
                Cambiar contraseña
              </Button>
            )}
            <Button danger onClick={handleLogout}>
              {t("navbar.logout")}
            </Button>
          </Space>
        </Space>

        <Card style={{ marginTop: 16 }} loading={loading}>
          <Descriptions column={1} labelStyle={{ fontWeight: 600, width: 200 }}>
            <Descriptions.Item label={t("perfil.rol")}>
              {t(`perfil.role.${roleKey}`) || t("perfil.role.default")}
            </Descriptions.Item>

            <Descriptions.Item label={t("perfil.nombre")}>
              {profile?.nombre || profile?.usuario?.nombreUsuario || user.username}
            </Descriptions.Item>

            <Descriptions.Item label={t("perfil.usuario")}>
              {profile?.usuario?.nombreUsuario || user.username}
            </Descriptions.Item>

            {!isAdmin && (
              <Descriptions.Item label={t("perfil.password")}>
                ••••••••
              </Descriptions.Item>
            )}

            {isPaciente && (
              <>
                <Descriptions.Item label={t("registro.paciente.dniLabel")}>
                  {profile?.dni ?? "—"}
                </Descriptions.Item>

                <Descriptions.Item label={t("registro.paciente.obraSocialLabel")}>
                  {obraSocialLabel || "—"}
                </Descriptions.Item>

                <Descriptions.Item label={t("registro.paciente.planLabel")}>
                  {planLabel || "—"}
                </Descriptions.Item>
              </>
            )}

            {isMedico && (
              <Descriptions.Item label={t("registro.medico.matriculaLabel")}>
                {profile?.matricula || "—"}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Modal 1: Editar Datos Personales */}
        <Modal
          title={t("perfil.editarTitulo")}
          open={modalDatosAbierto}
          onOk={guardarEdicionDatos}
          onCancel={cerrarModalDatos}
          okText={t("perfil.guardar")}
          cancelText={t("perfil.cancelar")}
          confirmLoading={guardando}
          maskClosable={!guardando}
          destroyOnClose
        >
          <Form form={formDatos} layout="vertical" preserve={false}>
            <Form.Item
              name="nombre"
              label={t("perfil.nombre")}
              rules={[{ required: true, message: "Por favor ingresá tu nombre" }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="nombreUsuario"
              label={t("perfil.usuario")}
              rules={[{ required: true, message: "Por favor ingresá tu nombre de usuario" }]}
            >
              <Input autoComplete="username" />
            </Form.Item>

            {isPaciente && (
              <Form.Item
                name="dni"
                label={t("registro.paciente.dniLabel")}
                rules={[
                  { required: true, message: "Por favor ingresá tu DNI" },
                  {
                    validator(_, val) {
                      if (val !== undefined && val !== "" && Number(val) <= 0) {
                        return Promise.reject(new Error("El DNI debe ser un número mayor a 0"));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input type="number" />
              </Form.Item>
            )}

            {isMedico && (
              <Form.Item
                name="matricula"
                label={t("registro.medico.matriculaLabel")}
                rules={[{ required: true, message: "Por favor ingresá tu matrícula" }]}
              >
                <Input />
              </Form.Item>
            )}

            {isPaciente && (
              <>
                <Form.Item name="obraSocialId" label={t("registro.paciente.obraSocialLabel")}>
                  <Select
                    placeholder={t("registro.paciente.placeholderObraSocial")}
                    options={obrasSociales.map((o) => ({ value: o._id, label: o.nombre }))}
                    onChange={(v) => {
                      setObraSocialIdSeleccionada(v ?? null);
                      formDatos.setFieldValue("planId", undefined);
                    }}
                    allowClear
                  />
                </Form.Item>
                <Form.Item name="planId" label={t("registro.paciente.planLabel")}>
                  <Select
                    placeholder={planes.length ? t("registro.paciente.placeholderPlan") : t("registro.paciente.placeholderPlanFirst")}
                    disabled={!planes.length}
                    options={planes.map((p) => ({ value: p._id, label: p.nombre }))}
                    allowClear
                  />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>

        {/* Modal 2: Cambiar Contraseña */}
        {!isAdmin && (
          <Modal
            title="Cambiar contraseña"
            open={modalPasswordAbierto}
            onOk={guardarEdicionPassword}
            onCancel={cerrarModalPassword}
            okText={t("perfil.guardar")}
            cancelText={t("perfil.cancelar")}
            confirmLoading={guardando}
            maskClosable={!guardando}
            destroyOnClose
          >
            <Form form={formPassword} layout="vertical" preserve={false}>
              <Form.Item
                name="passwordActual"
                label={t("perfil.passwordActual")}
                rules={[{ required: true, message: t("perfil.errorPasswordActualRequerida") }]}
              >
                <Input.Password autoComplete="current-password" placeholder={t("perfil.passwordActualPlaceholder")} />
              </Form.Item>

              <Form.Item
                name="passwordNueva"
                label={t("perfil.nuevaPassword")}
                rules={[
                  { required: true, message: "Por favor ingresá tu nueva contraseña" },
                  { min: 6, message: t("login.errorPasswordLength") }
                ]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>

              <Form.Item
                name="confirmarPassword"
                label={t("registro.confirmarPasswordLabel")}
                dependencies={["passwordNueva"]}
                rules={[
                  { required: true, message: t("registro.errorConfirmarPassword") },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("passwordNueva") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t("registro.errorPasswordNoCoincide")));
                    },
                  }),
                ]}
              >
                <Input.Password autoComplete="new-password" placeholder={t("registro.placeholderConfirmarPassword")} />
              </Form.Item>
            </Form>
          </Modal>
        )}
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
