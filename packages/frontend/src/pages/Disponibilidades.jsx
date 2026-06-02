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
  TimePicker,
  Typography,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  getDisponibilidadesDeMedico,
  agregarDisponibilidad,
  eliminarDisponibilidad,
  DiaSemana,
  nombreDia,
} from "../mocks";

const { Title, Text } = Typography;

// Sin login, simulamos que la médica activa es Rebecca Rose (id 5).
const MEDICO_ID = 5;

const DIAS_OPCIONES = Object.entries(DiaSemana).map(([k, v]) => ({
  value: v,
  label: k.charAt(0) + k.slice(1).toLowerCase(),
}));

export default function Disponibilidades() {
  return (
    <AntApp>
      <DisponibilidadesInner />
    </AntApp>
  );
}

function DisponibilidadesInner() {
  const { message, modal } = AntApp.useApp();
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form] = Form.useForm();

  const recargar = () => {
    setCargando(true);
    getDisponibilidadesDeMedico(MEDICO_ID).then((d) => {
      setDisponibilidades(d);
      setCargando(false);
    });
  };

  useEffect(recargar, []);

  const onAgregar = async () => {
    try {
      const values = await form.validateFields();
      const horaDesde = values.rango[0].format("HH:mm");
      const horaHasta = values.rango[1].format("HH:mm");
      if (horaDesde >= horaHasta) {
        message.error("La hora de inicio debe ser menor que la de fin");
        return;
      }
      await agregarDisponibilidad(MEDICO_ID, {
        diaSemana: values.diaSemana,
        horaDesde,
        horaHasta,
      });
      message.success("Disponibilidad agregada");
      setModalAbierto(false);
      form.resetFields();
      recargar();
    } catch (err) {
      // validateFields lanza si hay errores de form
    }
  };

  const onEliminar = (indice, item) => {
    modal.confirm({
      title: "Eliminar disponibilidad",
      content: `${nombreDia(item.diaSemana)} de ${item.horaDesde} a ${item.horaHasta}`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        await eliminarDisponibilidad(MEDICO_ID, indice);
        message.success("Disponibilidad eliminada");
        recargar();
      },
    });
  };

  const dataSource = disponibilidades.map((d, i) => ({ ...d, key: i, indice: i }));

  const columns = [
    {
      title: "Día",
      dataIndex: "diaSemana",
      render: (v) => {
        const dia = nombreDia(v);
        return dia.charAt(0) + dia.slice(1).toLowerCase();
      },
      sorter: (a, b) => a.diaSemana - b.diaSemana,
    },
    { title: "Desde", dataIndex: "horaDesde" },
    { title: "Hasta", dataIndex: "horaHasta" },
    {
      title: "",
      render: (_, d) => (
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onEliminar(d.indice, d)}>
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <Layout.Content style={{ maxWidth: 880, margin: "0 auto", padding: "clamp(20px, 4vw, 32px) clamp(12px, 4vw, 24px)", width: "100%" }}>
        <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
          <div>
            <Title level={2} style={{ marginBottom: 0 }}>Mis disponibilidades</Title>
            <Text type="secondary">Definí los días y horarios en los que atendés.</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalAbierto(true)}>
            Agregar disponibilidad
          </Button>
        </Space>

        <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }}>
          <Table
            loading={cargando}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: 480 }}
            locale={{ emptyText: "Todavía no cargaste ninguna disponibilidad" }}
          />
        </Card>

        <Modal
          title="Nueva disponibilidad"
          open={modalAbierto}
          onOk={onAgregar}
          onCancel={() => { setModalAbierto(false); form.resetFields(); }}
          okText="Agregar"
          cancelText="Cancelar"
        >
          <Form form={form} layout="vertical" initialValues={{ diaSemana: DiaSemana.LUNES }}>
            <Form.Item
              name="diaSemana"
              label="Día"
              rules={[{ required: true, message: "Elegí un día" }]}
            >
              <Select options={DIAS_OPCIONES} />
            </Form.Item>
            <Form.Item
              name="rango"
              label="Horario"
              rules={[{ required: true, message: "Elegí el rango horario" }]}
            >
              <TimePicker.RangePicker format="HH:mm" minuteStep={15} />
            </Form.Item>
          </Form>
        </Modal>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
