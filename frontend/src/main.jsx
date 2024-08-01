import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { Provider } from "react-redux"
import { store } from "../src/redux/store/store"
import App from './App.jsx'
import './index.css'

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ToastContainer position='top-center' autoClose={3000} // Close toasts after 3 seconds
        hideProgressBar={false} newestOnTop={false} closeOnClick={false} rtl={false} pauseOnFocusLoss
        draggable={true} pauseOnHover={false}
      />

      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<App />} />
        </Routes>
      </BrowserRouter>

    </Provider>
  </React.StrictMode>
)
