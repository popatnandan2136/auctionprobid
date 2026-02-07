// Helper function to create downloadable player profile
export const createPlayerProfileHTML = (player, team, auction, status) => {
    const isSold = status === 'SOLD';
    const bgColor = isSold ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'linear-gradient(135deg, #f44336 0%, #c62828 100%)';
    const statusBadgeColor = isSold ? '#00e676' : '#ffcdd2';
    const statusText = isSold ? 'SOLD' : 'UNSOLD';

    return `
        <div style="
            width: 600px;
            background: ${bgColor};
            padding: 40px;
            borderRadius: 20px;
            color: white;
            position: relative;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
            <!-- Probid Logo Watermark -->
            <img 
                src="/probid_logo.png" 
                alt="PROBID" 
                style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0.1;
                    width: 350px;
                    z-index: 0;
                " 
            />
            
            <!-- Status Badge (Visible) -->
            <div style="
                position: absolute;
                top: 30px;
                right: 30px;
                background: ${statusBadgeColor};
                color: ${isSold ? '#1b5e20' : '#b71c1c'};
                padding: 12px 24px;
                borderRadius: 25px;
                fontWeight: bold;
                fontSize: 1.2rem;
                boxShadow: 0 4px 15px rgba(0,0,0,0.3);
                z-index: 2;
            ">
                ${statusText}
            </div>

            <div style="position: relative; z-index: 1;">
                <!-- Header -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="font-size: 2.5rem; margin: 0 0 10px 0;">PROBID</h1>
                    <div style="font-size: 1.2rem; opacity: 0.9;">Player Profile</div>
                </div>

                <!-- Player Image -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="width: 200px; height: 200px; margin: 0 auto; border-radius: 50%; overflow: hidden; border: 5px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                        ${player.imageUrl ?
            `<img src="${player.imageUrl}" alt="${player.name}" style="width: 100%; height: 100%; object-fit: cover;" />` :
            `<div style="width: 100%; height: 100%; background: #555; display: flex; align-items: center; justify-content: center; font-size: 5rem;">👤</div>`
        }
                    </div>
                </div>

                <!-- Player Details -->
                <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 15px; backdrop-filter: blur(10px);">
                    <h2 style="font-size: 2rem; margin: 0 0 20px 0; text-align: center;">${player.name}</h2>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Role</div>
                            <div style="font-size: 1.2rem; font-weight: bold;">${player.role}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Category</div>
                            <div style="font-size: 1.2rem; font-weight: bold;">${player.category}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Base Price</div>
                            <div style="font-size: 1.2rem; font-weight: bold;">₹${(player.basePrice || 0).toLocaleString('en-IN')}</div>
                        </div>
                        ${isSold ? `
                        <div>
                            <div style="font-size: 0.9rem; opacity: 0.8;">Sold Price</div>
                            <div style="font-size: 1.5rem; font-weight: bold; color: #00e676;">₹${(player.soldPrice || 0).toLocaleString('en-IN')}</div>
                        </div>
                        ` : ''}
                    </div>

                    ${team && isSold ? `
                    <div style="text-align: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 10px; margin-bottom: 15px;">
                        <div style="font-size: 0.9rem; opacity: 0.8; margin-bottom: 5px;">Sold To</div>
                        <div style="font-size: 1.5rem; font-weight: bold;">${team.name}</div>
                    </div>
                    ` : ''}

                    ${player.stats && Object.keys(player.stats).length > 0 ? `
                    <div style="margin-top: 20px;">
                        <h3 style="font-size: 1.2rem; margin-bottom: 15px;">Stats</h3>
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                            ${Object.entries(player.stats).map(([key, value]) => `
                                <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 0.8rem; opacity: 0.8;">${key}</div>
                                    <div style="font-size: 1.2rem; font-weight: bold;">${value}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 30px; opacity: 0.7; font-size: 0.9rem;">
                    ${auction.name} • ${new Date().getFullYear()}
                </div>
            </div>
        </div>
    `;
};
