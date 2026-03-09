import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import loginImage from '../assets/log11.jpg';
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
        <div className="login-container" style={{ backgroundImage: `url(${loginImage})` }}>

            <div className="login-form-side">
                <div className="login-form-wrapper">
                    <div className="login-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to Evidence Collector</p>
                    </div>

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

        </div>
    );
};

export default Login;
