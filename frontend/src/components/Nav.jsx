import React from 'react';
import { Link } from 'react-router-dom';

function Nav(props) {
    return (
        <div className="flex items-center justify-between bg-white/10 border border-white/20 rounded-xl px-4 py-3">
            <Link to="/dashboard" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                MCQ Royale
            </Link>
            
        </div>
    );
}

export default Nav;