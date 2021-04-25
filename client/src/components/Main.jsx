import React from 'react'
import Nav from './Nav'
import CreateUser from './CreateUser'
import SignIn from './SignIn'
import './../styles/main.css'
function main() {
    return (
        <div className="page">
            <Nav/>
            <div className="main">
                <div className="flex-left">
                    <p>dont have account?</p>
                    <h1>create your account now!</h1>
                    <CreateUser/>
                </div>
                <div className="flex-center">
                    <p>already have account?</p>
                    <SignIn/>
                </div>
            </div>
        </div>
    )
}

export default main
