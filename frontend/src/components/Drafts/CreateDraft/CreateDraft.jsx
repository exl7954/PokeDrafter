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
} from '@mantine/core';
import { useState } from 'react';
import CreateDraftRules from './CreateDraftRules';
import {CreateDraftBoard} from './CreateDraftBoard';

export default function CreateDraft() {

    return (
        <Paper shadow="xs" withBorder p="xl" pt="md">
            <Stack>
                <Stack gap={1}>
                    <Title order={1}>Create a new draft template</Title>
                    <Text c="dimmed">
                        Create a draft template that can be used in a room.
                    </Text>
                </Stack>
                <Stack gap={10}>
                    <TextInput label="Draft Name" description="Enter a name for your draft" placeholder="e.g. SV Paldea Dex"/>
                    <Textarea label="Draft Description" description="Enter a description for your draft" placeholder="Introduce the draft board and include any relevant notes"/>
                </Stack>

                <Divider my="sm" />
                <Input.Wrapper label="Draft Rules" description="Enter the rules for your draft"></Input.Wrapper>
                <CreateDraftRules />
                <Divider my="sm" />

                <Stack>
                    <Group>
                        <NumberInput label="Point Limit" description="Enter the maximum amount of points players can spend" placeholder="e.g. 115" hideControls allowDecimal={false} allowNegative={false} />
                        <NumberInput label="Pokemon Limit" description="Enter the maximum number of Pokemon players can draft" placeholder="e.g. 12" hideControls allowDecimal={false} allowNegative={false} min={1} />
                    </Group>
                </Stack>
                <CreateDraftBoard />
            </Stack>
        </Paper>
    );
}