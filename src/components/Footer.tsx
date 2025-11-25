import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="border-t border-slate-800 py-4 bg-slate-900 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
                <p>Secure Client-Side Processing. Files are never uploaded to a server.</p>
            </div>
        </footer>
    );
};
