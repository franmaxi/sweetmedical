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
import { useTranslation } from "react-i18next";
import {
  getDisponibilidadesDeMedico,
  agregarDisponibilidad,
  eliminarDisponibilidad,
  DiaSemana,
  nombreDia,
} from "../../mocks";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const { Title, Text } = Typography;

// Sin login, simulamos que la médica activa es Rebecca Rose (id 5).
const MEDICO_ID = 5;

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
  const { message, modal } = AntApp.useApp();
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form] = Form.useForm();
  const diasOpciones = getDiasOpciones(t);

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
        message.error(t("disponibilidades.errorHoraInicio"));
        return;
      }
      await agregarDisponibilidad(MEDICO_ID, {
        diaSemana: values.diaSemana,
        horaDesde,
        horaHasta,
      });
      message.success(t("disponibilidades.successAgregada"));
      setModalAbierto(false);
      form.resetFields();
      recargar();
    } catch (err) {
      // validateFields lanza si hay errores de form
    }
  };

  const onEliminar = (indice, item) => {
    modal.confirm({
      title: t("disponibilidades.eliminarTitle"),
      content: `${t(`dias.${nombreDia(item.diaSemana).toLowerCase()}`)} ${t("disponibilidades.de")} ${item.horaDesde} ${t("disponibilidades.a")} ${item.horaHasta}`,
      okText: t("disponibilidades.eliminar"),
      okButtonProps: { danger: true },
      cancelText: t("disponibilidades.cancelar"),
      onOk: async () => {
        await eliminarDisponibilidad(MEDICO_ID, indice);
        message.success(t("disponibilidades.successEliminada"));
        recargar();
      },
    });
  };

  const dataSource = disponibilidades.map((d, i) => ({ ...d, key: i, indice: i }));

  const columns = [
    {
      title: t("disponibilidades.column.dia"),
      dataIndex: "diaSemana",
      render: (v) => t(`dias.${nombreDia(v).toLowerCase()}`),
      sorter: (a, b) => a.diaSemana - b.diaSemana,
    },
    { title: t("disponibilidades.column.desde"), dataIndex: "horaDesde" },
    { title: t("disponibilidades.column.hasta"), dataIndex: "horaHasta" },
    {
      title: "",
      render: (_, d) => (
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => onEliminar(d.indice, d)}>
          {t("disponibilidades.eliminar")}
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
            <Title level={2} style={{ marginBottom: 0 }}>{t("disponibilidades.titulo")}</Title>
            <Text type="secondary">{t("disponibilidades.subtitulo")}</Text>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalAbierto(true)}>
            {t("disponibilidades.agregarDisponibilidad")}
          </Button>
        </Space>

        <Card style={{ marginTop: 16 }} bodyStyle={{ padding: 0 }}>
          <Table
            loading={cargando}
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            scroll={{ x: 480 }}
            locale={{ emptyText: t("disponibilidades.emptyText") }}
          />
        </Card>

        <Modal
          title={t("disponibilidades.nuevaDisponibilidad")}
          open={modalAbierto}
          onOk={onAgregar}
          onCancel={() => { setModalAbierto(false); form.resetFields(); }}
          okText={t("disponibilidades.agregar")}
          cancelText={t("disponibilidades.cancelar")}
        >
          <Form form={form} layout="vertical" initialValues={{ diaSemana: DiaSemana.LUNES }}>
            <Form.Item
              name="diaSemana"
              label={t("disponibilidades.labelDia")}
              rules={[{ required: true, message: t("disponibilidades.errorElegirDia") }]}
            >
              <Select options={diasOpciones} />
            </Form.Item>
            <Form.Item
              name="rango"
              label={t("disponibilidades.labelHorario")}
              rules={[{ required: true, message: t("disponibilidades.errorElegirHorario") }]}
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
