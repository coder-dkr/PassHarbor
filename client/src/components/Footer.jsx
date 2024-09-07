import React from 'react'

const Footer = () => {
  return (
    <footer className='text-center fixed bottom-0 w-full p-2 flex flex-col items-center backdrop-blur-sm overflow-hidden'>
        <div className="logo font-bold text-center">
                &lt; Pass<span className='text-[#f1d537]'>Harbor/&gt;</span>
        </div>

       <span className="top-skills-icons flex gap-2 ">
                          Crafted with 
                          <img src="mongo.svg" alt="" />
                          <img src="express.svg" alt="" />
                          <img src="react.svg" alt="" />
                          <img src="node.svg" alt="" /> 
                          By <a className='cursor-pointer  font-semibold' href="https://github.com/coder-dkr" target='_blank'>👉 Dhruv Roy </a>
                </span> 
               

    </footer>
  )
}

export default Footer
