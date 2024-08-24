import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';  // Change to useHistory

function SignIn() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const history = useHistory();  // Change to useHistory

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3001/signin', { name, email });
            console.log("response",response);
            localStorage.setItem('user', JSON.stringify(response?.data));
            history.push('/game', { user: response?.data?.data });  // Use history.push instead of navigate
        } catch (error) {
            console.error('Sign-in failed:', error.response?.data?.error);
        }
    };

    return (
        <div>
            <h2>Sign In</h2>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                />
                <input 
                    type="email" 
                    placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                />
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
}

export default SignIn;
