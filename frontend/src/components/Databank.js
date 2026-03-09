import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Databank.css';

const Databank = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/cases');
                setCases(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchCases();
    }, []);

    const handleSearch = (overrideQuery) => {
        const query = overrideQuery !== undefined ? overrideQuery.trim() : search.trim();
        setSearchQuery(query);

        if (!query) return;

        const q = query.toLowerCase();

        const matches = cases.filter(c => {
            const firMatch = c.firNumber && c.firNumber.toLowerCase().includes(q);
            const logMatch = c.evidenceLogs && c.evidenceLogs.some(log =>
                log.referenceData && log.referenceData.toLowerCase().includes(q)
            );
            return firMatch || logMatch;
        });

        // Auto-redirect if exactly 1 match
        if (matches.length === 1) {
            navigate(`/cases/${matches[0]._id}`);
        } else if (query.length >= 10 && /^\d+$/.test(query) && matches.length > 0) {
            // Auto-redirect to the first match if it's a phone number search
            navigate(`/cases/${matches[0]._id}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };

    // Filter cases either by FIR number or any matching KYC/Mobile number in their evidence logs
    const filteredCases = cases.filter(c => {
        if (!searchQuery) return false; // Show nothing until searched

        const q = searchQuery.toLowerCase();

        // Exact or partial FIR match
        const firMatch = c.firNumber && c.firNumber.toLowerCase().includes(q);

        // Match in Evidence Logs (referenceData holds URL/Mobile/KYC)
        const logMatch = c.evidenceLogs && c.evidenceLogs.some(log =>
            log.referenceData && log.referenceData.toLowerCase().includes(q)
        );

        return firMatch || logMatch;
    });

    return (
        <div className="databank-container">

            <div className="databank-content">
                <div className="glass-panel" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '50px' }}>
                    <div className="search-container d-flex justify-content-center align-items-center mb-4" style={{ width: '100%', maxWidth: '600px' }}>
                        <input
                            type="text"
                            className="search-input form-control"
                            style={{ maxWidth: '450px', marginRight: '10px' }}
                            placeholder="Enter FIR Number, KYC or Mobile..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="btn btn-primary" onClick={() => handleSearch()} style={{ padding: '10px 25px', borderRadius: '8px' }}>
                            Search
                        </button>
                    </div>

                    {/* Search Results Table */}
                    {loading ? (
                        <div className="mt-4">Loading Databank records...</div>
                    ) : (
                        <div className="table-responsive w-100 mt-4" style={{ maxWidth: '900px' }}>
                            {searchQuery && filteredCases.length === 0 ? (
                                <div className="text-center mt-4">
                                    <p>No matching cases found for "{searchQuery}".</p>
                                </div>
                            ) : null}

                            {filteredCases.length > 0 && (
                                <table className="table-glass" style={{ width: '100%' }}>
                                    <thead>
                                        <tr>
                                            <th>Case No</th>
                                            <th>FIR No</th>
                                            <th>Case Name</th>
                                            <th>Station</th>
                                            <th>Date</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCases.map(c => (
                                            <tr key={c._id} onClick={() => navigate(`/cases/${c._id}`)} style={{ cursor: 'pointer' }}>
                                                <td>{c.caseNumber}</td>
                                                <td>{c.firNumber}</td>
                                                <td>{c.caseName}</td>
                                                <td>{c.policeStation}</td>
                                                <td>{c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}</td>
                                                <td>
                                                    <button
                                                        onClick={() => navigate(`/cases/${c._id}`)}
                                                        className="btn-action btn-open"
                                                    >
                                                        Open Case File
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Databank;
