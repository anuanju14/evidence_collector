import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import './CaseDetails.css'; // Import the new CSS

const CaseDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [allCases, setAllCases] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Evidence Log State
    const [showAddDataForm, setShowAddDataForm] = useState(false);
    const [logFormData, setLogFormData] = useState({
        date: '',
        mode: '',
        remark: '',
        referenceData: '',
        criminalName: '',
        criminalAddress: '',
        criminalPhoto: '',
        attachment: null // Changed from '' to null for raw file
    });
    const [logMessage, setLogMessage] = useState('');

    useEffect(() => {
        const fetchCase = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/cases/${id}`);
                setCaseData(res.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('Error fetching case details');
                setLoading(false);
            }
        };

        const fetchAllCases = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/cases');
                setAllCases(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchCase();
        fetchAllCases();
        setSearchTerm('');
        setShowResults(false);
        setShowAddDataForm(false);
    }, [id]);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this case?')) {
            try {
                await axios.delete(`http://localhost:5000/api/cases/${id}`);
                navigate('/cases');
            } catch (err) {
                console.error(err);
                setError('Error deleting case');
            }
        }
    };

    const handleLogChange = (e) => {
        if (e.target.name === 'attachment') {
            const file = e.target.files[0];
            setLogFormData(prev => ({ ...prev, attachment: file })); // Store raw file
        } else if (e.target.name === 'criminalPhotoInput') {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogFormData(prev => ({ ...prev, criminalPhoto: reader.result }));
            };
            if (file) reader.readAsDataURL(file);
        } else {
            const { name, value } = e.target;
            setLogFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('date', logFormData.date);
            formData.append('mode', logFormData.mode);
            formData.append('remark', logFormData.remark);
            if (logFormData.referenceData) {
                formData.append('referenceData', logFormData.referenceData);
            }
            if (logFormData.criminalName) {
                formData.append('criminalName', logFormData.criminalName);
            }
            if (logFormData.criminalAddress) {
                formData.append('criminalAddress', logFormData.criminalAddress);
            }
            if (logFormData.criminalPhoto) {
                formData.append('criminalPhoto', logFormData.criminalPhoto);
            }
            if (logFormData.attachment) {
                formData.append('attachment', logFormData.attachment);
            }

            const res = await axios.put(`http://localhost:5000/api/cases/${id}/logs`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setCaseData(res.data);
            setLogMessage('Log added successfully!');
            setLogFormData({ date: '', mode: '', remark: '', referenceData: '', criminalName: '', criminalAddress: '', criminalPhoto: '', attachment: null });
            setShowAddDataForm(false);
            setTimeout(() => setLogMessage(''), 3000);
        } catch (err) {
            console.error(err);
            setLogMessage('Error adding log');
        }
    };

    const handleDeleteLog = async (logId) => {
        if (window.confirm('Are you sure you want to delete this log?')) {
            try {
                const res = await axios.delete(`http://localhost:5000/api/cases/${id}/logs/${logId}`);
                setCaseData(res.data);
                setLogMessage('Log deleted successfully!');
                setTimeout(() => setLogMessage(''), 3000);
            } catch (err) {
                console.error(err);
                setLogMessage('Error deleting log');
            }
        }
    };


    const handleDownloadPDF = async () => {
        const input = document.getElementById('pdf-content');
        if (!input) {
            alert('Report content not found.');
            return;
        }

        try {
            console.log('Generating PDF...');

            // Temporary styles for capture
            input.style.display = 'block';
            input.style.position = 'static';
            input.style.left = '0';
            input.style.opacity = '1';

            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 1200
            });

            // Restore hidden state
            input.style.position = 'absolute';
            input.style.left = '-9999px';
            input.style.display = 'block';

            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            const fileName = `Case_Report_${caseData.firNumber || id}.pdf`;
            pdf.save(fileName);
            console.log('PDF Saved:', fileName);
        } catch (err) {
            console.error('PDF Generation Error:', err);
            alert('Failed to generate PDF. Check console.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth');
        navigate('/login');
    };


    const filteredCases = allCases.filter(c =>
        c._id !== id && (
            (c.firNumber && c.firNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        )
    );

    if (loading) return <div className="case-details-container"><div className="case-details-content">Loading...</div></div>;
    if (error) return <div className="case-details-container"><div className="case-details-content alert alert-danger">{error}</div></div>;
    if (!caseData) return <div className="case-details-container"><div className="case-details-content">Case not found</div></div>;

    return (
        <div className="case-details-container">

            <div className="case-details-content" id="case-details-content">

                {/* Main Details Card */}
                <div className="details-card">
                    <div className="details-card-header">
                        <h3 className="case-title">Case Details: {caseData.firNumber}</h3>

                        <div className="position-relative no-print" style={{ width: '300px' }}>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search other cases..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setShowResults(true);
                                }}
                                onFocus={() => setShowResults(true)}
                            />
                            {showResults && searchTerm && (
                                <div className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
                                    {filteredCases.map(c => (
                                        <button
                                            key={c._id}
                                            className="list-group-item list-group-item-action"
                                            onClick={() => {
                                                navigate(`/cases/${c._id}`);
                                                setSearchTerm('');
                                                setShowResults(false);
                                            }}
                                        >
                                            <small className="fw-bold">{c.firNumber}</small>
                                        </button>
                                    ))}
                                    {filteredCases.length === 0 && (
                                        <div className="list-group-item">No matches found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="no-print action-buttons">
                            <button onClick={handleDownloadPDF} className="btn btn-primary me-2">Download PDF</button>
                            <button onClick={() => setShowAddDataForm(!showAddDataForm)} className="btn btn-success me-2">{showAddDataForm ? 'Hide Form' : 'Add Data'}</button>
                            <button onClick={handleDelete} className="btn btn-danger me-2">Delete</button>
                            <Link to="/cases" className="btn btn-secondary">Back to List</Link>
                        </div>
                    </div>

                    <div className="p-4 p-md-5">
                        <div className="row">
                            <div className="col-12">
                                <table className="table table-bordered table-details">
                                    <tbody>
                                        <tr>
                                            <th>FIR Number</th>
                                            <td>{caseData.firNumber}</td>
                                        </tr>
                                        <tr><th>Petitioner Name</th><td>{caseData.petitionerName || 'N/A'}</td></tr>
                                        <tr><th>Petitioner Address</th><td>{caseData.petitionerAddress || 'N/A'}</td></tr>
                                        <tr><th>Petitioner Contact</th><td>{caseData.petitionerContact || 'N/A'}</td></tr>
                                        <tr>
                                            <th>Police Station</th>
                                            <td>{caseData.policeStation}</td>
                                        </tr>
                                        <tr>
                                            <th>Date</th>
                                            <td>{caseData.date ? new Date(caseData.date).toLocaleDateString() : 'N/A'}</td>
                                        </tr>
                                        <tr>
                                            <th>Description</th>
                                            <td>{caseData.description}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Add Evidence Log Form Modal */}
                {showAddDataForm && (
                    <div className="modal-overlay">
                        <div className="modal-content-custom">
                            <div className="card-header-green d-flex justify-content-between align-items-center">
                                <h4 className="mb-0 text-white" style={{ fontSize: '18px' }}>Add Evidence Log</h4>
                                <button type="button" className="btn-close btn-close-white" aria-label="Close" onClick={() => setShowAddDataForm(false)}></button>
                            </div>
                            <div className="p-3">
                                <form onSubmit={handleLogSubmit}>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label">Date</label>
                                            <input type="date" className="form-control" name="date" value={logFormData.date} onChange={handleLogChange} required />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Mode</label>
                                            <input type="text" className="form-control" name="mode" value={logFormData.mode} onChange={handleLogChange} required placeholder="eg: facebook, instagram" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">URL / Mobile / KYC No</label>
                                            <input type="text" className="form-control" name="referenceData" value={logFormData.referenceData} onChange={handleLogChange} placeholder="Enter relevant data" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Criminal Name</label>
                                            <input type="text" className="form-control" name="criminalName" value={logFormData.criminalName} onChange={handleLogChange} placeholder="Enter name" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Criminal Address</label>
                                            <input type="text" className="form-control" name="criminalAddress" value={logFormData.criminalAddress} onChange={handleLogChange} placeholder="Enter address" />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label">Criminal Photo (Image)</label>
                                            <input type="file" className="form-control" name="criminalPhotoInput" accept="image/*" onChange={handleLogChange} />
                                        </div>
                                        <div className="col-md-12">
                                            <label className="form-label">Upload Attachment</label>
                                            <input type="file" className="form-control" name="attachment" onChange={handleLogChange} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label">Remark</label>
                                            <textarea className="form-control" name="remark" value={logFormData.remark} onChange={handleLogChange} rows="3" required></textarea>
                                        </div>
                                        <div className="col-12 text-end mt-3">
                                            <button type="button" className="btn btn-secondary me-2" onClick={() => setShowAddDataForm(false)}>Cancel</button>
                                            <button type="submit" className="btn btn-primary">Save</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Evidence Logs Table */}
                <div className="details-card mt-4">
                    <div className="details-card-header">
                        <h4 style={{ margin: 0 }}>Evidence Logs</h4>
                    </div>
                    <div>
                        {logMessage && <div className={`alert ${logMessage.includes('Error') ? 'alert-danger' : 'alert-success'} no-print`}>{logMessage}</div>}
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Date</th>
                                        <th>Mode</th>
                                        <th>URL / Mobile / KYC No</th>
                                        <th>Criminal Name</th>
                                        <th>Criminal Address</th>
                                        <th>Criminal Photo</th>
                                        <th>Remark</th>
                                        <th className="no-print">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {caseData.evidenceLogs && caseData.evidenceLogs.length > 0 ? (
                                        caseData.evidenceLogs.map((log, index) => (
                                            <tr key={log._id}>
                                                <td>{new Date(log.date).toLocaleDateString()}</td>
                                                <td>{log.mode}</td>
                                                <td>{log.referenceData || 'N/A'}</td>
                                                <td>{log.criminalName || 'N/A'}</td>
                                                <td>{log.criminalAddress || 'N/A'}</td>
                                                <td>
                                                    {log.criminalPhoto ? <img src={log.criminalPhoto} alt="Criminal" style={{ width: '50px', borderRadius: '4px' }} /> : 'N/A'}
                                                </td>
                                                <td>
                                                    {log.remark}
                                                    {log.attachment && (
                                                        <div className="mt-2">
                                                            <strong>Attachment:</strong><br />
                                                            <img src={log.attachment} alt="Evidence" style={{ maxHeight: '100px', maxWidth: '100px', borderRadius: '4px', objectFit: 'contain' }} />
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="no-print">
                                                    <div className="d-flex align-items-center">
                                                        {log.attachment && (
                                                            <a href={log.attachment} download={`evidence-${index}`} className="btn btn-sm btn-dark me-2">Download</a>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteLog(log._id)}
                                                            className="btn btn-sm btn-danger"
                                                            title="Delete Log"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="8" className="text-center">No evidence logs found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Hidden Printable Area for PDF */}
                <div id="pdf-content" style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm', padding: '20px', backgroundColor: 'white', color: '#000', fontFamily: 'Arial, sans-serif', boxSizing: 'border-box' }}>
                    <div style={{ textAlign: 'center', marginBottom: '40px', paddingTop: '30px' }}>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '10px', display: 'inline-block' }}>CASE DETAILS FORM</h2>
                    </div>

                    {/* CASE DETAILS Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '35px', border: '1px solid #000', fontSize: '12px' }}>
                        <tbody>
                            <tr>
                                <td colSpan="2" style={{ backgroundColor: '#e0e0e0', fontWeight: 'bold', padding: '10px', border: '1px solid #000' }}>CASE DETAILS</td>
                            </tr>
                            <tr>
                                <th style={{ width: '30%', border: '1px solid #000', padding: '10px', textAlign: 'left', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>FIR Number:</th>
                                <td style={{ width: '70%', border: '1px solid #000', padding: '10px' }}>{caseData.firNumber}</td>
                            </tr>
                            <tr>
                                <th style={{ width: '30%', border: '1px solid #000', padding: '10px', textAlign: 'left', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>Date:</th>
                                <td style={{ width: '70%', border: '1px solid #000', padding: '10px' }}>{caseData.date ? new Date(caseData.date).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                            <tr>
                                <th style={{ width: '30%', border: '1px solid #000', padding: '10px', textAlign: 'left', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>Police Station:</th>
                                <td style={{ width: '70%', border: '1px solid #000', padding: '10px' }}>{caseData.policeStation}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* PETITIONER DETAILS Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '35px', border: '1px solid #000', fontSize: '12px' }}>
                        <tbody>
                            <tr>
                                <td colSpan="2" style={{ backgroundColor: '#e0e0e0', fontWeight: 'bold', padding: '10px', border: '1px solid #000' }}>PETITIONER DETAILS</td>
                            </tr>
                            <tr>
                                <th style={{ width: '30%', border: '1px solid #000', padding: '10px', textAlign: 'left', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>Name:</th>
                                <td style={{ width: '70%', border: '1px solid #000', padding: '10px' }}>{caseData.petitionerName || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th style={{ width: '30%', border: '1px solid #000', padding: '10px', textAlign: 'left', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>Contact No.:</th>
                                <td style={{ width: '70%', border: '1px solid #000', padding: '10px' }}>{caseData.petitionerContact || 'N/A'}</td>
                            </tr>
                            <tr>
                                <th style={{ width: '30%', border: '1px solid #000', padding: '10px', textAlign: 'left', backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>Address:</th>
                                <td style={{ width: '70%', border: '1px solid #000', padding: '10px' }}>{caseData.petitionerAddress || 'N/A'}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* CASE DESCRIPTION Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '35px', border: '1px solid #000', fontSize: '12px' }}>
                        <tbody>
                            <tr>
                                <td colSpan="2" style={{ backgroundColor: '#e0e0e0', fontWeight: 'bold', padding: '10px', border: '1px solid #000' }}>CASE DESCRIPTION</td>
                            </tr>
                            <tr>
                                <td colSpan="2" style={{ border: '1px solid #000', padding: '10px', minHeight: '50px', verticalAlign: 'top' }}>
                                    {caseData.description || 'No description provided.'}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* EVIDENCE LOGS Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', fontSize: '10px' }}>
                        <thead>
                            <tr>
                                <td colSpan="7" style={{ backgroundColor: '#e0e0e0', fontWeight: 'bold', padding: '10px', border: '1px solid #000', fontSize: '12px' }}>EVIDENCE LOGS</td>
                            </tr>
                            <tr style={{ backgroundColor: '#f9f9f9' }}>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', width: '8%', fontWeight: 'bold' }}>Date</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', width: '12%', fontWeight: 'bold' }}>Mode</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', width: '15%', fontWeight: 'bold' }}>URL/Mobile/KYC</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', width: '15%', fontWeight: 'bold' }}>Criminal Name</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', width: '20%', fontWeight: 'bold' }}>Criminal Address</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', width: '10%', fontWeight: 'bold' }}>Photo</th>
                                <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', width: '20%', fontWeight: 'bold' }}>Remarks/Attachment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {caseData.evidenceLogs && caseData.evidenceLogs.length > 0 ? (
                                caseData.evidenceLogs.map((log) => (
                                    <tr key={log._id}>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>{new Date(log.date).toLocaleDateString()}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>{log.mode.toUpperCase()}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px', wordBreak: 'break-word' }}>{log.referenceData || 'N/A'}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>{log.criminalName || 'N/A'}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px' }}>{log.criminalAddress || 'N/A'}</td>
                                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>
                                            {log.criminalPhoto ? <img src={log.criminalPhoto} alt="Criminal" style={{ width: '60px', maxHeight: '60px', borderRadius: '2px', objectFit: 'cover' }} /> : 'N/A'}
                                        </td>
                                        <td style={{ border: '1px solid #000', padding: '8px', wordBreak: 'break-word' }}>
                                            {log.remark}
                                            {log.attachment && (
                                                <div style={{ marginTop: '5px' }}>
                                                    <img src={log.attachment} alt="Evidence Attachment" style={{ maxHeight: '40px', maxWidth: '40px', borderRadius: '2px', objectFit: 'contain' }} />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" style={{ border: '1px solid #000', padding: '10px', textAlign: 'center', color: '#666' }}>No evidence logs recorded for this case.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CaseDetails;
