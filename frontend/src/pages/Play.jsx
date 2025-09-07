import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';


const data= {
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
        name:"player1",
        eliminated: false
    },
    {
        name:"player1",
        eliminated: false
    },
    {
        name:"player1",
        eliminated: true
    },
    {
        name:"player1",
        eliminated: true
    },
    {
        name:"player1",
        eliminated: true
    },
    
]

const updates = [
    "player this gor elimated",
    "player this "
]

function Play(props) {
    const {code} = useParams();
    const [socket, setSocket] = useState(null)
    const [question, setQuestion] = useState(null)

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
    socketInstance.on('question', (msg) => {
      console.log(msg)
      setQuestion(msg)

    });
    return () => {
      socketInstance.disconnect()
    }
  }, [])


//   const handleAnswer = (index) => {
//     if (!socket) console.log('no socket ')
//     socket.emit('answer', index)
//   }
    return (
        <div>
            <div>
                mcq royale  lives left : ❤️❤️❤️   time left: 1:00
            </div>
            <div className='flex flex-row w-screen w-full justify-between items-center'>
                <div>
                    {updates.map((update, index) => (
                        <p key={index}>{update}</p>
                    ))}
                </div>
            <div>
                <h2>{data.question}</h2>
              <div className='flex flex-col'>
                    {data.options.map((option, index) => (
                        <button key={index}>{option}</button>
                    ))}
</div>
            </div>

            <div>
                <h2>Players left</h2>
                <ul>
                {players.map((player, index) => (
                    <li className={`${player.eliminated && "line-through"} text-`} key={index}>{player.name}</li>
                ))}
            
            </ul>

            </div>
            </div>
            
        </div>
    );
}

export default Play;