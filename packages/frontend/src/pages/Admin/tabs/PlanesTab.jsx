import { useEffect, useState } from "react";
import {
  App as AntApp,
  Button,
  Card,
  Divider,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  getPlanes,
  crearPlan,
  getObrasSociales,
  getEspecialidadesGenericas,
  getPracticasGenericas,
} from "../../../api/api";
import { extraerMensajeError } from "../../../api/errorUtils";
import { idDe } from "../utils";
import FilaCobertura, { getColorPorNivel } from "../components/FilaCobertura";

let nextCobId = 1;
const newCobertura = (extra = {}) => ({ id: nextCobId++, nivel: null, pocentajeDescuento: null, ...extra });

export default function PlanesTab({ onChanged }) {
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
