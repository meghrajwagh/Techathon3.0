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
              <div className='w-full flex flex-col gap-4'>
                <button className='bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]'>
                  Create Meeting
                </button>
                <div className='flex gap-2'>
                  <input
                    type="text"
                    name='code'
                    placeholder='Enter Code'
                    className="flex-grow bg-[#1a1c23] border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 transition-all"
                  />
                  <button className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg active:scale-[0.98]'>
                    Join
                  </button>
                </div>
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