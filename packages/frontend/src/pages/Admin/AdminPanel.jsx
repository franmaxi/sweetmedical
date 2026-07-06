import { useCallback, useEffect, useMemo, useState } from "react";
import {
  App as AntApp,
  Button,
  Card,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  Layout,
  Modal,
  Popover,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import {
  DashboardOutlined,
  DeleteOutlined,
  EditOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
  PushpinOutlined,
  SettingOutlined,
  SmileOutlined,
  FileTextOutlined,
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
  getObrasSociales,
  crearObraSocial,
  getPlanes,
  crearPlan,
} from "../../api/api";
import { extraerMensajeError } from "../../api/errorUtils";
import { CATEGORIAS_COMPLETAS, validarUnicoEmoji } from "../../utils/emojis";

const { Title, Text } = Typography;

const idDe = (x) => String(x?._id ?? x?.id ?? x);

function EmojiInput({ value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);

  const seleccionarEmoji = (emoji) => {
    onChange?.(emoji);
    setVisible(false);
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gap: 6,
    maxHeight: 220,
    overflowY: "auto",
    padding: "8px 4px",
  };

  const emojiBtnStyle = {
    fontSize: 20,
    padding: 0,
    height: 34,
    width: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    transition: "all 0.15s ease",
  };

  const renderEmojiGrid = (emojis) => (
    <div style={gridStyle}>
      {emojis.map((emoji, index) => (
        <Button
          key={`${emoji}-${index}`}
          size="middle"
          type="text"
          style={emojiBtnStyle}
          onClick={() => seleccionarEmoji(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );

  const tabItems = CATEGORIAS_COMPLETAS.map((cat) => ({
    key: cat.key,
    label: cat.label,
    children: renderEmojiGrid(cat.emojis),
  }));

  const contenidoPopover = (
    <div style={{ width: 360 }}>
      <Tabs
        defaultActiveKey="medicina"
        size="small"
        items={tabItems}
        tabBarStyle={{ marginBottom: 4 }}
      />
    </div>
  );

  return (
    <Popover
      content={contenidoPopover}
      title={<Text strong style={{ fontSize: 13, padding: "8px 16px 0 16px", display: "block" }}>Seleccionar Emoji</Text>}
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
      placement="bottomLeft"
      overlayStyle={{ zIndex: 1050 }}
      overlayInnerStyle={{ padding: "0 12px 12px 12px" }}
    >
      <Input
        value={value}
        readOnly
        role = "button"
        tabIndex = {0}
        aria-haspopup="dialog"
        aria-expanded={visible}
        placeholder={placeholder || "Haz clic aquí para seleccionar un emoji..."}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setVisible(true);
          }
        }}
        style={{
          borderRadius: 8,
          cursor: "pointer",
          fontSize: value ? 20 : 14,
          textAlign: value ? "center" : "left",
          backgroundColor: "#fff"
        }}
      />
    </Popover>
  );
}

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
  {
    key: "obrasSociales",
    icon: <SmileOutlined />,
    accent: "#ea580c",
    loadFn: () => getObrasSociales(),
    render: (props) => <ObrasSocialesTab {...props} />,
  },
  {
    key: "planes",
    icon: <FileTextOutlined />,
    accent: "#0284c7",
    loadFn: () => getPlanes(),
    render: (props) => <PlanesTab {...props} />,
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
            <DashboardOutlined aria-hidden/>
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
                role = "button"
                tabIndex = {0}
                aria-pressed={activa}
                bordered={false}
                onClick={() => setSeccionActiva(seccion.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSeccionActiva(seccion.key);
                  }
                }}
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

  const [ items, setItems ] = useState([]);
  const [ cargando, setCargando ] = useState(true);
  const [ modalAbierto, setModalAbierto ] = useState(false);
  const [ guardando, setGuardando ] = useState(false);
  const [ enEdicion, setEnEdicion ] = useState(null); // item que se está editando (null = alta)

  const recargar = () => {
    setCargando(true);
    loadFn()
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : [];
        setItems(data);
      })
      .catch((err) => message.error(extraerMensajeError(err, textos.errorCargar)))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (modalAbierto) {
      if (enEdicion) {
        const valores = {};
        fields.forEach((f) => {
          valores[f.name] = enEdicion[f.name];
        });
        form.setFieldsValue(valores);
      } else {
        form.resetFields();
      }
    }
  }, [modalAbierto, enEdicion, fields, form]);

  const abrirAlta = () => {
    setEnEdicion(null);
    setModalAbierto(true);
  };

  const abrirEdicion = (item) => {
    setEnEdicion(item);
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
      message.error(extraerMensajeError(error, textos.errorGuardar));
    } finally {
      setGuardando(false);
    }
  };

  const columns = [
    ...fields.map((f) => ({
      title: f.label,
      dataIndex: f.name,
      width: f.width,
      render: f.render,
    })),
  ];

  if (updateFn) {
    columns.push({
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
    });
  }

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
        {modalAbierto && (
          <Form
            form={form}
            layout="vertical"
            key={enEdicion ? idDe(enEdicion) : "nuevo"}
            initialValues={enEdicion || {}}
          >
            {fields.map((f) => (
              <Form.Item
                key={f.name}
                name={f.name}
                label={f.label}
                rules={f.rules}
                extra={f.extra}
              >
                {f.type === "emoji" ? (
                  <EmojiInput placeholder={f.placeholder} />
                ) : f.type === "select" ? (
                  <Select placeholder={f.placeholder} options={f.options} loading={f.loading} />
                ) : (
                  <Input placeholder={f.placeholder} maxLength={f.maxLength} />
                )}
              </Form.Item>
            ))}
          </Form>
        )}
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
          type: "emoji",
          extra: t("admin.hints.emoji"),
          rules: [
            { required: true, message: t("admin.validacion.emojiRequerido") },
            { validator: validarUnicoEmoji }
          ],
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
          type: "emoji",
          extra: t("admin.hints.emoji"),
          rules: [
            { required: true, message: t("admin.validacion.emojiRequerido") },
            { validator: validarUnicoEmoji }
          ],
        },
      ]}
      textos={buildTextos(t, "especialidades")}
    />
  );
}

