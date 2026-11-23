/** Affiche un niveau de 1 à 5 sous forme de 5 segments. */
export function LevelBar({ level }: { level: number }) {
    return (
        <div className="flex gap-0.5" role="img" aria-label={`Niveau ${level} sur 5`}>
            {[1, 2, 3, 4, 5].map((step) => (
                <span
                    key={step}
                    className={`h-2 w-5 rounded-sm ${step <= level ? "bg-indigo-500" : "bg-slate-200"}`}
                />
            ))}
        </div>
    );
}