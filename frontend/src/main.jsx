import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import Dashboard from './pages/Dashboard.jsx';
import Play from './pages/Play.jsx';
import Create from './pages/Create.jsx';
import AuthChecker from './components/AuthChecker.jsx';
import Signup from './pages/Signup.jsx';
import SignIn from './pages/SignIn.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/dashboard",
    element:
      <AuthChecker>
        <Dashboard />
      </AuthChecker>
  },
  {
    path: "/signup",
    element: <Signup/>,
  },
  {
    path: "/signin",
    element: <SignIn/>,
  },
  {
    path: "/play/:code",
    element:
      <AuthChecker>
        <Play />
      </AuthChecker>
  },
  {
    path: "/create",
    element:
      <AuthChecker>
        <Create />
      </AuthChecker>
  }
])

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <RouterProvider router={router} />
  // </StrictMode>,
)
