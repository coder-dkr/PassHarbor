import { useState } from 'react'
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from './components/Navbar'
import Manager from './components/Manager'
import Footer from './components/Footer'


function App() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  return (
    <>
      <div className="absolute inset-0 -z-10 h-screen w-screen items-center px-5 py-24 [background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>
      <Navbar />

      {isLoading ? <div className='absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]'>
        <img src="loading.gif" className="w-60" alt="" />
      </div> :

        (!isAuthenticated && <div>
          <img src="keylock.png" className="w-[20%] absolute top-[38%] left-[48%] translate-x-[-50%] translate-y-[-50%]" />
          <div className='text-center absolute top-[70%] left-[50%] translate-x-[-50%] translate-y-[-50%]'>A highly secure and efficient vault designed to safely store and manage your passwords. It ensures your credentials remain protected while offering seamless access across devices. With advanced encryption and intuitive features, it simplifies password management by auto-filling login details, generating strong passwords, and keeping everything secure and accessible only to you. Trust PassHarbor to safeguard your digital life with ease, convenience, and top-notch security.</div>
        </div>)
      }

      {isAuthenticated && <Manager />}
      <Footer />


    </>
  )
}

export default App
