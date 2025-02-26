import { signOut, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';
import { useEffect, useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = () => {
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [lastLogin, setLastLogin] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkToken = () => {
      const userToken = localStorage.getItem("token");
      if (userToken) {
        console.log("User is valid");
      } else {
        console.log("User is not valid");
        navigate("/");
      }
    };
    checkToken();
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsVerified(currentUser.emailVerified);

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name);
          setEmail(userData.email);
          setLastLogin(userData.lastLogin?.toDate().toString() || '');
        }
      } else {
        setUser(null);
        setIsVerified(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleUpdate = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          name: name
        });
        alert("Name updated successfully.");
        setIsEditing(false);
      } catch (error: any) {
        console.log("Error msg: ", error.message);
        alert(error.message);
      }
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      navigate("/");
    } catch (error: any) {
      console.log("Error msg: ", error.message);
      alert(error.message);
    }
  };

  const handleResendVerification = async () => {
    if (user) {
      try {
        await sendEmailVerification(user);
        alert("Verification email sent.");
      } catch (error: any) {
        console.log("Error msg: ", error.message);
        alert(error.message);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Dashboard</h1>
      {isVerified ? (
        <div className="card p-4">
          <div className="mb-3">
            <label className="form-label">Name:</label>
            <p className="form-control-plaintext d-inline">{name}</p>
            <button className="btn btn-link" onClick={() => setIsEditing(true)}>Edit</button>
          </div>
          <div className="mb-3">
            <label className="form-label">Email:</label>
            <p className="form-control-plaintext">{email}</p>
          </div>
          <div className="mb-3">
            <label className="form-label">Last Login:</label>
            <p className="form-control-plaintext">{lastLogin}</p>
          </div>
        </div>
      ) : (
        <div className="card p-4">
          <div className="alert alert-warning" role="alert">
            Please verify your email first
          </div>
          <button className="btn btn-secondary" onClick={handleResendVerification}>Resend Verification Email</button>
        </div>
      )}
      <div className="text-center mt-4">
        <button className="btn btn-danger" onClick={logoutUser}>Logout</button>
      </div>

      {isEditing && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Name</h5>
                <button type="button" className="btn-close" onClick={() => setIsEditing(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Name:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={handleNameChange}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Close</button>
                <button type="button" className="btn btn-primary" onClick={handleUpdate}>Save changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;