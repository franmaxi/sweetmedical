import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, Dropdown, Empty, List, Space, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import {
  getNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
} from "../api/api";

const { Text } = Typography;

const fmtFecha = (iso, locale) => {
  if (!iso) return "";
  return new Date(iso).toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function NotificacionesDropdown() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const destinatarioId = user?.userId;
  const [notificaciones, setNotificaciones] = useState([]);
  const [open, setOpen] = useState(false);

  const recargar = useCallback(() => {
    if (!destinatarioId) return;
    getNotificaciones({ destinatarioId })
      .then((res) => {
        setNotificaciones(res?.data || []);
      })
      .catch((err) => {
        console.error("Error al cargar notificaciones en dropdown", err);
      });
  }, [destinatarioId]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  const irANotificaciones = () => {
    setOpen(false);
    navigate("/notificaciones");
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const onMarcar = async (id, e) => {
    e?.stopPropagation();
    try {
      await marcarComoLeida(id);
      recargar();
    } catch (err) {
      console.error("No se pudo marcar la notificación como leída", err);
    }
  };

  const onMarcarTodas = async () => {
    if (!destinatarioId) return;
    try {
      await marcarTodasComoLeidas(destinatarioId);
      recargar();
    } catch (err) {
      console.error("No se pudieron marcar todas como leídas", err);
    }
  };

  const popup = () => (
    <div style={{ width: 360, background: "#fff", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Text strong>{t("notificaciones.titulo")}</Text>
        {noLeidas > 0 && (
          <Button type="link" size="small" onClick={onMarcarTodas} style={{ padding: 0 }}>
            {t("notificaciones.marcarTodas")}
          </Button>
        )}
      </div>

      {notificaciones.length === 0 ? (
        <div style={{ padding: 24 }}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("notificaciones.emptyText")} />
        </div>
      ) : (
        <List
          style={{ maxHeight: 320, overflow: "auto" }}
          dataSource={notificaciones}
          renderItem={(n) => (
            <List.Item
              key={n._id || n.id}
              style={{
                padding: "12px 16px",
                background: n.leida ? "#fff" : "#fff1f0",
                alignItems: "flex-start",
              }}
            >
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                <Text style={{ fontWeight: n.leida ? 400 : 500 }}>{n.mensaje}</Text>
                <Space size="small" style={{ width: "100%", justifyContent: "space-between" }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>{fmtFecha(n.fechaHoraCreacion, i18n.language === "en" ? "en-US" : "es-AR")}</Text>
                  {!n.leida && (
                    <Button type="link" size="small" style={{ padding: 0, fontSize: 11 }} onClick={(e) => onMarcar(n._id || n.id, e)}>
                      {t("notificaciones.marcarLeida")}
                    </Button>
                  )}
                </Space>
              </Space>
            </List.Item>
          )}
        />
      )}

      <div style={{ padding: "8px 16px", borderTop: "1px solid #f0f0f0", textAlign: "center" }}>
        <Button type="link" size="small" onClick={irANotificaciones} style={{ padding: 0 }}>
          {t("notificaciones.verTodas")}
        </Button>
      </div>
    </div>
  );

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      popupRender={popup}
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) recargar();
      }}
    >
      <Badge count={noLeidas} size="small">
        <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 16 }} />} />
      </Badge>
    </Dropdown>
  );
}
