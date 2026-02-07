import React from "react";
import { CheckCircle, AlertTriangle, XCircle, X } from "lucide-react";

/**
 * ActionModal Component
 * Replaces native confirm/alert dialogs.
 * 
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - onConfirm: function (for confirmation type)
 * - title: string
 * - message: string
 * - type: 'confirm' | 'success' | 'danger' | 'alert'
 * - confirmText: string
 * - cancelText: string
 */
export default function ActionModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = "alert",
    confirmText = "Confirm",
    cancelText = "Cancel"
}) {
    if (!isOpen) return null;

    const isConfirm = type === "confirm" || type === "danger";
    const color = type === "danger" ? "#d32f2f" : type === "success" ? "#2e7d32" : "#1e3c72";
    const Icon = type === "danger" ? AlertTriangle : type === "success" ? CheckCircle : AlertTriangle;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000
        }}>
            <div style={{
                background: 'white', borderRadius: '15px', padding: '30px', width: '90%', maxWidth: '400px',
                textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative',
                animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
                >
                    <X size={20} />
                </button>

                <div style={{
                    width: '60px', height: '60px', borderRadius: '50%', background: `${color}20`,
                    color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                }}>
                    <Icon size={32} />
                </div>

                <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{title}</h3>
                <p style={{ margin: '0 0 25px 0', color: '#666', lineHeight: '1.5' }}>{message}</p>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    {isConfirm && (
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 25px', borderRadius: '30px', border: '1px solid #ddd', background: 'white',
                                color: '#666', fontWeight: '600', cursor: 'pointer', flex: 1
                            }}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            if (!isConfirm) onClose(); // Auto close if alert/success
                        }}
                        style={{
                            padding: '10px 25px', borderRadius: '30px', border: 'none', background: color,
                            color: 'white', fontWeight: '600', cursor: 'pointer', flex: 1,
                            boxShadow: `0 4px 10px ${color}40`
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes popIn {
                    from { transform: scale(0.8); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
