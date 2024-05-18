import React from 'react'
import ReactDOM from 'react-dom/client'
import { Loader } from '@mantine/core'
import App from './App.jsx'
import ErrorPage from './components/ErrorPage/ErrorPage'
import {Room, getRoom} from './components/Rooms/Room/Room.jsx'
import {Rooms, getRooms} from './components/Rooms/Rooms.jsx'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom"
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';

const theme = createTheme({
  /* THEME OVERRIDE */
});
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'home',
        element: <div>home</div>,
      },
      {
        path: 'rooms',
        element: <Rooms />,
        loader: getRooms,
      },
      {  
        path: 'rooms/:id',
        element: <Room />,
        loader: getRoom,
          
      },
      {
        path: 'drafts',
        element: <div>drafts</div>,
      },
      {
        path: 'profile',
        element: <div>profile</div>,
      }
    ]
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme='dark' withGlobalStyles withNormalizeCSS>
      <RouterProvider
        router={router}
        fallbackElement={<Loader color="blue" size="xl"/>}
      />
    </MantineProvider>
  </React.StrictMode>,
)