function ObrasSocialesTab({ onChanged }) {
  const { t } = useTranslation();
  return (
    <CrudTab
      loadFn={getObrasSociales}
      createFn={crearObraSocial}
      onChanged={onChanged}
      fields={[
        {
          name: "nombre",
          label: t("admin.campos.nombre"),
          rules: [{ required: true, message: t("admin.validacion.nombreRequerido") }],
        },
      ]}
      textos={buildTextos(t, "obrasSociales")}
    />
  );
}

const NIVELES_COBERTURA = [
  { value: "TOTAL", color: "green", label: "TOTAL" },
  { value: "PARCIAL", color: "gold", label: "PARCIAL" },
  { value: "NO CUBIERTA", color: "red", label: "NO CUBIERTA" }
];

const getColorPorNivel = (nivel) => {
  const n = NIVELES_COBERTURA.find(x => x.value === nivel);
  return n ? n.color : "default";
};

/**
 * Fila individual de cobertura (especialidad o práctica).
 * Props:
 *   item      – { id, especialidadGenerica|practicaGenerica, nivel, pocentajeDescuento }
 *   opciones  – [{ label, value }]
 *   loading   – boolean
 *   onChange  – (id, campo, valor) => void
 *   onRemove  – (id) => void
 *   labelSelect – string
 *   keyGenerica – "especialidadGenerica" | "practicaGenerica"
 *   t         – función de traducción
 */
