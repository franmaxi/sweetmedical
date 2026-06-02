import { useState } from "react";
import { Dropdown, Button } from "antd";
import { GlobalOutlined } from "@ant-design/icons";

// Boton visual de idioma. La traducción real se va a cablear cuando
// se integre la capa de i18n ( por ahora solo cambia el label seleccionado )
const IDIOMAS = [
  { code: "es", label: "Español", short: "ES" },
  { code: "en", label: "English", short: "EN" },
];

export default function SelectorIdioma() {
  const [actual, setActual] = useState(IDIOMAS[0]);

  const menu = {
    items: IDIOMAS.map((i) => ({ key: i.code, label: i.label })),
    selectedKeys: [actual.code],
    onClick: ({ key }) => setActual(IDIOMAS.find((i) => i.code === key) ?? IDIOMAS[0]),
  };

  return (
    <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
      <Button type="text" icon={<GlobalOutlined />}>{actual.short}</Button>
    </Dropdown>
  );
}
