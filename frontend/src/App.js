import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CaseManager from './components/CaseManager';
import CaseDetails from './components/CaseDetails';
import CaseReport from './components/CaseReport';
import Databank from './components/Databank';
import NewEntry from './components/NewEntry';
import CDR from './components/CDR';
import IPDR from './components/IPDR';
import SocialMedia from './components/SocialMedia';
import Layout from './components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
    const PrivateRoute = ({ children }) => {
        const auth = localStorage.getItem('auth');
        return auth ? <Layout>{children}</Layout> : <Navigate to="/login" />;
    };

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/cases" element={<PrivateRoute><CaseManager /></PrivateRoute>} />
                <Route path="/cases/:id" element={<PrivateRoute><CaseDetails /></PrivateRoute>} />
                <Route path="/cases/:id/report" element={<PrivateRoute><CaseReport /></PrivateRoute>} />
                <Route path="/databank" element={<PrivateRoute><Databank /></PrivateRoute>} />
                <Route path="/new-entry" element={<PrivateRoute><NewEntry /></PrivateRoute>} />
                <Route path="/cdr" element={<PrivateRoute><CDR /></PrivateRoute>} />
                <Route path="/ipdr" element={<PrivateRoute><IPDR /></PrivateRoute>} />
                <Route path="/social-media" element={<PrivateRoute><SocialMedia /></PrivateRoute>} />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
