import { useEffect, useState } from "react";
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
  Tabs,
  Typography,
} from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import {
  getSedes,
  crearSede,
  actualizarSede,
  eliminarSede,
  getPracticasGenericas,
  crearPracticaGenerica,
  actualizarPracticaGenerica,
  eliminarPracticaGenerica,
  getEspecialidadesGenericas,
  crearEspecialidadGenerica,
  actualizarEspecialidadGenerica,
  eliminarEspecialidadGenerica,
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

function AdminPanelInner() {
  const { t } = useTranslation();

  return (
    <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <Layout.Content
        style={{
          maxWidth: 980,
          margin: "0 auto",
          padding: "clamp(20px, 4vw, 32px) clamp(12px, 4vw, 24px)",
          width: "100%",
        }}
      >
        <Title level={2} style={{ marginBottom: 0 }}>
          {t("admin.titulo")}
        </Title>
        <Text type="secondary">{t("admin.subtitulo")}</Text>

        <Tabs
          style={{ marginTop: 16 }}
          items={[
            {
              key: "sedes",
              label: t("admin.tabs.sedes"),
              children: <SedesTab />,
            },
            {
              key: "practicas",
              label: t("admin.tabs.practicas"),
              children: <PracticasTab />,
            },
            {
              key: "especialidades",
              label: t("admin.tabs.especialidades"),
              children: <EspecialidadesTab />,
            },
          ]}
        />
      </Layout.Content>
      <Footer />
    </Layout>
  );
}

/**
 * Tab CRUD genérico y reutilizable.
 * - fields: descripción de los campos del formulario/tabla
 * - loadFn / createFn / updateFn / deleteFn: helpers de api.js
 * - toPayload: arma el body a partir de los valores del formulario
 */
function CrudTab({
  fields,
  loadFn,
  createFn,
  updateFn,
  deleteFn,
  textos,
}) {
  const { message, modal } = AntApp.useApp();
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
    } catch (error) {
      const detalle = error?.response?.data?.message;
      message.error(detalle || textos.errorGuardar);
    } finally {
      setGuardando(false);
    }
  };

  const confirmarEliminar = (item) => {
    modal.confirm({
      title: textos.eliminarTitle,
      content: textos.eliminarContenido(item[fields[0].name]),
      okText: textos.eliminar,
      okButtonProps: { danger: true },
      cancelText: textos.cancelar,
      onOk: async () => {
        try {
          await deleteFn({ id: idDe(item) });
          message.success(textos.eliminado);
          recargar();
        } catch (error) {
          const detalle = error?.response?.data?.message;
          message.error(detalle || textos.errorEliminar);
        }
      },
    });
  };

  const columns = [
    ...fields.map((f) => ({
      title: f.label,
      dataIndex: f.name,
      width: f.width,
    })),
    {
      title: textos.acciones,
      width: 170,
      render: (_, item) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => abrirEdicion(item)}
          >
            {textos.editar}
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmarEliminar(item)}
          >
            {textos.eliminar}
          </Button>
        </Space>
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

function SedesTab() {
  const { t } = useTranslation();
  return (
    <CrudTab
      loadFn={() => getSedes({ limit: 100 })}
      createFn={crearSede}
      updateFn={actualizarSede}
      deleteFn={eliminarSede}
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

function PracticasTab() {
  const { t } = useTranslation();
  return (
    <CrudTab
      loadFn={() => getPracticasGenericas({ limit: 100 })}
      createFn={crearPracticaGenerica}
      updateFn={actualizarPracticaGenerica}
      deleteFn={eliminarPracticaGenerica}
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

function EspecialidadesTab() {
  const { t } = useTranslation();
  return (
    <CrudTab
      loadFn={() => getEspecialidadesGenericas({ limit: 100 })}
      createFn={crearEspecialidadGenerica}
      updateFn={actualizarEspecialidadGenerica}
      deleteFn={eliminarEspecialidadGenerica}
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
    eliminar: t("admin.acciones.eliminar"),
    guardar: t("admin.acciones.guardar"),
    cancelar: t("admin.acciones.cancelar"),
    acciones: t("admin.acciones.acciones"),
    creado: t("admin.mensajes.creado"),
    actualizado: t("admin.mensajes.actualizado"),
    eliminado: t("admin.mensajes.eliminado"),
    errorCargar: t("admin.mensajes.errorCargar"),
    errorGuardar: t("admin.mensajes.errorGuardar"),
    errorEliminar: t("admin.mensajes.errorEliminar"),
    vacio: t(`admin.vacio.${entidad}`),
    crearTitle: t(`admin.modal.crear.${entidad}`),
    editarTitle: t(`admin.modal.editar.${entidad}`),
    eliminarTitle: t("admin.modal.eliminarTitle"),
    eliminarContenido: (nombre) =>
      t("admin.modal.eliminarContenido", { nombre }),
  };
}
