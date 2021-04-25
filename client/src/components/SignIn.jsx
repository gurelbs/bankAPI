import React, {useState} from 'react'
import api from './../API/api'
import {useHistory } from 'react-router-dom'
function SignIn() {
    const [ userData, setUserData ] = useState({})
    const [resMsg, setResMsg] = useState(null)
    const {email, password} = userData
    const history = useHistory();

    const handleLogIn = async e => {
        e.preventDefault()
        try {
            const {data} = await api.get(`/user?email=${email}&password=${password}`)
            console.log(data);
            setResMsg(`log in successfully. hello ${data.name}.`)
            const routeChange = () => { 
                let path = `/user/${data._id}`; 
                history.push(path);
              }
            return routeChange()
        } catch (e) {
            console.log(e);
            setResMsg(`user not found...`)
        }
    }
    return (
        <div className="signin">
            <form>
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
                <label htmlFor="password">password:</label>
                <input 
                    type="password" 
                    id="password"
                    value={userData.password || ''}
                    onChange={e => setUserData({...userData, [e.target.id]: e.target.value})}
                    />
            </div>
            <div className="submit">
                <input type="submit" value="log in" onClick={handleLogIn}/>
            </div>
            <div>
                {resMsg}
            </div>
        </form>
        </div>
    )
}

export default SignIn
