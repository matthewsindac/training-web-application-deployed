import React, { useEffect, useState } from 'react';

function TrainingSessionForm({ onSubmit, sessionData }) {
    const [date, setDate] = useState('');
    const [duration, setDuration] = useState('');
    const [location, setLocation] = useState('');
    const [trainerId, setTrainerId] = useState('');
    const [certificationId, setCertificationId] = useState(null);
    const [trainers, setTrainers] = useState([]);
    const [certifications, setCertifications] = useState([]);

    const locations = [
        "Honors Hall Room 102",
        "University Church Main Room",
        "WALC Room 1012",
        "Physics Building Room 172",
        "Purdue Memorial Union Room 3"
    ];

    const durations = Array.from({ length: 8 }, (_, i) => (i + 1) * 15); 

    useEffect(() => {
        fetch("https://training-web-application-deployed.onrender.com/api/trainers")
            .then(response => response.json())
            .then(data => setTrainers(data))
            .catch(error => console.error("Error fetching trainers:", error));

        fetch("https://training-web-application-deployed.onrender.com/api/certifications")
            .then(response => response.json())
            .then(data => setCertifications(data))
            .catch(error => console.error("Error fetching certifications:", error));
    }, []);

    useEffect(() => {
        if (sessionData) {
            setDate(sessionData.date || '');
            setDuration(sessionData.duration || '');
            setLocation(sessionData.location || '');
            setTrainerId(sessionData.trainer_id || ''); 
            setCertificationId(sessionData.certification_id || null); 
        } else {
            setDate('');
            setDuration('');
            setLocation('');
            setTrainerId('');
            setCertificationId(null);
        }
    }, [sessionData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ date, duration, location, trainer_id: trainerId, certification_id: certificationId });

        setDate('');
        setDuration('');
        setLocation('');
        setTrainerId('');
        setCertificationId(null);
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>Date:</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

            <label>Duration (minutes):</label>
            <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} required>
                <option value="">-- Select a Duration --</option>
                {durations.map(duration => (
                    <option key={duration} value={duration}>
                        {duration} minutes
                    </option>
                ))}
            </select>

            <label>Location:</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} required>
                <option value="">-- Select a Location --</option>
                {locations.map((loc, index) => (
                    <option key={index} value={loc}>
                        {loc}
                    </option>
                ))}
            </select>

            <label>Trainer:</label>
                <select value={trainerId} onChange={(e) => setTrainerId(Number(e.target.value))} required>
                    <option value="">-- Select a Trainer --</option>
                    {trainers.map(trainer => (
                        <option key={trainer.trainer_id} value={trainer.trainer_id}>
                            {trainer.name}
                        </option>
                    ))}
                </select>

            <label>Certification (optional):</label>
            <select value={certificationId || ''} onChange={(e) => setCertificationId(e.target.value ? Number(e.target.value) : null)}>
                <option value="">None</option>
                {certifications.map(cert => (
                    <option key={cert.certification_id} value={cert.certification_id}>
                        {cert.name}
                    </option>
                ))}
            </select>


            <button type="submit">Save</button>
        </form>
    );
}

export default TrainingSessionForm;
