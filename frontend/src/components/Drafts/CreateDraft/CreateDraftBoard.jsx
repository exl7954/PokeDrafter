import React, { useState, useEffect } from 'react';
import { Container, Button, ScrollArea, Card, Title, Text, Group, Stack, Modal, Autocomplete, Image, Divider, Center, ActionIcon, NumberInput, Popover, FocusTrap } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';
import { useLoaderData } from 'react-router-dom';
import PokemonInfo from '../PokemonInfo';
import PokemonCell from '../PokemonCell';

export function CreateDraftBoard({ bannedPokemon, setBannedPokemon, teraBannedPokemon, setTeraBannedPokemon, columns, setColumns }) {
    const POKEMON_DATA = useLoaderData();

    const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);

    const [isColumnPopoverOpen, setIsColumnPopoverOpen] = useState(false);
    const [newColumnPoints, setNewColumnPoints] = useState(null);

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
        if (newColumnPoints != null) {
            setColumns([...columns, { points: newColumnPoints, pokemon: [] }]);
            setNewColumnPoints(null);
            setIsColumnPopoverOpen(false);
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

    const handleRemoveColumn = (columnIndex) => {
        setColumns(columns.filter((column, index) => index !== columnIndex));
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
        <Container fluid>
        <Title align="center" mb="xl">Draft Board</Title>
        <ScrollArea>
        <Group align="flex-start" wrap="nowrap" mb="md">
            <Group align="flex-start" wrap="nowrap">
                <Card key="banned-pokemon" p="lg" style={{ minWidth: '200px' }} c="red">
                    <Stack spacing="xs">
                        <Title order={4}>Banned</Title>
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
                        <Title order={4}>Tera Banned</Title>
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
            <Group align="flex-start" wrap="nowrap">
                {columns.map((column, columnIndex) => (
                <Card key={columnIndex} p="lg" style={{ minWidth: '200px' }}>
                    <Stack spacing="xs">
                    <Group justify="space-between">
                        <Title order={4}>{column.points} Points</Title>
                        <ActionIcon variant="transparent" onClick={() => handleRemoveColumn(columnIndex)}>
                            <IconX size={16} />
                        </ActionIcon>
                    </Group>
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
                <Popover position="top" opened={isColumnPopoverOpen} onChange={setIsColumnPopoverOpen}>
                    <Popover.Target>
                        <ActionIcon onClick={() => setIsColumnPopoverOpen((prev) => !prev)}>
                            <IconPlus size={16} />
                        </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                        <FocusTrap>
                        <NumberInput
                            label="Points"
                            value={newColumnPoints}
                            placeholder="Point Cost"
                            onChange={setNewColumnPoints}
                            hideControls
                            allowDecimal={false}
                            allowNegative={false}
                        />
                        </FocusTrap>
                        <Button onClick={handleAddColumn} mt="md">Add Column</Button>
                    </Popover.Dropdown>
                </Popover>
            </Group>
        </Group>
        </ScrollArea>

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
            <FocusTrap>
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
                data-autofocus
            />
            </FocusTrap>

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