function FilaCobertura({ item, opciones, loading, onChange, onRemove, labelSelect, keyGenerica, t }) {
  const isParcial = item.nivel === "PARCIAL";

  const handleNivelChange = (val) => {
    onChange(item.id, "nivel", val);
    if (val === "TOTAL") {
      onChange(item.id, "pocentajeDescuento", 100);
    } else if (val === "NO CUBIERTA") {
      onChange(item.id, "pocentajeDescuento", 0);
    } else if (val === "PARCIAL") {
      // Limpiamos el valor o lo dejamos null si no es un número válido para parcial
      if (item.pocentajeDescuento === 100 || item.pocentajeDescuento === 0) {
        onChange(item.id, "pocentajeDescuento", null);
      }
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        width: "100%",
        boxSizing: "border-box",
        background: "#f8fafc",
        borderRadius: 10,
        padding: "10px 12px",
        border: "1px solid #e2e8f0",
        marginBottom: 8,
      }}
    >
      {/* Select especialidad o práctica */}
      <Form.Item
        style={{ margin: 0, flex: 2 }}
        validateStatus={!item[keyGenerica] ? "error" : ""}
        help={!item[keyGenerica] ? t("admin.validacion." + (keyGenerica === "especialidadGenerica" ? "especialidadRequerida" : "practicaRequerida")) : null}
      >
        <Select
          placeholder={labelSelect}
          options={opciones}
          loading={loading}
          value={item[keyGenerica] || undefined}
          onChange={(val) => onChange(item.id, keyGenerica, val)}
          style={{ width: "100%" }}
          showSearch
          optionFilterProp="label"
        />
      </Form.Item>

      {/* Select nivel */}
      <Form.Item
        style={{ margin: 0, flex: 1.5 }}
        validateStatus={!item.nivel ? "error" : ""}
        help={!item.nivel ? t("admin.validacion.nivelRequerido") : null}
      >
        <Select
          placeholder={t("admin.campos.nivel")}
          value={item.nivel || undefined}
          onChange={handleNivelChange}
          style={{ width: "100%" }}
          options={NIVELES_COBERTURA.map((n) => ({
            label: <Tag color={n.color} style={{ margin: 0, display: "block", textAlign: "center" }}>{n.label}</Tag>,
            value: n.value
          }))}
        />
      </Form.Item>

      {/* Input porcentaje */}
      <Form.Item
        style={{ margin: 0, flex: 1 }}
        validateStatus={isParcial && (item.pocentajeDescuento == null || item.pocentajeDescuento < 1 || item.pocentajeDescuento > 99) ? "error" : ""}
        help={isParcial && (item.pocentajeDescuento == null || item.pocentajeDescuento < 1 || item.pocentajeDescuento > 99) ? t("admin.validacion.porcentajeInvalido") : null}
      >
        <InputNumber
          placeholder="%"
          min={1}
          max={99}
          step={1}
          disabled={!isParcial}
          value={item.pocentajeDescuento}
          onChange={(val) => onChange(item.id, "pocentajeDescuento", val)}
          style={{ width: "100%" }}
          addonAfter="%"
        />
      </Form.Item>

      {/* Botón eliminar */}
      <Button
        type="text"
        danger
        icon={<DeleteOutlined />}
        onClick={() => onRemove(item.id)}
      />
    </div>
  );
}

let nextCobId = 1;
const newCobertura = (extra = {}) => ({ id: nextCobId++, nivel: null, pocentajeDescuento: null, ...extra });

