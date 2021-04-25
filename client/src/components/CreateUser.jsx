import React, {useState} from 'react'
import './../styles/createForm.css'
import api from '../API/api'
function CreateUser() {
    const [ userData, setUserData ] = useState({})
    const [resMsg, setResMsg] = useState(null)
    const handleCreateUser = async e => {
        e.preventDefault()
            try {
                await api.post('/user/create', {
                    name: userData.name,
                    email: userData.email,
                    id: userData.userid,
                    password: userData.password,
                })
                setResMsg(`hey ${userData.name}. wellcome to bankAPI!`)
                setUserData({})
            } catch (e) {
                console.log(e);
                setResMsg(`try again, there is some error...${e.message}`)
            }
        }
    return (
        <form>
            <div>
                <label htmlFor="name">name:</label>
                <input 
                    type="text" 
                    id="name"
                    value={userData.name || ''}
                    onChange={e => setUserData({...userData, [e.target.id]: e.target.value})}
                />
            </div>
            <div>
                <label htmlFor="email">email:</label>
                <input 
                    type="email" 
                    id="email"
                    value={userData.email || ''}
                    onChange={e => setUserData({...userData, [e.target.id]: e.target.value})}
                />
            </div>
            <div>
                <label htmlFor="userid">id:</label>
                <input 
                    type="number" 
                    id="userid"
                    value={userData.userid || ''}
                    onChange={e => setUserData({...userData, [e.target.id]: e.target.value})}
                    />
            </div>
            <div>
                <label htmlFor="password">password:</label>
                <input 
                    type="password" 
                    id="password"
                    value={userData.password || ''}
                    onChange={e => setUserData({...userData, [e.target.id]: e.target.value})}
                    />
            </div>
            <div className="submit">
                <input type="submit" value="submit" onClick={handleCreateUser}/>
            </div>
            <div>
                {resMsg}
            </div>
        </form>
    )
}

export default CreateUser
