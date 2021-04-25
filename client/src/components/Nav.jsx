import React from 'react'
import {
    Link
  } from "react-router-dom";
import './../styles/nav.css'
function Nav() {
    return (
        <nav className="nav">
            <h1>BankAPI</h1>
            <ul>
                <li>
                <Link to="/">HomePage</Link>
                </li>
            </ul>
        </nav> 
    )
}

export default Nav
