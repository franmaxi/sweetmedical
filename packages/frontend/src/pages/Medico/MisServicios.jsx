import { useEffect, useState } from "react";
import {
  App as AntApp,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Layout,
  Modal,
  Select,
  Space,
  Table,
  Typography,
  Tabs,
} from "antd";
import { DeleteOutlined, EditOutlined, LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  getEspecialidadesDeMedico,
  agregarEspecialidad,
  editarEspecialidad,
  eliminarEspecialidad,
  getPracticasDeMedico,
  agregarPractica,
  editarPractica,
  eliminarPractica,
} from "../../mocks";
import { getEspecialidadesGenericas, getPracticasGenericas } from "../../api/api";
const { Title, Text } = Typography;

const MEDICO_ID = 1; //todo: sacar cuando se integre con el login real

const precio = (n) => `$${Number(n).toLocaleString("es-AR")}`; //casteo el precio que llega como string y le doy el formato de moneda de argentina ej: 1500 => $1.500

export default function MisEspecialidades() {
  return (
    <AntApp>
      <MisServiciosInner />
    </AntApp>
  );
}

function MisServiciosInner() {
  const { message, modal } = AntApp.useApp();

  const [especialidades, setEspecialidades] = useState([]);
  const [practicas, setPracticas] = useState([]);
  const [especialidadesGenericas, setEspecialidadesGenericas] = useState([]);
  const [practicasGenericas, setPracticasGenericas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [genericasCargando, setGenericasCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const spinTablas = { spinning: cargando, indicator: <LoadingOutlined spin />, tip: "Cargando..." };

  const [especialidadEnModal, setEspecialidadEnModal] = useState(false);
  const [practicaEnModal, setPracticaEnModal] = useState(false);
  const [formEsp] = Form.useForm();
  const [formPrac] = Form.useForm();

  const handleDuracionStep = (form, value, info) => {
    // info.type es 'up' o 'down'. El valor recibido ya tiene sumado/restado el step (15)
    const oldValue = info.type === 'up' ? value - 15 : value + 15;
    let snapped;
    if (info.type === 'up') {
      snapped = Math.floor(oldValue / 15) * 15 + 15;
    } else {
      snapped = Math.ceil(oldValue / 15) * 15 - 15;
    }
    if (snapped < 15) snapped = 15;
    if (snapped > 240) snapped = 240;

    setTimeout(() => {
      form.setFieldsValue({ duracionTurnoEnMins: snapped });
      form.validateFields(['duracionTurnoEnMins']);
    }, 0);
  };

  const recargar = () => {
    setCargando(true);
    Promise.all([
      getEspecialidadesDeMedico(MEDICO_ID),
      getPracticasDeMedico(MEDICO_ID),
    ]).then(([esp, prac]) => {
      setEspecialidades(esp);
      setPracticas(prac);
      setCargando(false);
    });
  };

  useEffect(() => {
    Promise.all([
      getEspecialidadesGenericas(),
      getPracticasGenericas()
    ]).then(([especialidadesResponse, practicasResponse]) => {
      const listaEspecialidades = Array.isArray(especialidadesResponse?.data) ? especialidadesResponse.data : [];
      const listaPracticas = Array.isArray(practicasResponse?.data) ? practicasResponse.data : [];

      setEspecialidadesGenericas(listaEspecialidades);
      setPracticasGenericas(listaPracticas);
      setGenericasCargando(false);
    });
    recargar();
  }, []);



  const abrirEspecialidad = (item = null) => {
    setEspecialidadEnModal(item);
    if (item) {
      formEsp.setFieldsValue({
        especialidadGenericaId: item.especialidadGenericaId,
        duracionTurnoEnMins: item.duracionTurnoEnMins,
        costoConsulta: item.costoConsulta,
      });
    } else {
      formEsp.resetFields();
    }
  };

  const guardarEspecialidad = async () => {
    let values;
    try {
      values = await formEsp.validateFields();
    } catch {
      return; // validateFields lanza si hay errores de validación
    }
    setGuardando(true);
    try {
      if (especialidadEnModal) {
        await editarEspecialidad(especialidadEnModal.id, values);
        message.success("Especialidad actualizada");
      } else {
        await agregarEspecialidad(MEDICO_ID, values);
        message.success("Especialidad agregada");
      }
      setEspecialidadEnModal(false);
      formEsp.resetFields();
      recargar();
    } finally {
      setGuardando(false);
    }
  };

  const eliminarEsp = (item) => {
    modal.confirm({
      title: "Eliminar especialidad",
      content: `¿Querés eliminar "${item.nombre}"?`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        await eliminarEspecialidad(MEDICO_ID, item.id);
        message.success("Especialidad eliminada");
        recargar();
      },
    });
  };

  const abrirPractica = (item = null) => {
    setPracticaEnModal(item);
    if (item) {
      formPrac.setFieldsValue({
        practicaGenericaId: item.practicaGenericaId,
        duracionTurnoEnMins: item.duracionTurnoEnMins,
        costo: item.costo,
      });
    } else {
      formPrac.resetFields();
    }
  };

  const guardarPractica = async () => {
    let values;
    try {
      values = await formPrac.validateFields();
    } catch {
      return; 
    }
    setGuardando(true);
    try {
      if (practicaEnModal) {
        await editarPractica(practicaEnModal.id, values);
        message.success("Práctica actualizada");
      } else {
        await agregarPractica(MEDICO_ID, values);
        message.success("Práctica agregada");
      }
      setPracticaEnModal(false);
      formPrac.resetFields();
      recargar();
    } finally {
      setGuardando(false);
    }
  };

  const eliminarPrac = (item) => {
    modal.confirm({
      title: "Eliminar práctica",
      content: `¿Querés eliminar "${item.nombre}"?`,
      okText: "Eliminar",
      okButtonProps: { danger: true },
      cancelText: "Cancelar",
      onOk: async () => {
        await eliminarPractica(MEDICO_ID, item.id);
        message.success("Práctica eliminada");
        recargar();
      },
    });
  };

  const accionesColumna = (abrir, eliminar) => ({
    title: "",
    width: 170,
    render: (_, item) => (
      <Space>
        <Button size="small" icon={<EditOutlined />} onClick={() => abrir(item)}>
          Editar
        </Button>
        <Button size="small" danger icon={<DeleteOutlined />} onClick={() => eliminar(item)}>
          Eliminar
        </Button>
      </Space>
    ),
  });

  const columnasEspecialidades = [
    { title: "Especialidad", dataIndex: "nombre" },
    { title: "Duración del turno", dataIndex: "duracionTurnoEnMins", render: (v) => `${v} min` },
    { title: "Costo de consulta", dataIndex: "costoConsulta", render: precio },
    accionesColumna(abrirEspecialidad, eliminarEsp),
  ];

  const columnasPracticas = [
    { title: "Código", dataIndex: "codigo" },
    { title: "Práctica", dataIndex: "nombre" },
    { title: "Duración del turno", dataIndex: "duracionTurnoEnMins", render: (v) => `${v} min` },
    { title: "Costo", dataIndex: "costo", render: precio },
    accionesColumna(abrirPractica, eliminarPrac),
  ];

  const tabEspecialidades = (
    <>
      <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
        <Title level={4} style={{ margin: 0 }}>Especialidades</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => abrirEspecialidad()}>
          Agregar especialidad
        </Button>
      </Space>
      <Card style={{ marginTop: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          loading={spinTablas}
          columns={columnasEspecialidades}
          dataSource={especialidades}
          pagination={false}
          scroll={{ x: 560 }}
          locale={{ emptyText: "Todavía no cargaste ninguna especialidad" }}
        />
      </Card>
    </>
  );

  const tabPracticas = (
    <>
      <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
        <Title level={4} style={{ margin: 0 }}>Prácticas</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => abrirPractica()}>
          Agregar práctica
        </Button>
      </Space>
      <Card style={{ marginTop: 12 }} bodyStyle={{ padding: 0 }}>
        <Table
          rowKey="id"
          loading={spinTablas}
          columns={columnasPracticas}
          dataSource={practicas}
          pagination={false}
          scroll={{ x: 620 }}
          locale={{ emptyText: "Todavía no cargaste ninguna práctica" }}
        />
      </Card>
    </>
  );

  return (
    <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <Layout.Content style={{ maxWidth: 980, margin: "0 auto", padding: "clamp(20px, 4vw, 32px) clamp(12px, 4vw, 24px)", width: "100%" }}>
        <Title level={2} style={{ marginBottom: 4 }}>Mis Servicios</Title>
        <Text type="secondary">Gestioná las especialidades que atendés y las prácticas que realizás.</Text>

        <Tabs
          defaultActiveKey="especialidades"
          style={{ marginTop: 16 }}
          items={[
            { key: "especialidades", label: `Especialidades (${especialidades.length})`, children: tabEspecialidades },
            { key: "practicas", label: `Prácticas (${practicas.length})`, children: tabPracticas },
          ]}
        />

        {/* Modal de especialidad */}
        <Modal
          title={especialidadEnModal ? "Editar especialidad" : "Nueva especialidad"}
          open={especialidadEnModal !== false}
          onOk={guardarEspecialidad}
          onCancel={() => { setEspecialidadEnModal(false); formEsp.resetFields(); }}
          okText="Guardar"
          cancelText="Cancelar"
          confirmLoading={guardando}
          maskClosable={!guardando}
        >
          <Form form={formEsp} layout="vertical">
            <Form.Item
              name="especialidadGenericaId"
              label="Especialidad"
              rules={[{ required: true, message: "Elegí una especialidad" }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Elegí una especialidad"
                loading={genericasCargando}
                options={especialidadesGenericas.map((g) => ({ value: g._id || g.id, label: g.nombre }))}
              />
            </Form.Item>
            <Form.Item
              name="duracionTurnoEnMins"
              label="Duración del turno (minutos)"
              rules={[
                { required: true, message: "Ingresá la duración" },
                { validator: (_, value) => {
                    if (value && value % 15 !== 0) {
                      return Promise.reject(new Error("La duración debe ser múltiplo de 15"));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber 
                min={15} 
                max={240} 
                step={15} 
                style={{ width: "100%" }} 
                onStep={(val, info) => handleDuracionStep(formEsp, val, info)}
              />
            </Form.Item>
            <Form.Item
              name="costoConsulta"
              label="Costo de consulta"
              rules={[{ required: true, message: "Ingresá el costo" }]}
            >
              <InputNumber min={0} step={500} prefix="$" style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal de práctica */}
        <Modal
          title={practicaEnModal ? "Editar práctica" : "Nueva práctica"}
          open={practicaEnModal !== false}
          onOk={guardarPractica}
          onCancel={() => { setPracticaEnModal(false); formPrac.resetFields(); }}
          okText="Guardar"
          cancelText="Cancelar"
          confirmLoading={guardando}
          maskClosable={!guardando}
        >
          <Form form={formPrac} layout="vertical">
            <Form.Item
              name="practicaGenericaId"
              label="Práctica"
              rules={[{ required: true, message: "Elegí una práctica" }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Elegí una práctica"
                loading={genericasCargando}
                options={practicasGenericas.map((g) => ({ value: g._id || g.id, label: g.nombre }))}
              />
            </Form.Item>
          
            <Form.Item
              name="duracionTurnoEnMins"
              label="Duración del turno (minutos)"
              rules={[
                { required: true, message: "Ingresá la duración" },
                { validator: (_, value) => {
                    if (value && value % 15 !== 0) {
                      return Promise.reject(new Error("La duración debe ser múltiplo de 15"));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber 
                min={15} 
                max={240} 
                step={15} 
                style={{ width: "100%" }} 
                onStep={(val, info) => handleDuracionStep(formPrac, val, info)}
              />
            </Form.Item>
            <Form.Item
              name="costo"
              label="Costo"
              rules={[{ required: true, message: "Ingresá el costo" }]}
            >
              <InputNumber min={0} step={500} prefix="$" style={{ width: "100%" }} />
            </Form.Item>
          </Form>
        </Modal>
      </Layout.Content>
      <Footer />
    </Layout>
  );
}
