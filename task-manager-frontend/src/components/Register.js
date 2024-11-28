import { useState } from 'react';
import { register } from '../api';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        const { email, password } = formData;

        if (!email || !password) {
            setError('Email and Password are required!');
            return;
        }

        // Handle login logic, you can add API call for login here
        try {
            await register({ email, password });
            navigate('/')
            alert("You are on login page. Please login to continue")
        } catch (err) {
            alert(err.response.data.message)
            console.error(err.response.data.message);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ marginTop: 8 }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    padding: 3,
                    borderRadius: 2,
                    boxShadow: 3,
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom>
                    Sign Up
                </Typography>

                {error && (
                    <Typography color="error" variant="body2" sx={{ marginBottom: 2 }}>
                        {error}
                    </Typography>
                )}

                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                    <TextField
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                    />

                    <TextField
                        label="Password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        required
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ marginTop: 2 }}
                    >
                        Sign Up
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default Register;
