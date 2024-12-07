import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import TrainingSessionForm from './TrainingSessionForm';
import ReportPage from './ReportPage';

function TrainingSessionManagement() {
    const [trainingSessions, setTrainingSessions] = useState([]);
    const [editingSession, setEditingSession] = useState(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = () => {
        fetch("http://127.0.0.1:5000/api/training_sessions")
            .then(response => {
                if (!response.ok) throw new Error("Failed to fetch sessions");
                return response.json();
            })
            .then(data => {
                if (data.sessions) setTrainingSessions(data.sessions);
                else setTrainingSessions([]);
            })
            .catch(err => console.error("Error fetching sessions:", err));
    };
    

    const handleAddSession = (sessionData) => {
        fetch("http://127.0.0.1:5000/api/training_sessions", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
        }).then(() => fetchSessions());
    };

    const handleEditSession = (sessionData) => {
        fetch(`http://127.0.0.1:5000/api/training_sessions/${editingSession.session_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
        }).then(() => {
            setEditingSession(null);
            fetchSessions();
        });
    };

    const handleDeleteSession = (sessionId) => {
        if (editingSession && editingSession.session_id === sessionId) {
            setEditingSession(null);
        }

        if (window.confirm("Are you sure you want to delete this session?")) {
            fetch(`http://127.0.0.1:5000/api/training_sessions/${sessionId}`, { method: 'DELETE' })
                .then(() => fetchSessions());
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const handleEditClick = (session) => {
        setEditingSession({
            session_id: session.session_id,
            date: session.date,
            duration: session.duration,
            location: session.location,
            trainer_id: session.trainer_id,
            certification_id: session.certification_id
        });
    };

    return (
        <div>
            <h1>Manage Training Sessions</h1>
            {editingSession ? (
                <TrainingSessionForm onSubmit={handleEditSession} sessionData={editingSession} />
            ) : (
                <TrainingSessionForm onSubmit={handleAddSession} />
            )}

            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Duration</th>
                        <th>Location</th>
                        <th>Trainer</th>
                        <th>Certification</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {trainingSessions.length > 0 ? (
                        trainingSessions.map(session => (
                            <tr key={session.session_id}>
                                <td>{formatDate(session.date)}</td>
                                <td>{session.duration} minutes</td>
                                <td>{session.location}</td>
                                <td>{session.trainer}</td>
                                <td>{session.certification || "None"}</td>
                                <td>
                                    <button onClick={() => handleEditClick(session)}>Edit</button>
                                    <button onClick={() => handleDeleteSession(session.session_id)}>Delete</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center' }}>No training sessions available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

function App() {
    return (
        <Router>
            <nav style={{ display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
                <Link to="/" style={{ marginBottom: '10px' }}>Manage Training Sessions</Link>
                <Link to="/report">Generate Report</Link>
            </nav>
            <Routes>
                <Route path="/" element={<TrainingSessionManagement />} />
                <Route path="/report" element={<ReportPage />} />
            </Routes>
        </Router>
    );
}

export default App;
