import { useTranslation } from "react-i18next";
import { Dropdown, Button } from "antd";
import { GlobalOutlined } from "@ant-design/icons";

const IDIOMAS = [
  { code: "es", label: "Español", short: "ES" },
  { code: "en", label: "English", short: "EN" },
];

export default function SelectorIdioma() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.startsWith("es") ? "es" : "en";
  const actual = IDIOMAS.find((i) => i.code === currentLanguage) ?? IDIOMAS[0];

  const menu = {
    items: IDIOMAS.map((i) => ({ key: i.code, label: i.label })),
    selectedKeys: [actual.code],
    onClick: ({ key }) => i18n.changeLanguage(key),
  };

  return (
    <Dropdown menu={menu} trigger={["click"]} placement="bottomRight">
      <Button type="text" icon={<GlobalOutlined />}>{actual.short}</Button>
    </Dropdown>
  );
}
