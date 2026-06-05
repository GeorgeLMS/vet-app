export default function PageTitle({ children }: { children: React.ReactNode }) {
    return (
        <h1 className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-outfit)]">
            {children}
        </h1>
    )
}
