import React from 'react';
import '/src/styles/color-blend.css';

const Layout: React.FC = ({ children }) => {
    return (
        <div className="layout-container">
            <header className="layout-header">
                <h1>College Predictor</h1>
            </header>
            <main className="layout-main">
                {children}
            </main>
            <footer className="layout-footer">
                <p>&copy; 2023 College Predictor. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;