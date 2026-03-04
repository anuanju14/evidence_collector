import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faWhatsapp, faInstagram, faTelegram, faSnapchat, faXTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import './SocialMedia.css';

const SocialMedia = () => {
    const navigate = useNavigate();
    const [records, setRecords] = useState([]);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newRecord, setNewRecord] = useState({ name: '', platform: '', handleOrLink: '' });
    const [customPlatform, setCustomPlatform] = useState('');
    const [showAddPlatformRow, setShowAddPlatformRow] = useState(false);
    const fileInputRef = useRef(null);

    // Initial platform list
    const initialPlatforms = ["Facebook", "WhatsApp", "Instagram", "Telegram", "Snapchat", "X", "LinkedIn"];

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const [smRes, casesRes] = await Promise.all([
                axios.get('http://localhost:5000/api/social-media'),
                axios.get('http://localhost:5000/api/cases')
            ]);
            setRecords(smRes.data);
            setCases(casesRes.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data:", err);
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRecord(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveNewRecord = async () => {
        let finalPlatform = newRecord.platform;
        if (newRecord.platform === 'Others') {
            finalPlatform = customPlatform.trim();
        }

        if (!newRecord.name || !finalPlatform) {
            alert("Name and Platform are required");
            return;
        }

        try {
            await axios.post('http://localhost:5000/api/social-media', { ...newRecord, platform: finalPlatform });
            setNewRecord({ name: '', platform: '', handleOrLink: '' });
            setCustomPlatform('');
            setIsAdding(false);
            fetchRecords();
        } catch (err) {
            console.error("Error saving record:", err);
            alert("Failed to save record");
        }
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
        setNewRecord({ name: '', platform: '', handleOrLink: '' });
        setCustomPlatform('');
    };

    const handleDeleteUser = async (name) => {
        if (window.confirm(`Are you sure you want to delete all records for ${name}?`)) {
            try {
                const userRecords = records.filter(r => r.name === name);
                await Promise.all(userRecords.map(r => axios.delete(`http://localhost:5000/api/social-media/${r._id}`)));
                fetchRecords();
            } catch (err) {
                console.error("Error deleting user records:", err);
                alert("Failed to delete records");
            }
        }
    };

    const handleDeletePlatform = async (platform) => {
        if (window.confirm(`Are you sure you want to delete all records for the platform ${platform}?`)) {
            try {
                const platformRecords = records.filter(r => r.platform === platform);
                await Promise.all(platformRecords.map(r => axios.delete(`http://localhost:5000/api/social-media/${r._id}`)));
                fetchRecords();
            } catch (err) {
                console.error("Error deleting platform records:", err);
                alert("Failed to delete records");
            }
        }
    };

    const handleDeleteAll = async () => {
        if (window.confirm("Are you sure you want to delete ALL social media records? This action cannot be undone.")) {
            try {
                await axios.delete('http://localhost:5000/api/social-media');
                fetchRecords();
            } catch (err) {
                console.error("Error deleting all records:", err);
                alert("Failed to delete records");
            }
        }
    };

    const triggerFileUpload = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post('http://localhost:5000/api/social-media/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("File uploaded and processed successfully!");
            fetchRecords();
        } catch (err) {
            console.error("Error uploading file:", err);
            alert("Failed to upload file");
        }
        e.target.value = '';
    };

    const [otherPlatform, setOtherPlatform] = useState('');
    const [othersData, setOthersData] = useState({});

    const handleOthersInputChange = (name, value) => {
        setOthersData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveOthers = async () => {
        const platformName = otherPlatform.trim() || 'Others';
        const entries = Object.entries(othersData).filter(([_, link]) => link.trim() !== '');

        try {
            if (entries.length === 0) {
                // Save a placeholder so the platform is recorded
                await axios.post('http://localhost:5000/api/social-media', {
                    name: '_hidden_placeholder_',
                    platform: platformName,
                    handleOrLink: ''
                });
            } else {
                await Promise.all(entries.map(([name, link]) =>
                    axios.post('http://localhost:5000/api/social-media', {
                        name,
                        platform: platformName,
                        handleOrLink: link
                    })
                ));
            }
            setOtherPlatform('');
            setOthersData({});
            setShowAddPlatformRow(false);
            fetchRecords();
            alert(`Saved links for ${platformName}`);
        } catch (err) {
            console.error("Error saving others:", err);
            alert("Failed to save some links");
        }
    };

    // Helper function to get the icon for a platform
    const getPlatformIcon = (platformName) => {
        const lowerName = platformName.toLowerCase();
        if (lowerName.includes('facebook')) return faFacebook;
        if (lowerName.includes('whatsapp')) return faWhatsapp;
        if (lowerName.includes('instagram')) return faInstagram;
        if (lowerName.includes('telegram')) return faTelegram;
        if (lowerName.includes('snapchat')) return faSnapchat;
        if (lowerName === 'x' || lowerName.includes('twitter')) return faXTwitter;
        if (lowerName.includes('linkedin')) return faLinkedin;
        return faLink; // Default icon for "Others"
    };

    // Derived State
    const uniqueNames = Array.from(new Set(records.map(r => r.name).filter(n => n && n !== '_hidden_placeholder_'))).sort();
    const activePlatforms = Array.from(new Set([...initialPlatforms, ...records.map(r => r.platform).filter(Boolean)]));

    const matrix = activePlatforms.reduce((acc, p) => {
        acc[p] = {};
        uniqueNames.forEach(name => {
            const match = records.find(r => r.name === name && r.platform === p);
            acc[p][name] = match ? match.handleOrLink : null;
        });
        return acc;
    }, {});

    // Compute counts based on case evidence logs
    const platformCounts = activePlatforms.reduce((acc, p) => {
        const lowerP = p.toLowerCase();
        let count = 0;
        cases.forEach(c => {
            if (c.evidenceLogs && Array.isArray(c.evidenceLogs)) {
                c.evidenceLogs.forEach(log => {
                    if (log.mode && log.mode.toLowerCase() === lowerP) {
                        count++;
                    }
                });
            }
        });
        acc[p] = count;
        return acc;
    }, {});

    return (
        <div className="social-media-container">


            <div className="social-media-content">
                <div className="glass-panel">
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                        <h2 className="panel-title mb-0">Social Media</h2>
                    </div>

                    {isAdding && (
                        <div className="add-record-form mb-4 p-3 border rounded bg-white-50">
                            <div className="row g-2 align-items-end">
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Name</label>
                                    <input type="text" name="name" className="form-control form-control-sm" placeholder="Person Name" value={newRecord.name} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label small fw-bold">Platform</label>
                                    <select name="platform" className="form-select form-select-sm mb-1" value={newRecord.platform} onChange={handleInputChange}>
                                        <option value="">Select Platform</option>
                                        {initialPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                                        <option value="Others">Others</option>
                                    </select>
                                    {newRecord.platform === 'Others' && (
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="Enter platform name"
                                            value={customPlatform}
                                            onChange={(e) => setCustomPlatform(e.target.value)}
                                        />
                                    )}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label small fw-bold">Handle / Link</label>
                                    <input type="text" name="handleOrLink" className="form-control form-control-sm" placeholder="Username or URL" value={newRecord.handleOrLink} onChange={handleInputChange} />
                                </div>
                                <div className="col-md-2">
                                    <button className="btn btn-sm btn-success w-100 mb-1" onClick={handleSaveNewRecord}>Save</button>
                                    <button className="btn btn-sm btn-secondary w-100" onClick={handleCancelAdd}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="table-responsive">
                        <table className="table-glass transposed-table">
                            <thead>
                                <tr>
                                    <th className="sticky-col">Platform</th>
                                    {uniqueNames.map(name => (
                                        <th key={name} className="name-header">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span>{name}</span>
                                                <button className="btn-delete-user" onClick={() => handleDeleteUser(name)} title={`Delete all for ${name}`}>&times;</button>
                                            </div>
                                        </th>
                                    ))}
                                    <th className="action-header" style={{ width: '80px', textAlign: 'center' }}>Count</th>
                                    <th className="action-header">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={uniqueNames.length + 1} className="text-center">Loading...</td></tr>
                                ) : (
                                    <>
                                        {activePlatforms.map(p => (
                                            <tr key={p}>
                                                <td className="sticky-col platform-label">
                                                    <FontAwesomeIcon icon={getPlatformIcon(p)} className="me-2 text-primary" style={{ width: '20px' }} />
                                                    {p}
                                                </td>
                                                {uniqueNames.map(name => (
                                                    <td key={`${name}-${p}`}>
                                                        {matrix[p][name] ? (
                                                            <span className="platform-link" title={matrix[p][name]}>{matrix[p][name]}</span>
                                                        ) : (
                                                            <span className="empty-cell">-</span>
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="text-center fw-bold text-muted">
                                                    {platformCounts[p] || 0}
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger py-0 px-2"
                                                        onClick={() => handleDeletePlatform(p)}
                                                        title={`Delete all for ${p}`}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {showAddPlatformRow ? (
                                            <>
                                                <tr className="others-row">
                                                    <td className="sticky-col platform-label">
                                                        <input type="text" className="form-control form-control-sm platform-input" placeholder="Platform Name..." value={otherPlatform} onChange={(e) => setOtherPlatform(e.target.value)} />
                                                    </td>
                                                    {uniqueNames.map(name => (
                                                        <td key={`others-${name}`}>
                                                            <input type="text" className="form-control form-control-sm" placeholder="Link..." value={othersData[name] || ''} onChange={(e) => handleOthersInputChange(name, e.target.value)} />
                                                        </td>
                                                    ))}
                                                    <td>-</td>
                                                    <td></td>
                                                </tr>
                                                <tr className="apply-row">
                                                    <td colSpan={uniqueNames.length + 3}>
                                                        <div className="save-others-container d-flex justify-content-end gap-2 mt-2 mb-2 pe-2">
                                                            <button className="btn btn-sm btn-secondary" onClick={() => setShowAddPlatformRow(false)}>Cancel</button>
                                                            <button className="btn btn-sm btn-success" onClick={handleSaveOthers}>Save</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </>
                                        ) : (
                                            <tr>
                                                <td colSpan={uniqueNames.length + 3} className="text-start py-3 ps-3">
                                                    <button
                                                        className="btn btn-outline-primary btn-sm"
                                                        onClick={() => setShowAddPlatformRow(true)}
                                                    >
                                                        Others
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialMedia;
