import { useEffect, useMemo, useState } from "react";
import { App as AntApp, Button, Card, Descriptions, Form, Input, Layout, Modal, Select, Space, Tooltip, Typography } from "antd";
import { EditOutlined, KeyOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
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
  
  const [formPassword] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [profile, setProfile] = useState(null);
  const [obrasSociales, setObrasSociales] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [obraSocialIdSeleccionada, setObraSocialIdSeleccionada] = useState(null);

  // Edición inline: qué campo se está editando y su valor temporal.
  const [campoEditando, setCampoEditando] = useState(null);
  const [valorTemporal, setValorTemporal] = useState(undefined);

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

  const iniciarEdicion = (campo, valorInicial) => {
    setCampoEditando(campo);
    setValorTemporal(valorInicial);
  };

  const cancelarEdicion = () => {
    setCampoEditando(null);
    setValorTemporal(undefined);
  };

  const guardarCampo = async (payload) => {
    setGuardando(true);
    const guardo = await persistirPerfil(payload);
    setGuardando(false);
    if (guardo) {
      setCampoEditando(null);
      setValorTemporal(undefined);
    }
  };

  const renderBotonEditar = (campo, valorInicial) => (
    <Tooltip title={t("perfil.editar")}>
      <Button
        type="text"
        size="small"
        icon={<EditOutlined />}
        onClick={() => iniciarEdicion(campo, valorInicial)}
        aria-label={t("perfil.editar")}
      />
    </Tooltip>
  );

  const renderAcciones = (onGuardar) => (
    <>
      <Button
        type="text"
        size="small"
        icon={<CheckOutlined />}
        loading={guardando}
        onClick={onGuardar}
        aria-label={t("perfil.guardar")}
      />
      <Button
        type="text"
        size="small"
        icon={<CloseOutlined />}
        onClick={cancelarEdicion}
        disabled={guardando}
        aria-label={t("perfil.cancelar")}
      />
    </>
  );

  // Muestra el valor con un botón de editar, o un editor inline si está en edición.
  const renderCampoEditable = ({ campo, valor, valorInicial, onGuardar, editor }) => {
    if (campoEditando === campo) {
      return (
        <Space size={4} wrap>
          {editor}
          {renderAcciones(onGuardar)}
        </Space>
      );
    }
    return (
      <Space size={4}>
        <span>{valor}</span>
        {renderBotonEditar(campo, valorInicial)}
      </Space>
    );
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
            <Button danger onClick={handleLogout}>
              {t("navbar.logout")}
            </Button>
          </Space>
        </Space>

        <Card
          style={{ marginTop: 16 }}
          loading={loading}
          title={t("perfil.datos")}
        >
          <Descriptions column={1} labelStyle={{ fontWeight: 600, width: 200 }}>
            <Descriptions.Item label={t("perfil.rol")}>
              {t(`perfil.role.${roleKey}`) || t("perfil.role.default")}
            </Descriptions.Item>

            <Descriptions.Item label={t("perfil.nombre")}>
              {renderCampoEditable({
                campo: "nombre",
                valor: profile?.nombre || profile?.usuario?.nombreUsuario || user.username,
                valorInicial: profile?.nombre || "",
                onGuardar: () => {
                  const v = (valorTemporal ?? "").trim();
                  if (!v) return message.warning(t("perfil.errorNombreRequerido"));
                  guardarCampo({ nombre: v });
                },
                editor: (
                  <Input
                    autoFocus
                    value={valorTemporal}
                    onChange={(e) => setValorTemporal(e.target.value)}
                    onPressEnter={() => {
                      const v = (valorTemporal ?? "").trim();
                      if (v) guardarCampo({ nombre: v });
                    }}
                    style={{ width: 220 }}
                  />
                ),
              })}
            </Descriptions.Item>

            <Descriptions.Item label={t("perfil.usuario")}>
              {renderCampoEditable({
                campo: "nombreUsuario",
                valor: profile?.usuario?.nombreUsuario || user.username,
                valorInicial: profile?.usuario?.nombreUsuario || user.username || "",
                onGuardar: () => {
                  const v = (valorTemporal ?? "").trim();
                  if (!v) return message.warning(t("perfil.errorUsuarioRequerido"));
                  guardarCampo({ nombreUsuario: v });
                },
                editor: (
                  <Input
                    autoFocus
                    autoComplete="username"
                    value={valorTemporal}
                    onChange={(e) => setValorTemporal(e.target.value)}
                    onPressEnter={() => {
                      const v = (valorTemporal ?? "").trim();
                      if (v) guardarCampo({ nombreUsuario: v });
                    }}
                    style={{ width: 220 }}
                  />
                ),
              })}
            </Descriptions.Item>

            {!isAdmin && (
              <Descriptions.Item label={t("perfil.password")}>
                <Space size={4}>
                  <span>••••••••</span>
                  <Tooltip title={t("perfil.cambiarPassword")}>
                    <Button
                      type="text"
                      size="small"
                      icon={<KeyOutlined />}
                      onClick={abrirEdicionPassword}
                      aria-label={t("perfil.cambiarPassword")}
                    />
                  </Tooltip>
                </Space>
              </Descriptions.Item>
            )}

            {isPaciente && (
              <>
                <Descriptions.Item label={t("registro.paciente.dniLabel")}>
                  {renderCampoEditable({
                    campo: "dni",
                    valor: profile?.dni ?? "—",
                    valorInicial: profile?.dni ?? "",
                    onGuardar: () => {
                      const n = Number(valorTemporal);
                      if (!valorTemporal || Number.isNaN(n) || n <= 0) {
                        return message.warning(t("perfil.errorDniInvalido"));
                      }
                      guardarCampo({ dni: n });
                    },
                    editor: (
                      <Input
                        autoFocus
                        type="number"
                        value={valorTemporal}
                        onChange={(e) => setValorTemporal(e.target.value)}
                        style={{ width: 220 }}
                      />
                    ),
                  })}
                </Descriptions.Item>

                <Descriptions.Item label={t("registro.paciente.obraSocialLabel")}>
                  {renderCampoEditable({
                    campo: "obraSocial",
                    valor: obraSocialLabel || "—",
                    valorInicial: profile?.obraSocial?._id || profile?.obraSocial || undefined,
                    onGuardar: () => guardarCampo({ obraSocialId: valorTemporal || null, planId: null }),
                    editor: (
                      <Select
                        autoFocus
                        style={{ width: 220 }}
                        value={valorTemporal}
                        placeholder={t("registro.paciente.placeholderObraSocial")}
                        options={obrasSociales.map((o) => ({ value: o._id, label: o.nombre }))}
                        onChange={(v) => {
                          setValorTemporal(v);
                          setObraSocialIdSeleccionada(v ?? null);
                        }}
                        allowClear
                      />
                    ),
                  })}
                </Descriptions.Item>

                <Descriptions.Item label={t("registro.paciente.planLabel")}>
                  {renderCampoEditable({
                    campo: "plan",
                    valor: planLabel || "—",
                    valorInicial: profile?.plan?._id || profile?.plan || undefined,
                    onGuardar: () => guardarCampo({ planId: valorTemporal || null }),
                    editor: (
                      <Select
                        autoFocus
                        style={{ width: 220 }}
                        value={valorTemporal}
                        placeholder={planes.length ? t("registro.paciente.placeholderPlan") : t("registro.paciente.placeholderPlanFirst")}
                        disabled={!planes.length}
                        options={planes.map((p) => ({ value: p._id, label: p.nombre }))}
                        onChange={(v) => setValorTemporal(v)}
                        allowClear
                      />
                    ),
                  })}
                </Descriptions.Item>
              </>
            )}

            {isMedico && (
              <Descriptions.Item label={t("registro.medico.matriculaLabel")}>
                {renderCampoEditable({
                  campo: "matricula",
                  valor: profile?.matricula || "—",
                  valorInicial: profile?.matricula || "",
                  onGuardar: () => {
                    const v = (valorTemporal ?? "").trim();
                    if (!v) return message.warning(t("perfil.errorMatriculaRequerida"));
                    guardarCampo({ matricula: v });
                  },
                  editor: (
                    <Input
                      autoFocus
                      value={valorTemporal}
                      onChange={(e) => setValorTemporal(e.target.value)}
                      onPressEnter={() => {
                        const v = (valorTemporal ?? "").trim();
                        if (v) guardarCampo({ matricula: v });
                      }}
                      style={{ width: 220 }}
                    />
                  ),
                })}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* Modal: Cambiar Contraseña */}
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
