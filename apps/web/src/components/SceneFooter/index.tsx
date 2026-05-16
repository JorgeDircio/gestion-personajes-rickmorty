import type { ReactNode } from "react";
import base from "./SceneFooter.module.css";
import mobile from "./SceneFooter.mobile.module.css";
import desktop from "./SceneFooter.desktop.module.css";

interface Props {
  children: ReactNode;
}

export default function SceneFooter({ children }: Props) {
  return (
    <footer className={`${base.root} ${mobile.root} ${desktop.root}`}>
      <div className={`${base.favsMount} ${mobile.favsMount} ${desktop.favsMount}`}>
        {children}
      </div>
      <div className={`${mobile.grass} ${desktop.grass}`} aria-hidden />
    </footer>
  );
}
