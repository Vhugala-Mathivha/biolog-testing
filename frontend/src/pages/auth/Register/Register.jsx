import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../../services/api";

// This does NOT create a new employee — the employee record already exists
// (an Admin added it via RegisterEmployee.jsx). This page only lets an HR
// user attach a password to their existing record by proving they are who
// they say they are (employee number + ID number must match).
export default function Register() {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await registerUser({ employeeNumber, idNumber, password });
      // TODO: confirm this route once the HR pages exist (built by another
      // teammate). Spec says register should redirect to the HR dashboard.
      navigate("/hr/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="button" onClick = {() => navigate('/login')}>
        Back
      </button>

      <h1>Register</h1>
      <p>Enter your employee number and ID number to set up your password.</p>

      <label>
        Employee Number
        <input
          value={employeeNumber}
          onChange={(e) => setEmployeeNumber(e.target.value)}
          required
        />
      </label>

      <label>
        ID Number
        <input
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </label>

      <label>
        Confirm Password
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={8}
        />
      </label>

      {error && <p role="alert">{error}</p>}

      <a href="#">Scan Face ID</a>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
