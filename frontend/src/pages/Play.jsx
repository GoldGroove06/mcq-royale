import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';


const data = {
    question: "question",
    options: [
        "option1",
        "option2",
        "option3",
        "option4",
    ]
}

const players = [
    {
        name: "player1",
        eliminated: false
    },
    {
        name: "player1",
        eliminated: false
    },
    {
        name: "player1",
        eliminated: true
    },
    {
        name: "player1",
        eliminated: true
    },
    {
        name: "player1",
        eliminated: true
    },

]

const updates = [
    "player this gor elimated",
    "player this "
]

function Play(props) {
    const { code } = useParams();
    const [socket, setSocket] = useState(null)
    const [question, setQuestion] = useState(null)
    const [lives, setLives] = useState(3)
    const [eliminated, setEliminated] = useState(false)
    const [status, setStatus] = useState('idle') // idle | waiting | started | closed | ended
    const [msUntilStart, setMsUntilStart] = useState(null)
    const [msUntilJoinClose, setMsUntilJoinClose] = useState(null)
    const [msQuestionLeft, setMsQuestionLeft] = useState(null)
    const [gameMeta, setGameMeta] = useState(null)
    const [error, setError] = useState(null)
    const [lastAnswerResult, setLastAnswerResult] = useState(null) // 'correct' | 'wrong' | null
    const [updatesFeed, setUpdatesFeed] = useState([])
    const [isWinner, setIsWinner] = useState(false)
    const startIntervalRef = useRef(null)
    const closeIntervalRef = useRef(null)
    const questionTimerRef = useRef(null)

    useEffect(() => {
        let ignore = false
        async function fetchMeta() {
            setError(null)
            try {
                const res = await fetch(`http://localhost:3000/game/${code}`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: { 'Content-Type': 'application/json' }
                })
                if (!res.ok) {
                    setError('Invalid or inaccessible game code.')
                    return
                }
                const data = await res.json()
                if (!ignore) setGameMeta(data.game)
            } catch (e) {
                if (!ignore) setError('Failed to load game info.')
            }
        }
        if (code) fetchMeta()
        return () => { ignore = true }
    }, [code])

    useEffect(() => {
        const socketInstance = io('http://localhost:3000', { withCredentials: true });
        if (!code) return console.log('no code')
        setSocket(socketInstance);
        socketInstance.on('connect', () => {
            console.log('socket connected', socketInstance.id)
        })
        socketInstance.on('connect_error', (err) => {
            console.error('socket connect_error:', err.message)
        })
        socketInstance.emit('joinroom', code)

        socketInstance.on('room:error', (msg) => console.error(msg))
        socketInstance.on('room:waiting', ({ msUntilStart }) => {
            setStatus('waiting')
            setMsUntilStart(msUntilStart)
        })
        socketInstance.on('room:started', () => {
            setStatus('started')
            setMsUntilStart(0)
        })
        socketInstance.on('game:started', () => {
            setStatus('started')
        })
        socketInstance.on('room:closed', () => setStatus('closed'))
        socketInstance.on('room:join-window', ({ msUntilClose }) => setMsUntilJoinClose(msUntilClose))

        socketInstance.on('question', (msg) => {
            setQuestion(msg)
            setLastAnswerResult(null)
            // reset per-question 60s countdown
            if (questionTimerRef.current) clearInterval(questionTimerRef.current)
            setMsQuestionLeft(60 * 1000)
            questionTimerRef.current = setInterval(() => {
                setMsQuestionLeft((prev) => {
                    const next = Math.max(0, (prev ?? 0) - 1000)
                    if (next === 0) {
                        clearInterval(questionTimerRef.current)
                    }
                    return next
                })
            }, 1000)
        });
        socketInstance.on('lives:update', ({ lives, correct }) => {
            setLives(lives)
            setLastAnswerResult(correct ? 'correct' : 'wrong')
        })
        socketInstance.on('player:eliminated', (payload) => {
            setEliminated(true)
            if (payload && payload.name) {
                setUpdatesFeed((prev) => [{ type: 'eliminated', text: `${payload.name} was eliminated.` }, ...prev].slice(0, 20))
            }
        })
        socketInstance.on('answer:result', ({ name, correct }) => {
            setUpdatesFeed((prev) => [{ type: 'answer', text: `${name} answered ${correct ? 'correctly' : 'wrong'}.` }, ...prev].slice(0, 20))
        })
        socketInstance.on('game:win', ({ name }) => {
            setIsWinner(true)
            setStatus('ended')
            setUpdatesFeed((prev) => [{ type: 'win', text: `${name} won the game!` }, ...prev].slice(0, 20))
        })
        socketInstance.on('game:end', (payload) => {
            setStatus('ended')
            if (payload && payload.winnerName) {
                setUpdatesFeed((prev) => [{ type: 'end', text: `Game ended. Winner: ${payload.winnerName}.` }, ...prev].slice(0, 20))
            } else {
                setUpdatesFeed((prev) => [{ type: 'end', text: `Game ended.` }, ...prev].slice(0, 20))
            }
        })

        return () => {
            socketInstance.disconnect()
            if (questionTimerRef.current) clearInterval(questionTimerRef.current)
        }
    }, [])


      const handleAnswer = (index) => {
        if (!socket) return console.log('no socket ')
        if (eliminated || status !== 'started') return
        socket.emit('answer', index)
      }

    useEffect(() => {
        if (msUntilStart == null) return
        if (startIntervalRef.current) clearInterval(startIntervalRef.current)
        startIntervalRef.current = setInterval(() => {
            setMsUntilStart((prev) => {
                if (prev == null) return prev
                const next = Math.max(0, prev - 1000)
                if (next === 0) {
                    clearInterval(startIntervalRef.current)
                }
                return next
            })
        }, 1000)
        return () => clearInterval(startIntervalRef.current)
    }, [msUntilStart])

    useEffect(() => {
        if (msUntilJoinClose == null) return
        if (closeIntervalRef.current) clearInterval(closeIntervalRef.current)
        closeIntervalRef.current = setInterval(() => {
            setMsUntilJoinClose((prev) => {
                if (prev == null) return prev
                const next = Math.max(0, prev - 1000)
                if (next === 0) {
                    clearInterval(closeIntervalRef.current)
                }
                return next
            })
        }, 1000)
        return () => clearInterval(closeIntervalRef.current)
    }, [msUntilJoinClose])

    const startCountdownText = useMemo(() => {
        if (msUntilStart == null) return ''
        const total = Math.floor(msUntilStart / 1000)
        const m = Math.floor(total / 60)
        const s = total % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }, [msUntilStart])

    const joinCloseCountdownText = useMemo(() => {
        if (msUntilJoinClose == null) return ''
        const total = Math.floor(msUntilJoinClose / 1000)
        const m = Math.floor(total / 60)
        const s = total % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }, [msUntilJoinClose])
    const questionCountdownText = useMemo(() => {
        if (msQuestionLeft == null) return ''
        const total = Math.floor(msQuestionLeft / 1000)
        const m = Math.floor(total / 60)
        const s = total % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }, [msQuestionLeft])
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
            <div className="max-w-5xl mx-auto">
                <div className='bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 md:p-8'>
                    <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-white">Play</div>
                        <div className="text-white/80">Code: <span className="font-mono text-yellow-300">{code}</span></div>
                    </div>

                    <div className="mt-4 grid md:grid-cols-3 gap-4">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-gray-300 text-sm">Lives</div>
                            <div className="text-2xl">{"❤️".repeat(Math.max(0, lives)) || '—'}</div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-gray-300 text-sm">Room</div>
                            <div className="text-white">
                                {status === 'waiting' && <span>Starts in: <span className="text-yellow-300 font-mono">{startCountdownText}</span></span>}
                                {status !== 'waiting' && status !== 'closed' && status !== 'ended' && (
                                    <span>Join closes in: <span className="text-emerald-300 font-mono">{joinCloseCountdownText}</span></span>
                                )}
                                {status === 'closed' && <span className="text-red-300">Room closed</span>}
                                {status === 'ended' && <span className="text-pink-300">Game ended</span>}
                            </div>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-gray-300 text-sm">Question Timer</div>
                            <div className="text-white font-mono text-xl">{questionCountdownText || '—'}</div>
                        </div>
                    </div>

                    {gameMeta && (
                        <div className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10">
                            <div className="text-gray-300 text-sm">Game</div>
                            <div className="text-white text-lg">{gameMeta.name}</div>
                            <div className="text-gray-400 text-sm">Start: {new Date(gameMeta.startTime).toLocaleString()}</div>
                        </div>
                    )}

                    {error && (
                        <div className="mt-4 text-red-300 bg-red-500/10 border border-red-500/30 rounded p-3">{error}</div>
                    )}

                    <div className="mt-6 grid md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 bg-white/5 rounded-xl p-6 border border-white/10">
                            {!eliminated && status === 'started' && question && (
                                <div>
                                    <div className="text-white text-xl mb-4">{question.text}</div>
                                    {lastAnswerResult && (
                                        <div className={`mb-3 text-sm px-3 py-1 rounded inline-block ${lastAnswerResult === 'correct' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                                            {lastAnswerResult === 'correct' ? 'Correct!' : 'Wrong answer'}
                                        </div>
                                    )}
                                    <div className='grid grid-cols-1 gap-3'>
                                        {question.options.map((option, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleAnswer(index)}
                                                disabled={eliminated || status !== 'started'}
                                                className={`px-4 py-3 rounded-lg text-left transition border ${eliminated || status !== 'started' ? 'bg-gray-500/20 text-gray-300 border-white/10 cursor-not-allowed' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
                                            >
                                                {option.text}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {status !== 'started' && (
                                <div className="text-gray-300">{status === 'waiting' ? 'Waiting for game to start…' : status === 'closed' ? 'Room closed for new joins.' : status === 'ended' ? 'Game ended.' : 'Connecting…'}</div>
                            )}
                            {eliminated && (
                                <div className="text-red-300">You are eliminated.</div>
                            )}
                        </div>

                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                            <div className="text-white font-semibold text-xl mb-2">Updates</div>
                            <div className="space-y-1 text-gray-300">
                                {updatesFeed.length === 0 && <p className='text-gray-400'>No updates yet.</p>}
                                {updatesFeed.map((u, index) => (
                                    <p key={index}>{u.text}</p>
                                ))}
                            </div>
                        </div>
                    </div>
                    {status === 'ended' && (
                        <div className="mt-6 bg-white/10 border border-white/20 rounded-xl p-6 text-center">
                            {isWinner ? (
                                <div className="text-2xl text-yellow-300 font-bold">You win! 🎉</div>
                            ) : (
                                <div className="text-xl text-gray-200">Game over. Better luck next time!</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Play;