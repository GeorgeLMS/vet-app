export function formatAge(birthDate: unknown): string {
    if (!birthDate) return '—'
    const birth = new Date(birthDate as string)
    if (isNaN(birth.getTime())) return '—'

    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())

    if (months < 12) return months === 1 ? '1 mes' : `${months} meses`
    const years = Math.floor(months / 12)
    return years === 1 ? '1 año' : `${years} años`
}

export function formatDate(val: unknown): string {
    if (!val) return '—'
    const d = new Date(val as string)
    if (isNaN(d.getTime())) return '—'
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
        .toLocaleDateString('es-MX', {
            day: 'numeric',
            month: 'short',
            year: '2-digit',
        })
}

export function formatTime(ts: string) {
    return new Date(ts).toLocaleTimeString('es-MX', {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: 'America/Tijuana'
    })
}