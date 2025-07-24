import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import socket from 'sockets/socket';
import Login from 'pages/login';

// We'll import needed pages/components as we develop and push more code

function App() {
    useEffect( () => {
        socket.connect();

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={Login} /> {/* This is placeholder code, we can modify the Login import and this route later */}
            </Routes>
        </BrowserRouter>
    )
}

export default App;