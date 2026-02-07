import { useState } from "react";
import { loginApi } from "../api";

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await loginApi({ email, password });
    if (res.token) {
      setToken(res.token);
      alert("Login Success");
    } else {
      alert(res.message);
    }
  };

  return (
    <div>
      <h3>Login</h3>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  );
}
