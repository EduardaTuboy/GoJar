function initNavigation() {
    const icons = document.querySelectorAll("footer i");
    const sections = document.querySelectorAll("section");

    // Inicializar: mostrar Stats para debug
    if (icons.length > 0 && sections.length > 0) {
        const statsSection = document.querySelector("#stats");
        const statsIcon = Array.from(icons).find(icon => icon.textContent.trim() === statsSection.dataset.target);

        sections.forEach((section) => {
            section.style.display = section.id === "stats" ? "block" : "none";
        });

        icons.forEach((icon) => {
            icon.classList.toggle("active", icon === statsIcon);
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
