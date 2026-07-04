import { useEffect, useMemo, useState } from "react";
import { App as AntApp, Button, Card, Descriptions, Form, Input, Layout, Modal, Select, Space, Typography } from "antd";
import { CheckOutlined, CloseOutlined, EditOutlined } from "@ant-design/icons";
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

function FilaTexto({ value, editing, editingValue, onChangeValue, onEdit, onCancel, onSave, saving, inputType = "text", disabled }) {
  if (editing) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Input
          type={inputType}
          value={editingValue}
          onChange={(e) => onChangeValue(e.target.value)}
          autoFocus
          style={{ maxWidth: 260 }}
        />
        <Space size={4}>
          <Button type="text" icon={<CheckOutlined />} onClick={onSave} loading={saving} />
          <Button type="text" icon={<CloseOutlined />} onClick={onCancel} />
        </Space>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
      <Text>{value !== undefined && value !== null && value !== "" ? value : "—"}</Text>
      <Button type="text" icon={<EditOutlined />} onClick={onEdit} disabled={disabled} />
    </div>
  );
}

function MiPerfilInner() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { message } = AntApp.useApp();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [profile, setProfile] = useState(null);
  const [obrasSociales, setObrasSociales] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [obraSocialIdSeleccionada, setObraSocialIdSeleccionada] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [editingPasswordActual, setEditingPasswordActual] = useState("");
  const [editingPasswordConfirm, setEditingPasswordConfirm] = useState("");
  const [guardandoCampo, setGuardandoCampo] = useState(false);

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

  const passwordEditError = useMemo(() => {
    if (editingField !== "password") return null;

    const actual = editingPasswordActual;
    const nueva = editingValue;
    const confirmacion = editingPasswordConfirm;

    if (!actual && !nueva && !confirmacion) return null;
    if (!actual) return t("perfil.errorPasswordActualRequerida");
    if (!nueva && confirmacion) return t("perfil.errorPassword");
    if (nueva && nueva.length < 6) return t("login.errorPasswordLength");
    if (nueva && confirmacion && nueva !== confirmacion) return t("registro.errorPasswordNoCoincide");
    return null;
  }, [editingField, editingValue, editingPasswordActual, editingPasswordConfirm, t]);

  const roleKey = user?.role === "usuario" ? "paciente" : user?.role;
  const planLabel = profile?.plan?.nombre || (typeof profile?.plan === "string" ? planes.find((p) => p._id === profile.plan)?.nombre : undefined) || profile?.plan;
  const obraSocialLabel = profile?.obraSocial?.nombre || (typeof profile?.obraSocial === "string" ? obrasSociales.find((o) => o._id === profile.obraSocial)?.nombre : undefined) || profile?.obraSocial;

  // Aplica los cambios al backend (o al estado local para admin) y refresca el perfil.
  // Devuelve true si se guardó algo, false si no había nada para actualizar o falló.
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

  const abrirEdicion = () => {
    cancelarEdicionCampo();

    const obraSocialId = profile?.obraSocial?._id || profile?.obraSocial || undefined;

    form.resetFields();
    form.setFieldsValue({
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

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    form.resetFields();
  };

  const guardarEdicion = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    const payload = {};
    if (values.nombre?.trim()) payload.nombre = values.nombre.trim();
    if (values.nombreUsuario?.trim()) payload.nombreUsuario = values.nombreUsuario.trim();
    if (values.passwordNueva) {
      payload.passwordNueva = values.passwordNueva;
      payload.passwordActual = values.passwordActual;
    }
    if (isPaciente) {
      if (values.dni !== undefined && values.dni !== "") payload.dni = Number(values.dni);
      if (values.obraSocialId) payload.obraSocialId = values.obraSocialId;
      if (values.planId) payload.planId = values.planId;
    }
    if (isMedico && values.matricula?.trim()) {
      payload.matricula = values.matricula.trim();
    }

    setGuardando(true);
    const guardo = await persistirPerfil(payload);
    setGuardando(false);

    if (guardo) {
      setModalAbierto(false);
      form.resetFields();
    }
  };

  const iniciarEdicionCampo = (field, valorInicial) => {
    setEditingField(field);
    setEditingValue(valorInicial ?? "");
    setEditingPasswordActual("");
    setEditingPasswordConfirm("");
  };

  const cancelarEdicionCampo = () => {
    setEditingField(null);
    setEditingValue("");
    setEditingPasswordActual("");
    setEditingPasswordConfirm("");
  };

  const guardarCampo = async (field) => {
    const payload = {};

    if (field === "password") {
      const actual = editingPasswordActual;
      const nueva = editingValue;
      const confirmacion = editingPasswordConfirm;

      if (!actual && !nueva && !confirmacion) {
        // nada para cambiar
      } else if (!actual) {
        message.error(t("perfil.errorPasswordActualRequerida"));
        return;
      } else if (!nueva) {
        message.error(t("perfil.errorPassword"));
        return;
      } else if (nueva.length < 6) {
        message.error(t("login.errorPasswordLength"));
        return;
      } else if (!confirmacion) {
        message.error(t("registro.errorConfirmarPassword"));
        return;
      } else if (nueva !== confirmacion) {
        message.error(t("registro.errorPasswordNoCoincide"));
        return;
      } else {
        payload.passwordActual = actual;
        payload.passwordNueva = nueva;
      }
    } else if (field === "dni") {
      if (editingValue !== "" && editingValue !== undefined && editingValue !== null) {
        payload.dni = Number(editingValue);
      }
    } else if (field === "obraSocialId" || field === "planId") {
      if (editingValue) payload[field] = editingValue;
    } else if (editingValue?.trim()) {
      payload[field] = editingValue.trim();
    }

    setGuardandoCampo(true);
    const guardo = await persistirPerfil(payload);
    setGuardandoCampo(false);

    if (guardo) cancelarEdicionCampo();
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
          <Space>
            <Button type="primary" icon={<EditOutlined />} onClick={abrirEdicion} disabled={!!editingField}>
              {t("perfil.editar")}
            </Button>
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
              <FilaTexto
                value={profile?.nombre || profile?.usuario?.nombreUsuario || user.username}
                editing={editingField === "nombre"}
                editingValue={editingValue}
                onChangeValue={setEditingValue}
                onEdit={() => iniciarEdicionCampo("nombre", profile?.nombre || "")}
                onCancel={cancelarEdicionCampo}
                onSave={() => guardarCampo("nombre")}
                saving={guardandoCampo}
                disabled={modalAbierto}
              />
            </Descriptions.Item>

            <Descriptions.Item label={t("perfil.usuario")}>
              <FilaTexto
                value={profile?.usuario?.nombreUsuario || user.username}
                editing={editingField === "nombreUsuario"}
                editingValue={editingValue}
                onChangeValue={setEditingValue}
                onEdit={() => iniciarEdicionCampo("nombreUsuario", profile?.usuario?.nombreUsuario || "")}
                onCancel={cancelarEdicionCampo}
                onSave={() => guardarCampo("nombreUsuario")}
                saving={guardandoCampo}
                disabled={modalAbierto}
              />
            </Descriptions.Item>

            <Descriptions.Item label={t("perfil.password")}>
              {editingField === "password" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 260 }}>
                  <Input.Password
                    placeholder={t("perfil.passwordActualPlaceholder")}
                    value={editingPasswordActual}
                    onChange={(e) => setEditingPasswordActual(e.target.value)}
                    autoComplete="current-password"
                    status={passwordEditError ? "error" : ""}
                  />
                  <Input.Password
                    placeholder={t("perfil.nuevaPassword")}
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    autoComplete="new-password"
                    status={passwordEditError ? "error" : ""}
                  />
                  <Input.Password
                    placeholder={t("registro.confirmarPasswordLabel")}
                    value={editingPasswordConfirm}
                    onChange={(e) => setEditingPasswordConfirm(e.target.value)}
                    autoComplete="new-password"
                    status={passwordEditError ? "error" : ""}
                  />
                  {passwordEditError && (
                    <Text type="danger" style={{ fontSize: 12 }}>
                      {passwordEditError}
                    </Text>
                  )}
                  <Space size={4}>
                    <Button
                      type="text"
                      icon={<CheckOutlined />}
                      onClick={() => guardarCampo("password")}
                      loading={guardandoCampo}
                      disabled={!!passwordEditError}
                    />
                    <Button type="text" icon={<CloseOutlined />} onClick={cancelarEdicionCampo} />
                  </Space>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <Text>••••••••</Text>
                  <Button type="text" icon={<EditOutlined />} onClick={() => iniciarEdicionCampo("password", "")} disabled={modalAbierto} />
                </div>
              )}
            </Descriptions.Item>

            {isPaciente && (
              <>
                <Descriptions.Item label={t("registro.paciente.dniLabel")}>
                  <FilaTexto
                    value={profile?.dni}
                    editing={editingField === "dni"}
                    editingValue={editingValue}
                    onChangeValue={setEditingValue}
                    onEdit={() => iniciarEdicionCampo("dni", profile?.dni ?? "")}
                    onCancel={cancelarEdicionCampo}
                    onSave={() => guardarCampo("dni")}
                    saving={guardandoCampo}
                    inputType="number"
                    disabled={modalAbierto}
                  />
                </Descriptions.Item>

                <Descriptions.Item label={t("registro.paciente.obraSocialLabel")}>
                  {editingField === "obraSocialId" ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Select
                        value={editingValue || undefined}
                        placeholder={t("registro.paciente.placeholderObraSocial")}
                        options={obrasSociales.map((o) => ({ value: o._id, label: o.nombre }))}
                        onChange={(v) => {
                          setEditingValue(v ?? "");
                          setObraSocialIdSeleccionada(v ?? null);
                        }}
                        allowClear
                        style={{ minWidth: 220 }}
                      />
                      <Space size={4}>
                        <Button type="text" icon={<CheckOutlined />} onClick={() => guardarCampo("obraSocialId")} loading={guardandoCampo} />
                        <Button type="text" icon={<CloseOutlined />} onClick={cancelarEdicionCampo} />
                      </Space>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                      <Text>{obraSocialLabel || "—"}</Text>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => iniciarEdicionCampo("obraSocialId", profile?.obraSocial?._id || profile?.obraSocial || undefined)}
                        disabled={modalAbierto}
                      />
                    </div>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label={t("registro.paciente.planLabel")}>
                  {editingField === "planId" ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Select
                        value={editingValue || undefined}
                        placeholder={planes.length ? t("registro.paciente.placeholderPlan") : t("registro.paciente.placeholderPlanFirst")}
                        disabled={!planes.length}
                        options={planes.map((p) => ({ value: p._id, label: p.nombre }))}
                        onChange={(v) => setEditingValue(v ?? "")}
                        allowClear
                        style={{ minWidth: 220 }}
                      />
                      <Space size={4}>
                        <Button type="text" icon={<CheckOutlined />} onClick={() => guardarCampo("planId")} loading={guardandoCampo} />
                        <Button type="text" icon={<CloseOutlined />} onClick={cancelarEdicionCampo} />
                      </Space>
                    </div>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                      <Text>{planLabel || "—"}</Text>
                      <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => iniciarEdicionCampo("planId", profile?.plan?._id || profile?.plan || undefined)}
                        disabled={modalAbierto}
                      />
                    </div>
                  )}
                </Descriptions.Item>
              </>
            )}

            {isMedico && (
              <Descriptions.Item label={t("registro.medico.matriculaLabel")}>
                <FilaTexto
                  value={profile?.matricula}
                  editing={editingField === "matricula"}
                  editingValue={editingValue}
                  onChangeValue={setEditingValue}
                  onEdit={() => iniciarEdicionCampo("matricula", profile?.matricula || "")}
                  onCancel={cancelarEdicionCampo}
                  onSave={() => guardarCampo("matricula")}
                  saving={guardandoCampo}
                  disabled={modalAbierto}
                />
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        <Modal
          title={t("perfil.editarTitulo")}
          open={modalAbierto}
          onOk={guardarEdicion}
          onCancel={cerrarModal}
          okText={t("perfil.guardar")}
          cancelText={t("perfil.cancelar")}
          confirmLoading={guardando}
          maskClosable={!guardando}
          destroyOnClose
        >
          <Form form={form} layout="vertical" preserve={false}>
            <Form.Item name="nombre" label={t("perfil.nombre")}>
              <Input />
            </Form.Item>

            <Form.Item name="nombreUsuario" label={t("perfil.usuario")}>
              <Input autoComplete="username" />
            </Form.Item>

            {isPaciente && (
              <Form.Item name="dni" label={t("registro.paciente.dniLabel")}>
                <Input type="number" />
              </Form.Item>
            )}

            {isMedico && (
              <Form.Item name="matricula" label={t("registro.medico.matriculaLabel")}>
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
                      form.setFieldValue("planId", undefined);
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

            {!isAdmin && (
              <>
                <Form.Item
                  name="passwordActual"
                  label={t("perfil.passwordActual")}
                  extra={t("perfil.passwordPlaceholder")}
                  dependencies={["passwordNueva"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value && getFieldValue("passwordNueva")) {
                          return Promise.reject(new Error(t("perfil.errorPasswordActualRequerida")));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input.Password autoComplete="current-password" placeholder={t("perfil.passwordActualPlaceholder")} />
                </Form.Item>

                <Form.Item
                  name="passwordNueva"
                  label={t("perfil.nuevaPassword")}
                  dependencies={["passwordActual"]}
                  rules={[
                    { min: 6, message: t("login.errorPasswordLength") },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value && getFieldValue("passwordActual")) {
                          return Promise.reject(new Error(t("perfil.errorPassword")));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input.Password autoComplete="new-password" />
                </Form.Item>

                <Form.Item
                  name="confirmarPassword"
                  label={t("registro.confirmarPasswordLabel")}
                  dependencies={["passwordNueva"]}
                  rules={[
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const passwordNueva = getFieldValue("passwordNueva");
                        if (!passwordNueva && !value) return Promise.resolve();
                        if (passwordNueva && !value) {
                          return Promise.reject(new Error(t("registro.errorConfirmarPassword")));
                        }
                        if (passwordNueva !== value) {
                          return Promise.reject(new Error(t("registro.errorPasswordNoCoincide")));
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Input.Password autoComplete="new-password" placeholder={t("registro.placeholderConfirmarPassword")} />
                </Form.Item>
              </>
            )}
          </Form>
        </Modal>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
