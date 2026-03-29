import { useState } from "react";
import logo from "./assets/logo.png";
import "./App.css";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

function App() {
  return (
    <>
      <nav>
        <img src={logo} alt="Go Jar Logo" />
        <h1>GoJar</h1>
      </nav>

      <section id="login" data-target="exit_to_app">
        <h2>Login</h2>
      </section>

      <section id="graph" data-target="insights">
        <h2>Graph</h2>
      </section>

      <section id="stats" data-target="format_list_bulleted">
        <div>
          <h3>Entradas</h3>
          <ul>
            <li>
              <span>Entrada1</span>
              <span className="valor">500,00/mes</span>
              <span className="edit">
                <EditRoundedIcon />

                <DeleteRoundedIcon />
              </span>
              <span className="freq">dia 5 de todo mês</span>
            </li>
            <li>
              <span className="nome">Entradaaaaaaaaaaaaaaaaaaa2</span>
              <span className="valor">500,00/mes</span>
              <span className="edit">
                <EditRoundedIcon />

                <DeleteRoundedIcon />
              </span>
              <span className="freq">dia 5 de todo mês</span>
            </li>
          </ul>
          <button className="add">
            <AddRoundedIcon />
          </button>
        </div>

        <div>
          <h3>Saídas</h3>
          <ul>
            <li>
              <span className="nome">Saída1</span>
              <span className="valor">500,00/mes</span>
              <span className="edit">
                <EditRoundedIcon />

                <DeleteRoundedIcon />
              </span>
              <span className="freq">dia 5 de todo mês</span>
            </li>
            <li>
              <span className="nome">
                Saída222222222222222222222222222222222222222222
              </span>
              <span className="valor">500,00/mes</span>
              <span className="edit">
                <EditRoundedIcon />

                <DeleteRoundedIcon />
              </span>
              <span className="freq">dia 5 de todo mês</span>
            </li>
          </ul>
          <button className="add">
            <AddRoundedIcon />
          </button>
        </div>

        <div>
          <h3>Metas</h3>
          <ul>
            <li>
              <span className="nome">Meta1</span>
              <span className="valor">500,00/mes</span>
              <span className="edit">
                <EditRoundedIcon />

                <DeleteRoundedIcon />
              </span>
              <span className="freq">dia 5 de todo mês</span>
            </li>
            <li>
              <span className="nome">Meta2</span>
              <span className="valor">500,00/mes</span>
              <span className="edit">
                <EditRoundedIcon />

                <DeleteRoundedIcon />
              </span>
              <span className="freq">dia 5 de todo mês</span>
            </li>
          </ul>
          <button className="add">
            <AddRoundedIcon />
          </button>
        </div>
      </section>
      <footer>
        <ExitToAppRoundedIcon sx={{ color: "white" }} />

        <InsightsRoundedIcon sx={{ color: "white" }} />

        <FormatListBulletedRoundedIcon sx={{ color: "white" }} />
      </footer>
      <script src="index.js"></script>
    </>
  );
}

export default App;
