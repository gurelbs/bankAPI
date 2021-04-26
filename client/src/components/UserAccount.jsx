import React,{useState, useEffect} from 'react'
import  Nav from './Nav' 
import api from './../API/api'
import axios from 'axios'
const CancelToken = axios.CancelToken;
const source = CancelToken.source();
function UserAccount() {
    const [data, setData] = useState({})
    const [resMsg, setResMsg] = useState('')
    const [openInput, setOpenInput] = useState({
        isCredit: false,
        isDeposit: false,
        isWithdraw: false,
        isWithdrawP2P: false,
    })
    const [toAccount, setToAccount] = useState('')
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
    },[data])
    const handleCredit = () => {
        setResMsg('')
        setPlaceholderMsg('requested credit amount')
        setOpenInput({
            isCredit: true,
            isDeposit: false,
            isWithdraw: false,
            isWithdrawP2P: false,
        })
    }
    const handleDeposite = () => {
        setResMsg('')
        setPlaceholderMsg('deposit money amount' )
        setOpenInput({
            isCredit: false,
            isDeposit: true,
            isWithdraw: false,
            isWithdrawP2P: false,
        })
    }
    const handleWithdraw = () => {
        setResMsg('')
        setPlaceholderMsg('withdraw money amount')
        setOpenInput({
            isCredit: false,
            isDeposit: false,
            isWithdraw: true,
            isWithdrawP2P: false,
        })
    }
    const handleWithdrawP2P = () => {
        setResMsg('')
        setPlaceholderMsg('withdraw P2P amount')
        setOpenInput({
            isCredit: false,
            isDeposit: false,
            isWithdraw: false,
            isWithdrawP2P: true,
        })
    }
    const handleSubmit = () => {
        let res;
        const moreThen0 = parseFloat(amountInput) > 0;
        const creditLoaction = window.location.pathname
        const cashDepositLoaction = `${window.location.pathname}/deposit`
        const cashWithdrawLoaction = `${window.location.pathname}/withdraw`
        const withdrawP2PLoaction = `${window.location.pathname}/withdrawP2P`
        const handleAllData = async (name, path, update, ifis, msg) => {
            try {
                setOpenInput({
                    isCredit: false,
                    isDeposit: false,
                    isWithdraw: false,
                    isWithdrawP2P: false,
                })
                if (ifis) {
                    res = await api.put(path, {[name]: update})
                    setData({...data,accountDetails: res.data.accountDetails})
                    setPlaceholderMsg('')
                    setAmountInput('')
                } else {
                    setResMsg(msg)
                    setTimeout(() => {
                        setResMsg('')
                    }, 2000);
                    setAmountInput('')
                }
            } catch (e) {
                setResMsg(e.message)
                    setTimeout(() => {
                        setResMsg('')
                    }, 2000);
                setAmountInput('')
            }
        }
        const WithdrawP2P = async () => {
            const isValid = toAccount !== '' 
                && amountInput > 0
                && amountInput <= data.accountDetails.cash + data.accountDetails.credit
            try {
                setOpenInput({
                    isCredit: false,
                    isDeposit: false,
                    isWithdraw: false,
                    isWithdrawP2P: false,
                })
                if (isValid){
                    const res = await api.put(withdrawP2PLoaction, {
                        "to": toAccount,
                        "amount": amountInput,
                    })
                    setResMsg(`${res.data.message || res.data}`)
                    setData({...data,accountDetails: res.data.fromAccount})
                    setTimeout(() => {
                        setResMsg('')
                    }, 2000);
                } else {
                    setResMsg(`transaction is not valid`)
                    setTimeout(() => {
                        setResMsg('')
                    }, 2000);
                }
            } catch (e) {
                setResMsg(e.message)
                    setTimeout(() => {
                        setResMsg('')
                    }, 2000);
                setAmountInput('')
            }
        }


        return placeholderMsg === 'requested credit amount' 
        ? handleAllData("credit",creditLoaction,amountInput,moreThen0,'credit requested amount must be more then 0')
        : placeholderMsg === 'deposit money amount' 
        ? handleAllData("cash",cashDepositLoaction,amountInput,moreThen0,'deposit must be more then 0')
        : placeholderMsg === 'withdraw money amount' 
        ? handleAllData("cash",cashWithdrawLoaction,amountInput,moreThen0,'withdraw amount must be more then 0') 
        : placeholderMsg === 'withdraw P2P amount' 
        ? WithdrawP2P()
        : null
    }
    // useEffect(() => {

    // })
    const {_id, cash, credit} = data.accountDetails || ''
    return (
        <div>
            <Nav/>
            <div>
                {console.log(data)}
                {<h1>hello {data?.user?.name || ''}</h1>}
                {<p>wellcome to your account number {_id || ''}</p>}
                <div>
                    <h1>cash: {(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cash)) || ''}</h1>
                    <h1>credit: {(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(credit)) || ''}</h1>
                </div>
            </div>
            <div>
                <button onClick={handleCredit}>request more credit</button>
                <button onClick={handleDeposite}>deposit money</button>
                <button onClick={handleWithdraw}>withdraw money</button>
                <button onClick={handleWithdrawP2P}>send money P2P</button>
            {[...Object.values(openInput)].includes(true) && <div>
                <input 
                    type='number'
                    autoFocus
                    value={amountInput}
                    onChange={e => setAmountInput(e.target.value)}
                    placeholder={placeholderMsg}
                    />
                <input 
                    type='string'
                    disabled={!openInput['isWithdrawP2P']}
                    value={toAccount}
                    onChange={e => setToAccount(e.target.value)}
                    placeholder='to (account ID number)'
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
