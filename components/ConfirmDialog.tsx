'use client';

type Props = {
    title: string;
    message: string;
    confirmText?: string;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export default function ConfirmDialog({
    title,
    message,
    confirmText = 'Delete',
    danger = false,
    onConfirm,
    onCancel
}: Props) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
        >
            <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col gap-4 border border-[var(--border)]">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: danger ? '#FEF0ED' : '#EFF6FF' }}
                        >
                            {danger ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    <path d="M10 11v6M14 11v6" />
                                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 16v-4M12 8h.01" />
                                </svg>
                            )}
                        </div>
                        <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                            {title}
                        </h3>
                    </div>
                    <p className="text-sm pl-10" style={{ color: 'var(--text-secondary)' }}>
                        {message}
                    </p>
                </div>

                <div className="flex gap-2 pt-1">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-2.5 rounded-xl text-sm font-medium cursor-pointer border border-[var(--border)] bg-white"
                        style={{ color: 'var(--text-secondary)' }}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none text-white"
                        style={{ backgroundColor: danger ? 'var(--danger)' : 'var(--primary)' }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}