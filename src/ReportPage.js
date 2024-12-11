import React, { useState, useEffect } from 'react';

function ReportPage() {
    const [trainers, setTrainers] = useState([]);
    const [certifications, setCertifications] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [trainerId, setTrainerId] = useState('');
    const [certificationId, setCertificationId] = useState('');
    const [reportData, setReportData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetch("https://training-web-application-deployed.onrender.com/api/trainers")
            .then(response => response.json())
            .then(data => setTrainers(data))
            .catch(err => setError("Failed to load trainers"));

        fetch("https://training-web-application-deployed.onrender.com/api/certifications")
            .then(response => response.json())
            .then(data => setCertifications(data))
            .catch(err => setError("Failed to load certifications"));
    }, []);

    const generateReport = () => {
        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
            trainer_id: trainerId || null,
            certification_id: certificationId || null
        });

        fetch(`https://training-web-application-deployed.onrender.com/api/training_sessions/report?${params.toString()}`)
            .then(response => {
                if (!response.ok) throw new Error("Failed to generate report");
                return response.json();
            })
            .then(data => {
                setError(null);
                setReportData(data);
            })
            .catch(err => setError("Failed to generate report"));
    };

    return (
        <div>
            <h1>Training Sessions Report</h1>
            <div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <label>Start Date:</label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />

                <label>End Date:</label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />

                <label>Trainer:</label>
                <select value={trainerId} onChange={(e) => setTrainerId(e.target.value)}>
                    <option value="">All Trainers</option>
                    {trainers.map(trainer => (
                        <option key={trainer.trainer_id} value={trainer.trainer_id}>
                            {trainer.name}
                        </option>
                    ))}
                </select>

                <label>Certification:</label>
                <select
                    value={certificationId}
                    onChange={(e) => setCertificationId(e.target.value)}
                >
                    <option value="">All Certifications</option>
                    {certifications.map(cert => (
                        <option key={cert.certification_id} value={cert.certification_id}>
                            {cert.name}
                        </option>
                    ))}
                </select>

                <button onClick={generateReport}>Generate Report</button>
            </div>

            {reportData && (
                reportData.sessions.length > 0 ? (
                    <div>
                        <h2>Report Results</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Duration</th>
                                    <th>Location</th>
                                    <th>Trainer</th>
                                    <th>Certification</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.sessions.map(session => (
                                    <tr key={session.session_id}>
                                        <td>{session.date}</td>
                                        <td>{session.duration} minutes</td>
                                        <td>{session.location}</td>
                                        <td>{session.trainer}</td>
                                        <td>{session.certification || 'None'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <h2>Statistics</h2>
                        <p>Total Sessions: {reportData.statistics.total_sessions || '0'}</p>
                        <p>Average Duration: {reportData.statistics.average_duration || 'N/A'} minutes</p>
                        <p>Average Attendance: {reportData.statistics.average_attendance || 'N/A'} attendees</p>
                    </div>
                ) : (
                    <div>
                        <h2>No Results</h2>
                        <p>No training sessions match the selected filters.</p>
                    </div>
                )
            )}
        </div>
    );
}

export default ReportPage;
