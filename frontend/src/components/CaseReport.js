import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CaseReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
        fetchCase();
    }, [id]);

    if (loading) return <div className="container mt-5">Loading...</div>;
    if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;
    if (!caseData) return <div className="container mt-5">Case not found</div>;

    return (
        <div className="container mt-5 mb-5 bg-white p-4">
            {/* Header / Actions - Hidden when printing */}
            <div className="d-flex justify-content-between mb-4 no-print">
                <button onClick={() => navigate(-1)} className="btn btn-secondary">Close</button>
                <button onClick={() => window.print()} className="btn btn-primary">Print Report</button>
            </div>

            {/* Report Content */}
            <div className="report-content">
                <h2 className="text-center mb-4">Case Evidence Report</h2>

                <div className="row mb-5">
                    <div className="col-12">
                        <table className="table table-borderless">
                            <tbody>
                                <tr><th style={{ width: '40%' }}>FIR Number</th><td>{caseData.firNumber}</td></tr>
                                <tr><th>Petitioner Name</th><td>{caseData.petitionerName || 'N/A'}</td></tr>
                                <tr><th>Petitioner Address</th><td>{caseData.petitionerAddress || 'N/A'}</td></tr>
                                <tr><th>Petitioner Contact</th><td>{caseData.petitionerContact || 'N/A'}</td></tr>
                                <tr><th>Police Station</th><td>{caseData.policeStation}</td></tr>
                                <tr><th>Date</th><td>{caseData.date ? new Date(caseData.date).toLocaleDateString() : 'N/A'}</td></tr>
                                <tr><th>Description</th><td>{caseData.description}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <h4 className="mb-3">Evidence Logs</h4>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>Date</th>
                                <th>Mode</th>
                                <th>Remark</th>
                                <th>Attachment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {caseData.evidenceLogs && caseData.evidenceLogs.length > 0 ? (
                                caseData.evidenceLogs.map((log, index) => (
                                    <tr key={index}>
                                        <td>{new Date(log.date).toLocaleDateString()}</td>
                                        <td>{log.mode}</td>
                                        <td>{log.remark}</td>
                                        <td>{log.attachment ? 'Yes' : 'No'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center">No evidence logs recorded.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CaseReport;
