function initNavigation() {
    const icons = document.querySelectorAll("footer i");
    const sections = document.querySelectorAll("section");

    // Inicializar: mostrar primeira seção e marcar primeiro ícone como ativo
    if (icons.length > 0 && sections.length > 0) {
        icons[0].classList.add("active");
        sections.forEach((section, index) => {
            section.style.display = index === 0 ? "block" : "none";
        });
    }

    // Adicionar event listeners
    icons.forEach((icon) => {
        icon.addEventListener("click", () => {
            const targetValue = icon.textContent.trim();

            // Atualizar sections
            sections.forEach((section) => {
                section.style.display = section.dataset.target === targetValue ? "block" : "none";
            });

            // Atualizar ícones ativos
            icons.forEach((i) => {
                i.classList.remove("active");
            });
            icon.classList.add("active");
        });
    });
}

// Garantir que o DOM está pronto
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavigation);
} else {
    initNavigation();
}
