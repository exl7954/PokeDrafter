import { AppShell, rem } from '@mantine/core';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';

export default function Shell() {
  return (
    <AppShell
      navbar={{ width: rem(80)}}
      padding="md"
    >
      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}