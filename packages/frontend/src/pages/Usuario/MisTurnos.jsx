import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  App as AntApp,
  Button,
  Card,
  Empty,
  Input,
  Layout,
  Space,
  Tabs,
  Tag,
  Typography,
  Pagination,
  Modal,
} from "antd";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useTranslation } from "react-i18next";
import { getTurnos, cancelarTurnoApi } from "../../api/api";
import { extraerMensajeError } from "../../api/errorUtils";

const { Title, Text } = Typography;

const COLOR_ESTADO = {
  DISPONIBLE: "default",
  RESERVADO: "blue",
  CONFIRMADO: "green",
  CANCELADO: "red",
  REALIZADO: "purple",
};

// formato de fecha legible para mostrar en la UI
const fmt = (iso) =>
  new Date(iso).toLocaleString("es-AR", {
    weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

const fmtMoneda = (n) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

const esFuturo = (iso) => new Date(iso).getTime() >= Date.now();

export default function MisTurnos() {
  return (
    <AntApp>
      <MisTurnosInner />
    </AntApp>
  );
}

function MisTurnosInner() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { message, modal } = AntApp.useApp();
  const [historialTurnos, setHistorialTurnos] = useState([]);
  const [reservadosTurnos, setReservadosTurnos] = useState([]);
  const [paginaActualReservados, setPaginaActualReservados] = useState(1);
  const [paginasTotalesReservados, setPaginasTotalesReservados] = useState(1);
  const [totalReservados, setTotalReservados] = useState(0);
  const [cargandoReservados, setCargandoReservados] = useState(true);

  const [confirmadosTurnos, setConfirmadosTurnos] = useState([]);
  const [paginaActualConfirmados, setPaginaActualConfirmados] = useState(1);
  const [paginasTotalesConfirmados, setPaginasTotalesConfirmados] = useState(1);
  const [totalConfirmados, setTotalConfirmados] = useState(0);
  const [cargandoConfirmados, setCargandoConfirmados] = useState(true);

  const [paginaActualHistorial, setPaginaActualHistorial] = useState(1);
  const [paginasTotalesHistorial, setPaginasTotalesHistorial] = useState(1);
  const [totalHistorial, setTotalHistorial] = useState(0);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  const [modalCancelarVisible, setModalCancelarVisible] = useState(false);
  const [turnoACancelar, setTurnoACancelar] = useState(null);

  const fetchHistorial = () => {
    setCargandoHistorial(true);
    getTurnos({ filtrarPaciente: true, estado: "CANCELADO,REALIZADO", ordenarPor: "fechaHora", ordenDireccion: "desc", page: paginaActualHistorial, limit: 10 })
      .then((res) => {
        setHistorialTurnos(res.data || []);
        setPaginasTotalesHistorial(res.paginacion?.totalPaginas || 1);
        setTotalHistorial(res.paginacion?.total || res.data?.length || 0);
        setCargandoHistorial(false);
      })
      .catch((err) => {
        console.error(err);
        setCargandoHistorial(false);
        message.error(extraerMensajeError(err, "Error al obtener el historial de turnos"));
      });
  };

  const fetchReservados = () => {
    setCargandoReservados(true);
    getTurnos({ filtrarPaciente: true, estado: "RESERVADO", ordenarPor: "fechaHora", ordenDireccion: "asc", page: paginaActualReservados, limit: 10 })
      .then((res) => {
        setReservadosTurnos(res.data || []);
        setPaginasTotalesReservados(res.paginacion?.totalPaginas || 1);
        setTotalReservados(res.paginacion?.total || res.data?.length || 0);
        setCargandoReservados(false);
      })
      .catch((err) => {
        console.error(err);
        setCargandoReservados(false);
        message.error(extraerMensajeError(err, "Error al obtener los turnos reservados"));
      });
  };

  const fetchConfirmados = () => {
    setCargandoConfirmados(true);
    getTurnos({ filtrarPaciente: true, estado: "CONFIRMADO", ordenarPor: "fechaHora", ordenDireccion: "asc", page: paginaActualConfirmados, limit: 10 })
      .then((res) => {
        setConfirmadosTurnos(res.data || []);
        setPaginasTotalesConfirmados(res.paginacion?.totalPaginas || 1);
        setTotalConfirmados(res.paginacion?.total || res.data?.length || 0);
        setCargandoConfirmados(false);
      })
      .catch((err) => {
        console.error(err);
        setCargandoConfirmados(false);
        message.error(extraerMensajeError(err, "Error al obtener los turnos confirmados"));
      });
  };

  useEffect(fetchHistorial, [paginaActualHistorial]);
  useEffect(fetchReservados, [paginaActualReservados]);
  useEffect(fetchConfirmados, [paginaActualConfirmados]);

  const recargar = () => {
    fetchHistorial();
    fetchReservados();
    fetchConfirmados();
  };

  const hidratarTurno = (t) => {
    const especialidad = t.especialidad?.[0];
    const practica = t.practica?.[0];
    const servicioNombre = especialidad?.nombre || practica?.nombre || "—";
    const servicioCosto = especialidad?.costo ?? practica?.costo ?? 0;

    return {
      ...t,
      id: t._id || t.id,
      medicoNombre: t.medico?.nombre ?? "—",
      sedeNombre: t.sede?.nombre ?? "—",
      especialidadNombre: servicioNombre,
      costo: servicioCosto,
    };
  };

  const reservados = useMemo(
    () => reservadosTurnos.map(hidratarTurno),
    [reservadosTurnos]
  );

  const confirmados = useMemo(
    () => confirmadosTurnos.map(hidratarTurno),
    [confirmadosTurnos]
  );

  const historicos = useMemo(
    () => historialTurnos.map(hidratarTurno),
    [historialTurnos]
  );

  const onCancelar = (turno) => {
    setTurnoACancelar(turno);
    setModalCancelarVisible(true);
  };

  const renderTurno = (turno) => (
    <Card key={turno.id} style={{ marginBottom: 12 }} bodyStyle={{ padding: 16 }}>
      <Space direction="vertical" size={4} style={{ width: "100%" }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Title level={5} style={{ margin: 0 }}>{turno.medicoNombre}</Title>
          <Tag color={COLOR_ESTADO[turno.estado]}>{t(`estados.${turno.estado?.toLowerCase()}`, { defaultValue: turno.estado })}</Tag>
        </Space>
        <Space wrap size="large">
          <Text type="secondary"><MedicineBoxOutlined /> {turno.especialidadNombre}</Text>
          <Text type="secondary"><EnvironmentOutlined /> {turno.sedeNombre}</Text>
          <Text type="secondary"><CalendarOutlined /> {fmt(turno.fechaHora)}</Text>
          <Text type="secondary"><ClockCircleOutlined /> {fmtMoneda(turno.costo)}</Text>
        </Space>
        {(turno.estado === "RESERVADO" || turno.estado === "CONFIRMADO") && esFuturo(turno.fechaHora) && (
          <Space style={{ marginTop: 8 }}>
            <Button danger onClick={() => onCancelar(turno)}>{t("misTurnos.cancelarOk")}</Button>
          </Space>
        )}
      </Space>
    </Card>
  );

  const renderLista = (lista, cargando, paginaActual, paginasTotales, setPaginaActual) => {
    if (cargando) return <Text type="secondary">{t("misTurnos.cargando")}</Text>;
    if (lista.length === 0) {
      return (
        <Empty description={t("misTurnos.sinTurnosDescripcion")}>
          <Button type="primary" onClick={() => navigate("/buscar")}>
            {t("misTurnos.buscarTurnosBoton")}
          </Button>
        </Empty>
      );
    }
    return (
      <>
        {lista.map(renderTurno)}
        <Pagination
          align="center"
          defaultCurrent={1}
          current={paginaActual}
          pageSize={10}
          total={paginasTotales * 10}
          style={{ marginTop: '16px' }}
          onChange={(page) => setPaginaActual(page)}
          showSizeChanger={false}
        />
      </>
    );
  };

  return (
    <Layout style={{ background: "#fafafa", minHeight: "100vh" }}>
      <Navbar />
      <Layout.Content style={{ maxWidth: 880, margin: "0 auto", padding: "clamp(20px, 4vw, 32px) clamp(12px, 4vw, 24px)", width: "100%" }}>
        <Title level={2}>{t("misTurnos.titulo")}</Title>
        <Text type="secondary">{t("misTurnos.subtitulo")}</Text>

        <Tabs
          defaultActiveKey="confirmados"
          style={{ marginTop: 16 }}
          items={[
            { 
              key: "confirmados", 
              label: `${t("misTurnos.confirmados", "Confirmados")} (${totalConfirmados})`, 
              children: renderLista(confirmados, cargandoConfirmados, paginaActualConfirmados, paginasTotalesConfirmados, setPaginaActualConfirmados) 
            },
            { 
              key: "reservados", 
              label: `${t("misTurnos.reservados", "Reservados")} (${totalReservados})`, 
              children: renderLista(reservados, cargandoReservados, paginaActualReservados, paginasTotalesReservados, setPaginaActualReservados) 
            },
            { 
              key: "historicos", 
              label: `${t("misTurnos.historial")} (${totalHistorial})`, 
              children: renderLista(historicos, cargandoHistorial, paginaActualHistorial, paginasTotalesHistorial, setPaginaActualHistorial) 
            },
          ]}
        />
      </Layout.Content>
      <Footer />
      <ModalCancelacion 
        visible={modalCancelarVisible}
        turno={turnoACancelar}
        onCancel={() => setModalCancelarVisible(false)}
        onSuccess={() => {
          setModalCancelarVisible(false);
          recargar();
        }}
      />
    </Layout>
  );
}

function ModalCancelacion({ visible, turno, onCancel, onSuccess }) {
  const { t } = useTranslation();
  const { message, modal } = AntApp.useApp();
  const [ motivo, setMotivo ] = useState("");
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
    if (visible) setMotivo("");
  }, [visible]);

  const handleOk = async () => {
    if (!motivo.trim()) {
      message.error(t("misTurnos.errorFaltaMotivo"));
      return;
    }
    setLoading(true);
    try {
      await cancelarTurnoApi(turno.id, motivo.trim());
      message.success(t("misTurnos.canceladoOk"));
      onSuccess();
    } catch (error) {
      if (error.response?.status === 422) {
        onCancel();
        modal.error({
          title: t("misTurnos.errorCancelarTitle"),
          content: t("misTurnos.errorCancelarContent"),
          centered: true,
        });
      } else {
        message.error(error.response?.data?.message || t("misTurnos.errorCancelacionGen"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={t("misTurnos.cancelarTitle")}
      open={visible}
      onCancel={onCancel}
      onOk={handleOk}
      okText={t("misTurnos.cancelarOk")}
      cancelText={t("misTurnos.cancelarCancel")}
      confirmLoading={loading}
      okButtonProps={{ 
        danger: true, 
        disabled: !motivo.trim() 
      }}
    >
      {turno && (
        <div>
          <p>{turno.medicoNombre} · {fmt(turno.fechaHora)}</p>
          <Input.TextArea
            rows={3}
            placeholder={t("misTurnos.cancelarPlaceholder")}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </div>
      )}
    </Modal>
  );
}
