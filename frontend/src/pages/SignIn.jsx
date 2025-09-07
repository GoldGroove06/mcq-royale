import React from 'react';

function SignIn() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [submitError, setSubmitError] = React.useState(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    async function signIn() {
        try {
            setSubmitError(null);
            setIsSubmitting(true);
            const response = await fetch('http://localhost:3000/auth/signin', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
            });
            const data = await response.json();
            if (response.ok && data.message === "Logged in") {
                window.location.href = '/dashboard';
                return;
            }
            setSubmitError(data.message || 'Sign in failed.');
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
                        Sign In
                    </h1>
                    <p className="text-center text-gray-300 mb-6">Welcome back! Sign in to continue.</p>

                    <form onSubmit={(e) => { e.preventDefault(); signIn(); }} className="space-y-6">
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
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-pink-500 text-black font-bold rounded-lg transition-all duration-300 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:from-yellow-500 hover:to-pink-600 transform hover:scale-[1.01] hover:shadow-xl'}`}
                        >
                            {isSubmitting ? 'Signing in…' : 'Sign In'}
                        </button>

                        {submitError && (
                            <div className="mt-2 text-red-300 bg-red-500/10 border border-red-500/30 rounded p-3 text-sm">
                                {submitError}
                            </div>
                        )}

                        <div className="text-center text-gray-300">
                            Don't have an account?
                            <a href="/signup" className="text-yellow-300 hover:text-yellow-200 ml-1 font-medium">
                                Sign up
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default SignIn;