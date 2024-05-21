import {
    useLoaderData,
} from "react-router-dom";
import {
    Paper,
    Title,
    Text,
    Group,
    Stack,
    Tabs,
} from '@mantine/core';
import Rules from "./Rules/Rules.jsx";
import { Badges } from '../Badges.jsx';

function convertDate(date) {
    let ms = Date.now() - date;
    if (ms > 1000*60*60*24*7*4) {
        return String(date).substring(0, 10);
    }
    let seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
        if (seconds === 1) {
            return '1 second ago';
        }
        return `${seconds} seconds ago`;
    }
    let minutes = Math.round(seconds / 60);
    if (minutes < 60) {
        if (minutes === 1) {
            return '1 minute ago';
        }
        return `${minutes} minutes ago`;
    }
    let hours = Math.round(minutes / 60);
    if (hours < 24) {
        if (hours === 1) {
            return '1 hour ago';
        }
        return `${hours} hours ago`;
    }
    let days = Math.round(hours / 24);
    if (days < 7) {
        if (days === 1) {
            return '1 day ago';
        }
        return `${days} days ago`;
    }
    let weeks = Math.round(days / 7);
    if (weeks < 4) {
        if (weeks === 1) {
            return '1 week ago';
        }
        return `${weeks} weeks ago`;
    }
}

export function Room() {
    const roomData = useLoaderData();
    const updatedAt = new Date(roomData.updated_at);
    const timedelta = convertDate(updatedAt);
    const authorized_users = [... new Set([...roomData.moderators, roomData.creator])]

    return (
        <Paper shadow="xs" withBorder p="xl" pt="md">
            <Stack>
                <Stack gap={1}>
                    <Group justify="space-between">
                        <Title>{roomData.name}Pokemon Draft League Season 1</Title>
                        <Text
                            c={roomData.participants.length == roomData.max_participants ? "dimmed" : "green"}
                            fw={900}
                            size="lg"
                        >
                            {roomData.participants.length} / {roomData.max_participants}
                        </Text>
                        {Badges[roomData.invite_policy]}
                        {Badges[roomData.room_status]}
                    </Group>
                    <Text c="dimmed">Last updated {timedelta}</Text>
                </Stack>
                <Text>{roomData.description}Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</Text>
            
                <Tabs defaultValue="rules">
                    <Tabs.List>
                        <Tabs.Tab value="rules">Rules</Tabs.Tab>
                        <Tabs.Tab value="draft">Draft</Tabs.Tab>
                        <Tabs.Tab value="draftboard">Draft Board</Tabs.Tab>
                        <Tabs.Tab value="transactions">Transactions</Tabs.Tab>
                        <Tabs.Tab value="schedule">Schedule</Tabs.Tab>
                        <Tabs.Tab value="standings">Standings</Tabs.Tab>
                        <Tabs.Tab value="stats">Stats</Tabs.Tab>
                        <Tabs.Tab value="participants">Participants</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="rules">
                        <Rules room_id={roomData.id} authorized_users={authorized_users} content={roomData.rules || ''}/>
                    </Tabs.Panel>
                    <Tabs.Panel value="draft">
                        <Text>Draft</Text>
                    </Tabs.Panel>
                    <Tabs.Panel value="draftboard">
                        <Text>Draft Board</Text>
                    </Tabs.Panel>
                    <Tabs.Panel value="transactions">
                        <Text>Transactions</Text>
                    </Tabs.Panel>
                    <Tabs.Panel value="schedule">
                        <Text>Schedule</Text>
                    </Tabs.Panel>
                    <Tabs.Panel value="standings">
                        <Text>Standings</Text>
                    </Tabs.Panel>
                    <Tabs.Panel value="stats">
                        <Text>Stats</Text>
                    </Tabs.Panel>
                    <Tabs.Panel value="participants">
                        <Text>Participants</Text>
                    </Tabs.Panel>

                </Tabs>
            </Stack>
        </Paper>
    );
}

export async function getRoom({ params }) {
    const response = await fetch(`/api/rooms/id/${params.id}`);
    if (!response.ok) {
        throw new Error('Failed to fetch room');
    }
    return await response.json();
}