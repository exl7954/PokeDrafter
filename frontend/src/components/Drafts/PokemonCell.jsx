import { Image, Tooltip, Group, ActionIcon, Text, Stack, Title, } from '@mantine/core';
import { IconAlertCircle, IconPencil, IconX } from '@tabler/icons-react';

const PokemonCell = ({ pokemon, handleEditPokemon, handleRemovePokemon }) => {
    const { name, sprite, bannedAbilities, bannedMoves, notes } = pokemon;

    return (
        <Group w={"250px"} pos="relative">
            <Group>
                <Image src={sprite} alt={name} />
                <Title order={6}>{formatString(name)}</Title>
            </Group>
            <Group gap={1} pos="absolute" top={0} right={5}>
                {bannedAbilities.length > 0 && (
                    <Tooltip
                        label={`Banned Abilities: ${bannedAbilities.map(formatString).join(', ')}`}
                        position="top"
                        placement="end"
                    >
                        <IconAlertCircle size={18} color="pink" />
                    </Tooltip>
                )}
                {bannedMoves.length > 0 && (
                    <Tooltip
                        label={`Banned Moves: ${bannedMoves.map(formatString).join(', ')}`}
                        position="top"
                        placement="end"
                    >
                        <IconAlertCircle size={18} color="rgb(255, 224, 102)" />
                    </Tooltip>
                )}
                {notes && (
                    <Tooltip
                        label={`Notes: ${notes}`}
                        position="top"
                        placement="end"
                    >
                        <IconAlertCircle size={18} color="lightgray" />
                    </Tooltip>
                )}
            </Group>

            <Group gap={2} pos="absolute" top={0} left={5}>
                <ActionIcon onClick={handleEditPokemon} variant="subtle" size={20} opacity={0.5}>
                    <IconPencil />
                </ActionIcon>
                <ActionIcon onClick={handleRemovePokemon} variant="subtle" size={20} opacity={0.5}>
                    <IconX />
                </ActionIcon>
            </Group>
        </Group>
    );
};

export default PokemonCell;

function formatString(string) {
    const str = string.replace(/-/g, ' ');
    return str.replace(/\b\w/g, letter => letter.toUpperCase());
}