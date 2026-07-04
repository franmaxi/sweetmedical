import { useEffect, useMemo, useState } from "react";
import {
  App as AntApp,
  Button,
  Card,
  Empty,
  Form,
  Layout,
  Modal,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  getMedicoById,
  getSedes,
  agregarSedesMedico,
  quitarSedesMedico,
} from "../../api/api";
import { extraerMensajeError } from "../../api/errorUtils";

const { Title, Text } = Typography;

const idDe = (x) => String(x?._id ?? x?.id ?? x);

export default function MisSedes() {
  return (
    <AntApp>
      <MisSedesInner />
    </AntApp>
  );
}

function MisSedesInner() {
  const { t } = useTranslation();
  const { message, modal } = AntApp.useApp();
  const { user } = useAuth();
  const medicoId = user?.userId;

  // Sedes ya asociadas al perfil del médico
  const [sedesMedico, setSedesMedico] = useState([]);
  // Catálogo global de sedes (creadas por un admin)
  const [catalogo, setCatalogo] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [form] = Form.useForm();

  const recargarSedesMedico = () => {
    if (!medicoId) return;
    setCargando(true);
    getMedicoById({ medicoId })
      .then((res) => {
        const sedes = Array.isArray(res?.data?.sedes) ? res.data.sedes : [];
        setSedesMedico(sedes);
      })
      .catch((err) => message.error(extraerMensajeError(err, "No se pudieron cargar tus sedes")))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    recargarSedesMedico();

    setCargandoCatalogo(true);
    getSedes()
      .then((res) => {
        const sedes = Array.isArray(res?.data) ? res.data : [];
        setCatalogo(sedes);
      })
      .catch((err) => message.error(extraerMensajeError(err, "No se pudo cargar el catálogo de sedes")))
      .finally(() => setCargandoCatalogo(false));
  }, [medicoId]);

  // Opciones para el modal: solo las sedes del catálogo que el médico todavía no tiene
  const opcionesDisponibles = useMemo(() => {
    const yaAsociadas = new Set(sedesMedico.map(idDe));
    return catalogo
      .filter((s) => !yaAsociadas.has(idDe(s)))
      .map((s) => ({ value: idDe(s), label: `${s.nombre} — ${s.direccion}` }));
  }, [catalogo, sedesMedico]);

  const onAgregar = async () => {
    let values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }

    setGuardando(true);
    try {
      await agregarSedesMedico({ medicoId, sedesId: values.sedesId });
      message.success(
        values.sedesId.length > 1 ? t("misSedes.sedesAgregadas") : t("misSedes.sedeAgregada")
      );
      setModalAbierto(false);
      form.resetFields();
      recargarSedesMedico();
    } catch (err) {
      message.error(extraerMensajeError(err, "No se pudieron agregar las sedes"));
    } finally {
      setGuardando(false);
    }
  };

  const onQuitar = (sede) => {
    modal.confirm({
      title: "Quitar sede",
      content: (
        <div>
          ¿Querés quitar <strong>{sede.nombre}</strong> de tu perfil?
          <div style={{ marginTop: 8, color: "#8c8c8c" }}>
            Se eliminarán las disponibilidades y turnos asociados a esta sede.
          </div>
        </div>
      ),
      okText: "Quitar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await quitarSedesMedico({ medicoId, sedesId: [idDe(sede)] });
          message.success(t("misSedes.sedeQuitada"));
          recargarSedesMedico();
        } catch (err) {
          message.error(extraerMensajeError(err, "No se pudo quitar la sede"));
        }
      },
    });
  };

  const columns = [
    { title: "Nombre", dataIndex: "nombre" },
    { title: "Dirección", dataIndex: "direccion" },
    {
      title: "",
      width: 130,
      render: (_, sede) => (
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onQuitar(sede)}>
          Quitar
        </Button>
      ),
    },
  ];

  const dataSource = sedesMedico.map((s) => ({ ...s, key: idDe(s) }));

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
              Mis Sedes
            </Title>
            <Text type="secondary">
              Elegí en qué sedes atendés. Después vas a poder cargar disponibilidades en ellas.
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              setModalAbierto(true);
            }}
          >
            Agregar sede
          </Button>
        </Space>

        <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }}>
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
                  description="Todavía no tenés sedes asignadas"
                />
              ),
            }}
          />
        </Card>

        <Modal
          title="Agregar sede a mi perfil"
          open={modalAbierto}
          onOk={onAgregar}
          onCancel={() => {
            setModalAbierto(false);
            form.resetFields();
          }}
          okText="Agregar"
          cancelText="Cancelar"
          confirmLoading={guardando}
          maskClosable={!guardando}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="sedesId"
              label="Sedes"
              rules={[{ required: true, message: "Elegí al menos una sede" }]}
              extra="Seleccioná una o más sedes del catálogo para asociarlas a tu perfil."
            >
              <Select
                mode="multiple"
                placeholder="Elegí las sedes"
                loading={cargandoCatalogo}
                options={opcionesDisponibles}
                optionFilterProp="label"
                showSearch
                allowClear
                notFoundContent={
                  cargandoCatalogo
                    ? "Cargando..."
                    : "No hay sedes nuevas para agregar"
                }
              />
            </Form.Item>
          </Form>
        </Modal>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
