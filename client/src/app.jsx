import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from 'pages/login';

// We'll import needed pages/components as we develop and push more code

function App() {
    return (
        <Routes>
            <Route path="/" element={Login} /> {/* This is placeholder code, we can delete the import and this route later */}
        </Routes>
    )
}