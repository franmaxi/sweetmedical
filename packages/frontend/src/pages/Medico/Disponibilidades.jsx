import { useEffect, useState } from "react";
import {
  App as AntApp,
  Button,
  Card,
  Form,
  Layout,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import { DeleteOutlined, PlusOutlined, EditOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { DiaSemana, nombreDia } from "../../mocks";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getServicios, getSedes, crearDisponibilidad, getDisponibilidades, getMedicoById, eliminarDisponibilidad, modificarDisponibilidad } from "../../api/api";
import { extraerMensajeError } from "../../api/errorUtils";

const { Title, Text } = Typography;

// Sin login, simulamos que el médico activo es el de id fijo en la API
const MEDICO_ID = "6a14c252688165715658e489";

const getDiasOpciones = (t) =>
  Object.entries(DiaSemana).map(([k, v]) => ({
    value: v,
    label: t(`dias.${k.toLowerCase()}`),
  }));

export default function Disponibilidades() {
  return (
    <AntApp>
      <DisponibilidadesInner />
    </AntApp>
  );
}

function DisponibilidadesInner() {
  const { t } = useTranslation();
  const { message } = AntApp.useApp();

  const [disponibilidades, setDisponibilidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [disponibilidadEnEdicion, setDisponibilidadEnEdicion] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Datos para los selectores
  const [opcionesServicios, setOpcionesServicios] = useState([]);
  const [opcionesSedes, setOpcionesSedes] = useState([]);
  const [cargandoSelects, setCargandoSelects] = useState(true);

  // Mapa de ids → nombre para mostrar en la tabla
  const [mapaServicios, setMapaServicios] = useState({});
  const [mapaSedes, setMapaSedes] = useState({});

  const [form] = Form.useForm();
  const diasOpciones = getDiasOpciones(t);

  // Carga inicial: servicios y sedes del médico
  useEffect(() => {
    Promise.all([getServicios({ medicoId: MEDICO_ID }), getMedicoById({ medicoId: MEDICO_ID })])
      .then(([serviciosRes, medicoRes]) => {
        // --- Servicios (especialidades + prácticas) ---
        const especialidades = Array.isArray(serviciosRes?.data?.especialidades)
          ? serviciosRes.data.especialidades
          : [];
        const practicas = Array.isArray(serviciosRes?.data?.practicas)
          ? serviciosRes.data.practicas
          : [];

        const opciones = [
          ...(especialidades.length
            ? [
                {
                  label: "Especialidades",
                  options: especialidades.map((e) => ({
                    value: `esp_${e._id || e.id}`,
                    label: e.nombre,
                    tipo: "especialidad",
                    originalId: e._id || e.id,
                  })),
                },
              ]
            : []),
          ...(practicas.length
            ? [
                {
                  label: "Prácticas",
                  options: practicas.map((p) => ({
                    value: `prac_${p._id || p.id}`,
                    label: p.nombre,
                    tipo: "practica",
                    originalId: p._id || p.id,
                  })),
                },
              ]
            : []),
        ];
        setOpcionesServicios(opciones);

        // Construir mapa id→nombre para la tabla
        const mapa = {};
        especialidades.forEach((e) => {
          mapa[`esp_${e._id || e.id}`] = e.nombre;
        });
        practicas.forEach((p) => {
          mapa[`prac_${p._id || p.id}`] = p.nombre;
        });
        setMapaServicios(mapa);

        // --- Sedes del médico ---
        const medico = medicoRes?.data || {};
        const sedesDelMedico = Array.isArray(medico.sedes) ? medico.sedes : [];
        setOpcionesSedes(
          sedesDelMedico.map((s) => ({ value: s._id || s.id, label: s.nombre }))
        );

        const mapSedes = {};
        sedesDelMedico.forEach((s) => {
          mapSedes[s._id || s.id] = s.nombre;
        });
        setMapaSedes(mapSedes);
      })
      .catch((err) => {
        message.error(extraerMensajeError(err, "Error al cargar los datos"));
      })
      .finally(() => setCargandoSelects(false));
  }, []);

  const recargarDisponibilidades = () => {
    setCargando(true);
    getDisponibilidades({ medicoId: MEDICO_ID })
      .then((res) => {
        const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const formateadas = data.map((d) => {
          const servicios = [
            ...(d.especialidades || []).map((e) => `esp_${e._id || e.id || e}`),
            ...(d.practicas || []).map((p) => `prac_${p._id || p.id || p}`),
          ];
          return {
            _id: d._id || d.id,
            diaSemana: d.diaSemana,
            horaDesde: d.horaDesde,
            horaHasta: d.horaHasta,
            servicios: servicios,
            sedeId: d.sede?._id || d.sede?.id || d.sede,
          };
        });
        setDisponibilidades(formateadas);
      })
      .catch((err) => {
        message.error(extraerMensajeError(err, "Error al cargar las disponibilidades"));
      })
      .finally(() => {
        setCargando(false);
      });
  };

  useEffect(() => {
    recargarDisponibilidades();
  }, []);

  const onAgregar = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    // Separar servicios seleccionados en especialidades y prácticas
    const seleccionados = values.servicios || [];
    const especialidadesIds = seleccionados
      .filter((v) => v.startsWith("esp_"))
      .map((v) => v.replace("esp_", ""));
    const practicasIds = seleccionados
      .filter((v) => v.startsWith("prac_"))
      .map((v) => v.replace("prac_", ""));

    setGuardando(true);
    try {
      if (disponibilidadEnEdicion) {
        await modificarDisponibilidad({
          medicoId: MEDICO_ID,
          disponibilidadId: disponibilidadEnEdicion._id,
          especialidades: especialidadesIds,
          practicas: practicasIds,
          sedeId: values.sedeId,
        });
        message.success(t("disponibilidades.successEditada"));
      } else {
        const horaDesde = values.rango[0].format("HH:mm");
        const horaHasta = values.rango[1].format("HH:mm");

        if (horaDesde >= horaHasta) {
          message.error(t("disponibilidades.errorHoraInicio"));
          setGuardando(false);
          return;
        }

        await crearDisponibilidad({
          medicoId: MEDICO_ID,
          especialidades: especialidadesIds,
          practicas: practicasIds,
          sedeId: values.sedeId,
          horaDesde,
          horaHasta,
          diaSemana: Number(values.diaSemana),
        });
        message.success(t("disponibilidades.successAgregada"));
      }

      setModalAbierto(false);
      setDisponibilidadEnEdicion(null);
      form.resetFields();
      recargarDisponibilidades();
    } catch (err) {
      message.error(extraerMensajeError(err, "Error al guardar la disponibilidad"));
    } finally {
      setGuardando(false);
    }
  };

  const onEditar = (d) => {
    setDisponibilidadEnEdicion(d);
    form.setFieldsValue({
      diaSemana: d.diaSemana,
      horario: [dayjs(d.horaDesde, "HH:mm"), dayjs(d.horaHasta, "HH:mm")],
      servicios: d.servicios,
      sedeId: d.sedeId,
    });
    setModalAbierto(true);
  };

  const onEliminar = (d) => {
    Modal.confirm({
      title: t("disponibilidades.eliminarTitle"),
      content: (
        <div>
          <div style={{ marginBottom: 16 }}>
            <strong>Horario:</strong> {t(`dias.${nombreDia(d.diaSemana).toLowerCase()}`)} {t("disponibilidades.de")} {d.horaDesde} {t("disponibilidades.a")} {d.horaHasta}
          </div>
          <div style={{ paddingLeft: 20 }}>
            <div style={{ marginBottom: 4 }}>
              <strong>Servicios:</strong>{" "}
              {d.servicios && d.servicios.length > 0
                ? d.servicios.map((sId) => mapaServicios[sId] ?? sId).join(", ")
                : "—"}
            </div>
            <div>
              <strong>Sede:</strong> {mapaSedes[d.sedeId] ?? d.sedeId ?? "—"}
            </div>
          </div>
        </div>
      ),
      okText: t("disponibilidades.eliminar"),
      okButtonProps: { danger: true },
      cancelText: t("disponibilidades.cancelar"),
      onOk: async () => {
        try {
          await eliminarDisponibilidad({ medicoId: MEDICO_ID, disponibilidadId: d._id });
          message.success(t("disponibilidades.successEliminada"));
          recargarDisponibilidades();
        } catch (err) {
          message.error(extraerMensajeError(err, "Error al eliminar la disponibilidad"));
        }
      },
    });
  };

  const dataSource = disponibilidades.map((d, i) => ({ ...d, key: i, _index: i }));

  const columns = [
    {
      title: t("disponibilidades.column.dia"),
      dataIndex: "diaSemana",
      render: (v) => t(`dias.${nombreDia(v).toLowerCase()}`),
      sorter: (a, b) => a.diaSemana - b.diaSemana,
    },
    {
      title: "Horario",
      render: (_, d) => `${d.horaDesde} – ${d.horaHasta}`,
    },
    {
      title: "Servicios",
      dataIndex: "servicios",
      render: (servicios) =>
        servicios && servicios.length > 0 ? (
          <Space size={4} wrap>
            {servicios.map((sId) => (
              <Tag
                key={sId}
                color={sId.startsWith("esp_") ? "blue" : "purple"}
              >
                {mapaServicios[sId] ?? sId}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Sede",
      dataIndex: "sedeId",
      render: (sedeId) => mapaSedes[sedeId] ?? sedeId ?? "—",
    },
    {
      title: "",
      render: (_, d) => (
        <Space>
          <Button
            size="small"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => onEditar(d)}
          >
            Editar
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onEliminar(d)}
          >
            {t("disponibilidades.eliminar")}
          </Button>
        </Space>
      ),
    },
  ];

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
              {t("disponibilidades.titulo")}
            </Title>
            <Text type="secondary">{t("disponibilidades.subtitulo")}</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setDisponibilidadEnEdicion(null);
              form.resetFields();
              setModalAbierto(true);
            }}
          >
            {t("disponibilidades.agregarDisponibilidad")}
          </Button>
        </Space>

        <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }}>
          <Table
            loading={cargando}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: 600 }}
            locale={{ emptyText: t("disponibilidades.emptyText") }}
          />
        </Card>

        <Modal
          title={disponibilidadEnEdicion ? "Editar disponibilidad" : t("disponibilidades.nuevaDisponibilidad")}
          open={modalAbierto}
          onOk={onAgregar}
          onCancel={() => {
            setModalAbierto(false);
            setDisponibilidadEnEdicion(null);
            form.resetFields();
          }}
          okText={disponibilidadEnEdicion ? "Guardar" : t("disponibilidades.agregar")}
          cancelText={t("disponibilidades.cancelar")}
          confirmLoading={guardando}
          maskClosable={!guardando}
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ diaSemana: DiaSemana.LUNES }}
          >
            {/* Día y Horario solo en creación */}
            {!disponibilidadEnEdicion && (
              <>
                {/* Día */}
                <Form.Item
                  name="diaSemana"
                  label={t("disponibilidades.labelDia")}
                  rules={[
                    {
                      required: true,
                      message: t("disponibilidades.errorElegirDia"),
                    },
                  ]}
                >
                  <Select options={diasOpciones} />
                </Form.Item>

                {/* Horario */}
                <Form.Item
                  name="rango"
                  label={t("disponibilidades.labelHorario")}
                  rules={[
                    {
                      required: true,
                      message: t("disponibilidades.errorElegirHorario"),
                    },
                  ]}
                >
                  <TimePicker.RangePicker format="HH:mm" minuteStep={15} />
                </Form.Item>
              </>
            )}

            {/* Servicios (especialidades + prácticas del médico) */}
            <Form.Item
              name="servicios"
              label="Servicios"
              rules={[
                {
                  required: true,
                  message: "Seleccioná al menos un servicio",
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="Seleccioná especialidades o prácticas"
                loading={cargandoSelects}
                options={opcionesServicios}
                optionFilterProp="label"
                showSearch
                allowClear
              />
            </Form.Item>

            {/* Sede */}
            <Form.Item
              name="sedeId"
              label="Sede"
              rules={[{ required: true, message: "Elegí una sede" }]}
            >
              <Select
                placeholder="Elegí la sede"
                loading={cargandoSelects}
                options={opcionesSedes}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </Form>
        </Modal>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
