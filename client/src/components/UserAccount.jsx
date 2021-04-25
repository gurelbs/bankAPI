import React,{useState, useEffect} from 'react'
import  Nav from './Nav' 
import api from './../API/api'
import axios from 'axios'
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
function UserAccount() {
    const [data, setData] = useState({})
    const [resMsg, setResMsg] = useState('')
    const [toggle, setToggle] = useState(false)
    const [isWithdrawP2P, setIsWithdrawP2P] = useState(false)
    const [placeholderMsg, setPlaceholderMsg] = useState('')
    const [amountInput, setAmountInput] = useState('')
    useEffect(() => {
        const fetchData = async () => {
            try {
                const {data} = await api.get(window.location.pathname, {cancelToken: source.token})
                console.log(data);
                setData(data)
            } catch (thrown) {
                if (axios.isCancel(thrown)) {
                    console.log('Request canceled', thrown.message);
                } else {
                    console.log('there is some error');
                  }
            }
        }
        fetchData()
        return () => source.cancel()
    },[{data}])
    const handleCredit = () => {
        setToggle(!toggle)
        setResMsg('')
        setPlaceholderMsg('request more credit')
    }
    const handleDeposite = () => {
        setToggle(!toggle)
        setResMsg('')
        setPlaceholderMsg('deposit money' )
    }
    const handleWithdraw = () => {
        setToggle(!toggle)
    }
    const handleWithdrawP2P = () => {
        setToggle(!toggle)
    }
    const handleSubmit = () => {
        const fetchCreditData = async () => {
            try {
                const res = await api.put(window.location.pathname, {"credit": amountInput})
                setData({...data,accountDetails: res.data.accountDetails})
                setResMsg(res.data["message"])
                setToggle(false)
                setPlaceholderMsg('')
            } catch (e) {
                setResMsg(e.message)
            }
            setAmountInput('')
        }
        const fetchCashData = async () => {
            try {
                const res = await api.put(window.location.pathname, {"cash": amountInput})
                setData({...data,accountDetails: res.data.accountDetails})
                setResMsg(res.data["message"])
                setToggle(false)
                setPlaceholderMsg('')
            } catch (e) {
                setResMsg(e.message)
            }
        }
        return placeholderMsg === 'request more credit' 
        ?  fetchCreditData()
        : placeholderMsg === 'deposit money' 
        ? fetchCashData()
        : null
    }
    const {_id, cash, credit} = data.accountDetails || ''
    const {name} = data.user || ''
    return (
        <div>
            <Nav/>
            <div>
                {data && <h1>hello {name}</h1>}
                {<p>wellcome to your account number {_id}</p>}
                <div>
                    <h1>cash: {cash}</h1>
                    <h1>credit: {credit}</h1>
                </div>
            </div>
            <div>
                <button onClick={handleCredit}>request more credit</button>
                <button onClick={handleDeposite}>deposit money</button>
                <button onClick={handleWithdraw}>withdraw money</button>
                <button onClick={handleWithdrawP2P}>send money P2P</button>
            {toggle && <div>
                <input 
                    type='number'
                    autoFocus
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value)}
                    placeholder={placeholderMsg}
                    />
                <input 
                    type='number'
                    autoFocus
                    disabled={true}
                    value=''
                    onChange={e => setAmountInput(e.target.value)}
                    placeholder='to (WithdrawP2P)'
                    />
                <input 
                    type="submit" 
                    value="submit"
                    onClick={handleSubmit}
                />
            </div>}
                {resMsg}
            </div>
        </div>
    )
}

export default UserAccount
