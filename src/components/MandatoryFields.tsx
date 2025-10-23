import React from 'react';

const MandatoryFields: React.FC = () => {
    return (
        <div className="mandatory-fields">
            <label htmlFor="rank">Rank:</label>
            <input type="number" id="rank" required />

            <label htmlFor="branch">Preferred Branch:</label>
            <input type="text" id="branch" required />

            <label htmlFor="location">Location:</label>
            <input type="text" id="location" required />

            <label htmlFor="hostel">Hostel Readiness:</label>
            <select id="hostel" required>
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
            </select>
        </div>
    );
};

export default MandatoryFields;