import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './CDR.css';

const CDR = () => {
    const navigate = useNavigate();
    const [cdrData, setCdrData] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newMobile, setNewMobile] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const fileInputRef = React.useRef(null);
    const [uploadingRecordId, setUploadingRecordId] = useState(null);

    // Fetch CDR data on mount
    const fetchCdrData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/cdr');
            setCdrData(res.data);
        } catch (err) {
            console.error('Error fetching CDRs:', err);
        }
    };

    useEffect(() => {
        fetchCdrData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };

    const handleSaveNewRecord = async () => {
        const mobile = newMobile.trim();
        if (mobile !== '') {
            if (!/^\d{10}$/.test(mobile)) {
                alert('Please enter a valid 10-digit mobile number.');
                return;
            }
            try {
                await axios.post('http://localhost:5000/api/cdr', { mobile });
                fetchCdrData();
                setIsAdding(false);
                setNewMobile('');
            } catch (err) {
                console.error('Failed to create record:', err);
                alert('Failed to save record.');
            }
        }
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
        setNewMobile('');
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                await axios.delete(`http://localhost:5000/api/cdr/${id}`);
                fetchCdrData();
            } catch (err) {
                console.error('Failed to delete record:', err);
                alert('Failed to delete record.');
            }
        }
    };

    const triggerFileUpload = (recordId) => {
        setUploadingRecordId(recordId);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file && uploadingRecordId) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await axios.post(`http://localhost:5000/api/cdr/upload/${uploadingRecordId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert(res.data.message || 'File uploaded successfully!');
                fetchCdrData(); // Refresh table
            } catch (err) {
                console.error('File upload failed:', err);
                alert('Failed to upload and process Excel file.');
            }

            e.target.value = ''; // Reset input
            setUploadingRecordId(null);
        }
    };

    const handleDownload = async (id, fileName) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/cdr/download/${id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error('Download error:', err);
            if (err.response && err.response.status === 404) {
                alert('File not found! This is an older record uploaded before the download feature was added.');
            } else {
                alert('Error downloading file.');
            }
        }
    };

    const filteredCdrData = cdrData.filter(record =>
        record.mobile.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="cdr-container">
            <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
            />

            <div className="cdr-content">
                <div className="glass-panel">
                    <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                        <h2 className="panel-title mb-0">Call Detail Records (CDR)</h2>
                        <div className="d-flex align-items-center gap-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search Mobile Number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '250px' }}
                            />
                            <button className="btn btn-primary text-nowrap" onClick={() => setIsAdding(true)}>Add Row</button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-glass table-hover">
                            <thead>
                                <tr>
                                    <th>Si No</th>
                                    <th>Mobile Number</th>
                                    <th>File</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCdrData.length > 0 && (
                                    filteredCdrData.map((record, index) => (
                                        <tr key={record._id}>
                                            <td>{index + 1}</td>
                                            <td>{record.mobile}</td>
                                            <td>
                                                {record.fileName ? (
                                                    <span
                                                        onClick={() => handleDownload(record._id, record.fileName)}
                                                        className="text-primary text-decoration-underline"
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {record.fileName}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted italic">No file</span>
                                                )}
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-warning text-dark me-2" onClick={() => triggerFileUpload(record._id)}>Upload Excel</button>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(record._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                {isAdding && (
                                    <tr>
                                        <td>{cdrData.length + 1}</td>
                                        <td>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm"
                                                value={newMobile}
                                                onChange={(e) => setNewMobile(e.target.value)}
                                                placeholder="Enter Mobile Number"
                                                autoFocus
                                            />
                                        </td>
                                        <td><span className="text-muted italic">Pending</span></td>
                                        <td>
                                            <button className="btn btn-sm btn-success me-2" onClick={handleSaveNewRecord}>Save</button>
                                            <button className="btn btn-sm btn-secondary" onClick={handleCancelAdd}>Cancel</button>
                                        </td>
                                    </tr>
                                )}
                                {!isAdding && filteredCdrData.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center text-muted">
                                            {searchTerm ? 'No matching records found.' : "No records found."}
                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CDR;
