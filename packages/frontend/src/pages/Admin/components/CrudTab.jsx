import { useEffect, useState } from "react";
import {
  App as AntApp,
  Button,
  Card,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
} from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { extraerMensajeError } from "../../../api/errorUtils";
import EmojiInput from "./EmojiInput";
import { idDe } from "../utils";

/**
 * Tab CRUD genérico y reutilizable.
 * - fields: descripción de los campos del formulario/tabla
 * - loadFn / createFn / updateFn: helpers de api.js
 * - onChanged: callback tras un alta/edición (para refrescar contadores)
 * - toPayload: arma el body a partir de los valores del formulario
 */
export default function CrudTab({
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
