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
} from '@mantine/core';
import { useFetch } from '@mantine/hooks';
import { useState, useEffect } from 'react';

export default function PokemonInfo({ pokemon }) {
    const { data, loading, error, refetch, abort } = useFetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.name}`);
    const [abilities, setAbilities] = useState([]);
    
    const [bannedAbilities, setBannedAbilities] = useState([]);
    const [bannedMoves, setBannedMoves] = useState([]);

    const [progressWidth, setProgressWidth] = useState(50);

    useEffect(() => {
        if (data) {
            // abilities
            const newAbilities = [];
            const uniqueAbilities = data?.abilities.reduce((unique, ability) => {
                if (!unique.includes(ability.ability.name)) {
                    unique.push(ability.ability.name);
                }
                return unique;
            }, []);
            
            Promise.all(uniqueAbilities.map(ability =>
                fetch(`https://pokeapi.co/api/v2/ability/${ability}`)
                    .then(response => response.json())
                    .then(data => {
                        const effect = data.effect_entries.length > 0 ? data.effect_entries[1].effect : data.flavor_text_entries[0].flavor_text;
                        return { [ability]: effect };
                    })
            )).then(newAbilities => setAbilities(newAbilities));
        }
    }, [data]);

    useEffect(() => {
        setBannedAbilities([]);
        setBannedMoves([]);
    }, [data]);

    function capitalizeName(name) {
        return name.replace(/(^|-)(\w)/g, (match, p1, p2) => p1 + p2.toUpperCase());
    }
    const capitalizedName = capitalizeName(pokemon.name);

    function formatAbility(ability) {
        const str = ability.replace(/-/g, ' ');
        return str.replace(/\b\w/g, letter => letter.toUpperCase());
    }

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
                                        <Text td={banned ? "line-through" : ""}>{formatAbility(abilityName)}</Text>
                                    </Button>
                                </Tooltip>
                            </Center>
                        );
                    })
                }
                </Group>

                <Divider />

                <Box>
                    <Group>
                        <Text ta='right' w={70} size="md">HP</Text>
                        <Progress.Root size="sm" w={`${data?.stats[0].base_stat / 255 * 70}%`}>
                            <Progress.Section value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[0].base_stat}</Text>
                    </Group>
                    <Group>
                        <Text ta='right' w={70} size="md">Attack</Text>
                        <Progress.Root size="sm" w={`${data?.stats[1].base_stat / 255 * 70}%`}>
                            <Progress.Section value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[1].base_stat}</Text>
                    </Group>
                    <Group>
                        <Text ta='right' w={70} size="md">Defense</Text>
                        <Progress.Root size="sm" w={`${data?.stats[2].base_stat / 255 * 70}%`}>
                            <Progress.Section value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[2].base_stat}</Text>
                    </Group>
                    <Group>
                        <Text ta='right' w={70} size="md">Sp. Atk</Text>
                        <Progress.Root size="sm" w={`${data?.stats[3].base_stat / 255 * 70}%`}>
                            <Progress.Section value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[3].base_stat}</Text>
                    </Group>
                    <Group>
                        <Text ta='right' w={70} size="md">Sp. Def</Text>
                        <Progress.Root size="sm" w={`${data?.stats[4].base_stat / 255 * 70}%`}>
                            <Progress.Section value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[4].base_stat}</Text>
                    </Group>
                    <Group>
                        <Text ta='right' w={70} size="md">Speed</Text>
                        <Progress.Root size="sm" w={`${data?.stats[5].base_stat / 255 * 70}%`}>
                            <Progress.Section value={100}></Progress.Section>
                        </Progress.Root>
                        <Text size="sm">{data?.stats[5].base_stat}</Text>
                    </Group>

                </Box>

                <Button onClick={() => setProgressWidth(Math.random() * 100)} mt="md">
                    Set random value
                </Button>
                
            </Stack>
        </Card>
    )
}