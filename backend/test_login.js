async function testLogin() {
  try {
    const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@storerating.com',
        password: 'Admin@123'
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log("Login Success! Token:", data.token.substring(0, 20) + "...");
    } else {
      console.error("Login Failed:", data);
    }
  } catch (err) {
    console.error("Request Failed:", err.message);
  }
}

testLogin();
