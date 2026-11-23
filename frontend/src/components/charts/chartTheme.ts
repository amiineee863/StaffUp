/**
 * Couleurs des graphiques, définies à un seul endroit.
 * series1 / series2 : paire bleu / orange vérifiée pour rester distinguable
 * par les personnes daltoniennes et contrastée sur fond blanc.
 */
export const CHART_THEME = {
    series1: "#2a78d6",
    series2: "#eb6834",
    grid: "#e2e8f0", // slate-200 : grille discrète
    axis: "#64748b", // slate-500
    text: "#0f172a", // slate-900 : les valeurs restent en couleur de texte, jamais en couleur de série
    cursor: "#f1f5f9", // slate-100 : survol
} as const;