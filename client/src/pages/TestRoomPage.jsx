import React, { useEffect, useState, useContext } from "react";
import GameSocket from "../sockets/socket";
import { AppContext } from "../app"; // 👈 Import context

const TestRoomPage = () => {
  const [roomCode, setRoomCode] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const { user } = useContext(AppContext); // 👈 Get actual logged-in user

  useEffect(() => {
    console.log("🟢 Mounting TestRoomPage");
    console.log("=== SOCKET CONNECTION DEBUG ===");
    console.log("Connecting to: http://localhost:3001");
    console.log("User data:", user);

    GameSocket.connect(user);

    const onConnect = () => {
      console.log("Socket is ready, setting up event listeners...");

      GameSocket.socket.on("room_created", ({ roomCode }) => {
        console.log("ROOM CREATED:", roomCode);
        setCreatedCode(roomCode);
      });

      GameSocket.socket.on("room_joined", ({ roomCode, playerCount }) => {
        console.log("JOINED ROOM:", roomCode, "Players:", playerCount);
      });

      GameSocket.socket.on("start_game", ({ problem }) => {
        console.log("START GAME:", problem);
      });

      GameSocket.socket.on("room_error", ({ message }) => {
        console.error("ROOM ERROR:", message);
      });
    };

    GameSocket.on("connection_status", ({ status }) => {
      if (status === "connected") {
        onConnect();
      }
    });

    return () => {
      GameSocket.disconnect();
    };
  }, [user]);

  const handleCreateRoom = () => {
    console.log("🔘 handleCreateRoom clicked");
    GameSocket.createRoom({
      difficulty: "easy",
      creator: user
    });
  };

  const handleJoinRoom = () => {
    GameSocket.joinRoom(roomCode, user);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <h2 className="text-3xl font-bold mb-6">Code Clash Test Room</h2>

      <button
        onClick={handleCreateRoom}
        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Create Room
      </button>

      {createdCode && (
        <p className="mb-4">
          Your room code: <strong>{createdCode}</strong>
        </p>
      )}

      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Enter room code"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          className="px-2 py-1 text-black rounded"
        />
        <button
          onClick={handleJoinRoom}
          className="bg-green-600 px-4 py-1 rounded hover:bg-green-700"
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default TestRoomPage;
