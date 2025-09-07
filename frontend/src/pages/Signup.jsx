import React from 'react';

function Signup() {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [submitError, setSubmitError] = React.useState(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    async function signUp() {
        try {
            setSubmitError(null);
            setIsSubmitting(true);
            const response = await fetch('http://localhost:3000/auth/signup', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name, email: email, password: password, confirmPassword: confirmPassword, username }),
            });
            const data = await response.json();
            if (!response.ok) {
                setSubmitError(data.message || 'Sign up failed.');
                return;
            }
            window.location.href = '/signin';
        } catch (e) {
            setSubmitError('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md mx-auto">
                    <h1 className="text-4xl font-bold text-white text-center mb-2 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                        Create Account
                    </h1>
                    <p className="text-center text-gray-300 mb-6">Sign up to get started.</p>

                    <form onSubmit={(e) => { e.preventDefault(); signUp(); }} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                required 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                                placeholder="Enter your name"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                required 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                                placeholder="Enter your email"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input 
                                type="password" 
                                id="password" 
                                required 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                                placeholder="Create a password"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                required 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                                placeholder="Confirm your password"
                            />
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                            <input 
                                type="text" 
                                id="username" 
                                required 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300"
                                placeholder="Enter your username"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-black font-bold rounded-lg transition-all duration-300 mt-2 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:from-yellow-500 hover:to-pink-600 transform hover:scale-[1.01] hover:shadow-xl'}`}
                        >
                            {isSubmitting ? 'Creating account…' : 'Sign Up'}
                        </button>

                        {submitError && (
                            <div className="mt-2 text-red-300 bg-red-500/10 border border-red-500/30 rounded p-3 text-sm">
                                {submitError}
                            </div>
                        )}

                        <div className="text-center text-gray-300">
                            Already have an account?
                            <a href="/signin" className="text-yellow-300 hover:text-yellow-200 ml-1 font-medium">
                                Sign in
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Signup;