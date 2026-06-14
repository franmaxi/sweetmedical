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
} from "antd";
import { CalendarOutlined, ClockCircleOutlined, EnvironmentOutlined, MedicineBoxOutlined } from "@ant-design/icons";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { useTranslation } from "react-i18next";
import {
  cancelarTurno,
} from "../../mocks";
import { getTurnos } from "../../api/api";

const { Title, Text } = Typography;

const PACIENTE_ACTIVO = "6a22243ea59d0c59c2916fd2"

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
  const [proximosTurnos, setProximosTurnos] = useState([]);
  
  const [paginaActualProximos, setPaginaActualProximos] = useState(1);
  const [paginasTotalesProximos, setPaginasTotalesProximos] = useState(1);
  const [totalProximos, setTotalProximos] = useState(0);
  const [cargandoProximos, setCargandoProximos] = useState(true);

  const [paginaActualHistorial, setPaginaActualHistorial] = useState(1);
  const [paginasTotalesHistorial, setPaginasTotalesHistorial] = useState(1);
  const [totalHistorial, setTotalHistorial] = useState(0);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);

  const fetchHistorial = () => {
    setCargandoHistorial(true);
    getTurnos({ pacienteId: PACIENTE_ACTIVO, estado: "CANCELADO,REALIZADO", ordenarPor: "fechaHora", ordenDireccion: "desc", page: paginaActualHistorial, limit: 10 })
      .then((res) => {
        setHistorialTurnos(res.data || []);
        setPaginasTotalesHistorial(res.paginacion?.totalPaginas || 1);
        setTotalHistorial(res.paginacion?.total || res.data?.length || 0);
        setCargandoHistorial(false);
      })
      .catch((err) => {
        console.error(err);
        setCargandoHistorial(false);
        message.error("Error al obtener el historial de turnos");
      });
  };

  const fetchProximos = () => {
    setCargandoProximos(true);
    getTurnos({ pacienteId: PACIENTE_ACTIVO, estado: "RESERVADO", ordenarPor: "fechaHora", ordenDireccion: "asc", page: paginaActualProximos, limit: 10 })
      .then((res) => {
        setProximosTurnos(res.data || []);
        setPaginasTotalesProximos(res.paginacion?.totalPaginas || 1);
        setTotalProximos(res.paginacion?.total || res.data?.length || 0);
        setCargandoProximos(false);
      })
      .catch((err) => {
        console.error(err);
        setCargandoProximos(false);
        message.error("Error al obtener los próximos turnos");
      });
  };

  useEffect(fetchHistorial, [paginaActualHistorial]);
  useEffect(fetchProximos, [paginaActualProximos]);

  const recargar = () => {
    fetchHistorial();
    fetchProximos();
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

  const proximos = useMemo(
    () => proximosTurnos.map(hidratarTurno),
    [proximosTurnos]
  );

  const historicos = useMemo(
    () => historialTurnos.map(hidratarTurno),
    [historialTurnos]
  );

  const onCancelar = (turno) => {
    let motivo = "";
    modal.confirm({
      title: t("misTurnos.cancelarTitle"),
      content: (
        <div>
          <p>{turno.medicoNombre} · {fmt(turno.fechaHora)}</p>
          <Input.TextArea
            rows={3}
            placeholder={t("misTurnos.cancelarPlaceholder")}
            onChange={(e) => { motivo = e.target.value; }}
          />
        </div>
      ),
      okText: t("misTurnos.cancelarOk"),
      okButtonProps: { danger: true },
      cancelText: t("misTurnos.cancelarCancel"),
      onOk: async () => {
        if (!motivo.trim()) {
          message.error(t("misTurnos.errorFaltaMotivo"));
          throw new Error("falta motivo");
        }
        await cancelarTurno(turno.id, { usuarioId: PACIENTE_ACTIVO.usuarioId, motivo: motivo.trim() });
        message.success(t("misTurnos.canceladoOk"));
        recargar();
      },
    });
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
          defaultActiveKey="proximos"
          style={{ marginTop: 16 }}
          items={[
            { 
              key: "proximos", 
              label: `${t("misTurnos.proximos")} (${totalProximos})`, 
              children: renderLista(proximos, cargandoProximos, paginaActualProximos, paginasTotalesProximos, setPaginaActualProximos) 
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
    </Layout>
  );
}
