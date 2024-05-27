import React, { useState } from 'react';
import { Container, Button, TextInput, Card, Title, Text, Group, Stack, Modal, Autocomplete, Image, UnstyledButton, Center } from '@mantine/core';
import { useLoaderData } from 'react-router-dom';
import PokemonInfo from '../PokemonInfo';
import PokemonCell from '../PokemonCell';

export function CreateDraftBoard() {
    const POKEMON_DATA = useLoaderData();

    const [columns, setColumns] = useState([
        { name: 'Banned', pokemon: []},
        { name: 'Tera Banned', pokemon: []},
        { name: '19 Points', pokemon: []},
    ]);
    const [newColumnName, setNewColumnName] = useState('');
    const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);

    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    const [isPokemonModalOpen, setIsPokemonModalOpen] = useState(false);
    const [pokemonValue, setPokemonValue] = useState('');
    const [pokemonToBeAdded, setPokemonToBeAdded] = useState('');
    const [pokemonDropdownOpened, setPokemonDropdownOpened] = useState(false);

    const [bannedAbilities, setBannedAbilities] = useState([]);
    const [bannedMoves, setBannedMoves] = useState([]);
    const [notes, setNotes] = useState('');

    const handleAddColumn = () => {
        if (newColumnName.trim()) {
        setColumns([...columns, { name: newColumnName, pokemon: [] }]);
        setNewColumnName('');
        setIsColumnModalOpen(false);
        }
    };

    const handleAddPokemon = () => {
        if (pokemonToBeAdded.trim() && selectedColumnIndex !== null) {
            const updatedColumns = columns.map((column, index) =>
                index === selectedColumnIndex
                ? { ...column, pokemon: [...column.pokemon, {
                    name: pokemonToBeAdded,
                    sprite: `/src/assets/pokemon-sprites/sprites/pokemon/${POKEMON_DATA.find((pokemon) => pokemon.name === pokemonToBeAdded).url.split('/')[6]}.png`,
                    bannedAbilities: bannedAbilities,
                    bannedMoves: bannedMoves,
                    notes: notes
                }] }
                : column
            );
            setColumns(updatedColumns);
            setPokemonValue('');
            setPokemonToBeAdded('');
            setSelectedColumnIndex(null);
            setIsPokemonModalOpen(false);
        }
    };

    function renderAutocompleteOption({option}) {
        const pokedexNumber = POKEMON_DATA.find((pokemon) => pokemon.name === option.value).url.split('/')[6];
        const imgSrc = `/src/assets/pokemon-sprites/sprites/pokemon/${pokedexNumber}.png`;
        return(
            <Group gap="sm">
                <Image src={imgSrc} alt={option.value} width={32} />
                <div>
                <Text size="sm">{option.value}</Text>
                </div>
            </Group>
        );
    };

    return (
        <Container>
        <Title align="center" mb="xl">Draft Board</Title>
        <Group spacing="lg" align="flex-start">
            {columns.map((column, columnIndex) => (
            <Card key={columnIndex} shadow="sm" p="lg" style={{ minWidth: '200px' }}>
                <Stack spacing="xs">
                <Title order={4}>{column.name}</Title>
                {column.pokemon.map((poke, pokeIndex) => (
                    <Center key={pokeIndex}>
                        <PokemonCell pokemon={poke} />
                    </Center>
                ))}
                <Button onClick={() => {
                    setSelectedColumnIndex(columnIndex);
                    setIsPokemonModalOpen(true);
                }}>Add Pokémon</Button>
                </Stack>
            </Card>
            ))}
            <Button onClick={() => setIsColumnModalOpen(true)}>Add Column</Button>
        </Group>

        <Modal
            opened={isColumnModalOpen}
            onClose={() => setIsColumnModalOpen(false)}
            title="Add New Column"
        >
            <TextInput
            placeholder="New column name"
            value={newColumnName}
            onChange={(event) => setNewColumnName(event.currentTarget.value)}
            />
            <Button onClick={handleAddColumn} mt="md">Add Column</Button>
        </Modal>

        <Modal
            opened={isPokemonModalOpen}
            onClose={() => {
                setIsPokemonModalOpen(false);
                setPokemonValue('');
                setPokemonToBeAdded('');
            }}
            size="lg"
            title="Add New Pokémon"
        >
            <Stack>
            <Autocomplete
                data={POKEMON_DATA.map((pokemon) => (pokemon.name))}
                placeholder={'Start typing...'}
                value={pokemonValue}
                comboboxProps={{ onOptionSubmit: (value) => {
                    setPokemonValue(value);
                    setPokemonToBeAdded(value);
                    setPokemonDropdownOpened(false);
                } }}
                onChange={(value) => {
                    setPokemonValue(value)
                    if (value.length > 0) {
                        setPokemonDropdownOpened(true);
                    } else {
                        setPokemonDropdownOpened(false);
                    }
                }}
                onDropdownClose={() => setPokemonDropdownOpened(false)}
                limit={10}
                renderOption={renderAutocompleteOption}
                dropdownOpened={pokemonDropdownOpened}
            />

            {pokemonToBeAdded &&
                <PokemonInfo pokemon={POKEMON_DATA.find((pokemon) => pokemon.name === pokemonToBeAdded)}
                bannedAbilities={bannedAbilities}
                bannedMoves={bannedMoves}
                setBannedAbilities={setBannedAbilities}
                setBannedMoves={setBannedMoves} 
                notes={notes}
                setNotes={setNotes}
                />
            }
            </Stack>
            

            <Button onClick={handleAddPokemon} mt="md">Add Pokémon</Button>
        </Modal>
        </Container>
    );
};

export async function getPokemon() {
    const POKEMON_DATA = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=1302').then((res) => res.json());
    return POKEMON_DATA.results;
}