import React, { useState, useRef, useEffect } from 'react'
import { useAuth0 } from "@auth0/auth0-react";


const Navbar = () => {
  const { user, isAuthenticated, loginWithRedirect, logout ,getAccessTokenSilently } = useAuth0();
  const [isOpen, setIsOpen] = useState(false);
  const sliderRef = useRef(null);

  const toggleSlider = () => {
    setIsOpen(!isOpen);
  };

  const toggleUser = () => {
    if (!isAuthenticated) {
      loginWithRedirect()
    }
    else {
      let confir = confirm("Loging out?")
      if(confir){
        logout({ logoutParams: { returnTo: window.location.origin } })
  
      }
      
    }
  }

  useEffect(() => {
    // Function to handle outside clicks
    const handleClickOutside = (event) => {
      if (sliderRef.current && !sliderRef.current.contains(event.target)) {
        setIsOpen(false); // Close slider if clicked outside
      }
    };

    // Attach event listener to the document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sliderRef]);

  const handleDeleteAccount = async () => {
      window.location.href = `https://${import.meta.env.VITE_AUTH0_DOMAIN}/v2/logout?returnTo=http://localhost:5173&client_id=${import.meta.env.VITE_AUTH0_CLIENT_ID}`;
  }



  return (
    <>
    <nav className="h-16 flex items-center text-white sticky top-0 z-40 backdrop-blur-md overflow-hidden">
      <div className="container mx-32 flex justify-between items-center">
        <div className="logo font-bold text-2xl">
          &lt; Pass<span className='text-[#f1d537]'>Harbor/&gt;</span>
        </div>
        <div className="user-menu flex w-1/5 justify-evenly items-center">

          {isAuthenticated && <div onClick={toggleSlider} className="user-profile flex items-center justify-center cursor-pointer">
            <lord-icon
              src="https://cdn.lordicon.com/kthelypq.json"
              trigger="hover"
              colors="primary:#ffffff"
              style={{ width: 40, height: 40 }}>
            </lord-icon>
          </div>}

          <button onClick={toggleUser} className="relative inline-flex items-center justify-center p-0.5  me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-black rounded-md group-hover:bg-opacity-0">
              {isAuthenticated ? "Logout" : "Login"}
            </span>
          </button>


        </div>
      </div>
    </nav>
    {isAuthenticated &&
            <div
              ref={sliderRef}
              className={`fixed top-0 right-0 h-full overflow-hidden backdrop-blur-2xl shadow-lg transform transition-transform duration-300 ease-in-out border-solid border-white border-[5px] border-y-0 border-r-0 ${isOpen ? "translate-x-0" : "translate-x-[105%] blur-sm"
                } w-[35] z-50`}
            >

                {/* User Info */}
                <div
                  className="text-gray-900">
                  
                  <div className="h-44 overflow-hidden">
                    <img className="object-cover object-top w-full" src='https://images.unsplash.com/photo-1597172300672-dbcdf33ac44e?q=80&w=2073&auto=format&w=400&fit=max&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' alt='Mountain'/>
                  </div>
                  <div className="mx-auto w-32 h-32 relative -mt-16 border-4 border-white rounded-full overflow-hidden">
                  <img className="object-cover object-center h-32" src={user.picture} alt='Woman looking front'/>
                  </div>
                  <div className="text-center mt-2">
                    <h2 className="font-semibold text-gray-50 mb-3">{user.name}</h2>
                    <p className="text-gray-400">@{user.nickname}</p>
                    <p className="text-gray-400">{user.email}</p>
                  </div>
                 
                  <div className="p-4 border-t mx-8 mt-2" onClick={toggleSlider}>
                    <button className="w-1/2 block mx-auto rounded-full bg-gray-800 hover:shadow-lg font-semibold text-white px-6 py-2">X</button>
                  </div>

                  {/* ACCOUNT DELETE */}
                  <p className="text-red-600 mt-20 text-center">Danger Ahead</p>
                  <div className="p-4 border-t mx-8 mt-2 " onClick={handleDeleteAccount}>
                    <button className="w-1/2 block mx-auto rounded-full bg-gray-800 hover:shadow-lg font-semibold text-red-600 px-6 py-2">Delete Account</button>
                  </div>
                </div>
            </div>
          }
    </>
  )
}

export default Navbar
