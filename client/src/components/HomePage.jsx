import React from 'react'
import {Link} from "react-router-dom";

function HomePage() {
    return ( 
        <div className="App">
            <header className="App-header">
                <h1>Wellcome To BankAPI</h1>
                <Link to='/main'><h2>Open the bank door</h2></Link>
                {/* <Link to='/signin'>Sign in</Link> */}
            </header>
        </div>
    )
}

export default HomePage
