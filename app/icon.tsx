import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        <div style={{
            width: 32, height: 32,
            background: '#2563eb',
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        }}>
            <div style={{ position: 'absolute', width: 12, height: 10, background: 'white', borderRadius: '50%', bottom: 4, left: 10 }} />
            <div style={{ position: 'absolute', width: 6, height: 5, background: 'white', borderRadius: '50%', top: 5, left: 4 }} />
            <div style={{ position: 'absolute', width: 6, height: 5, background: 'white', borderRadius: '50%', top: 3, left: 11 }} />
            <div style={{ position: 'absolute', width: 6, height: 5, background: 'white', borderRadius: '50%', top: 3, right: 11 }} />
            <div style={{ position: 'absolute', width: 6, height: 5, background: 'white', borderRadius: '50%', top: 5, right: 4 }} />
        </div>,
        { width: 32, height: 32 }
    )
}
