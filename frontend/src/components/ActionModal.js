import React from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const ActionModal = ({ isOpen, onClose, type = 'alert', title, message, confirmText = 'OK', cancelText = 'Cancel', onConfirm }) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success': return <CheckCircle size={48} color="#4ade80" />;
            case 'danger': return <AlertCircle size={48} color="#ef4444" />;
            case 'confirm': return <AlertTriangle size={48} color="#f59e0b" />;
            default: return <Info size={48} color="#3b82f6" />;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'success': return '#4ade80';
            case 'danger': return '#ef4444';
            case 'confirm': return '#f59e0b';
            default: return '#3b82f6';
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'white', padding: '30px', borderRadius: '15px',
                width: '400px', maxWidth: '90%',
                display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                position: 'relative',
                animation: 'fadeIn 0.2s ease-out'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '15px', right: '15px',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#999'
                    }}
                >
                    <X size={20} />
                </button>

                <div style={{ marginBottom: '20px' }}>
                    {getIcon()}
                </div>

                <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', color: '#333' }}>{title}</h2>
                <p style={{ margin: '0 0 25px 0', color: '#666', lineHeight: '1.5' }}>{message}</p>

                <div style={{ display: 'flex', gap: '15px', width: '100%', justifyContent: 'center' }}>
                    {type === 'confirm' && (
                        <button
                            onClick={onClose}
                            style={{
                                padding: '10px 25px', borderRadius: '8px', border: '1px solid #ddd',
                                background: 'white', color: '#666', cursor: 'pointer', fontWeight: 'bold',
                                flex: 1
                            }}
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            else onClose();
                        }}
                        style={{
                            padding: '10px 25px', borderRadius: '8px', border: 'none',
                            background: getButtonColor(), color: 'white', cursor: 'pointer', fontWeight: 'bold',
                            flex: 1,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default ActionModal;
