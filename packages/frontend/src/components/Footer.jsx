import { useLocation, useNavigate } from "react-router-dom";
import { Layout, Typography, Space } from "antd";

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export default function Footer() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const irInicio = () => {
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <AntFooter style={{ background: "#fafafa", borderTop: "1px solid #f0f0f0", padding: "16px clamp(16px, 4vw, 32px)" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Space style={{ cursor: "pointer" }} onClick={irInicio}>
          <span
            style={{
              width: 28, height: 28, borderRadius: "50%", background: "#be123c",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={18} height={18}>
              <path
                fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
                d="M 78 30 C 78 13 22 13 22 50 C 22 82 78 82 78 50 C 78 28 35 28 35 55 C 35 73 62 73 62 50 C 62 40 50 40 50 52"
              />
            </svg>
          </span>
          <Text strong style={{ fontSize: 15, color: "#be123c" }}>Sweet Medical</Text>
        </Space>

        <Text type="secondary" style={{ fontSize: 13 }}>
          © 2026 Sweet Medical · Grupo 12 · DDSO UTN FRBA
        </Text>
      </div>
    </AntFooter>
  );
}
