import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Nav from '../components/Nav';

function Dashboard(props) {
    const location = useLocation();
    const [isModel, setIsModel] = useState(false)
    const [gameCode, setGameCode] = useState('');
    const [latestGame, setLatestGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchLatest() {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('http://localhost:3000/create/latest', {
                    credentials: 'include'
                });
                if (res.status === 401 || res.status === 403) {
                    setError('Please sign in to view your dashboard.');
                    if (isMounted) setLoading(false);
                    return;
                }
                const data = await res.json();
                if (isMounted) setLatestGame(data.game);
            } catch (e) {
                if (isMounted) setError('Failed to load latest game.');
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        fetchLatest();
        return () => { isMounted = false; }
    }, []);

    const handleJoin = async () => {
        try {
            const res = await fetch(`http://localhost:3000/game/${gameCode}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (res.ok) {
                window.location.href = `/play/${gameCode}`;
            } else {
                setError('Invalid game code.');
            }
        } catch (e) {
            setError('Failed to join game.');
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6'>
            <div className="max-w-5xl mx-auto">
                <div className='bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8'>
                    <Nav />

                    <div className="flex items-center justify-between mt-4 mb-6">
                        <h1 className="text-3xl md:text-4xl font-bold text-white bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">Dashboard</h1>
                        <div className="space-x-3">
                            <Link to="/create" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300">Create Game</Link>
                            <button onClick={() => setIsModel(true)} className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition">Join Game</button>
                        </div>
                    </div>

                    {isModel && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                            <div className='bg-white/10 border border-white/20 rounded-2xl p-6 w-full max-w-md backdrop-blur-md shadow-2xl'>
                                <div className='text-center mb-4'>
                                    <div className='text-2xl font-bold text-white mb-1'>Join a Game</div>
                                    <p className='text-gray-300 text-sm'>Enter the join code to hop in.</p>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-300 mb-2'>Game Code</label>
                                    <input type='text' placeholder='ABC123' className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent' value={gameCode} onChange={(e) => setGameCode(e.target.value)}/>
                                    <p className='text-gray-400 text-xs mt-2'>Ask the host for the code.</p>
                                </div>
                                <div className='flex justify-end space-x-3 mt-5'>
                                    <button onClick={() => setIsModel(false)} className='px-4 py-2 bg-gray-500/20 text-white rounded-lg hover:bg-gray-500/30 transition'>Cancel</button>
                                    <button className='px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition' onClick={handleJoin}>Join</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-white font-semibold text-xl">Stats</div>
                                <span className="text-xs px-2 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Live</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-gray-300 text-sm">Players Online</div>
                                    <div className="text-2xl text-white font-semibold">8</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="text-gray-300 text-sm">Games Active</div>
                                    <div className="text-2xl text-white font-semibold">3</div>
                                </div>
                                <div className="bg-white/5 rounded-lg p-4 border border-white/10 col-span-2">
                                    <div className="text-gray-300 text-sm">Brains dropped today</div>
                                    <div className="text-2xl text-pink-300 font-semibold">10 ☠️</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-white font-semibold text-xl">Your Latest Game</div>
                                <Link to="/create" className="text-sm text-yellow-300 hover:text-yellow-200">Create new</Link>
                            </div>
                            {loading && <div className='text-gray-300'>Loading...</div>}
                            {error && <div className='text-red-300'>{error}</div>}
                            {!loading && !error && !latestGame && (
                                <div className='text-gray-300'>No games created yet.</div>
                            )}
                            {!loading && !error && latestGame && (
                                <div className='space-y-4'>
                                    <div>
                                        <div className="text-gray-300 text-sm">Game Name</div>
                                        <div className="text-yellow-300 text-lg">{latestGame.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-300 text-sm">Join Code</div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-green-300 font-mono text-2xl">{latestGame.joinCode}</div>
                                            <button
                                                type="button"
                                                onClick={() => navigator.clipboard.writeText(latestGame.joinCode)}
                                                className="px-3 py-1 bg-green-500/20 text-green-300 rounded hover:bg-green-500/30 transition"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Link to={`/play/${latestGame.joinCode}`} className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition">Play</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;