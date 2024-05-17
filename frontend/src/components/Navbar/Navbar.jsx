import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Center, Tooltip, UnstyledButton, Stack, rem, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AuthModal from '../AuthModal/AuthModal';
import {
    IconHome,
    IconUsersGroup,
    IconBook2,
    IconUser,
    IconLogin,
    IconLogout,
    IconSettings,
} from '@tabler/icons-react';
import classes from './Navbar.module.css';

function NavbarLink({ icon: Icon, label, active, onClick }) {
    return (
    <Tooltip label={label} position="right" withArrow>
        <UnstyledButton onClick={onClick} className={classes.link} data-active={active || undefined}>
            <Icon style={{ width: rem(20), height: rem(20) }} stroke={1.5} />
        </UnstyledButton>
    </Tooltip>
    );
}

const data = [
    { icon: IconHome, label: 'Home', to: '/home'},
    { icon: IconUsersGroup, label: 'Rooms', to: '/rooms'},
    { icon: IconBook2, label: 'Drafts', to: '/drafts'},
    { icon: IconUser, label: 'Profile', to: '/profile'},
];


export default function Navbar() {
    const navigate = useNavigate();
    const [active, setActive] = useState(0);
    const [loggedIn, setLoggedIn] = useState(false);
    const [opened, {open, close}] = useDisclosure(false);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            setLoggedIn(true);
        }
    }, [opened])

    const links = data.map((link, index) => (
        <NavbarLink
          {...link}
          key={link.label}
          active={index === active}
          onClick={() => {
            setActive(index)
            navigate(link.to)
        }}
        />
    ));

    function handleLoginClick() {
        if (loggedIn) {
            localStorage.removeItem('token');
            setLoggedIn(false);
        } else {
            open();
        }
    }

    return (
    <nav className={classes.navbar}>
        <Center>
        Logo
        </Center>

        <div className={classes.navbarMain}>
        <Stack justify="center" gap={5}>
            {links}
        </Stack>
        </div>

        <Stack justify="center" gap={5}>
        <NavbarLink icon={IconSettings} label="Settings" />
        <NavbarLink icon={loggedIn ? IconLogout : IconLogin} label={loggedIn ? "Logout" : "Login"} onClick={handleLoginClick} />
        </Stack>

        <Modal opened={opened} onClose={close} title="Authentication" centered>
            <AuthModal close={close}/>
        </Modal>
    </nav>
    );
}