import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../sockets/socket';

function MatchRoom() {
    const { matchCode } = useParams();
    const [problem, setProblem] = useState(null);

    useEffect(() => {
        const username = "Replace later";
        socket.connect();

        /**
         * Sends a join_match signal to the backend, showing that the user with 'username' has joined a match
         * Whenever we get a "start_game" signal from the backend we then show it to the user in the Match Room
         */
        socket.emit("join_match", {matchCode, username});
        socket.on("start_game", ({problem}) => {
            console.log("Problem received");
            setProblem(problem);
        });

        /**
         * Handler for whenever a server sends a message. 
         * This should be updated based on how our frontend is designed.
         * I'll wait for Ohi to finish before modifying this.
         */
        socket.on("server_message", (message) => {
            console.log(message);
        });

        // standard socket disconnect whenever we end
        return () => {
            socket.disconnect();
        };
    }, [matchCode]);

    /**
     * Returns rudimentary html if problem is loaded in (i.e. the game has started).
     * Otherwise, we tell the user we're still waiting. 
     * This is mostly untouched just so we can wait on UI decisions.
     */
    return (
        <div>
            {problem ? (
                <div>
                    <p> {problem} </p>
                </div>
            ) : (
                <p> Waiting on other player... </p>
            )}
        </div>
    );
}


export default MatchRoom;