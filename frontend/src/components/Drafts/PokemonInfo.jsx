import {
    Card,
    Stack,
    Group,
    Image,
    Title,
    Text,
    Tooltip,
    Box,
    Center,
    Divider,
    Button,
    Progress,
    Table,
    ScrollArea,
    TextInput,
    ActionIcon,
    Collapse,
    Textarea,
    rem,
    useMantineColorScheme,
} from '@mantine/core';
import { IconSearch, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useDisclosure, useFetch } from '@mantine/hooks';
import { useState, useEffect } from 'react';

export default function PokemonInfo({ pokemon, bannedAbilities, bannedMoves, setBannedAbilities, setBannedMoves, notes, setNotes }) {
    const { colorScheme } = useMantineColorScheme();
    const { data, loading, error, refetch, abort } = useFetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
    const [abilities, setAbilities] = useState([]);

    const [statColors, setStatColors] = useState([]);

    const [notesOpened, {toggle: toggleNotes}] = useDisclosure(false);

    const [moveData, setMoveData] = useState([]);
    const [moveSearch, setMoveSearch] = useState('');
    const [filteredMoves, setFilteredMoves] = useState([]);

    useEffect(() => {
        if (data) {
            // stats
            const newStatColors = data?.stats.map(stat => {
                return statBarColor(stat.base_stat);
            });
            setStatColors(newStatColors);

            // abilities
            const uniqueAbilities = data?.abilities.reduce((unique, ability) => {
                if (!unique.includes(ability.ability.name)) {
                    unique.push(ability.ability.name);
                }
                return unique;
            }, []);
            
            Promise.all(uniqueAbilities.map(ability =>
                fetch(`https://pokeapi.co/api/v2/ability/${ability}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        const effect = data.effect_entries.length > 0 ? findEnglish(data.effect_entries).effect : findEnglish(data.flavor_text_entries).flavor_text;
                        return { [ability]: effect };
                    })
                    .catch(error => {
                        console.error('There was a problem with the fetch operation: ', error);
                        return {}; // return an empty object when there's an error
                    })
            )).then(newAbilities => setAbilities(newAbilities.filter(ability => Object.keys(ability).length !== 0))) // filter out any empty objects
              .catch(error => console.error('Error setting new abilities:', error));

            // moves
            const newMoveData = [];
            if (data.moves) {
                data.moves.forEach(move => {
                    fetch(move.move.url)
                        .then(response => response.json())
                        .then(data => {
                            newMoveData.push(data);
                        })
                        .catch(error => console.error(`Error fetching move data for ${move.move.url}:`, error));
                });
                setMoveData(newMoveData);
                setFilteredMoves(newMoveData);
            }

        }
    }, [data]);

    function handleMoveClick(move) {
        if (bannedMoves.includes(move)) {
            setBannedMoves(bannedMoves.filter(m => m !== move));
        } else {
            setBannedMoves([...bannedMoves, move]);
        }
    }
    
    function handleMoveSearchChange(e) {
        setMoveSearch(e.target.value);
        setFilteredMoves(moveData.filter(move => formatString(move.name).toLowerCase().includes(e.target.value.toLowerCase())));
    }
    
    function generateTable(moves) {
        // moves.forEach(move => {
        //     console.log(move.name, move.type.name, move.damage_class.name, move.power, move.accuracy, move.pp, move.effect_entries[0]?.effect)
        // });
    
        const rows = filteredMoves.map((move) => {
            const isStruck = bannedMoves.includes(move.name);
            return (
                <Table.Tr
                    onClick={() => handleMoveClick(move.name)}
                    key={move.name}
                    style={{ 
                        cursor: "pointer",
                        textDecoration: isStruck ? "line-through" : "none",
                    }}
                    c={isStruck ? "red" : ""}
                >
                    <Table.Td>{formatString(move.name)}</Table.Td>
                    <Table.Td>{move.type.name}</Table.Td>
                    <Table.Td>{move.damage_class.name}</Table.Td>
                    <Table.Td>{move.power}</Table.Td>
                    <Table.Td>{move.accuracy}</Table.Td>
                    <Table.Td>{move.pp}</Table.Td>
                </Table.Tr>
            )
        });
    
        return (
            <Box>
            <TextInput
                placeholder="Search by move name"
                mb="xs"
                leftSection={<IconSearch style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                value={moveSearch}
                onChange={handleMoveSearchChange}
            />
            <ScrollArea h={250}>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Category</Table.Th>
                        <Table.Th>Power</Table.Th>
                        <Table.Th>Accuracy</Table.Th>
                        <Table.Th>PP</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows}
                </Table.Tbody>
            </Table>
            </ScrollArea>
            </Box>
        );
    }
    

    generateTable(moveData);

    const capitalizedName = capitalizeName(pokemon.name);

    return (
        <Card>
            <Stack spacing="xs">

                <Group>
                    <Image src={`/src/assets/pokemon-sprites/sprites/pokemon/${pokemon.url.split('/')[6]}.png`} alt={pokemon.name} />
                    <Stack gap={2}>
                        <Title>{capitalizedName}</Title>
                        <Group gap={3}>
                                <Image src={`/src/assets/pokemon-sprites/sprites/types/generation-vii/ultra-sun-ultra-moon/${data?.types[0].type.name}.png`} alt={data?.types[0].type.name} width={32} />
                                {data?.types.length == 2 && <Image src={`/src/assets/pokemon-sprites/sprites/types/generation-vii/ultra-sun-ultra-moon/${data?.types[1].type.name}.png`} alt={data?.types[1].type.name} width={32} />}
                        </Group>
                    </Stack>
                </Group>

                <Divider />

                <Box>
                <Title order={4}>Stats</Title>
                </Box>

                <Box>
                    <Group>
                        <Text ta='right' w={70} size="md">HP</Text>
                        <Progress.Root size="sm" w={`${data?.stats[0].base_stat / 255 * 70}%`}>
                            <Progress.Section color={statColors[0]} value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[0].base_stat}</Text>
                    </Group>
                    <Group>
                        <Text ta='right' w={70} size="md">Attack</Text>
                        <Progress.Root size="sm" w={`${data?.stats[1].base_stat / 255 * 70}%`}>
                            <Progress.Section color={statColors[1]} value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[1].base_stat}</Text>
                    </Group>
                    <Group>
                        <Text ta='right' w={70} size="md">Defense</Text>
                        <Progress.Root size="sm" w={`${data?.stats[2].base_stat / 255 * 70}%`}>
                            <Progress.Section color={statColors[2]} value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[2].base_stat}</Text>
                    </Group>
                    <Group>
                        <Text ta='right' w={70} size="md">Sp. Atk</Text>
                        <Progress.Root size="sm" w={`${data?.stats[3].base_stat / 255 * 70}%`}>
                            <Progress.Section color={statColors[3]} value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[3].base_stat}</Text>
                    </Group>
                    <Group>
                        <Text ta='right' w={70} size="md">Sp. Def</Text>
                        <Progress.Root size="sm" w={`${data?.stats[4].base_stat / 255 * 70}%`}>
                            <Progress.Section color={statColors[4]} value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[4].base_stat}</Text>
                    </Group>
                    <Group>
                        <Text ta='right' w={70} size="md">Speed</Text>
                        <Progress.Root size="sm" w={`${data?.stats[5].base_stat / 255 * 70}%`}>
                            <Progress.Section color={statColors[5]} value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[5].base_stat}</Text>
                    </Group>

                </Box>

                <Divider />

                <Box>
                    <Box>
                    <Title order={4}>Abilities</Title>
                    <Text size="sm" c="dimmed">Click on an ability to ban it</Text>
                    </Box>

                    <Group justify="center">
                    {/* Map non-duplicate abilities */}
                    {
                        abilities.map((ability, index) => {
                            const abilityName = Object.keys(ability)[0];
                            const banned = bannedAbilities.includes(abilityName);
                            return (
                                <Center key={index}>
                                    <Tooltip
                                        multiline
                                        w={500}
                                        label={Object.values(ability)[0]}
                                        position="top"
                                        withArrow
                                    >
                                        <Button 
                                            variant="subtle"
                                            radius="lg"
                                            c={banned ? "red" : "gray"}
                                            onClick={() => {
                                                if (banned) {
                                                    setBannedAbilities(bannedAbilities.filter(ability => ability !== abilityName));
                                                } else {
                                                    setBannedAbilities([...bannedAbilities, abilityName]);
                                                }
                                            }}
                                        >
                                            <Text td={banned ? "line-through" : ""}>{formatString(abilityName)}</Text>
                                        </Button>
                                    </Tooltip>
                                </Center>
                            );
                        })
                    }
                    </Group>
                </Box>

                <Divider />

                <Box>
                <Title order={4}>Moves</Title>
                <Text size="sm" c="dimmed">Click on a move to ban it</Text>
                </Box>

                {generateTable(moveData)}

                <Divider />

                <Box>
                    <Group justify="space-between">
                        <Title order={4}>Additional Notes</Title>
                        <ActionIcon variant="transparent" onClick={toggleNotes} color={colorScheme === 'dark' ? "white" : "black"}>
                            {notesOpened ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                        </ActionIcon>
                    </Group>

                    <Collapse in={notesOpened} mt="xs">
                        <Textarea placeholder="Write down any notes here..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </Collapse>
                
                </Box>

            </Stack>
        </Card>
    )
}

function capitalizeName(name) {
    return name.replace(/(^|-)(\w)/g, (match, p1, p2) => p1 + p2.toUpperCase());
}

// format ability and move names
function formatString(string) {
    const str = string.replace(/-/g, ' ');
    return str.replace(/\b\w/g, letter => letter.toUpperCase());
}


function statBarColor(stat) {
    if (stat < 30) {
        return "red";
    } else if (stat < 60) {
        return "orange";
    } else if (stat < 90) {
        return "yellow";
    } else if (stat < 150) {
        return "teal";
    } else {
        return "blue";
    }
}

function findEnglish(array) {
    return array.find(item => item.language.name === 'en');
}

