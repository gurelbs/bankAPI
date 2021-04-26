import React, {useState,useEffect} from 'react'
import Nav from './Nav'
import api from  './../API/api'
import './../styles/userpage.css'
import {Link,useLocation,useParams} from  'react-router-dom'
import axios from 'axios'
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
function UserPage() {
    const [userData,setUserData] = useState({})
    const [showList,setShowList] = useState(false)
    const [spinner,setSpinner] = useState(true)
    const [getMsg, setGetMsg] = useState('')
    const [createAccountMsg, setCreateAccountMsg] = useState('')
    let { id } = useParams();
    let location = useLocation();
    useEffect(() => {
        const fetchData = async () => {
            try {
                setGetMsg('data fetched')
                setSpinner(true)
                let {data} = await api.get(location.pathname, {cancelToken: source.token})
                setUserData(data.user)
                console.log(location.pathname)
                setSpinner(false)
                setTimeout(() => {
                    setGetMsg('')
                }, 1000);
            } catch (e) {
                if (axios.isCancel(e)) {
                    setSpinner(false)
                    console.log('Request canceled', e.message);
                } else {
                    setGetMsg('user not found..')
                    setTimeout(() => {
                        setGetMsg('')
                    }, 1000);
                    setGetMsg('there is some error')
                }
            }
        }
        fetchData()
        return () => source.cancel()
    },[userData,location])
    const createUserData = () => {
        return (<div>
            {userData?.accounts?.length === 0 && <div>
                <p>you currently have no accounts</p>
            </div>}            
        </div>)
    }
    const handleCreateAccount = () => {
        const fetchData = async () => {
            try {
                const accountData = await api.post('/account/create', {owner: id})
                console.log(accountData);
                setCreateAccountMsg(accountData)
            } catch (e) {
                console.log(e);
                setCreateAccountMsg('there is some problem with that...')
            }
        }
        fetchData()
    }
    const createList = () => {
        return (<div className="list">
            {userData?.accounts?.map((account,i) => {
            return <ul key={i}>
                <Link to={`${location.pathname}/${account}`}>#{i+1}: {account}</Link>
            </ul> 
            })}
        </div>)
    }
    return (
        <div>
            <Nav/>
            <div className="userpage-wrap">
                <div>
                    {getMsg}
                    {spinner && ' loading... '}
                    <h1>hello {userData?.name}</h1>
                    <h3>here is your accounts list</h3>
                    {!spinner &&  createUserData()}
                    <button onClick={() => setShowList(!showList)}>
                        {showList ? 'hide accounts List' : 'show accounts List'}
                    </button>
                    {!spinner && showList && createList()}
                </div>
            <div className="create-section">
                {createAccountMsg}
                <button onClick={() => handleCreateAccount()}>create new account</button>
            </div>
            </div>
        </div>
    )
}

export default UserPage
