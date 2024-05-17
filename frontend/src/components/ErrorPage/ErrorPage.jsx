import { useRouteError } from 'react-router-dom';
import { 
    Title,
    Center,
    Divider,
    Stack,
    Text,
} from '@mantine/core';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <Center>
        <Stack gap={1}>
            <Title>Error</Title>
            <Divider my="md" />
            <Text>{error.statusText || error.message}</Text>
        </Stack>
        </Center>
    );
}