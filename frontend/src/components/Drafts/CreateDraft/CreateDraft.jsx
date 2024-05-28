import {
    Paper,
    Title,
    Text,
    Group,
    Stack,
    TextInput,
    NumberInput,
    Textarea,
    Divider,
    Input,
    Button,
    Modal,
} from '@mantine/core';
import { useState } from 'react';
import CreateDraftRules from './CreateDraftRules';
import {CreateDraftBoard} from './CreateDraftBoard';
import { useNavigate } from 'react-router-dom';

import { Link } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { useDisclosure } from '@mantine/hooks';

export default function CreateDraft() {
    const navigate = useNavigate();
    const [draftName, setDraftName] = useState("");
    const [draftDescription, setDraftDescription] = useState("");
    const [pointLimit, setPointLimit] = useState(0);
    const [pokemonLimit, setPokemonLimit] = useState(0);

    const [bannedPokemon, setBannedPokemon] = useState([]);
    const [teraBannedPokemon, setTeraBannedPokemon] = useState([]);
    const [columns, setColumns] = useState([]);

    const [authErrorModalOpened, {open: authErrorModalOpen, close: authErrorModalClose}] = useDisclosure(false);
    const [confirmModalOpened, {open: confirmModalOpen, close: confirmModalClose}] = useDisclosure(false);

    const [validationError, setValidationError] = useState("");

    const editor = useEditor({
        extensions: [
          StarterKit,
          Underline,
          Link,
          Superscript,
          SubScript,
          Highlight,
          TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
    });

    function validateDraft() {
        if (draftName.length < 3 || draftName.length > 50) {
            return "Draft name must be between 3 and 50 characters";
        }
        if (columns.length < 1) {
            return "Draft must have at least 1 column";
        }
        // must be at least one non-empty column
        if (columns.every(column => column.length < 1)) {
            return "Draft board must contain at least 1 Pokemon";
        }
        // pokemon limit must be at least 1
        if (pokemonLimit < 1) {
            return "Pokemon limit must be at least 1";
        }
        // point limit must be at least 1
        if (pointLimit < 1) {
            return "Point limit must be at least 1";
        }
        return "";
    }

    function handleCreate() {
        if (localStorage.getItem('user_id') === null) {
            authErrorModalOpen();
            return;
        }
        confirmModalOpen();
    }

    async function handleConfirm() {
        if (localStorage.getItem('user_id') === null) {
            return;
        }

        if (validateDraft() !== "") {
            setValidationError(validateDraft());
            return;
        }

        const draft_board = {banned_pokemon: bannedPokemon, tera_banned_pokemon: teraBannedPokemon, columns: columns};
        const draft_rules = editor.getHTML();
        const draft_data = {name: draftName, description: draftDescription, point_limit: pointLimit, pokemon_limit: pokemonLimit, draft_board: draft_board, rules: draft_rules};

        const response = await fetch('/api/draft/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(draft_data)
        });
        if (response.ok) {
            const newDraft = await response.json();
            navigate(`/drafts/${newDraft.id}`);
        } else {
            const body = await response.json();
            console.log(body);
            setValidationError(body.detail);
        }
    }

    return (
        <Stack>
            <Stack gap={1}>
                <Title order={1}>Create a new draft template</Title>
                <Text c="dimmed">
                    Create a draft template that can be used in a room.
                </Text>
            </Stack>
            <Stack gap={10}>
                <TextInput label="Draft Name" description="Enter a name for your draft" placeholder="e.g. SV Paldea Dex" value={draftName} onChange={(e) => setDraftName(e.target.value)}/>
                <Textarea label="Draft Description (Optional)" description="Enter a description for your draft" placeholder="Introduce the draft board and include any relevant notes" value={draftDescription} onChange={(e) => setDraftDescription(e.target.value)}/>
            </Stack>

            <Divider my="sm" />
            <Input.Wrapper label="Draft Rules" description="Enter the rules for your draft"></Input.Wrapper>
            <CreateDraftRules editor={editor} />
            <Divider my="sm" />

            <Stack>
                <Group>
                    <NumberInput label="Point Limit" description="Enter the maximum amount of points players can spend" placeholder="e.g. 115" hideControls allowDecimal={false} allowNegative={false} value={pointLimit} onChange={setPointLimit} />
                    <NumberInput label="Pokemon Limit" description="Enter the maximum number of Pokemon players can draft" placeholder="e.g. 12" hideControls allowDecimal={false} allowNegative={false} min={1} value={pokemonLimit} onChange={setPokemonLimit} />
                </Group>
            </Stack>
            <CreateDraftBoard bannedPokemon={bannedPokemon} setBannedPokemon={setBannedPokemon} teraBannedPokemon={teraBannedPokemon} setTeraBannedPokemon={setTeraBannedPokemon} columns={columns} setColumns={setColumns} />
            <Divider my="sm" />
            <Button color="green" w="250px" onClick={handleCreate}>Create Draft</Button>

            <Modal opened={authErrorModalOpened} onClose={authErrorModalClose} withCloseButton={false} centered>
                <Text>You must be logged in to create a draft. Please login or sign up.</Text>
            </Modal>

            <Modal opened={confirmModalOpened} onClose={() => {confirmModalClose(); setValidationError("")}} title="Confirm Draft Creation" centered>
                <Text>Are you sure you want to create this draft?</Text>
                <Text c="red">{validationError}</Text>
                <Group mt="xs" grow>
                    <Button color="green" onClick={handleConfirm}>Confirm</Button>
                    <Button color="red" onClick={() => {confirmModalClose(); setValidationError("")}}>Cancel</Button>
                </Group>
            </Modal>
        </Stack>  
    );
}
