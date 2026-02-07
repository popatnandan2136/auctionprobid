import React, { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";

/**
 * MainLoader Component
 * - Shows a circular spinner while loading.
 * - If data takes >30s (default), shows a Retry button.
 */
export default function MainLoader({ loading, onRetry, timeout = 30000 }) {
    const [showRetry, setShowRetry] = useState(false);

    useEffect(() => {
        let timer;
        if (loading) {
            setShowRetry(false);
            timer = setTimeout(() => {
                setShowRetry(true);
            }, timeout);
        }
        return () => clearTimeout(timer);
    }, [loading, timeout]);

    if (!loading) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.9)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
        }}>

            {!showRetry ? (
                <>
                    <div style={{ animation: 'spin 1s linear infinite' }}>
                        <Loader2 size={64} color="#1e3c72" />
                    </div>
                    <p style={{ marginTop: '20px', color: '#1e3c72', fontWeight: 'bold' }}>Loading...</p>
                </>
            ) : (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '20px', color: '#d32f2f', fontSize: '1.2rem' }}>
                        Data is taking longer than expected.
                    </p>
                    <button
                        onClick={() => { setShowRetry(false); onRetry(); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: '#1e3c72',
                            color: 'white',
                            padding: '10px 25px',
                            borderRadius: '30px',
                            border: 'none',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        <RefreshCw size={20} /> Retry
                    </button>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
