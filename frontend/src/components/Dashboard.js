import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFolderOpen, faDatabase, faChartPie, faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Dashboard.css';

const Dashboard = () => {
    const [caseCount, setCaseCount] = useState(0);
    const [totalRecordsCount, setTotalRecordsCount] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCases = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/cases');
                const fetchedCases = res.data;
                setCaseCount(fetchedCases.length);

                // Calculate total records: number of cases + number of evidence logs across all cases
                const totalLogs = fetchedCases.reduce((total, currentCase) => {
                    return total + (currentCase.evidenceLogs ? currentCase.evidenceLogs.length : 0);
                }, 0);
                setTotalRecordsCount(fetchedCases.length + totalLogs);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCases();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };

    return (
        <div className="dashboard-layout">
            {/* Main Content Area */}
            <main className="main-content">
                <h1 className="page-title">Dashboard Overview</h1>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-title">Total Active Cases</div>
                        <div className="stat-value">{caseCount}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-title">Total Records</div>
                        <div className="stat-value">{totalRecordsCount}</div>
                    </div>
                    <Link to="/social-media" className="stat-card" style={{ textDecoration: 'none' }}>
                        <div className="stat-title">Social Media</div>
                        <div className="stat-value">0</div>
                    </Link>
                    <Link to="/cdr" className="stat-card" style={{ textDecoration: 'none' }}>
                        <div className="stat-title">CDR</div>
                        <div className="stat-value">0</div>
                    </Link>
                    <Link to="/ipdr" className="stat-card" style={{ textDecoration: 'none' }}>
                        <div className="stat-title">IPDR</div>
                        <div className="stat-value">0</div>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
