import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Layout } from "./Layout";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Auth } from "./pages/Auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./../firebase"; // ajuste o caminho

function App() {
  const [usuario, setUsuario] = useState<any>(null);
  const [verificandoAuth, setVerificandoAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setVerificandoAuth(false); // <-- Só libera a tela DEPOIS que o Firebase responder
    });
    return () => unsubscribe();
  }, []);

  // Tela de loading enquanto verifica o Firebase
  if (verificandoAuth) {
    return <div style={{ textAlign: "center", marginTop: "20vh" }}>Carregando GoJar...</div>;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          {/* ROTAS PROTEGIDAS: Se não tiver usuário, redireciona para /auth */}
          <Route
            path="/"
            element={usuario ? <Home /> : <Navigate to="/auth" replace />}
          />
          <Route
            path="/about"
            element={usuario ? <About /> : <Navigate to="/auth" replace />}
          />

          {/* ROTA PÚBLICA (LOGIN): Se JÁ tiver usuário, redireciona para a Home (/) */}
          <Route
            path="/auth"
            element={!usuario ? <Auth /> : <Navigate to="/" replace />}
          />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;