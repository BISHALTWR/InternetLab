import React, { useState, ChangeEvent, useEffect } from 'react';
import { auth, db } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface LoginProps { }

const Login: React.FC<LoginProps> = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkToken = () => {
      const userToken = localStorage.getItem("token");
      if (userToken) {
        navigate("/dashboard");
      } else {
        console.log("User is not valid");
        if (location.pathname === "/") {
          navigate("/");
        }
      }
    };
    checkToken();
  }, [navigate, location.pathname]);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLogin = async () => {
    try {
      const data: any = await signInWithEmailAndPassword(auth, email, password);
      const userToken: string = await data?.user?.accessToken;
      localStorage.setItem("token", userToken);

      const userDoc = await getDoc(doc(db, "users", data.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem("name", userData.name);
      }

      await updateDoc(doc(db, "users", data.user.uid), {
        isLoggedIn: true,
        lastLogin: serverTimestamp()
      });

      alert("Login Successful");
      navigate("/dashboard");
    } catch (error: any) {
      console.log("Error msg: ", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4">
        <h3 className="card-title text-center mb-4">Login</h3>
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
          <div className="text-center">
            <button type="button" className="btn btn-primary" onClick={handleLogin}>
              Login
            </button>
          </div>
          <h3 className='d-flex justify-content-center align-items-center'><a href="/register">Register</a></h3>
        </form>
      </div>
    </div>
  );
};

export default Login;