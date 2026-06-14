import { useState } from "react"

export function useBump(duration = 200) {
    const [bumping, setBumping] = useState<Set<string>>(new Set())

    function trigger(key = 'default') {
        setBumping(prev => new Set([...prev, key]))
        setTimeout(() => setBumping(prev => { const s = new Set(prev); s.delete(key); return s }), duration)
    }

    function isBumping(key = 'default') {
        return bumping.has(key)
    }

    function style(key = 'default') {
        return {
            transform: bumping.has(key) ? 'scale(1.25)' : 'scale(1)',
            transition: 'transform 0.15s ease',
        }
    }

    return { trigger, isBumping, style }
}