function PlanesTab({ onChanged }) {
  const { t } = useTranslation();
  const { message } = AntApp.useApp();
  const [form] = Form.useForm();

  const [planes, setPlanes]                     = useState([]);
  const [cargando, setCargando]                 = useState(true);
  const [modalAbierto, setModalAbierto]         = useState(false);
  const [guardando, setGuardando]               = useState(false);

  // Datos para los selects
  const [obrasSociales, setObrasSociales]       = useState([]);
  const [loadingOS, setLoadingOS]               = useState(true);
  const [especialidades, setEspecialidades]     = useState([]);
  const [loadingEsp, setLoadingEsp]             = useState(true);
  const [practicas, setPracticas]               = useState([]);
  const [loadingPrac, setLoadingPrac]           = useState(true);

  // Listas dinámicas de coberturas
  const [cobEspecialidades, setCobEspecialidades] = useState([]);
  const [cobPracticas, setCobPracticas]           = useState([]);

  // Error de "al menos una cobertura"
  const [errorCobertura, setErrorCobertura]     = useState(false);

  const recargar = () => {
    setCargando(true);
    getPlanes()
      .then((res) => setPlanes(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => message.error(extraerMensajeError(err, t("admin.mensajes.errorCargar"))))
      .finally(() => setCargando(false));
  };

  useEffect(() => { recargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    getObrasSociales()
      .then((res) => setObrasSociales(res?.data || []))
      .catch((err) => console.error("Error cargando obras sociales", err))
      .finally(() => setLoadingOS(false));

    getEspecialidadesGenericas({ limit: 200 })
      .then((res) => setEspecialidades(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => console.error("Error cargando especialidades", err))
      .finally(() => setLoadingEsp(false));

    getPracticasGenericas({ limit: 200 })
      .then((res) => setPracticas(Array.isArray(res?.data) ? res.data : []))
      .catch((err) => console.error("Error cargando prácticas", err))
      .finally(() => setLoadingPrac(false));
  }, []);

  const abrirAlta = () => {
    form.resetFields();
    setCobEspecialidades([]);
    setCobPracticas([]);
    setErrorCobertura(false);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    form.resetFields();
    setCobEspecialidades([]);
    setCobPracticas([]);
    setErrorCobertura(false);
  };

  const agregarEspecialidad = () =>
    setCobEspecialidades((prev) => [...prev, newCobertura({ especialidadGenerica: null })]);

  const agregarPractica = () =>
    setCobPracticas((prev) => [...prev, newCobertura({ practicaGenerica: null })]);

  const cambiarEspecialidad = (id, campo, valor) =>
    setCobEspecialidades((prev) => prev.map((c) => c.id === id ? { ...c, [campo]: valor } : c));

  const cambiarPractica = (id, campo, valor) =>
    setCobPracticas((prev) => prev.map((c) => c.id === id ? { ...c, [campo]: valor } : c));

  const quitarEspecialidad = (id) =>
    setCobEspecialidades((prev) => prev.filter((c) => c.id !== id));

  const quitarPractica = (id) =>
    setCobPracticas((prev) => prev.filter((c) => c.id !== id));

  const validarCoberturas = () => {
    const todasEsp = cobEspecialidades.every(
      (c) => c.especialidadGenerica && c.nivel && c.pocentajeDescuento != null && c.pocentajeDescuento >= (c.nivel === "PARCIAL" ? 1 : 0) && c.pocentajeDescuento <= (c.nivel === "PARCIAL" ? 99 : 100)
    );
    const todasPrac = cobPracticas.every(
      (c) => c.practicaGenerica && c.nivel && c.pocentajeDescuento != null && c.pocentajeDescuento >= (c.nivel === "PARCIAL" ? 1 : 0) && c.pocentajeDescuento <= (c.nivel === "PARCIAL" ? 99 : 100)
    );
    return todasEsp && todasPrac;
  };

  const guardar = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    // Al menos una cobertura requerida
    if (cobEspecialidades.length === 0 && cobPracticas.length === 0) {
      setErrorCobertura(true);
      return;
    }
    setErrorCobertura(false);

    // Validar campos internos de cada fila
    if (!validarCoberturas()) {
      message.error(t("admin.mensajes.errorGuardar"));
      return;
    }

    setGuardando(true);
    try {
      await crearPlan({
        idObraSocial: values.idObraSocial,
        nombre: values.nombre,
        coberturasEspecialidades: cobEspecialidades.map(({ especialidadGenerica, nivel, pocentajeDescuento }) => ({
          especialidadGenerica,
          nivel,
          pocentajeDescuento: pocentajeDescuento / 100,
        })),
        coberturasPracticas: cobPracticas.map(({ practicaGenerica, nivel, pocentajeDescuento }) => ({
          practicaGenerica,
          nivel,
          pocentajeDescuento: pocentajeDescuento / 100,
        })),
      });
      message.success(t("admin.mensajes.creado"));
      cerrarModal();
      recargar();
      onChanged?.();
    } catch (error) {
      message.error(extraerMensajeError(error, t("admin.mensajes.errorGuardar")));
    } finally {
      setGuardando(false);
    }
  };

  // Helpers para mostrar en tabla
  const opcionesEsp = especialidades.map((e) => ({ label: e.nombre, value: e._id || e.id }));
  const opcionesPrac = practicas.map((p) => ({ label: p.nombre, value: p._id || p.id }));

  const columns = [
    {
      title: t("admin.campos.obraSocial"),
      dataIndex: "obraSocialNombre",
      render: (val, record) => val || record.idObraSocial || "—",
    },
    {
      title: t("admin.campos.nombre"),
      dataIndex: "nombre",
    },
    {
      title: t("admin.planes.coberturasEspecialidades"),
      dataIndex: "coberturaEspecialidad",
      render: (list) => {
        if (!list?.length) return <Tag color="default">{t("admin.planes.sinCoberturas")}</Tag>;
        return (
          <Space wrap size={4}>
            {list.map((c, i) => (
              <Tag key={i} color={getColorPorNivel(c.nivel)}>
                {especialidades.find((e) => (e._id || e.id) === (c.especialidadGenerica?._id || c.especialidadGenerica))?.nombre || "—"}
                {" · "}{c.nivel}
                {" · "}{c.pocentajeDescuento != null ? `${Math.round(c.pocentajeDescuento * 100)}%` : ""}
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: t("admin.planes.coberturasPracticas"),
      dataIndex: "coberturaPractica",
      render: (list) => {
        if (!list?.length) return <Tag color="default">{t("admin.planes.sinCoberturas")}</Tag>;
        return (
          <Space wrap size={4}>
            {list.map((c, i) => (
              <Tag key={i} color={getColorPorNivel(c.nivel)}>
                {practicas.find((p) => (p._id || p.id) === (c.practicaGenerica?._id || c.practicaGenerica))?.nombre || "—"}
                {" · "}{c.nivel}
                {" · "}{c.pocentajeDescuento != null ? `${Math.round(c.pocentajeDescuento * 100)}%` : ""}
              </Tag>
            ))}
          </Space>
        );
      },
    },
  ];

  const dataSource = planes.map((p) => ({ ...p, key: idDe(p) }));

  return (
    <>
      <Space wrap style={{ width: "100%", justifyContent: "flex-end", marginBottom: 12 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={abrirAlta}>
          {t("admin.acciones.nuevo")}
        </Button>
      </Space>

      <Card bodyStyle={{ padding: 0 }}>
        <Table
          loading={cargando}
          columns={columns}
          dataSource={dataSource}
          pagination={false}
          scroll={{ x: 700 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={t("admin.vacio.planes")}
              />
            ),
          }}
        />
      </Card>

      <Modal
        title={t("admin.modal.crear.planes")}
        open={modalAbierto}
        onOk={guardar}
        onCancel={cerrarModal}
        okText={t("admin.acciones.guardar")}
        cancelText={t("admin.acciones.cancelar")}
        confirmLoading={guardando}
        maskClosable={!guardando}
        destroyOnClose
        width={800}
      >
        <Form form={form} layout="vertical">
          {/* Obra social */}
          <Form.Item
            name="idObraSocial"
            label={t("admin.campos.obraSocial")}
            rules={[{ required: true, message: t("admin.validacion.obraSocialRequerida") }]}
          >
            <Select
              placeholder={t("admin.validacion.obraSocialRequerida")}
              options={obrasSociales.map((os) => ({ label: os.nombre, value: os._id || os.id }))}
              loading={loadingOS}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          {/* Nombre del plan */}
          <Form.Item
            name="nombre"
            label={t("admin.campos.nombre")}
            rules={[{ required: true, message: t("admin.validacion.nombreRequerido") }]}
          >
            <Input placeholder={t("admin.campos.nombre")} />
          </Form.Item>

          {/* ── Coberturas de especialidades ── */}
          <Divider orientation="left" style={{ fontSize: 13, color: "#7c3aed", borderColor: "#ede9fe" }}>
            {t("admin.planes.coberturasEspecialidades")}
          </Divider>

          {cobEspecialidades.map((cob) => (
            <FilaCobertura
              key={cob.id}
              item={cob}
              opciones={opcionesEsp}
              loading={loadingEsp}
              onChange={cambiarEspecialidad}
              onRemove={quitarEspecialidad}
              labelSelect={t("admin.campos.especialidad")}
              keyGenerica="especialidadGenerica"
              t={t}
            />
          ))}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={agregarEspecialidad}
            style={{ width: "100%", marginBottom: 8 }}
          >
            {t("admin.planes.agregarEspecialidad")}
          </Button>

          {/* ── Coberturas de prácticas ── */}
          <Divider orientation="left" style={{ fontSize: 13, color: "#0369a1", borderColor: "#e0f2fe" }}>
            {t("admin.planes.coberturasPracticas")}
          </Divider>

          {cobPracticas.map((cob) => (
            <FilaCobertura
              key={cob.id}
              item={cob}
              opciones={opcionesPrac}
              loading={loadingPrac}
              onChange={cambiarPractica}
              onRemove={quitarPractica}
              labelSelect={t("admin.campos.practica")}
              keyGenerica="practicaGenerica"
              t={t}
            />
          ))}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={agregarPractica}
            style={{ width: "100%", marginBottom: 8 }}
          >
            {t("admin.planes.agregarPractica")}
          </Button>

          {/* Alerta de "al menos una cobertura" */}
          {errorCobertura && (
            <div style={{ color: "#dc2626", fontSize: 13, marginTop: 4 }}>
              {t("admin.validacion.alMenosUnaCobertura")}
            </div>
          )}
        </Form>
      </Modal>
    </>
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