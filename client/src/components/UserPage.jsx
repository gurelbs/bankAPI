import React, {useState,useEffect} from 'react'
import Nav from './Nav'
import api from  './../API/api'
import './../styles/userpage.css'
import {Link} from  'react-router-dom'
import axios from 'axios'
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
function UserPage() {
    const [userData,setUserData] = useState({})
    const [spinner,setSpinner] = useState(true)
    const [getMsg, setGetMsg] = useState(null)
    const [createAccountMsg, setCreateAccountMsg] = useState(null)
    const {name,accounts} = userData 

    useEffect(() => {
        const fetchData = async () => {
            try {
                setSpinner(true)
                const {data} = await api.get(window.location.pathname)
                console.log(data);
                setUserData(data)
                setSpinner(false)
            } catch (thrown) {
                if (axios.isCancel(thrown)) {
                    setGetMsg('user not found..')
                    console.log('Request canceled', thrown.message);
                } else {
                    setGetMsg('there is some error')
                    console.log('there is some error');
                  }
            }
        }
        fetchData()
        // return () => source.cancel()
    },[])
    const createUserData = () => {
        if (accounts) {
        return (<div>
            <h1>hello {name}</h1>
            {accounts && accounts.length < 1  && <div>
                <p>you currently have no accounts</p>
                <button onClick={handleCreateAccount}>create new account</button>
            </div>}            
        </div>)
        }
    }
    const createAccountList = (accounts) => {
            return (<div>
                {[...Object.values(accounts)].map((account,i) => <ul key={i}>
                <Link to={`${window.location.pathname}/${account}`}>#{i+1}: {account}</Link>
            </ul>)}
            </div>)
    }
    const handleCreateAccount = () => {
        const fetchData = async () => {
            try {
                const {data} = await api.post('/account/create', {
                    owner: userData._id
                })
                console.log(data);
                setCreateAccountMsg(data)
            } catch (e) {
                console.log(e);
                setCreateAccountMsg('there is some problem eith that...')
            }
        }
        fetchData()
    }
    return (
        <div>
            <Nav/>
            <div className="userpage-wrap">
                <div>
                {getMsg}
                    {spinner && 'loading...'}
                    {!spinner && createUserData()}
                    {!spinner && accounts.length !== {} && <div className="list">
                        <h3>here is your accounts list</h3>
                        {createAccountList(accounts)}
                    </div>}
                </div>
                <div className="create-section">
                    {createAccountMsg}
                    <button onClick={handleCreateAccount}>create new account</button>
                </div>
            </div>
        </div>
    )
}

export default UserPage
