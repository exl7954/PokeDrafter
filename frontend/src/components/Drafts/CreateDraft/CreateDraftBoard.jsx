import React, { useState, useEffect } from 'react';
import { Container, Button, TextInput, Card, Title, Text, Group, Stack, Modal, Autocomplete, Image, Divider, Center, ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useLoaderData } from 'react-router-dom';
import PokemonInfo from '../PokemonInfo';
import PokemonCell from '../PokemonCell';

export function CreateDraftBoard() {
    const POKEMON_DATA = useLoaderData();

    const [bannedPokemon, setBannedPokemon] = useState([]);
    const [teraBannedPokemon, setTeraBannedPokemon] = useState([]);

    const [columns, setColumns] = useState([
        { name: '19 Points', pokemon: []},
    ]);
    const [newColumnName, setNewColumnName] = useState('');
    const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);

    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    const [isPokemonModalOpen, setIsPokemonModalOpen] = useState(false);
    const [isEditingPokemon, setIsEditingPokemon] = useState(false);
    const [editingPokemonIndex, setEditingPokemonIndex] = useState(null);
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

    const clearPokemonInfo = () => {
        setBannedAbilities([]);
        setBannedMoves([]);
        setNotes('');
    };

    const clearPokemonStates = () => {
        setPokemonValue('');
        setPokemonToBeAdded('');
        setEditingPokemonIndex(null);
        setIsEditingPokemon(false);
        clearPokemonInfo();
    }

    const handleAddPokemon = () => {
        if (pokemonToBeAdded.trim() && selectedColumnIndex !== null) {
            if (selectedColumnIndex == -2) {
                setBannedPokemon([...bannedPokemon, {
                    name: pokemonToBeAdded,
                    sprite: `/src/assets/pokemon-sprites/sprites/pokemon/${POKEMON_DATA.find((pokemon) => pokemon.name === pokemonToBeAdded).url.split('/')[6]}.png`,
                    bannedAbilities: [],
                    bannedMoves: [],
                    notes: ''
                }]);
            } else if (selectedColumnIndex == -1) {
                setTeraBannedPokemon([...teraBannedPokemon, {
                    name: pokemonToBeAdded,
                    sprite: `/src/assets/pokemon-sprites/sprites/pokemon/${POKEMON_DATA.find((pokemon) => pokemon.name === pokemonToBeAdded).url.split('/')[6]}.png`,
                    bannedAbilities: [],
                    bannedMoves: [],
                    notes: ''
                }]);
            } else {
                let updatedColumns;
                if (isEditingPokemon) {
                    updatedColumns = columns.map((column, index) =>
                        index === selectedColumnIndex
                        ? { ...column, pokemon: column.pokemon.map((pokemon, pokeIndex) =>
                            pokeIndex === editingPokemonIndex
                            ? { ...pokemon,
                                name: pokemonToBeAdded,
                                sprite: `/src/assets/pokemon-sprites/sprites/pokemon/${POKEMON_DATA.find((pokemon) => pokemon.name === pokemonToBeAdded).url.split('/')[6]}.png`,
                                bannedAbilities: bannedAbilities,
                                bannedMoves: bannedMoves,
                                notes: notes
                            }
                            : pokemon
                        )}
                        : column
                    );
                } else {
                    updatedColumns = columns.map((column, index) =>
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
                }
                setColumns(updatedColumns);
            }
            clearPokemonStates();
            setIsPokemonModalOpen(false);
        }
    };

    const handleDirectAddPokemon = (pokemon) => {
        if (pokemon.trim() && selectedColumnIndex !== null) {
            if (selectedColumnIndex == -2) {
                setBannedPokemon([...bannedPokemon, {
                    name: pokemon,
                    sprite: `/src/assets/pokemon-sprites/sprites/pokemon/${POKEMON_DATA.find((p) => p.name === pokemon).url.split('/')[6]}.png`,
                    bannedAbilities: [],
                    bannedMoves: [],
                    notes: ''
                }]);
            } else if (selectedColumnIndex == -1) {
                setTeraBannedPokemon([...teraBannedPokemon, {
                    name: pokemon,
                    sprite: `/src/assets/pokemon-sprites/sprites/pokemon/${POKEMON_DATA.find((p) => p.name === pokemon).url.split('/')[6]}.png`,
                    bannedAbilities: [],
                    bannedMoves: [],
                    notes: ''
                }]);
            } else {
                const updatedColumns = columns.map((column, index) =>
                    index === selectedColumnIndex
                    ? { ...column, pokemon: [...column.pokemon, {
                        name: pokemon,
                        sprite: `/src/assets/pokemon-sprites/sprites/pokemon/${POKEMON_DATA.find((p) => p.name === pokemon).url.split('/')[6]}.png`,
                        bannedAbilities: [],
                        bannedMoves: [],
                        notes: ''
                    }] }
                    : column
                );
                setColumns(updatedColumns);
            }
            clearPokemonStates();
            setIsPokemonModalOpen(false);
        }
    };

    const handleEditPokemon = (pokemon, pokeIndex, columnIndex) => {
        setIsEditingPokemon(true);
        setEditingPokemonIndex(pokeIndex);
        setPokemonValue(pokemon.name);
        setPokemonToBeAdded(pokemon.name);
        setBannedAbilities(pokemon.bannedAbilities);
        setBannedMoves(pokemon.bannedMoves);
        setNotes(pokemon.notes);
        setSelectedColumnIndex(columnIndex);
        setIsPokemonModalOpen(true);
    };

    const handleRemovePokemon = (pokeIndex, columnIndex) => {
        if (columnIndex == -2) {
            setBannedPokemon(bannedPokemon.filter((pokemon, index) => index !== pokeIndex));
            return;
        } else if (columnIndex == -1) {
            setTeraBannedPokemon(teraBannedPokemon.filter((pokemon, index) => index !== pokeIndex));
            return;
        }

        const updatedColumns = columns.map((column, index) =>
            index === columnIndex
            ? { ...column, pokemon: column.pokemon.filter((pokemon, index) => index !== pokeIndex) }
            : column
        );
        setColumns(updatedColumns);
    };

    function renderAutocompleteOption({option}) {
        const pokedexNumber = POKEMON_DATA.find((pokemon) => pokemon.name === option.value).url.split('/')[6];
        const imgSrc = `/src/assets/pokemon-sprites/sprites/pokemon/${pokedexNumber}.png`;
        return(
            <Group justify="space-between" w="100%">
                <Group gap="sm">
                    <Image src={imgSrc} alt={option.value} width={32} />
                    <div>
                    <Text size="sm">{option.value}</Text>
                    </div>
                </Group>

                <ActionIcon
                    mr={10}
                    variant='outline'
                    onClick={() => {
                        handleDirectAddPokemon(option.value);
                    }}
                    title="Add Pokémon"
                >
                    <IconPlus size={16} />
                </ActionIcon>
            </Group>
        );
    };

    return (
        <Container>
        <Title align="center" mb="xl">Draft Board</Title>
        <Group>
            <Group>
                <Card key="banned-pokemon" p="lg" style={{ minWidth: '200px' }} c="red">
                    <Stack spacing="xs">
                        <Title order={4}>Banned Pokémon</Title>
                        {bannedPokemon.map((poke, index) => (
                            <Center key={index}>
                                <PokemonCell pokemon={poke} handleRemovePokemon={() => handleRemovePokemon(index, -2)} />
                            </Center>
                        ))}
                        <Button onClick={() => {
                            clearPokemonStates();
                            setSelectedColumnIndex(-2);
                            setIsPokemonModalOpen(true);
                        }}>Add Pokémon</Button>
                    </Stack>
                </Card>
                <Card key="tera-banned-pokemon" p="lg" style={{ minWidth: '200px' }} c="grape">
                    <Stack spacing="xs">
                        <Title order={4}>Tera Banned Pokémon</Title>
                        {teraBannedPokemon.map((poke, index) => (
                            <Center key={index}>
                                <PokemonCell pokemon={poke} handleRemovePokemon={() => handleRemovePokemon(index, -1)} />
                            </Center>
                        ))}
                        <Button onClick={() => {
                            clearPokemonStates();
                            setSelectedColumnIndex(-1);
                            setIsPokemonModalOpen(true);
                        }}>Add Pokémon</Button>
                    </Stack>
                </Card>
            </Group>
            <Divider orientation='vertical'/>
            <Group spacing="lg" align="flex-start">
                {columns.map((column, columnIndex) => (
                <Card key={columnIndex} p="lg" style={{ minWidth: '200px' }}>
                    <Stack spacing="xs">
                    <Title order={4}>{column.name}</Title>
                    {column.pokemon.map((poke, pokeIndex) => (
                        <Center key={pokeIndex}>
                            <PokemonCell pokemon={poke} handleEditPokemon={() => handleEditPokemon(poke, pokeIndex, columnIndex)} handleRemovePokemon={() => handleRemovePokemon(pokeIndex, columnIndex)} />
                        </Center>
                    ))}
                    <Button onClick={() => {
                        clearPokemonStates();
                        setSelectedColumnIndex(columnIndex);
                        setIsPokemonModalOpen(true);
                    }}>Add Pokémon</Button>
                    </Stack>
                </Card>
                ))}
                <Button onClick={() => setIsColumnModalOpen(true)}>Add Column</Button>
            </Group>
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
                clearPokemonStates();
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
                    clearPokemonInfo();
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
            

            <Button onClick={() => {
                handleAddPokemon();
                setIsEditingPokemon(false);
                setEditingPokemonIndex(null);
            }} mt="md">{isEditingPokemon ? 'Save Changes' : 'Add Pokemon'}</Button>
        </Modal>
        </Container>
    );
};

export async function getPokemon() {
    const POKEMON_DATA = await fetch('https://pokeapi.co/api/v2/pokemon/?limit=1302').then((res) => res.json());
    return POKEMON_DATA.results;
}