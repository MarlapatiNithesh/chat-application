import React from 'react'
import SideBar from '../components/SideBar'
import MessageArea from '../components/MessageArea'
import useGetMessages from '../customHook/getMessages'

function Home() {
  useGetMessages();
  return (
    <div className='w-full h-[100vh] flex overflow-hidden'>
      <SideBar />
      <MessageArea/>
    </div>
  )
}

export default Home