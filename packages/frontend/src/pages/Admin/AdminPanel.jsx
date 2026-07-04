import { useCallback, useEffect, useState } from "react";
import {
  App as AntApp,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Layout,
  Modal,
  Space,
  Table,
  Typography,
} from "antd";
import {
  DashboardOutlined,
  EditOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  PushpinOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  getSedes,
  crearSede,
  actualizarSede,
  getPracticasGenericas,
  crearPracticaGenerica,
  actualizarPracticaGenerica,
  getEspecialidadesGenericas,
  crearEspecialidadGenerica,
  actualizarEspecialidadGenerica,
} from "../../api/api";

const { Title, Text } = Typography;

const idDe = (x) => String(x?._id ?? x?.id ?? x);

export default function AdminPanel() {
  return (
    <AntApp>
      <AdminPanelInner />
    </AntApp>
  );
}

const SECCIONES = [
  {
    key: "sedes",
    icon: <PushpinOutlined />,
    accent: "#be123c",
    loadFn: () => getSedes({ limit: 100 }),
    render: (props) => <SedesTab {...props} />,
  },
  {
    key: "practicas",
    icon: <MedicineBoxOutlined />,
    accent: "#2e9e83",
    loadFn: () => getPracticasGenericas({ limit: 100 }),
    render: (props) => <PracticasTab {...props} />,
  },
  {
    key: "especialidades",
    icon: <SettingOutlined />,
    accent: "#7d5bd6",
    loadFn: () => getEspecialidadesGenericas({ limit: 100 }),
    render: (props) => <EspecialidadesTab {...props} />,
  },
];

function AdminPanelInner() {
  const { t } = useTranslation();
  const [seccionActiva, setSeccionActiva] = useState("sedes");
  const [counts, setCounts] = useState({});

  const recargarCounts = useCallback(() => {
    Promise.all(
      SECCIONES.map((seccion) =>
        seccion
          .loadFn()
          .then((res) => [
            seccion.key,
            Array.isArray(res?.data) ? res.data.length : 0,
          ])
          .catch(() => [seccion.key, null]),
      ),
    ).then((pares) => setCounts(Object.fromEntries(pares)));
  }, []);

  useEffect(() => {
    recargarCounts();
  }, [recargarCounts]);

  const seccionActual =
    SECCIONES.find((s) => s.key === seccionActiva) ?? SECCIONES[0];

  return (
    <Layout
      style={{
        background:
          "radial-gradient(circle at 0% 0%, rgba(190, 18, 60, 0.12), transparent 42%), radial-gradient(circle at 100% 0%, rgba(125, 91, 214, 0.10), transparent 40%), linear-gradient(180deg, #f6f8fc 0%, #eef2f8 100%)",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <Layout.Content
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "clamp(20px, 4vw, 36px) clamp(12px, 4vw, 24px)",
          width: "100%",
        }}
      >
        <Card
          bordered={false}
          style={{
            marginBottom: 20,
            borderRadius: 24,
            background:
              "linear-gradient(135deg, #881337 0%, #be123c 55%, #e11d48 100%)",
            color: "#fff",
            boxShadow: "0 24px 60px rgba(159, 18, 57, 0.22)",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: "clamp(22px, 4vw, 34px)" }}
        >
          <Space
            size={12}
            align="center"
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.14)",
              fontSize: 12,
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            <DashboardOutlined />
            {t("admin.titulo")}
          </Space>
          <Title level={2} style={{ margin: "14px 0 4px", color: "#fff" }}>
            {t("admin.tabs." + seccionActiva)}
          </Title>
          <Text style={{ color: "rgba(255,255,255,0.82)", maxWidth: 640 }}>
            {t("admin.subtitulo")}
          </Text>
        </Card>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          {SECCIONES.map((seccion) => {
            const activa = seccion.key === seccionActiva;
            const total = counts[seccion.key];
            return (
              <Card
                key={seccion.key}
                hoverable
                bordered={false}
                onClick={() => setSeccionActiva(seccion.key)}
                style={{
                  borderRadius: 20,
                  cursor: "pointer",
                  boxShadow: activa
                    ? `0 16px 36px ${seccion.accent}33`
                    : "0 10px 28px rgba(15, 23, 42, 0.06)",
                  border: activa
                    ? `2px solid ${seccion.accent}`
                    : "2px solid transparent",
                  transition: "all 0.2s ease",
                }}
                bodyStyle={{ padding: 18 }}
              >
                <Space
                  align="start"
                  style={{ width: "100%", justifyContent: "space-between" }}
                >
                  <div>
                    <Text
                      type="secondary"
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        fontSize: 12,
                      }}
                    >
                      {t("admin.tabs." + seccion.key)}
                    </Text>
                    <div
                      style={{
                        fontSize: 30,
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: "#1f2937",
                      }}
                    >
                      {total ?? "—"}
                    </div>
                  </div>
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      background: `${seccion.accent}1a`,
                      color: seccion.accent,
                      flex: "0 0 auto",
                    }}
                  >
                    {seccion.icon}
                  </span>
                </Space>
              </Card>
            );
          })}
        </div>

        <Card
          bordered={false}
          style={{
            borderRadius: 24,
            boxShadow: "0 18px 44px rgba(15, 23, 42, 0.08)",
          }}
          bodyStyle={{ padding: "clamp(16px, 3vw, 24px)" }}
        >
          <Space direction="vertical" size={4} style={{ marginBottom: 16 }}>
            <Space size={10} align="center">
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  background: `${seccionActual.accent}1a`,
                  color: seccionActual.accent,
                }}
              >
                {seccionActual.icon}
              </span>
              <Title level={4} style={{ margin: 0 }}>
                {t("admin.tabs." + seccionActiva)}
              </Title>
            </Space>
          </Space>
          {seccionActual.render({ onChanged: recargarCounts })}
        </Card>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

