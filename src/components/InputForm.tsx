import React, { useState } from 'react';

const InputForm = () => {
    const [rank, setRank] = useState('');
    const [branch, setBranch] = useState('');
    const [location, setLocation] = useState('');
    const [hostelReady, setHostelReady] = useState(false);
    const [question, setQuestion] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission logic here
    };

    return (
        <form onSubmit={handleSubmit} className="input-form">
            <div className="form-group">
                <label htmlFor="rank">Rank:</label>
                <input
                    type="text"
                    id="rank"
                    value={rank}
                    onChange={(e) => setRank(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="branch">Preferred Branch:</label>
                <input
                    type="text"
                    id="branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="location">Location:</label>
                <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="hostelReady">Hostel Readiness:</label>
                <select
                    id="hostelReady"
                    value={hostelReady ? 'Yes' : 'No'}
                    onChange={(e) => setHostelReady(e.target.value === 'Yes')}
                    required
                >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                </select>
            </div>
            <div className="form-group">
                <label htmlFor="question">Your Question:</label>
                <textarea
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Submit</button>
        </form>
    );
};

export default InputForm;