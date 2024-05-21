import {
    useLoaderData,
    useNavigate,
} from "react-router-dom";
import {
    UnstyledButton
} from '@mantine/core';

export function Rooms() {
    const navigate = useNavigate();
    const data = useLoaderData();
    const rooms = data.rooms;
    
    return (
        <div>
            <h1>Rooms</h1>
            <ul>
                {rooms.map(room => (
                    <UnstyledButton key={room.id} onClick={() => {navigate(`/rooms/${room.id}`)}}>
                        <li>{room.name}</li>
                    </UnstyledButton>
                ))}
            </ul>
        </div>
    );
}

export async function getRooms() {
    return fetch('/api/rooms')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch rooms');
            }
            return response.json();
        });
}