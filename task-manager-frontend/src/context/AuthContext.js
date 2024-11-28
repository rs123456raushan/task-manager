import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const login = (data) => {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        navigate('/dashboard');
    };

    const logout = () => {
        console.log('logout')
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setUser({}); // Set dummy user for now
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
