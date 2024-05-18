import { TextInput, Button, Text, Group, Anchor } from '@mantine/core';
import { useToggle } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { useState } from 'react';

export default function AuthModal({ close }) {
    const [type, toggle] = useToggle(['login', 'register']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loginForm = useForm({
        mode: 'uncontrolled',
        validateInputOnBlur: true,
        initialValues: {
            username: '',
            password: '',
            email: '',
            confirmPassword: '',
        },
        validate: {
            username: (value) => (
                type === 'login' ? null : value.length < 3 || value.length > 20 || /^[a-zA-Z0-9_]*$/.test(value) == false ? 'Invalid Username' : null
            ),
            password: (value) => (
                type === 'login' ? null : value.length < 6 || value.length > 20 ? 'Invalid Password' : null
            ),
            email: (value) => (
                type === 'login' ? null : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) == false ? 'Invalid Email' : null
            ),
            confirmPassword: (value) => (
                type === 'login' ? null : value !== loginForm.getValues().password ? 'Passwords do not match' : null
            ),
        }
    });

    async function handleSubmit(values) {
        setLoading(true);
        setError(null);

        if (type === 'register') {
            const registerResponse = await fetch('/api/users/create', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    'username': values.username,
                    'password': values.password,
                    'email': values.email
                })
            });
            if (!registerResponse.ok) {
                setLoading(false);
                let message = await registerResponse.json();
                setError(message.detail);
                return;
            }
        }

        const response = await fetch('/api/token', {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({
                'username': values.username,
                'password': values.password
            })
        });
        setLoading(false);
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            close();
        } else {
            // show error message
            setError('Invalid username or password');
        }
    }

    return (
        <form onSubmit={loginForm.onSubmit(handleSubmit)}>
            <TextInput
                label="Username"
                placeholder="Your username"
                key={loginForm.key('username')}
                {...loginForm.getInputProps('username')}
                required
                disabled={loading}
            />
            {type === 'register' && (
                <TextInput
                label="Email"
                placeholder="you@example.com"
                key={loginForm.key('email')}
                {...loginForm.getInputProps('email')}
                disabled={loading}
            />
            )}
            <TextInput
                label="Password"
                placeholder="Your password"
                type="password"
                key={loginForm.key('password')}
                {...loginForm.getInputProps('password')}
                required
                disabled={loading}
            />
            {type === 'register' && (
                <TextInput
                label="Confirm Password"
                placeholder="Your password again"
                type="password"
                key={loginForm.key('confirmPassword')}
                {...loginForm.getInputProps('confirmPassword')}
                required
                disabled={loading}
            />
            )}
            {error && <Text c="red" size="sm">{error}</Text>}
            <Group justify="space-between" mt="xs">
                <Anchor component="button" type="button" c="dimmed" onClick={() => toggle()} size="xs">
                    {type === 'register'
                    ? 'Already have an account? Login'
                    : "Don't have an account? Register"}
                </Anchor>
                <Button type="submit" mt="sm" disabled={loading}>
                    Submit
                </Button>
            </Group>
            
        </form>
    );
}