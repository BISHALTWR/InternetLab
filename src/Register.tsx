import React, { useState, ChangeEvent, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from "firebase/auth";
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
import {doc, setDoc } from 'firebase/firestore';

interface RegisterProps { }

const Register: React.FC<RegisterProps> = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [passwordMatch, setPasswordMatch] = useState<boolean>(true);
    const navigate = useNavigate()

    useEffect(() => {
        const checkToken = () => {
            const userToken = localStorage.getItem("token");
            if (userToken) {
                navigate("/dashboard")
            } else {
                console.log("User is not valid")
                if (location.pathname !== "/register") {
                    navigate("/")
                }
            }
        }
        checkToken()
    }, [navigate])

    useEffect(() => {
        // Check if passwords match whenever password or confirmPassword changes
        setPasswordMatch(password === confirmPassword || confirmPassword === '');
    }, [password, confirmPassword]);

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const handleLogin = async () => {
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await sendEmailVerification(user);
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                name: "user",
                isLoggedIn: false,
                lastLogin: null
            });
            alert("Registration Success. Please verify your email.");
            signOut(auth);
            navigate("/");
        } catch (error: any) {
            console.log("Error msg: ", error.message)
            alert(error.message)
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4">
                <h3 className="card-title text-center mb-4">Register</h3>
                <form>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                            Email
                        </label>
                        <input
                            type="email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={handlePasswordChange}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={handleConfirmPasswordChange}
                            className={`form-control ${!passwordMatch ? 'is-invalid' : ''}`}
                        />
                        {!passwordMatch && (
                            <div className="invalid-feedback">
                                Passwords don't match
                            </div>
                        )}
                    </div>
                    <div className="text-center">
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={handleLogin}
                            disabled={!email || !password || !confirmPassword || !passwordMatch}
                        >
                            Register
                        </button>
                    </div>
                </form>
                <h3 className='d-flex justify-content-center align-items-center'><a href="/">Login</a></h3>
            </div>
        </div>
    );
};

export default Register;