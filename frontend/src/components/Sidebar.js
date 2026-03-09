import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFolderOpen, faDatabase, faChartPie, faHome, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };

    const isActive = (path) => {
        return location.pathname.startsWith(path) && path !== '/' ? 'active' : '';
    };

    return (
        <aside className="global-sidebar">
            <div className="sidebar-header">
                <h2 className="brand-logo">Evidence.</h2>
                <p className="brand-subtitle">Collector Framework</p>
            </div>

            <nav className="sidebar-nav">
                <Link to="/dashboard" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                    <FontAwesomeIcon icon={faHome} className="sidebar-icon" /> Home
                </Link>
                <Link to="/cases" className={`sidebar-link ${isActive('/cases')}`}>
                    <FontAwesomeIcon icon={faFolderOpen} className="sidebar-icon" /> Case File
                </Link>
                <Link to="/new-entry" className={`sidebar-link ${isActive('/new-entry')}`}>
                    <FontAwesomeIcon icon={faPlus} className="sidebar-icon" /> New Entry
                </Link>
                <Link to="/databank" className={`sidebar-link ${isActive('/databank')}`}>
                    <FontAwesomeIcon icon={faDatabase} className="sidebar-icon" /> Databank
                </Link>

                <button onClick={handleLogout} className="sidebar-link logout-btn">
                    <FontAwesomeIcon icon={faSignOutAlt} className="sidebar-icon" /> Logout
                </button>
            </nav>
        </aside>
    );
};

export default Sidebar;
