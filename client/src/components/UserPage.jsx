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
    const [showList,setShowList] = useState(false)
    const [spinner,setSpinner] = useState(true)
    const [getMsg, setGetMsg] = useState(null)
    const [accountsList, setaccountsList] = useState([])
    const [createAccountMsg, setCreateAccountMsg] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setGetMsg('')
                setGetMsg('data fetched')
                setSpinner(true)
                const {data} = await api.get(window.location.pathname, {cancelToken: source.token})
                setaccountsList(data.accounts)
                setUserData(data)
                setSpinner(false)
                setGetMsg('')
            } catch (e) {
                if (axios.isCancel(e)) {
                    setGetMsg('user not found..')
                    setTimeout(() => {
                        setGetMsg('')
                    }, 1000);
                    setSpinner(false)
                    console.log('Request canceled', e.message);
                } else {
                    setGetMsg('there is some error')
                    console.log('there is some error');
                }
            }
        }
        fetchData()
        return () => source.cancel()
    },[accountsList])
    const createUserData = () => {
        return (<div>
            <h1>hello {userData.name}</h1>
            {userData?.accounts?.length === 0 && <div>
                <p>you currently have no accounts</p>
            </div>}            
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
                setCreateAccountMsg('there is some problem with that...')
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
                    {!spinner &&  <div className="list">
                        <h3>here is your accounts list</h3>
                        <button onClick={() => setShowList(!showList)}>{showList ? 'hide accounts List' : 'show accounts List'}</button>
                        {!spinner && showList && accountsList.map((account,i) => {
                        return <ul key={i}>
                            <Link to={`${window.location.pathname}/${account}`}>#{i+1}: {account}</Link>
                        </ul> 
                        })}
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