/**
 * Tab CRUD genérico y reutilizable.
 * - fields: descripción de los campos del formulario/tabla
 * - loadFn / createFn / updateFn: helpers de api.js
 * - onChanged: callback tras un alta/edición (para refrescar contadores)
 * - toPayload: arma el body a partir de los valores del formulario
 */
function CrudTab({
  fields,
  loadFn,
  createFn,
  updateFn,
  textos,
  onChanged,
}) {
  const { message } = AntApp.useApp();
  const [form] = Form.useForm();

  const [items, setItems] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [enEdicion, setEnEdicion] = useState(null); // item que se está editando (null = alta)

  const recargar = () => {
    setCargando(true);
    loadFn()
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        setItems(data);
      })
      .catch(() => message.error(textos.errorCargar))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const abrirAlta = () => {
    setEnEdicion(null);
    form.resetFields();
    setModalAbierto(true);
  };

  const abrirEdicion = (item) => {
    setEnEdicion(item);
    const valores = {};
    fields.forEach((f) => {
      valores[f.name] = item[f.name];
    });
    form.setFieldsValue(valores);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    form.resetFields();
    setEnEdicion(null);
  };

  const guardar = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setGuardando(true);
    try {
      if (enEdicion) {
        await updateFn({ id: idDe(enEdicion), ...values });
        message.success(textos.actualizado);
      } else {
        await createFn(values);
        message.success(textos.creado);
      }
      cerrarModal();
      recargar();
      onChanged?.();
    } catch (error) {
      const detalle = error?.response?.data?.message;
      message.error(detalle || textos.errorGuardar);
    } finally {
      setGuardando(false);
    }
  };

  const columns = [
    ...fields.map((f) => ({
      title: f.label,
      dataIndex: f.name,
      width: f.width,
    })),
    {
      title: textos.acciones,
      width: 120,
      render: (_, item) => (
        <Button
          size="small"
          icon={<EditOutlined />}
          onClick={() => abrirEdicion(item)}
        >
          {textos.editar}
        </Button>
      ),
    },
  ];

  const dataSource = items.map((it) => ({ ...it, key: idDe(it) }));

  return (
    <>
      <Space
        wrap
        style={{ width: "100%", justifyContent: "flex-end", marginBottom: 12 }}
      >
        <Button type="primary" icon={<PlusOutlined />} onClick={abrirAlta}>
          {textos.nuevo}
        </Button>
      </Space>

      <Card bodyStyle={{ padding: 0 }}>
        <Table
          loading={cargando}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ x: 480 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={textos.vacio}
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={enEdicion ? textos.editarTitle : textos.crearTitle}
        open={modalAbierto}
        onOk={guardar}
        onCancel={cerrarModal}
        okText={textos.guardar}
        cancelText={textos.cancelar}
        confirmLoading={guardando}
        maskClosable={!guardando}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          {fields.map((f) => (
            <Form.Item
              key={f.name}
              name={f.name}
              label={f.label}
              rules={f.rules}
              extra={f.extra}
            >
              <Input placeholder={f.placeholder} maxLength={f.maxLength} />
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
}

function SedesTab({ onChanged }) {
  const { t } = useTranslation();
  return (
    <CrudTab
      loadFn={() => getSedes({ limit: 100 })}
      createFn={crearSede}
      updateFn={actualizarSede}
      onChanged={onChanged}
      fields={[
        {
          name: "nombre",
          label: t("admin.campos.nombre"),
          rules: [{ required: true, message: t("admin.validacion.nombreRequerido") }],
        },
        {
          name: "direccion",
          label: t("admin.campos.direccion"),
          rules: [{ required: true, message: t("admin.validacion.direccionRequerida") }],
        },
      ]}
      textos={buildTextos(t, "sedes")}
    />
  );
}

function PracticasTab({ onChanged }) {
  const { t } = useTranslation();
  return (
    <CrudTab
      loadFn={() => getPracticasGenericas({ limit: 100 })}
      createFn={crearPracticaGenerica}
      updateFn={actualizarPracticaGenerica}
      onChanged={onChanged}
      fields={[
        {
          name: "nombre",
          label: t("admin.campos.nombre"),
          rules: [{ required: true, message: t("admin.validacion.nombreRequerido") }],
        },
        {
          name: "codigo",
          label: t("admin.campos.codigo"),
          width: 140,
          rules: [{ required: true, message: t("admin.validacion.codigoRequerido") }],
        },
        {
          name: "emoji",
          label: t("admin.campos.emoji"),
          width: 90,
          maxLength: 4,
          extra: t("admin.hints.emoji"),
          rules: [{ required: true, message: t("admin.validacion.emojiRequerido") }],
        },
      ]}
      textos={buildTextos(t, "practicas")}
    />
  );
}

function EspecialidadesTab({ onChanged }) {
  const { t } = useTranslation();
  return (
    <CrudTab
      loadFn={() => getEspecialidadesGenericas({ limit: 100 })}
      createFn={crearEspecialidadGenerica}
      updateFn={actualizarEspecialidadGenerica}
      onChanged={onChanged}
      fields={[
        {
          name: "nombre",
          label: t("admin.campos.nombre"),
          rules: [{ required: true, message: t("admin.validacion.nombreRequerido") }],
        },
        {
          name: "emoji",
          label: t("admin.campos.emoji"),
          width: 90,
          maxLength: 4,
          extra: t("admin.hints.emoji"),
          rules: [{ required: true, message: t("admin.validacion.emojiRequerido") }],
        },
      ]}
      textos={buildTextos(t, "especialidades")}
    />
  );
}

// Textos compartidos + específicos por entidad
function buildTextos(t, entidad) {
  return {
    nuevo: t("admin.acciones.nuevo"),
    editar: t("admin.acciones.editar"),
    guardar: t("admin.acciones.guardar"),
    cancelar: t("admin.acciones.cancelar"),
    acciones: t("admin.acciones.acciones"),
    creado: t("admin.mensajes.creado"),
    actualizado: t("admin.mensajes.actualizado"),
    errorCargar: t("admin.mensajes.errorCargar"),
    errorGuardar: t("admin.mensajes.errorGuardar"),
    vacio: t(`admin.vacio.${entidad}`),
    crearTitle: t(`admin.modal.crear.${entidad}`),
    editarTitle: t(`admin.modal.editar.${entidad}`),
  };
}