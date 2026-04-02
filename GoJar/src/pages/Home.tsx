import { useState, useEffect } from "react";
import "../App.css";
import type { Entrada, Saida, Meta, TipoItem, Modal, SaldoConta } from "../types";
import { ItemModal } from "../ItemModal";
import { StatsSection } from "../StatsSection";
import { SaldosSection } from "../SaldosSection";
import MeuGrafico from "../Grafico";

// --- IMPORTAÇÕES DO FIREBASE ---
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, type User } from "firebase/auth";
import { db, auth } from "../../firebase";

export function Home() {
    const [user, setUser] = useState<User | null>(null); // Estado para controlar o usuário logado
    const [entradas, setEntradas] = useState<Entrada[]>([]);
    const [saidas, setSaidas] = useState<Saida[]>([]);
    const [metas, setMetas] = useState<Meta[]>([]);
    const [saldos, setSaldos] = useState<SaldoConta[]>([]);
    const [modal, setModal] = useState<Modal>({ aberto: false, tipo: "entrada" });
    const [itemEditando, setItemEditando] = useState<Entrada | Saida | Meta | undefined>();

    // 1. Escutar quem está logado ao abrir o app
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                carregarDados(currentUser.uid); // Puxa os dados só se tiver logado
            } else {
                // Limpa a tela se o usuário deslogar
                setEntradas([]); setSaidas([]); setMetas([]); setSaldos([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // 2. Buscar dados do Firestore (Lendo os IDs verdadeiros)
    const carregarDados = async (uid: string) => {
        try {
            const fetchColecao = async (nomeColecao: string) => {
                const querySnapshot = await getDocs(collection(db, "usuarios", uid, nomeColecao));
                // Aqui é onde a mágica do ID acontece! O doc.id resolve aquele erro da 'key'
                return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            };

            setEntradas(await fetchColecao("entradas") as Entrada[]);
            setSaidas(await fetchColecao("saidas") as Saida[]);
            setMetas(await fetchColecao("metas") as Meta[]);
            setSaldos(await fetchColecao("saldos") as SaldoConta[]);
        } catch (erro) {
            console.error("Erro ao carregar dados do Firebase:", erro);
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

    // 3. Salvar ou Atualizar no Firestore
    const salvarItem = async (item: Entrada | Saida | Meta) => {
        if (!user) return alert("Você precisa estar logado!");

        // Mapeia o tipo (singular) para o nome da coleção (plural)
        const colecaoNome = modal.tipo === "entrada" ? "entradas" : modal.tipo === "saida" ? "saidas" : "metas";

        try {
            // Remove o ID do objeto para não salvá-lo dentro das propriedades do documento
            const { id, ...dadosSalvar } = item as any;

            if (item.id) {
                // ATUALIZAR (item já existe)
                const docRef = doc(db, "usuarios", user.uid, colecaoNome, item.id);
                await updateDoc(docRef, dadosSalvar);
            } else {
                // CRIAR NOVO (item não tem ID)
                const colecaoRef = collection(db, "usuarios", user.uid, colecaoNome);
                await addDoc(colecaoRef, dadosSalvar);
            }

            // Recarrega os dados para mostrar na tela
            carregarDados(user.uid);
            fecharModal();
        } catch (error) {
            console.error("Erro ao salvar no Firebase:", error);
            alert("Erro ao salvar o item.");
        }
    };

    // 4. Deletar do Firestore
    const deletarItem = async (tipo: TipoItem, id: string) => {
        if (!user) return;
        if (window.confirm("Tem certeza que deseja deletar?")) {
            const colecaoNome = tipo === "entrada" ? "entradas" : tipo === "saida" ? "saidas" : "metas";
            try {
                await deleteDoc(doc(db, "usuarios", user.uid, colecaoNome, id));
                carregarDados(user.uid); // Recarrega a tela
            } catch (error) {
                console.error("Erro ao deletar:", error);
            }
        }
    };

    // 5. Alternar Ativo/Inativo no Firestore
    const alternarAtivo = async (tipo: TipoItem, id: string) => {
        if (!user) return;
        const colecaoNome = tipo === "entrada" ? "entradas" : tipo === "saida" ? "saidas" : "metas";

        // Acha o item atual nas listas locais para saber o status dele
        const lista = tipo === "entrada" ? entradas : tipo === "saida" ? saidas : metas;
        const itemAtual = lista.find(item => item.id === id);

        if (itemAtual) {
            try {
                const docRef = doc(db, "usuarios", user.uid, colecaoNome, id);
                await updateDoc(docRef, { ativo: !itemAtual.ativo });
                carregarDados(user.uid); // Recarrega a tela
            } catch (error) {
                console.error("Erro ao alternar status:", error);
            }
        }
    };

    const handleAtualizarSaldos = async (novosSaldos: SaldoConta[]) => {
        if (!user) return alert("Você precisa estar logado!");

        // 1. Atualiza a tela imediatamente (Optimistic UI) para não travar a experiência do usuário
        setSaldos(novosSaldos);

        try {
            // 2. Descobrir se algum saldo foi deletado
            // Pegamos todos os IDs da nova lista
            const idsNovos = novosSaldos.map(s => s.id);
            // Filtramos a lista antiga para achar quem sumiu
            const saldosDeletados = saldos.filter(s => !idsNovos.includes(s.id));

            // 3. Deletar no Firebase os saldos que foram removidos
            for (const saldo of saldosDeletados) {
                await deleteDoc(doc(db, "usuarios", user.uid, "saldos", saldo.id));
            }

            // 4. Salvar ou Atualizar os saldos restantes
            for (const saldo of novosSaldos) {
                // Usamos o setDoc em vez do addDoc porque o seu frontend já gera um ID próprio (Date.now)
                const docRef = doc(db, "usuarios", user.uid, "saldos", saldo.id);
                await setDoc(docRef, saldo);
            }
        } catch (error) {
            console.error("Erro ao atualizar saldos no Firebase:", error);
            alert("Erro ao salvar os saldos.");
        }
    };

    return (
        <>
            <SaldosSection saldos={saldos} onAtualizarSaldos={handleAtualizarSaldos} />

            <section id="graph" data-target="insights">
                <MeuGrafico entradas={entradas} saidas={saidas} metas={metas} saldos={saldos} />
            </section>

            <section id="stats" data-target="format_list_bulleted">
                <StatsSection
                    titulo="Entradas"
                    tipo="entrada"
                    itens={entradas}
                    onEditar={(item) => abrirModal("entrada", item)}
                    onDeletar={(id) => deletarItem("entrada", id)}
                    onAdicionar={() => abrirModal("entrada")}
                    onToggleAtivo={(id) => alternarAtivo("entrada", id)}
                />

                <StatsSection
                    titulo="Saídas"
                    tipo="saida"
                    itens={saidas}
                    onEditar={(item) => abrirModal("saida", item)}
                    onDeletar={(id) => deletarItem("saida", id)}
                    onAdicionar={() => abrirModal("saida")}
                    onToggleAtivo={(id) => alternarAtivo("saida", id)}
                />

                <StatsSection
                    titulo="Metas"
                    tipo="meta"
                    itens={metas}
                    onEditar={(item) => abrirModal("meta", item)}
                    onDeletar={(id) => deletarItem("meta", id)}
                    onAdicionar={() => abrirModal("meta")}
                    onToggleAtivo={(id) => alternarAtivo("meta", id)}
                />
            </section>

            <ItemModal
                aberto={modal.aberto}
                tipo={modal.tipo}
                item={itemEditando}
                onSalvar={salvarItem}
                onFechar={fecharModal}
            />
        </>
    );
}