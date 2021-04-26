import React, {useState,useEffect} from 'react'
import Nav from './Nav'
import api from  './../API/api'
import './../styles/userpage.css'
import {Link,useParams} from  'react-router-dom'
import axios from 'axios'
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
function UserPage() {
    const [userData,setUserData] = useState({})
    const [showList,setShowList] = useState(false)
    const [spinner,setSpinner] = useState(true)
    const [getMsg, setGetMsg] = useState(null)
    const [createAccountMsg, setCreateAccountMsg] = useState(null)
    let { id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setGetMsg('data fetched')
                setSpinner(true)
                const pathname = 
                    process.env.NODE_ENV === 'development' 
                    ? window.location.pathname 
                    : process.env.NODE_ENV === 'production'
                    ? `/user/${id}`
                    : null
                const {data} = await api.get(pathname, {cancelToken: source.token})
                setUserData(data)
                console.log(id,data,pathname)
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
                    console.log('there is some error');
                }
            }
        }
        fetchData()
        return () => source.cancel()
    },[userData])
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
                const pathname = 
                    process.env.NODE_ENV === 'development' 
                    ? 'account/create' 
                    : process.env.NODE_ENV === 'production'
                    ? 'account/create'
                    : null
                const {data} = await api.post(pathname, {owner: id})
                setCreateAccountMsg(data)
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
                <Link to={`${window.location.pathname}/${account}`}>#{i+1}: {account}</Link>
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
                    {spinner && 'loading...'}
                    <h1>hello {userData.name}</h1>
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
