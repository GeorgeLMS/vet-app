'use client'

import { X, Download } from 'lucide-react'
import { useState, useEffect } from 'react'

interface PDFViewerProps {
    url: string
    fileName: string
    public_id: string
    resource_type: string
    onClose: () => void
}

export default function PDFViewer({ url, fileName, public_id, resource_type, onClose }: PDFViewerProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPdf = async () => {
            try {
                const res = await fetch(`/api/pet-files/download?public_id=${encodeURIComponent(public_id)}&name=${encodeURIComponent(fileName)}&resource_type=${resource_type}&view=true`)
                const blob = await res.blob()
                const url = URL.createObjectURL(blob)
                setBlobUrl(url)
            } catch (error) {
                console.error('Error loading PDF:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPdf()

        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl)
            }
        }
    }, [public_id, fileName, resource_type, blobUrl])

    const handleDownload = async () => {
        const res = await fetch(`/api/pet-files/download?public_id=${encodeURIComponent(public_id)}&name=${encodeURIComponent(fileName)}&resource_type=${resource_type}&view=false`)
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold truncate flex-1">{fileName}</h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="text-gray-600 hover:text-gray-800 p-2"
                            aria-label="Download"
                        >
                            <Download size={20} />
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 p-2"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* PDF Content */}
                <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-4 relative">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white">
                            <div className="text-center">
                                <div className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                </div>
                                <p className="text-sm text-gray-600">Cargando PDF...</p>
                            </div>
                        </div>
                    )}
                    {blobUrl && (
                        <embed
                            src={blobUrl}
                            type="application/pdf"
                            className="w-full h-full"
                            title={fileName}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
