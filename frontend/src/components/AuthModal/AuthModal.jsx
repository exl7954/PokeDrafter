import { TextInput, Button, Text, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useState } from 'react';

export default function AuthModal({ close }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loginForm = useForm({
        mode: 'uncontrolled',
        validateInputOnBlur: true,
        initialValues: {username: '', password: ''},
        validate: {
            username: (value) => (
                value.length < 3 || value.length > 20 || /^[a-zA-Z0-9_]*$/.test(value) == false ? 'Invalid Username' : null
            ),
            password: (value) => (
                value.length < 6 || value.length > 20 ? 'Invalid Password' : null
            ),
        }
    });

    const registerForm = useForm({
        mode: 'uncontrolled',
        validateInputOnBlur: false,
        initialValues: {username: '', password: '', email: '', confirmPassword: ''},
        validate: {
            username: (value) => (
                value.length < 3 || value.length > 20 || /^[a-zA-Z0-9_]*$/.test(value) == false ? 'Invalid Username' : null
            ),
            password: (value) => (
                value.length < 6 || value.length > 20 ? 'Invalid Password' : null
            ),
            email: (value) => (
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) == false ? 'Invalid Email' : null
            ),
            confirmPassword: (value) => (
                value !== registerForm.values.password ? 'Passwords do not match' : null
            ),
        }
    });

    async function handleSubmit(values) {
        setLoading(true);
        setError(null);
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
            <TextInput
                label="Password"
                placeholder="Your password"
                type="password"
                key={loginForm.key('password')}
                {...loginForm.getInputProps('password')}
                required
                disabled={loading}
            />
            {error && <Text c="red" size="sm">{error}</Text>}
            <Group>
                
                <Button type="submit" mt="sm" disabled={loading}>
                    Submit
                </Button>
            </Group>
            
        </form>
    );
}