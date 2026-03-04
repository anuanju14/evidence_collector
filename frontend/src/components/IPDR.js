import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './IPDR.css';

const IPDR = () => {
    const navigate = useNavigate();
    const [ipdrData, setIpdrData] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newRecord, setNewRecord] = useState({ ipAddress: '' });
    const [searchTerm, setSearchTerm] = useState(''); // Search term for filtering
    const fileInputRef = React.useRef(null);
    const [targetRecordId, setTargetRecordId] = useState(null);

    const filteredData = ipdrData.filter(record =>
        (record.ipAddress || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Fetch IPDR data on mount
    const fetchIpdrData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/ipdr');
            setIpdrData(res.data);
        } catch (err) {
            console.error('Error fetching IPDRs:', err);
        }
    };

    useEffect(() => {
        fetchIpdrData();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };

    const handleSaveNewRecord = async () => {
        if (newRecord.ipAddress.trim() !== '') {
            try {
                await axios.post('http://localhost:5000/api/ipdr', {
                    ipAddress: newRecord.ipAddress,
                    uploadDate: new Date(),
                    status: 'Pending',
                    data: []
                });
                fetchIpdrData();
                setIsAdding(false);
                setNewRecord({ ipAddress: '' });
            } catch (err) {
                console.error('Failed to create record:', err);
                alert('Failed to save record.');
            }
        }
    };

    const handleCancelAdd = () => {
        setIsAdding(false);
        setNewRecord({ ipAddress: '' });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewRecord(prev => ({ ...prev, [name]: value }));
    };

    const handleDelete = async (id) => {
        console.log("Delete button clicked for ID:", id);
        if (window.confirm("Are you sure you want to delete this record?")) {
            try {
                const res = await axios.delete(`http://localhost:5000/api/ipdr/${id}`);
                console.log("Delete response:", res.data);
                fetchIpdrData();
            } catch (err) {
                console.error('Failed to delete record:', err);
                alert('Failed to delete record.');
            }
        }
    };

    const triggerFileUpload = (id) => {
        setTargetRecordId(id);
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (file && targetRecordId) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await axios.post(`http://localhost:5000/api/ipdr/upload/${targetRecordId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert(res.data.message || 'File uploaded successfully!');
                fetchIpdrData();
            } catch (err) {
                console.error('File upload failed:', err);
                alert('Failed to upload Excel file.');
            }

            e.target.value = ''; // Reset input
            setTargetRecordId(null);
        }
    };

    const handleDownload = async (id, fileName) => {
        try {
            const res = await axios.get(`http://localhost:5000/api/ipdr/download/${id}`, {
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

    return (
        <div className="ipdr-container">
            <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
            />


            <div className="ipdr-content">
                <div className="glass-panel">
                    <div className="d-flex justify-content-between align-items-center mb-4 pb-3">
                        <h2 className="panel-title mb-0 border-bottom border-primary border-3 pb-2">IP DETAIL RECORDS (IPDR)</h2>
                        <div className="d-flex gap-2 align-items-center">
                            <input
                                type="text"
                                className="form-control search-input-large"
                                placeholder="Search IP Address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <button className="btn btn-primary fw-bold px-3 py-2" onClick={() => setIsAdding(true)}>Add</button>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table-glass table-hover">
                            <thead>
                                <tr>
                                    <th>Si No</th>
                                    <th>IP address</th>
                                    <th>File</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((record, index) => (
                                        <tr key={record._id || index}>
                                            <td>{index + 1}</td>
                                            <td>{record.ipAddress}</td>
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
                                                <button className="btn btn-sm btn-warning text-dark fw-bold me-2" onClick={() => triggerFileUpload(record._id)}>Upload Excel</button>
                                                <button className="btn btn-sm btn-danger fw-bold" onClick={() => handleDelete(record._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    !isAdding && (
                                        <tr>
                                            <td colSpan="4" className="text-center text-muted">
                                                {searchTerm ? `No records found matching "${searchTerm}"` : "No records found."}
                                            </td>
                                        </tr>
                                    )
                                )}

                                {isAdding && (
                                    <tr>
                                        <td>{ipdrData.length + 1}</td>
                                        <td><input type="text" name="ipAddress" className="form-control form-control-sm" value={newRecord.ipAddress} onChange={handleInputChange} placeholder="IP Address" autoFocus /></td>
                                        <td><span className="text-muted italic">Pending</span></td>
                                        <td>
                                            <button className="btn btn-sm btn-success me-2" onClick={handleSaveNewRecord}>Save</button>
                                            <button className="btn btn-sm btn-secondary" onClick={handleCancelAdd}>Cancel</button>
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

export default IPDR;
