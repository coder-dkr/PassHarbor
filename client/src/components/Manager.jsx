import React, { useRef, useState, useEffect } from 'react'
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { v4 as uuidv4 } from 'uuid'; // Import UUID

const Manager = () => {
    const { isAuthenticated, user } = useAuth0();
    const [form, setform] = useState({ site: "", username: "", password: "" })
    const [visible, setVisible] = useState(false);
    const [credentials, setCredentials] = useState([]);

    // Fetch credentials when the component mounts
    useEffect(() => {
        if (isAuthenticated && user.email) {
            fetchCredentials(user.email);
        }
    }, [isAuthenticated, user]);

    const fetchCredentials = async (email) => {
        try {
          const response = await axios.get(`http://localhost:4000/${email}`);
          if(response.data.credentials != undefined){
              setCredentials(response.data.credentials);
            }
          else setCredentials(response.data);

        } catch (error) {
          console.error("Error fetching credentials:", error);
        }
      };



    const handleInputChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }

    const handleVisible = (e) => {
        e.preventDefault()
        setVisible(!visible);
    };

    const HandleSavePass = async () => {
        if (form.site.length < 3 || form.username.length < 3 || form.password.length < 3) {
            toast.error('String length must be > 3', {
                className: 'bg-red-900 italic',
                position: "top-center",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
        }
        else {

            try{
                if(form.id){
                    const updatedCredential = {
                        site: form.site,
                        username: form.username,
                        password: form.password,
                        id: form.id, // Keep the same ID for the credential being updated
                    };

                    setform({ site: "", username: "", password: "" }); // Clear form
                    setCredentials(prevCredentials =>
                        prevCredentials.map(cred =>
                            cred.id === form.id ? { ...cred, ...updatedCredential } : cred
                        )
                    );
                    
                    await axios.patch("http://localhost:4000/update-credential", {
                        email: user.email, // Auth0 email
                        credentialId: form.id, // The ID of the credential being updated
                        updatedCredential: updatedCredential, // Updated form data
                    });
                    
                    fetchCredentials(user.email);
                    // Update credentials in state
                    
        
                    toast('✅ Credential Updated!', {
                        className: 'bg-green-500 italic',
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light",
                    });

                }
                else{
                    const newCredential = {...form,id: uuidv4() // Generate UUID for the new credential
                    };
                      await axios.post("http://localhost:4000/save", {
                        email: user.email, // Auth0 email
                        credential: newCredential, // Form data for site, username, password and ID
                      });
                      setCredentials((prevCredentials) => [...prevCredentials, newCredential])
                      setform({ site: "", username: "", password: "" }); // Clear form

                         toast('✅ Credentials Saved !', {
                            className: 'bg-gradient-to-r from-indigo-500 to-purple-900 italic',
                            position: "top-right",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "light",
                        });
                }
                
            }
            catch{
                console.error("Error saving/updating credential:", error);
                toast.error('❌ Failed to save/update credential!', {
                    className: 'bg-red-900 italic',
                    position: "top-center",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            }

           
        }

    }

    const handleCopyText = (text) => {
        toast('✅ Copied to clipboard !', {
            className: 'bg-gradient-to-r from-indigo-500 to-purple-900 italic',
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
        navigator.clipboard.writeText(text);
    }

    const handleDelPass = async (cred) => {
        let bolo = confirm(`Delete ${cred.site} ?`)
        if(bolo){
            try {
                setCredentials((prevCredentials) => prevCredentials.filter(item => item.id !== cred.id));
                await axios.delete(`http://localhost:4000/${user.email}`, {
                    data: { id: cred.id }, // Send the UUID of the credential to delete
                });
                fetchCredentials(user.email);
                toast('✅ Credentials Deleted !', {
                    className: 'bg-gradient-to-r from-indigo-500 to-purple-900 italic',
                    position: "top-right",
                    autoClose: 2000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "light",
                });
            } catch (error) {
                console.error("Error deleting credential:", error);
            }

        }
        
      };

      const handleEditpass = (cred) => {
            setform(cred);
      }


    
    return isAuthenticated && (
        <>
            <ToastContainer
                position="bottom-right"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
            />
            {/* Same as */}
            <ToastContainer />


            <div className='md:w-[70%] mx-auto mt-5 mb-3 flex flex-col gap-3 items-center'>
                <div className="logo text-2xl text-center">
                    &lt; Pass<span className='text-[#f1d537]'>Harbor/&gt;</span>
                </div>
                <div className='font-mono text-center'>A Harbor to store your passwords</div>

                <form className="entry-form flex flex-col gap-4 items-center w-3/4 mx-auto text-black">
                    <input onChange={handleInputChange} value={form.site} className="w-full style-my-input" type="text" name="site" placeholder='website url' />
                    <div className="main-value flex justify-center items-center gap-5 w-full ">

                        <input onChange={handleInputChange} value={form.username} className='text-black w-2/3 style-my-input' type="text" name="username" placeholder='enter username' />

                        <div className="relative w-1/3">

                            <input onChange={handleInputChange} value={form.password} className=' text-black w-full style-my-input' type={visible ? "text" : "password"} name="password" placeholder='enter password' />
                            <button onClick={handleVisible} className="absolute top-2 right-2 cursor-pointer">
                                <img className='w-5' src={visible ? "eye-slash-solid.svg" : "eye-solid.svg"} alt="" />
                            </button>

                        </div>
                    </div>
                </form>

                <button onClick={HandleSavePass} className='bg-[#59bc1c] my-5 border w-fit border-solid border-black px-3 py-1 rounded-full flex justify-center items-center gap-3 hover:bg-[#adf680]'>
                    <lord-icon
                        src="https://cdn.lordicon.com/jgnvfzqg.json"
                        trigger="hover" >
                    </lord-icon>
                    <span className='text-black font-semibold'>Save</span>
                </button>
            </div>

            {/* table for passwords */}
            <div className="Show-creds md:w-[70%] mx-auto flex flex-col text-white mb-16">
                <h1 className='font-semibold text-2xl mb-3'>{user.given_name[0].toUpperCase() + user.given_name.slice(1).toLowerCase()}'s Security Credentials</h1>

                <div className="relative h-66 shadow-2xl sm:rounded-lg md:overflow-hidden">

                    <table className="w-full  text-sm text-left rtl:text-right rounded-lg h-32">
                        <thead className="text-sm dark:bg-purple-900 dark:text-white">
                            <tr>
                                <th scope="col" className="px-6 py-3 bg-white dark:bg-purple-900 border-black border-4 border-y-0 border-l-0">
                                    Site Url
                                </th>
                                <th scope="col" className="px-6 py-3 bg-white dark:bg-purple-900 border-black border-4 border-y-0 border-l-0">
                                    Username
                                </th>
                                <th scope="col" className="px-6 py-3 bg-white dark:bg-purple-900 border-black border-4 border-y-0 border-l-0">
                                    Password
                                </th>
                                <th scope="col" className="px-6 py-3 bg-white dark:bg-purple-900 ">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {credentials && credentials.length === 0 ? <tr className='relative left-4'><td className='text-slate-400'>No saved Passwords</td></tr> : (credentials.map((item) => {
                                    return (
                                        <tr key={item.id} className="bg-none text-white border-b dark:border-gray-700 ">

                                            <td className="px-6 py-4">
                                                <a href={item.site} target="_blank" >{item.site}</a>
                                            </td>
                                            <td className="px-6 py-4 relative text-center">
                                                {item.username}
                                                <div onClick={() => { handleCopyText(item.username) }} className='absolute top-[25%] right-5 bg-slate-700 p-2 w-fit rounded-md cursor-pointer hover:bg-slate-500'> <img src="copy.svg" ></img></div>
                                            </td>
                                            <td className="px-6 py-4 relative text-center">
                                                {"*".repeat(item.password.length)}
                                                <div onClick={() => { handleCopyText(item.password) }} className='absolute top-[25%] right-5 bg-slate-700 p-2 w-fit rounded-md cursor-pointer hover:bg-slate-500'> <img src="copy.svg" ></img></div>
                                            </td>
                                            <td className="px-6 py-4 flex justify-evenly">
                                                <div className='cursor-pointer' onClick={ () => handleEditpass(item)} >
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/gwlusjdu.json"
                                                        trigger="hover"
                                                        colors="primary:#ffffff"
                                                        style={{ "width": "20px", "height": "20px" }}>
                                                    </lord-icon>
                                                </div>
                                                <div className='cursor-pointer' onClick={ () => handleDelPass(item)}>
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/skkahier.json"
                                                        trigger="hover"
                                                        colors="primary:#ffffff"
                                                        style={{ "width": "20px", "height": "20px" }}>
                                                    </lord-icon>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                }))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    )
}

export default Manager
