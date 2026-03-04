import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import logo from '../assets/kerala_police_logo.png';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/login', { username, password });
            if (res.data.success) {
                localStorage.setItem('auth', 'true');
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="logo-container">
                    <img src={logo} alt="Kerala Police Logo" className="login-logo" />
                </div>

                <br /><br /> {/* Spacer for avatar overlap */}

                {error && <div className="alert-custom">{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <FontAwesomeIcon icon={faUser} className="form-control-icon" />
                        <input
                            type="text"
                            className="form-control-custom"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <FontAwesomeIcon icon={faLock} className="form-control-icon" />
                        <input
                            type="password"
                            className="form-control-custom"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-login">
                        LOGIN
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
