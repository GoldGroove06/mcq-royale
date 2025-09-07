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
            const res = await fetch('http://localhost:3000/game/find', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ gameCode })
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
                        <div className="text-2xl font-bold text-white">Dashboard</div>
                        <div className="space-x-3">
                            <Link to="/create" className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300">Create Game</Link>
                            <button onClick={() => setIsModel(true)} className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition">Join Game</button>
                        </div>
                    </div>

                    {isModel && (
                        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
                            <div className='bg-white/10 border border-white/20 rounded-xl p-6 w-full max-w-md'>
                                <div className='text-white text-lg mb-3'>Enter Game Code</div>
                                <input type='text' placeholder='ABC123' className='w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent' value={gameCode} onChange={(e) => setGameCode(e.target.value)}/>
                                <p className='text-gray-300 text-sm mt-3'>Game starts at 11:00 AM</p>
                                <div className='flex justify-end space-x-3 mt-4'>
                                    <button onClick={() => setIsModel(false)} className='px-4 py-2 bg-gray-500/20 text-white rounded-lg hover:bg-gray-500/30 transition'>Cancel</button>
                                    <button className='px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition' onClick={handleJoin}>Join</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="text-white font-semibold text-xl mb-2">Stats</div>
                            <div className="text-gray-300">Players online: 8</div>
                            <div className="text-gray-300">Brains dropped today: 10 ☠️</div>
                        </div>

                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="text-white font-semibold text-xl mb-4">Your Latest Game</div>
                            {loading && <div className='text-gray-300'>Loading...</div>}
                            {error && <div className='text-red-300'>{error}</div>}
                            {!loading && !error && !latestGame && (
                                <div className='text-gray-300'>No games created yet.</div>
                            )}
                            {!loading && !error && latestGame && (
                                <div>
                                    <div className="text-gray-300 text-sm">Game Name</div>
                                    <div className="text-yellow-300 text-lg">{latestGame.name}</div>
                                    <div className="text-gray-300 text-sm mt-4">Join Code</div>
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;