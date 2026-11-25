import { useState } from "react";
import MenuLateral from "../pages/MenuLateral/MenuLateral";
import "./BotaoVoltarMenu.css";

export default function BotaoVoltarMenu({ texto = "Voltar", className = "" }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`btn-voltar-menu ${className}`.trim()}
        onClick={() => setMenuAberto(true)}
      >
        <span>{texto}</span>
      </button>

      <MenuLateral menuAberto={menuAberto} setMenuAberto={setMenuAberto} />
    </>
  );
}