import React from 'react';
// import Button from '@radui/ui/Button';
// import Heading from '@radui/ui/Heading';

function SignIn() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');

    async function signIn() {
        const response = await fetch('http://localhost:3000/auth/signin', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password }),
        });
        const data = await response.json();
        console.log(data)
        if(data.message=="Logged in"){
            window.location.href = '/dashboard';
        };
    }

    return (
        <div className='flex justify-center items-center min-h-screen  py-12'>
            <div className='bg-[#1b1b2f]/80 rounded-xl shadow-xl p-8 w-full max-w-md'>
                <div className='text-center mb-6'>
                    <h2 className='text-gradient font-bold mb-2'>Welcome Back</h2>
                    <p className='text-gray-600'>Sign in to your account</p>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); signIn(); }} className='space-y-6'>
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
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className='w-full bg-gradient-primary text-white py-2 rounded-md hover:opacity-90 transition-opacity'
                    >
                        Sign In
                    </button>
                    
                    <div className='text-center text-gray-600'>
                        Don't have an account? 
                        <a href="/signup" className='text-indigo-600 hover:text-indigo-800 ml-1 font-medium'>
                            Sign up
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignIn;