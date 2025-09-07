import React from 'react';
// import Button from '@radui/ui/Button';
// import Heading from '@radui/ui/Heading';

function Signup() {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');

    async function signUp() {
        const response = await fetch('http://localhost:3000/auth/signup', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, email: email, password: password, confirmPassword: confirmPassword }),
        });
        const data = await response.json();
        console.log(data);
    }
    
    return (
        <div className='flex justify-center items-center min-h-screen py-12'>
            <div className='bg-[#1b1b2f]/80 rounded-xl shadow-xl p-8 w-full max-w-md'>
                <div className='text-center mb-6'>
                    <h2 className='text-gradient font-bold mb-2'>Create Account</h2>
                    <p className='text-gray-600'>Sign up to get started</p>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); signUp(); }} className='space-y-4'>
                    <div className='space-y-2'>
                        <label htmlFor="name" className='block text-sm font-medium text-gray-700'>Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            required 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            placeholder="Enter your name"
                        />
                    </div>
                    
                    <div className='space-y-2'>
                        <label htmlFor="email" className='block text-sm font-medium text-gray-700'>Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            required 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            placeholder="Enter your email"
                        />
                    </div>
                    
                    <div className='space-y-2'>
                        <label htmlFor="password" className='block text-sm font-medium text-gray-700'>Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            placeholder="Create a password"
                        />
                    </div>
                    
                    <div className='space-y-2'>
                        <label htmlFor="confirmPassword" className='block text-sm font-medium text-gray-700'>Confirm Password</label>
                        <input 
                            type="password" 
                            id="confirmPassword" 
                            required 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            placeholder="Confirm your password"
                        />
                    </div>

                     <div className='space-y-2'>
                        <label htmlFor="username" className='block text-sm font-medium text-gray-700'>Username</label>
                        <input 
                            type="text" 
                            id="username" 
                            required 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500'
                            placeholder="Enter your username"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className='w-full bg-gradient-primary text-white py-2 rounded-md hover:opacity-90 transition-opacity mt-6'
                    >
                        Sign Up
                    </button>
                    
                    <div className='text-center text-gray-600 mt-4'>
                        Already have an account? 
                        <a href="/signin" className='text-indigo-600 hover:text-indigo-800 ml-1 font-medium'>
                            Sign in
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Signup;