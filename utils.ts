
// Helper to format today in user tz
export function formatToday(tz: string) {
    return new Intl.DateTimeFormat('es-MX', {
        timeZone: tz,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date())
}

export function formatDate(val: unknown): string {
    if (!val) return '—'
    // YYYY-MM-DD strings (from to_char queries) — parse as local date to avoid any tz shift
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        const [y, m, d] = val.split('-').map(Number)
        return new Date(y, m - 1, d).toLocaleDateString('es-MX', {
            day: 'numeric', month: 'short', year: 'numeric',
        })
    }
    // Full timestamps — always use explicit Tijuana timezone
    const d = new Date(val as string)
    if (isNaN(d.getTime())) return '—'
    return new Intl.DateTimeFormat('es-MX', {
        day: 'numeric', month: 'short', year: 'numeric',
        timeZone: 'America/Tijuana',
    }).format(d)
}

export function formatPhone(raw: string | null | undefined): string {
    if (!raw) return ''
    const digits = raw.replace(/\D/g, '')
    if (digits.length === 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    return raw
}

export function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString('es-MX', {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: 'America/Tijuana'
    })
}