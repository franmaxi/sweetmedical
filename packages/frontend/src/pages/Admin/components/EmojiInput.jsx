import { useState } from "react";
import { Button, Input, Popover, Tabs, Typography } from "antd";
import { CATEGORIAS_COMPLETAS } from "../../../utils/emojis";

const { Text } = Typography;

export default function EmojiInput({ value, onChange, placeholder }) {
  const [visible, setVisible] = useState(false);

  const seleccionarEmoji = (emoji) => {
    onChange?.(emoji);
    setVisible(false);
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gap: 6,
    maxHeight: 220,
    overflowY: "auto",
    padding: "8px 4px",
  };

  const emojiBtnStyle = {
    fontSize: 20,
    padding: 0,
    height: 34,
    width: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    transition: "all 0.15s ease",
  };

  const renderEmojiGrid = (emojis) => (
    <div style={gridStyle}>
      {emojis.map((emoji, index) => (
        <Button
          key={`${emoji}-${index}`}
          size="middle"
          type="text"
          style={emojiBtnStyle}
          onClick={() => seleccionarEmoji(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </div>
  );

  const tabItems = CATEGORIAS_COMPLETAS.map((cat) => ({
    key: cat.key,
    label: cat.label,
    children: renderEmojiGrid(cat.emojis),
  }));

  const contenidoPopover = (
    <div style={{ width: 360 }}>
      <Tabs
        defaultActiveKey="medicina"
        size="small"
        items={tabItems}
        tabBarStyle={{ marginBottom: 4 }}
      />
    </div>
  );

  return (
    <Popover
      content={contenidoPopover}
      title={<Text strong style={{ fontSize: 13, padding: "8px 16px 0 16px", display: "block" }}>Seleccionar Emoji</Text>}
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
      placement="bottomLeft"
      overlayStyle={{ zIndex: 1050 }}
      overlayInnerStyle={{ padding: "0 12px 12px 12px" }}
    >
      <Input
        value={value}
        readOnly
        role = "button"
        tabIndex = {0}
        aria-haspopup="dialog"
        aria-expanded={visible}
        placeholder={placeholder || "Haz clic aquí para seleccionar un emoji..."}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setVisible(true);
          }
        }}
        style={{
          borderRadius: 8,
          cursor: "pointer",
          fontSize: value ? 20 : 14,
          textAlign: value ? "center" : "left",
          backgroundColor: "#fff"
        }}
      />
    </Popover>
  );
}
