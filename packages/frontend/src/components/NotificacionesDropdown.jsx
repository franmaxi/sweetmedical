import { useEffect, useState } from "react";
import { Badge, Button, Dropdown, Empty, List, Space, Typography } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  getNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
} from "../mocks";

const { Text } = Typography;

// Sin login, mostramos las notificaciones de Ana García (usuarioId 201).
const USUARIO_ID = 201;

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
  const [notificaciones, setNotificaciones] = useState([]);

  const recargar = () => {
    getNotificaciones({ destinatarioId: USUARIO_ID }).then(setNotificaciones);
  };

  useEffect(recargar, []);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  const onMarcar = async (id, e) => {
    e?.stopPropagation();
    await marcarComoLeida(id);
    recargar();
  };

  const onMarcarTodas = async () => {
    await marcarTodasComoLeidas(USUARIO_ID);
    recargar();
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
          style={{ maxHeight: 380, overflow: "auto" }}
          dataSource={notificaciones}
          renderItem={(n) => (
            <List.Item
              key={n.id}
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
                    <Button type="link" size="small" style={{ padding: 0, fontSize: 11 }} onClick={(e) => onMarcar(n.id, e)}>
                      {t("notificaciones.marcarLeida")}
                    </Button>
                  )}
                </Space>
              </Space>
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      popupRender={popup}
      onOpenChange={(open) => open && recargar()}
    >
      <Badge count={noLeidas} size="small">
        <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18 }} />} />
      </Badge>
    </Dropdown>
  );
}
