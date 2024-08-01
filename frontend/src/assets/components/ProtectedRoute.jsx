import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const ProtectedRoute = ({ component: Component, ...rest }) => {
    // Check for authentication (you might use localStorage or any other method to store the token)
    const isAuthenticated = localStorage.getItem('token') !== null;

    return (
        <Route
            {...rest}
            render={(props) =>
                isAuthenticated ? (
                    <Component {...props} />
                ) : (
                    <Redirect to="/loginN" />
                )
            }
        />
    );
};

export default ProtectedRoute;
