async function login() {
  const params = new URLSearchParams()
  params.append("username", "admin@example.com")
  params.append("password", "changethis")

  try {
    const response = await fetch(
      "http://localhost:8000/api/v1/login/access-token",
      {
        method: "POST",
        body: params,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      console.log("Login Successful!")
      console.log("Access Token:", data.access_token)
    } else {
      console.error("Login Failed:", response.status, response.statusText)
      const text = await response.text()
      console.error("Response:", text)
    }
  } catch (error) {
    console.error("Error during login:", error)
  }
}

login()
