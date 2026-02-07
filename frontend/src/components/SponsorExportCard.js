import React from 'react';
import { Globe, MapPin, Phone } from 'lucide-react';

const SponsorExportCard = ({ sponsor, auctionName, refProp }) => {
    return (
        <div ref={refProp} style={{ width: '600px', padding: '50px', background: 'white', color: '#1e293b', fontFamily: "'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden', textAlign: 'center' }}>

            {/* Simple Border */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px', border: '2px dashed #e2e8f0', pointerEvents: 'none' }}></div>

            <div style={{ marginBottom: '10px', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '3px', color: '#64748b' }}>
                Proud Sponsor Of
            </div>
            <h2 style={{ margin: '0 0 40px 0', fontSize: '1.8rem', color: '#0f172a' }}>{auctionName}</h2>

            {/* Logo Area */}
            <div style={{ width: '250px', height: '250px', margin: '0 auto 30px auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {sponsor.logoUrl ? (
                    <img src={sponsor.logoUrl} alt={sponsor.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                    <div style={{ fontSize: '4rem' }}>🤝</div>
                )}
            </div>

            <h1 style={{ margin: '0 0 10px 0', fontSize: '3rem', color: '#1e3c72' }}>{sponsor.name}</h1>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px', color: '#64748b' }}>
                {sponsor.mobile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Phone size={16} /> {sponsor.mobile}
                    </div>
                )}
                {sponsor.website && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Globe size={16} /> {sponsor.website}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: '40px', fontSize: '0.8rem', opacity: 0.5 }}>
                Powered by ProBid
            </div>
        </div>
    );
};

export default SponsorExportCard;
