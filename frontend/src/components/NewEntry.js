import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './NewEntry.css';

const NewEntry = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firNumber: '',
        policeStation: '',
        date: '',
        description: '',
        caseFile: '',
        fileHandling: '',
        petitionerName: '',
        petitionerAddress: '',
        petitionerContact: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        if (e.target.name === 'photo' || e.target.name === 'caseFile') {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, [e.target.name]: reader.result });
            };
            if (file) reader.readAsDataURL(file);
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/cases', formData);
            setMessage('Case added successfully!');
            setTimeout(() => {
                navigate('/cases'); // Redirect to Case List
            }, 1000);
        } catch (err) {
            console.error(err);
            const errorMsg = err.response?.data?.error || err.message;
            setMessage(`Error adding case: ${errorMsg}`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };

    const handleCancel = () => {
        navigate('/dashboard');
    };

    return (
        <div className="new-entry-container">

            <div className="new-entry-content">
                <div className="glass-form-card">
                    <h2 className="form-title">New Case Entry</h2>
                    {message && <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>{message}</div>}

                    <form onSubmit={handleSubmit} className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label">FIR Number</label>
                            <input type="text" className="form-control" name="firNumber" value={formData.firNumber} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Petitioner Name</label>
                            <input type="text" className="form-control" name="petitionerName" value={formData.petitionerName} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Petitioner Address</label>
                            <input type="text" className="form-control" name="petitionerAddress" value={formData.petitionerAddress} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Petitioner Contact</label>
                            <input type="text" className="form-control" name="petitionerContact" value={formData.petitionerContact} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Police Station</label>
                            <input type="text" className="form-control" name="policeStation" value={formData.policeStation} onChange={handleChange} required />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Investigator</label>
                            <input type="text" className="form-control" name="fileHandling" value={formData.fileHandling} onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Case File (Doc/PDF)</label>
                            <input type="file" className="form-control" name="caseFile" onChange={handleChange} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label">Date</label>
                            <input type="date" className="form-control" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                        <div className="col-12">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" name="description" value={formData.description} onChange={handleChange} rows="3" required></textarea>
                        </div>
                        <div className="col-12" style={{ textAlign: 'center', marginTop: '30px' }}>
                            <button type="submit" className="btn-submit">Submit Case</button>
                            <button type="button" className="btn-cancel" onClick={handleCancel}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewEntry;
