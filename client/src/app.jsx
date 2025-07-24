import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import socket from 'sockets/socket';
import MatchRoom from 'pages/MatchRoom';

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
                <Route path="/room/:matchCode" element={<MatchRoom />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App;