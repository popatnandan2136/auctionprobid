import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Shield, Users, ArrowRight, Star, Code, Smartphone, Phone, Mail, MapPin, HelpCircle, Menu, Globe } from 'lucide-react';
import API from "../../api";
import { useState, useEffect } from "react";

export default function ProBidIntro() {
    const navigate = useNavigate();
    const [partners, setPartners] = useState([]);

    useEffect(() => {
        API.get("/partner").then(res => setPartners(res.data)).catch(err => console.error(err));
    }, []);

    const owners = partners.filter(p => p.type === 'OWNER').sort((a, b) => (a.order || 99) - (b.order || 99));
    const officialPartners = partners.filter(p => p.type === 'PARTNER').sort((a, b) => (a.order || 99) - (b.order || 99));

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", color: '#333', lineHeight: '1.6', background: '#fdfdfd' }}>

            {/* Premium Navbar */}
            <nav style={{
                position: 'sticky', top: 0, zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                padding: '15px 40px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
                borderBottom: '1px solid rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/probid_logo.png" alt="Logo" style={{ height: '40px' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111', margin: 0, letterSpacing: '-0.5px' }}>
                        🏏 ProBid<span style={{ color: '#d4af37' }}>Auction</span>
                    </h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '30px', fontWeight: '500', color: '#555' }}>
                    <a href="#" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '5px' }}>Home</a>
                    <a href="#contact" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '5px' }}>Contact Us</a>
                    <a href="#help" style={{ textDecoration: 'none', color: '#333', display: 'flex', alignItems: 'center', gap: '5px' }}>Help & Support</a>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button onClick={() => navigate('/login')} style={{
                        padding: '10px 25px', borderRadius: '30px', border: '1px solid #ddd', background: 'transparent', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s'
                    }}>
                        Login
                    </button>
                    <button onClick={() => navigate('/login')} style={{
                        padding: '10px 25px', borderRadius: '30px', border: 'none', background: '#111', color: 'white', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}>
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section - Premium Dark */}
            <div style={{
                background: '#0f172a', /* Dark Navy */
                color: 'white',
                padding: '100px 20px 140px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background Glows */}
                <div style={{ position: 'absolute', top: '-20%', left: '20%', width: '400px', height: '400px', background: '#4f46e5', opacity: 0.2, filter: 'blur(100px)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '10%', width: '300px', height: '300px', background: '#d4af37', opacity: 0.1, filter: 'blur(80px)', borderRadius: '50%' }}></div>

                <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <span style={{ color: '#d4af37', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '20px', display: 'block' }}>
                        Professional Sports Auction Platform
                    </span>
                    <h1 style={{ fontSize: '4rem', fontWeight: '800', marginBottom: '25px', lineHeight: '1.1', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Elevate Your Auction Experience
                    </h1>
                    <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '50px', maxWidth: '700px', margin: '0 auto 50px', lineHeight: '1.8' }}>
                        The most sophisticated platform for managing teams, players, and real-time bidding.
                        Designed for precision, built for performance.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <button
                            onClick={() => navigate('/login')}
                            style={{
                                background: '#d4af37', color: '#000', padding: '16px 45px', borderRadius: '50px', border: 'none',
                                fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                                boxShadow: '0 0 20px rgba(212, 175, 55, 0.4)', transition: 'transform 0.2s'
                            }}
                        >
                            Start Auction <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Strip */}
            <div style={{ marginTop: '-60px', padding: '0 20px', position: 'relative', zIndex: 10 }}>
                <div style={{
                    maxWidth: '1100px', margin: '0 auto',
                    background: 'white', borderRadius: '20px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    padding: '40px', gap: '40px'
                }}>
                    <FeatureItem icon={<Shield size={30} color="#0f172a" />} title="Secure Core" desc="Enterprise-grade data protection." />
                    <FeatureItem icon={<Users size={30} color="#0f172a" />} title="Team Mgmt" desc="Effortless player & team handling." />
                    <FeatureItem icon={<Award size={30} color="#0f172a" />} title="Live Bidding" desc="Real-time, zero-latency auctions." />
                </div>
            </div>

            {/* OWNERS SECTION - LUXURY DARK CARD */}
            {owners.length > 0 && (
                <div style={{ padding: '120px 20px', background: '#fff' }}>
                    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <span style={{ color: '#d4af37', fontWeight: 'bold', letterSpacing: '1px' }}>LEADERSHIP</span>
                            <h2 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', marginTop: '10px' }}>Meet The Owners</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                            {owners.map(partner => (
                                <div key={partner._id} style={{
                                    background: '#0f172a', // Dark Navy
                                    borderRadius: '25px',
                                    padding: '50px 30px',
                                    color: 'white',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.2)'
                                }}>
                                    {/* Gold Accent */}
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '5px', background: 'linear-gradient(90deg, #d4af37, #fcd34d)' }}></div>

                                    <div style={{
                                        width: '130px', height: '130px', borderRadius: '50%', border: '4px solid #d4af37',
                                        padding: '4px', margin: '0 auto 25px', background: 'transparent'
                                    }}>
                                        <img
                                            src={partner.imageUrl ? `http://localhost:5000${partner.imageUrl}` : "https://via.placeholder.com/150"}
                                            alt={partner.name}
                                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <h3 style={{ fontSize: '2rem', margin: '0 0 5px', color: '#fff', fontFamily: 'serif' }}>{partner.name}</h3>
                                    <p style={{ color: '#d4af37', fontWeight: '600', fontSize: '0.9rem', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '25px' }}>{partner.title}</p>
                                    <p style={{ color: '#94a3b8', lineHeight: '1.8', fontSize: '1rem' }}>{partner.description}</p>

                                    <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                        <a href={`tel:${partner.mobile}`} style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '30px', color: '#d4af37', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
                                            <Phone size={16} /> Contact Owner
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* PARTNERS SECTION - CLEAN CORPORATE */}
            {officialPartners.length > 0 && (
                <div style={{ padding: '80px 20px', background: '#f8fafc' }}>
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                            <span style={{ color: '#64748b', fontWeight: 'bold', letterSpacing: '1px' }}>NETWORK</span>
                            <h2 style={{ fontSize: '2.5rem', color: '#0f172a', fontWeight: '800', marginTop: '10px' }}>Official Partners</h2>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                            {officialPartners.map(partner => (
                                <div key={partner._id} style={{
                                    background: 'white', borderRadius: '15px', padding: '30px',
                                    border: '1px solid #e2e8f0',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                                    transition: 'transform 0.3s', cursor: 'default'
                                }}>
                                    <div style={{ width: '80px', height: '80px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img
                                            src={partner.imageUrl ? `http://localhost:5000${partner.imageUrl}` : "https://via.placeholder.com/150"}
                                            alt={partner.name}
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    </div>
                                    <h4 style={{ margin: '0', fontSize: '1.2rem', color: '#333' }}>{partner.name}</h4>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', marginTop: '5px' }}>{partner.title}</span>
                                    <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', marginTop: '15px', flex: 1 }}>{partner.description}</p>

                                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                        {/* Contact in Card */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#1e3c72', fontWeight: 'bold', background: '#e3f2fd', padding: '5px 10px', borderRadius: '15px' }}>
                                            <Phone size={14} /> {partner.mobile}
                                        </div>
                                        {/* Website Link */}
                                        {partner.website && (
                                            <a href={partner.website.startsWith('http') ? partner.website : `https://${partner.website}`} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#2e7d32', fontWeight: 'bold', background: '#e8f5e9', padding: '5px 10px', borderRadius: '15px', textDecoration: 'none' }}>
                                                <Globe size={14} /> Website
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* CONTACT US SECTION */}
            <div id="contact" style={{ padding: '100px 20px', background: '#0f172a', color: 'white' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '60px' }}>Get In Touch</h2>

                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '50px' }}>
                        <ContactItem icon={<Mail size={30} color="#d4af37" />} title="Email Us" value="support@probid.com" />
                        <ContactItem icon={<Phone size={30} color="#d4af37" />} title="Call Us" value="+91 7048470585" />
                        <ContactItem icon={<HelpCircle size={30} color="#d4af37" />} title="Support" value="24/7 Live Chat" />
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ background: '#020617', color: '#94a3b8', padding: '30px 20px', textAlign: 'center', borderTop: '1px solid #1e293b' }}>
                <p>&copy; {new Date().getFullYear()} ProBid Auction. All rights reserved.</p>
                <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                    Developed by <strong style={{ color: '#fff' }}>Nandan Popat</strong>
                </div>
            </div>
        </div>
    );
}

function FeatureItem({ icon, title, desc }) {
    return (
        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px' }}>{icon}</div>
            <div>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 5px', fontWeight: '700', color: '#333' }}>{title}</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: '1.4' }}>{desc}</p>
            </div>
        </div>
    );
}

function ContactItem({ icon, title, value }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div>
                <h4 style={{ margin: '0 0 5px', fontSize: '1.2rem' }}>{title}</h4>
                <p style={{ margin: '0', color: '#cbd5e1' }}>{value}</p>
            </div>
        </div>
    );
}
