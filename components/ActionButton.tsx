'use client'

type ActionButtonProps = {
    icon: React.ReactNode
    label: string
    onClick: () => void
    size?: number
    disabled?: boolean
    variant?: 'primary' | 'danger'  // add this
}

export function ActionButton({
    icon,
    label,
    onClick,
    size = 16,
    disabled,
    variant = 'primary'  // default blue
}: ActionButtonProps) {
    const colors = {
        primary: 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:border-blue-300',
        danger: 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100 hover:border-red-300'
    }

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center justify-center rounded-md border ${colors[variant]} transition-colors disabled:opacity-50 p-1.5`}
            aria-label={label}
        >
            {icon}
        </button>
    )
}