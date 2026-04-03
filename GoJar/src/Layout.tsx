import { Link, useLocation, useNavigate } from "react-router-dom"; // 1. Adicionado useNavigate
import logo from "./assets/logo.png";
import "./App.css";
import ExitToAppRoundedIcon from "@mui/icons-material/ExitToAppRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

// 2. Importações do Firebase
import { signOut } from "firebase/auth";
import { auth } from "./../firebase";

interface LayoutProps {
    children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const isAuthPage = location.pathname === "/auth";

    // Função que realmente desloga o usuário no Firebase
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Ao rodar isso, o Firebase avisa o App.tsx que o usuário deslogou
            // e o próprio App.tsx vai redirecionar a tela para /auth!
        } catch (error) {
            console.error("Erro ao fazer logout:", error);
        }
    };

    return (
        <>
            <nav>
                <img src={logo} alt="Go Jar Logo" />
                <h1>GoJar</h1>
            </nav>

            <main style={{ minHeight: isAuthPage ? "100vh" : "auto" }}>
                {children}
            </main>

            {!isAuthPage && (
                <footer>
                    {/* 5. Trocado de Link para button */}
                    <button
                        onClick={handleLogout}
                        title="Sair da Conta"
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex" // Mantém o alinhamento do ícone se necessário
                        }}
                    >
                        <ExitToAppRoundedIcon sx={{ color: "white" }} />
                    </button>

                    <Link to="/" title="Página Principal">
                        <InsightsRoundedIcon sx={{ color: "white" }} />
                    </Link>
                    <Link to="/about" title="Suporte e Sobre">
                        <HelpOutlineRoundedIcon sx={{ color: "white" }} />
                    </Link>
                </footer>
            )}
        </>
    );
}