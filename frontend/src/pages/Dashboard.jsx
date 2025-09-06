import React, { useState } from 'react';
import Nav from '../components/Nav';

function Dashboard(props) {
    const [isModel, setIsModel] = useState(false)
    return (
        <div className='bg-black text-white'>
            <Nav />
            <button>Create Game</button>
            <button onClick={() => setIsModel(true)}>Join Game</button>
            {
                isModel &&
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                    Enter Game Code: <input type='number' />
                    <p>Game starts at 1100 am</p>
                    <div>
                        <button onClick={() => setIsModel(false)}> Cancel </button>
                        <button>Join</button>
                    </div>
                </div>
            }


            <div className="border border-2 rounded-xl border-purple m-4">
                Players online : 8 Brains Droped today: 10 ☠️
            </div>
        </div>
    );
}

export default Dashboard;