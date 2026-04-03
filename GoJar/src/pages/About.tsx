export function About() {
    return (
        <div style={{ padding: "2rem", maxWidth: "900px", margin: "0 auto" }}>
            <h2>Sobre</h2>

            <section style={{ marginBottom: "2rem" }}>
                <p>
                    GoJar é uma aplicação de gerenciamento financeiro pessoal que ajuda você a
                    controlar suas entradas, saídas e definir metas de economia.
                </p>
            </section>
            <section style={{ marginBottom: "2rem" }}>
                <ul>
                    <li>O sistema aglomera suas entradas, saídas e metas em um gráfico de linhas contínuas.</li>
                    <li>A partir das metas, calcula sua meta acumulada (formato de "escadinha").</li>
                    <li>Com suas entradas e saídas, calcula o saldo projetado (formato de "serra"), que te diz o quanto pode gastar sem estrapolar as metas.</li>
                    <li>Ao cadastrar seus saldos, você pode observar no gráfico se está acima ou abaixo do projetado (e da meta) e com isso planejar sua vida financeira e tomar melhores decisões.
                    </li>
                </ul>
            </section>
            <h2>Suporte</h2>
            <section style={{ marginBottom: "2rem" }}>
                <p>
                    Dúvidas, sugestões ou bugs? Entre em contato conosco:
                </p>
                <ul>
                    <li>Email: <a href="https://mail.google.com/mail/?view=cm&fs=1&to=dudsmoproductions@gmail.com&su=Assunto do Email&body=Escreva sua mensagem aqui" target="_blank">
                        dudsmoproductions@gmail.com
                    </a></li>
                    <li>GitHub: <a href="https://github.com/EduardaTuboy/GoJar" target="_blank" rel="noopener noreferrer">GoJar Repository</a></li>
                </ul>
            </section>

            <section style={{ marginBottom: "100px" }}>
                <h3>Versão</h3>
                <p>GoJar v1.0.1</p>
            </section>
        </div>
    );
}
