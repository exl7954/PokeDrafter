import {
    useLoaderData,
    useNavigate,
} from "react-router-dom";
import {
    UnstyledButton
} from '@mantine/core';

export function Drafts() {
    const navigate = useNavigate();
    const data = useLoaderData();
    const drafts = data.drafts;
    
    return (
        <div>
            <h1>Drafts</h1>
            <UnstyledButton onClick={() => navigate('/drafts/new')}>
                Create a new draft template
            </UnstyledButton>
            <ul>
                {drafts.map(draft => (
                    <UnstyledButton key={draft.id} onClick={() => {navigate(`/drafts/${draft.id}`)}}>
                        <li>{draft.name}</li>
                    </UnstyledButton>
                ))}
            </ul>
        </div>
    );
}

export async function getDrafts() {
    return fetch('/api/draft')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch drafts');
            }
            return response.json();
        });
}