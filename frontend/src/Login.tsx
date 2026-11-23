import { useState } from 'react'
import './Travel.css'
import { useNavigate } from 'react-router-dom';
import './types/resturant'
export default function Login() {

  const [usernameText, setUsernameText] = useState('');
  const [passwordText, setPasswordText] = useState('');

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();


  const handleLoginClick = async () => {

    //alert(usernameText + passwordText);
    handleLoginRequest();
    
  }




 

  const handleLoginRequest = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const response = await fetch("http://localhost:5062/Auth/Login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username: usernameText, password: passwordText }),
        credentials: "include"
      });

      if (response.ok) {
        alert("Login successful");
        navigate('/main');

      } else {
        alert("Login failed");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };
    







    /*cpnst response = await fetch("http://localhost:5062/Auth/Login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // ✅ for cookies
      body: JSON.stringify({ usernameText, passwordText }),
    });

    if (response.ok) {
      // ✅ Login successful (status 200–299)
      alert("Login successful!");
      //navigate("/search"); // or whatever route you want
    } else if (response.status === 401) {
      // Unauthorized
      alert("Invalid username or password.");
    } else {
      // Other errors
      alert(`Login failed. Status: ${response.status}`);
    }*/

  





    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-white p-6 rounded shadow w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-4">Login</h1>
          <input type="text" placeholder="Username" onChange={(e) => setUsernameText(e.target.value)} className="w-full mb-2 p-2 border rounded" />
          <input type="password" placeholder="Password" onChange={(e) => setPasswordText(e.target.value)} className="w-full mb-4 p-2 border rounded" />
          <button 
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            onClick={handleLoginClick }
            disabled={loading}
          >
              {loading ? (
              <>
                
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </div>
      </div>
    );
}