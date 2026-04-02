import { useState } from "react";
// Trocamos signInWithRedirect por signInWithPopup. E removemos getRedirectResult.
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../firebase"; // Ajuste o caminho se necessário

export function Auth() {
    const [erro, setErro] = useState<string | null>(null);
    // Podemos iniciar como false agora, pois não precisamos esperar a volta do Google
    const [carregando, setCarregando] = useState(false);

    const handleGoogleLogin = async () => {
        setCarregando(true);
        setErro(null);
        const provider = new GoogleAuthProvider();

        try {
            // O Popup é muito mais estável. Ele trava a execução aqui até o usuário logar.
            await signInWithPopup(auth, provider);

            // Sucesso! 
            // Não precisamos de "navigate('/')" aqui. 
            // O onAuthStateChanged lá no App.tsx vai detectar que o usuário logou 
            // e automaticamente jogar ele para a Home!

        } catch (error: any) {
            console.error("Erro ao iniciar login:", error);
            setErro("Falha ao ligar ao Google: " + error.message);
            setCarregando(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <p style={{ marginBottom: "1rem", color: "#333" }}>
                    Faça login para continuar
                </p>

                {erro && (
                    <div style={{ color: "#d32f2f", fontSize: "0.9rem", marginBottom: "1rem", textAlign: "left" }}>
                        {erro}
                    </div>
                )}

                <button
                    onClick={handleGoogleLogin}
                    disabled={carregando}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.75rem",
                        padding: "0.75rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        backgroundColor: carregando ? "#f5f5f5" : "#fff",
                        color: "#333",
                        fontWeight: "bold",
                        cursor: carregando ? "not-allowed" : "pointer",
                        fontSize: "1rem",
                        transition: "background-color 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
                    }}
                >
                    <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    {carregando ? "Aguarde..." : "Entrar com o Google"}
                </button>
            </div>
        </div>
    );
}