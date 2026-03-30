import { useState, useEffect } from "react";
import logo from "./assets/logo.png";
import "./App.css";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import type { Entrada, Saida, Meta, TipoItem, Modal } from "./types";
import { ItemModal } from "./ItemModal";
import { StatsSection } from "./StatsSection";
import MeuGrafico from "./Grafico";

function App() {
  const [entradas, setEntradas] = useState<Entrada[]>([]);
  const [saidas, setSaidas] = useState<Saida[]>([]);
  const [metas, setMetas] = useState<Meta[]>([]);
  const [modal, setModal] = useState<Modal>({
    aberto: false,
    tipo: "entrada",
  });
  const [itemEditando, setItemEditando] = useState<
    Entrada | Saida | Meta | undefined
  >();

  // Carregar dados ao inicializar
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      // Carregar do data.json (sempre para manter os dados mockados)
      const response = await fetch("/data.json");
      const dados = await response.json();
      setEntradas(dados.entradas || []);
      setSaidas(dados.saidas || []);
      setMetas(dados.metas || []);
    } catch (erro) {
      console.error("Erro ao carregar dados:", erro);
    }
  };



  const abrirModal = (tipo: TipoItem, item?: Entrada | Saida | Meta) => {
    setModal({ aberto: true, tipo, itemId: item?.id });
    setItemEditando(item);
  };

  const fecharModal = () => {
    setModal({ aberto: false, tipo: "entrada" });
    setItemEditando(undefined);
  };

  const salvarItem = (item: Entrada | Saida | Meta) => {
    if (modal.tipo === "entrada") {
      const entrada = item as Entrada;
      const index = entradas.findIndex((e) => e.id === entrada.id);
      if (index >= 0) {
        const novasEntradas = [...entradas];
        novasEntradas[index] = entrada;
        setEntradas(novasEntradas);
      } else {
        setEntradas([...entradas, entrada]);
      }
    } else if (modal.tipo === "saida") {
      const saida = item as Saida;
      const index = saidas.findIndex((s) => s.id === saida.id);
      if (index >= 0) {
        const novasSaidas = [...saidas];
        novasSaidas[index] = saida;
        setSaidas(novasSaidas);
      } else {
        setSaidas([...saidas, saida]);
      }
    } else if (modal.tipo === "meta") {
      const meta = item as Meta;
      const index = metas.findIndex((m) => m.id === meta.id);
      if (index >= 0) {
        const novasMetas = [...metas];
        novasMetas[index] = meta;
        setMetas(novasMetas);
      } else {
        setMetas([...metas, meta]);
      }
    }
  };

  const deletarItem = (tipo: TipoItem, id: string) => {
    if (window.confirm("Tem certeza que deseja deletar?")) {
      if (tipo === "entrada") {
        setEntradas(entradas.filter((e) => e.id !== id));
      } else if (tipo === "saida") {
        setSaidas(saidas.filter((s) => s.id !== id));
      } else if (tipo === "meta") {
        setMetas(metas.filter((m) => m.id !== id));
      }
    }
  };

  const alternarAtivo = (tipo: TipoItem, id: string) => {
    if (tipo === "entrada") {
      setEntradas(entradas.map((e) => (e.id === id ? { ...e, ativo: !e.ativo } : e)));
    } else if (tipo === "saida") {
      setSaidas(saidas.map((s) => (s.id === id ? { ...s, ativo: !s.ativo } : s)));
    } else if (tipo === "meta") {
      setMetas(metas.map((m) => (m.id === id ? { ...m, ativo: !m.ativo } : m)));
    }
  };

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
        <MeuGrafico />
      </section>

      <section id="stats" data-target="format_list_bulleted">
        <StatsSection
          titulo="Entradas"
          tipo="entrada"
          itens={entradas}
          onEditar={(item) => abrirModal("entrada", item)}
          onDeletar={(id) => deletarItem("entrada", id)}
          onAdicionar={() => abrirModal("entrada")}
          onToggleAtivo={(id) => alternarAtivo("entrada", id)} // NOVO
        />

        <StatsSection
          titulo="Saídas"
          tipo="saida"
          itens={saidas}
          onEditar={(item) => abrirModal("saida", item)}
          onDeletar={(id) => deletarItem("saida", id)}
          onAdicionar={() => abrirModal("saida")}
          onToggleAtivo={(id) => alternarAtivo("saida", id)} // NOVO
        />

        <StatsSection
          titulo="Metas"
          tipo="meta"
          itens={metas}
          onEditar={(item) => abrirModal("meta", item)}
          onDeletar={(id) => deletarItem("meta", id)}
          onAdicionar={() => abrirModal("meta")}
          onToggleAtivo={(id) => alternarAtivo("meta", id)} // NOVO
        />
      </section>

      <ItemModal
        aberto={modal.aberto}
        tipo={modal.tipo}
        item={itemEditando}
        onSalvar={salvarItem}
        onFechar={fecharModal}
      />

      <footer>
        <ExitToAppRoundedIcon sx={{ color: "white" }} />
        <InsightsRoundedIcon sx={{ color: "white" }} />
        <FormatListBulletedRoundedIcon sx={{ color: "white" }} />
      </footer>
    </>
  );
}

export default App;
