import { AppShell } from '@mantine/core';
import Navbar from '../Navbar/Navbar';

export default function Shell() {
  return (
    <AppShell
        layout="alt"
    >
      <AppShell.Navbar>
        <Navbar />
      </AppShell.Navbar>
    </AppShell>
  );
}