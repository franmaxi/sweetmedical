import { useEffect, useMemo, useState } from "react";
import { Card, Typography, Button, Space, Layout, Input, Select, message } from "antd";
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getObrasSocialesApi, getPlanesPorObraSocialApi, getMedicoById, getPacienteById, updateMedico, updatePaciente } from "../api/api";

const { Title, Text } = Typography;
const { Content } = Layout;

export default function MiPerfil() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [obrasSociales, setObrasSociales] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [obraSocialId, setObraSocialId] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [editingValue, setEditingValue] = useState("");

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
            setObraSocialId(payload.obraSocial._id || payload.obraSocial);
          }
        } else if (isPaciente) {
          const res = await getPacienteById({ pacienteId: user.userId });
          const payload = res?.data ?? res;
          setProfile(payload);

          if (payload.obraSocial?._id || payload.obraSocial) {
            setObraSocialId(payload.obraSocial._id || payload.obraSocial);
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
  }, [isMedico, isPaciente, isAdmin, t, user]);

  useEffect(() => {
    getObrasSocialesApi()
      .then((res) => setObrasSociales(res.data ?? []))
      .catch(() => setObrasSociales([]));
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

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSaveField = async (field) => {
    if (field === "password") {
      if (editingValue.trim().length === 0) {
        message.error(t("perfil.errorPassword"));
        return;
      }
      if (editingValue.trim().length < 6) {
        message.error(t("login.errorPasswordLength"));
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {};
      if (field === "nombre") payload.nombre = editingValue;
      if (field === "nombreUsuario") payload.nombreUsuario = editingValue;
      if (field === "password") payload.password = editingValue;
      if (field === "dni") payload.dni = Number(editingValue);
      if (field === "matricula") payload.matricula = editingValue;
      if (field === "obraSocialId") payload.obraSocialId = editingValue;
      if (field === "planId") payload.planId = editingValue;

      if (isMedico) {
        await updateMedico({ medicoId: user.userId, payload });
      } else if (isPaciente) {
        await updatePaciente({ pacienteId: user.userId, payload });
      } else if (isAdmin) {
        if (field === "nombre") {
          setProfile((current) => ({
            ...current,
            nombre: editingValue,
          }));
        }
        if (field === "nombreUsuario") {
          setProfile((current) => ({
            ...current,
            usuario: { ...current.usuario, nombreUsuario: editingValue },
          }));
        }
      }

      message.success(t("perfil.success"));
      setEditingField(null);
      setEditingValue("");

      if (isMedico) {
        const res = await getMedicoById({ medicoId: user.userId });
        setProfile(res?.data ?? res);
      } else if (isPaciente) {
        const res = await getPacienteById({ pacienteId: user.userId });
        setProfile(res?.data ?? res);
      }
    } catch (error) {
      const msg = error.response?.data?.message || t("perfil.errorGuardar");
      message.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelField = () => {
    setEditingField(null);
    setEditingValue("");
  };

  const roleKey = user?.role === "usuario" ? "paciente" : user?.role;
  const planLabel = profile?.plan?.nombre || (typeof profile?.plan === "string" ? planes.find((p) => p._id === profile.plan)?.nombre : undefined) || profile?.plan;
  const obraSocialLabel = profile?.obraSocial?.nombre || (typeof profile?.obraSocial === "string" ? obrasSociales.find((o) => o._id === profile.obraSocial)?.nombre : undefined) || profile?.obraSocial;
  const canEditPatientFields = isPaciente;
  const canEditDoctorFields = isMedico;
  const canEditAdminBaseFields = isAdmin;

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
                <Button type="primary" onClick={() => navigate("/login") }>
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
      <Content style={{ minHeight: "70vh", padding: "clamp(24px, 5vw, 48px) 16px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Card loading={loading}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
              <div>
                <Title level={2} style={{ marginBottom: 4 }}>
                  {t("perfil.titulo")}
                </Title>
                <Text type="secondary">{t("perfil.descripcion")}</Text>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <Text strong>{t(`perfil.role.${roleKey}`) || t("perfil.role.default")}</Text>
                <Button danger onClick={handleLogout}>{t("navbar.logout")}</Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <div>
                    <Text strong>{t("perfil.nombre")}:</Text>
                    <div>{profile?.nombre || profile?.usuario?.nombreUsuario || user.username}</div>
                  </div>
                  {editingField === "nombre" ? (
                    <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} style={{ width: 260 }} />
                      <Button type="text" icon={<CheckOutlined />} onClick={() => handleSaveField("nombre")} loading={saving} />
                      <Button type="text" icon={<CloseOutlined />} onClick={handleCancelField} />
                    </span>
                  ) : (
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingField("nombre"); setEditingValue(profile?.nombre || ""); }} />
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <div>
                    <Text strong>{t("perfil.usuario")}:</Text>
                    <div>{profile?.usuario?.nombreUsuario || user.username}</div>
                  </div>
                  {editingField === "nombreUsuario" ? (
                    <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} style={{ width: 260 }} />
                      <Button type="text" icon={<CheckOutlined />} onClick={() => handleSaveField("nombreUsuario")} loading={saving} />
                      <Button type="text" icon={<CloseOutlined />} onClick={handleCancelField} />
                    </span>
                  ) : (
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingField("nombreUsuario"); setEditingValue(profile?.usuario?.nombreUsuario || ""); }} />
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                  <div>
                    <Text strong>{t("perfil.password")}:</Text>
                    <div>••••••••</div>
                  </div>
                  {editingField === "password" ? (
                    <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Input.Password value={editingValue} onChange={(e) => setEditingValue(e.target.value)} style={{ width: 260 }} placeholder={t("perfil.passwordPlaceholder")} />
                      <Button type="text" icon={<CheckOutlined />} onClick={() => handleSaveField("password")} loading={saving} />
                      <Button type="text" icon={<CloseOutlined />} onClick={handleCancelField} />
                    </span>
                  ) : (
                    <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingField("password"); setEditingValue(""); }} />
                  )}
                </div>

                {canEditPatientFields && (
                  <>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                      <div>
                        <Text strong>{t("registro.paciente.dniLabel")}:</Text>
                        <div>{profile?.dni}</div>
                      </div>
                      {editingField === "dni" ? (
                        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} style={{ width: 200 }} type="number" />
                          <Button type="text" icon={<CheckOutlined />} onClick={() => handleSaveField("dni")} loading={saving} />
                          <Button type="text" icon={<CloseOutlined />} onClick={handleCancelField} />
                        </span>
                      ) : (
                        <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingField("dni"); setEditingValue(profile?.dni || ""); }} />
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                      <div>
                        <Text strong>{t("registro.paciente.obraSocialLabel")}:</Text>
                        <div>{obraSocialLabel}</div>
                      </div>
                      {editingField === "obraSocialId" ? (
                        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Select
                            value={editingValue}
                            onChange={(value) => {
                              setEditingValue(value);
                              setObraSocialId(value);
                            }}
                            options={obrasSociales.map((o) => ({ value: o._id, label: o.nombre }))}
                            style={{ width: 220 }}
                          />
                          <Button type="text" icon={<CheckOutlined />} onClick={() => handleSaveField("obraSocialId")} loading={saving} />
                          <Button type="text" icon={<CloseOutlined />} onClick={handleCancelField} />
                        </span>
                      ) : (
                        <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingField("obraSocialId"); setEditingValue(profile?.obraSocial?._id || profile?.obraSocial || ""); }} />
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                      <div>
                        <Text strong>{t("registro.paciente.planLabel")}:</Text>
                        <div>{planLabel}</div>
                      </div>
                      {editingField === "planId" ? (
                        <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Select
                            value={editingValue}
                            onChange={(value) => setEditingValue(value)}
                            options={planes.map((p) => ({ value: p._id, label: p.nombre }))}
                            style={{ width: 220 }}
                            disabled={!planes.length}
                          />
                          <Button type="text" icon={<CheckOutlined />} onClick={() => handleSaveField("planId")} loading={saving} />
                          <Button type="text" icon={<CloseOutlined />} onClick={handleCancelField} />
                        </span>
                      ) : (
                        <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingField("planId"); setEditingValue(profile?.plan?._id || profile?.plan || ""); }} />
                      )}
                    </div>
                  </>
                )}

                {isMedico && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
                    <div>
                      <Text strong>{t("registro.medico.matriculaLabel")}:</Text>
                      <div>{profile?.matricula}</div>
                    </div>
                    {editingField === "matricula" ? (
                      <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} style={{ width: 260 }} />
                        <Button type="text" icon={<CheckOutlined />} onClick={() => handleSaveField("matricula")} loading={saving} />
                        <Button type="text" icon={<CloseOutlined />} onClick={handleCancelField} />
                      </span>
                    ) : (
                      <Button type="text" icon={<EditOutlined />} onClick={() => { setEditingField("matricula"); setEditingValue(profile?.matricula || ""); }} />
                    )}
                  </div>
                )}
              </div>
            </Space>
          </Card>
        </div>
      </Content>
      <Footer />
    </Layout>
  );
}
