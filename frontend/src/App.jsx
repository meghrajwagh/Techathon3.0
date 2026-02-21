import React from 'react'
import earthImg from './assets/earth.jpg'
import Waves from './components/Waves'

const App = () => {
  return (
    <Waves lineColor='rgba(255, 255, 255, 0.15)'>
      <div className='relative bg-transparent h-screen w-full flex items-center justify-center'>
        <div className='box absolute h-[80vh] w-[80vw] rounded-[60px] flex items-center'>

          {/* Left Section */}
          <div className='section1 h-[100%] w-[50%] rounded-[60px] flex flex-col justify-between items-center p-10'>
            <div className='w-full'>
              <span className='text-white text-2xl font-bold tracking-widest'>ORCA</span>
            </div>
            <div className='flex flex-col items-center gap-6'>
              <h1 className='text-white text-4xl font-bold tracking-tight text-center'>Create or Join a Meeting</h1>
              <p className='text-gray-400 text-sm text-center'>Start a new meeting or enter a code to join an existing one.</p>
              <div className='buttons'>
                <button>Create Meeting</button>
                <input type="text" name='code' placeholder='Enter Code' className="block min-w-0 grow bg-gray-800 py-3 px-5 text-lg text-white placeholder:text-gray-500 focus:outline-none border border-white/20 rounded" />
              </div>
            </div>
            <div></div>
          </div>

          {/* Right Section - Image */}
          <div className='relative section1 h-[95%] w-[49%] rounded-[60px] overflow-hidden'>
            <img src={earthImg} alt="Space Station" className='absolute h-full w-full object-cover rounded-[60px]' />
          </div>

        </div>
      </div>
    </Waves>
  )
}

export default App