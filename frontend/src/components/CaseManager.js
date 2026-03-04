import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './CaseManager.css'; // Import the new CSS

const CaseManager = () => {
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchCases();
    }, []);

    const fetchCases = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/cases');
            setCases(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this case?')) {
            try {
                await axios.delete(`http://localhost:5000/api/cases/${id}`);
                setCases(cases.filter(c => c._id !== id));
            } catch (err) {
                console.error(err);
                alert('Error deleting case');
            }
        }
    };

    const handleSearch = () => {
        const query = search.trim();
        setSearchQuery(query);

        if (!query) return;

        const q = query.toLowerCase();
        const matches = cases.filter(c =>
            (c.firNumber && c.firNumber.toLowerCase().includes(q)) ||
            (c.policeStation && c.policeStation.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q))
        );

        if (matches.length === 1) {
            navigate(`/cases/${matches[0]._id}`);
        }
    };

    const filteredCases = cases.filter(c =>
        (c.firNumber && c.firNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.policeStation && c.policeStation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="case-manager-container">

            <div className="case-manager-content">
                {/* Search Bar */}
                <div className="search-container d-flex justify-content-center align-items-center mb-4">
                    <input
                        type="text"
                        className="search-input form-control"
                        style={{ maxWidth: '400px', marginRight: '10px' }}
                        placeholder="Search by Name, FIR, Case No..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn btn-primary" onClick={handleSearch} style={{ padding: '10px 25px', borderRadius: '8px' }}>
                        Search
                    </button>
                </div>

                {/* Glass Table Card */}
                <div className="glass-table-card">
                    <table className="table-custom">
                        <thead>
                            <tr>
                                <th>FIR No.</th>
                                <th>Station</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCases.map(c => (
                                <tr key={c._id} onClick={() => navigate(`/cases/${c._id}`)} style={{ cursor: 'pointer' }}>
                                    <td>{c.firNumber}</td>
                                    <td>{c.policeStation}</td>
                                    <td>{c.date ? new Date(c.date).toLocaleDateString() : 'N/A'}</td>
                                    <td className="actions-cell">
                                        <div className="d-flex align-items-center">
                                            <button
                                                className="btn btn-sm btn-danger me-2"
                                                onClick={(e) => handleDelete(e, c._id)}
                                            >
                                                Delete
                                            </button>
                                            {c.caseFile && (
                                                <a href={c.caseFile} download={`case-file-${c.firNumber}`} onClick={(e) => e.stopPropagation()} className="btn-download">
                                                    File
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCases.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No cases found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CaseManager;
