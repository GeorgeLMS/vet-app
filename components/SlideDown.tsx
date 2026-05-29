export function SlideDown({ open, children }: { open: boolean; children: React.ReactNode }) {
    return (
        <div className={`grid transition-all duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden p-1 -m-1">  {/* ← gives shadow room to breathe */}
                <div className={`transition-all duration-200 ${open ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}`}>
                    {children}
                </div>
            </div>
        </div>
    )
}