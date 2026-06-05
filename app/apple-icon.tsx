import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
    const s = 180
    return new ImageResponse(
        <div style={{
            width: s, height: s,
            background: '#2563eb',
            borderRadius: s * 0.22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        }}>
            {/* Main pad */}
            <div style={{ position: 'absolute', width: s * 0.37, height: s * 0.31, background: 'white', borderRadius: '50%', bottom: s * 0.12, left: s * 0.315 }} />
            {/* Toe beans */}
            <div style={{ position: 'absolute', width: s * 0.19, height: s * 0.17, background: 'white', borderRadius: '50%', top: s * 0.19, left: s * 0.18 }} />
            <div style={{ position: 'absolute', width: s * 0.19, height: s * 0.17, background: 'white', borderRadius: '50%', top: s * 0.12, left: s * 0.375 }} />
            <div style={{ position: 'absolute', width: s * 0.19, height: s * 0.17, background: 'white', borderRadius: '50%', top: s * 0.12, right: s * 0.375 }} />
            <div style={{ position: 'absolute', width: s * 0.19, height: s * 0.17, background: 'white', borderRadius: '50%', top: s * 0.19, right: s * 0.18 }} />
        </div>,
        { width: s, height: s }
    )
}
