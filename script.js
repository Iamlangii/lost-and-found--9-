document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const loginButton = document.getElementById("loginButton")
  const errorMessage = document.getElementById("errorMessage")
  const emailInput = document.getElementById("email")
  const passwordInput = document.getElementById("password")
  const registrationSuccess = document.getElementById("registrationSuccess")
  const togglePasswordButton = document.querySelector(".toggle-password")

  // Check if user just registered
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("registered") === "true") {
    registrationSuccess.style.display = "flex"

    // Get email from localStorage if available
    const userEmail = localStorage.getItem("userEmail")
    if (userEmail) {
      emailInput.value = userEmail
      passwordInput.focus()
    }

    // Hide success message after 5 seconds
    setTimeout(() => {
      registrationSuccess.style.display = "none"
    }, 5000)
  } else {
    registrationSuccess.style.display = "none"
  }

  // Toggle password visibility
  togglePasswordButton.addEventListener("click", function () {
    const targetId = this.getAttribute("data-target")
    const targetInput = document.getElementById(targetId)

    if (targetInput.type === "password") {
      targetInput.type = "text"
      this.classList.remove("fa-eye-slash")
      this.classList.add("fa-eye")
    } else {
      targetInput.type = "password"
      this.classList.remove("fa-eye")
      this.classList.add("fa-eye-slash")
    }
  })

  // Form submission handler
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault()

    // Clear previous error
    errorMessage.textContent = ""
    errorMessage.classList.remove("visible")

    // Get form values
    const email = emailInput.value.trim()
    const password = passwordInput.value.trim()

    // Validate form
    if (!email || !password) {
      showError("Please fill in all fields")
      return
    }

    // Email validation
    if (!isValidEmail(email)) {
      showError("Please enter a valid email address")
      return
    }

    // Show loading state
    setLoading(true)

    // Simulate API call (replace with actual authentication)
    setTimeout(() => {
      // For demo purposes, let's consider login successful
      // In a real application, you would verify credentials with a server

      // Simulate successful login
      setLoading(false)
      window.location.href = "dashboard.html" // Redirect to dashboard

      // If you want to simulate a failed login instead, uncomment this:
      // setLoading(false);
      // showError('Invalid email or password');
    }, 1500)
  })

  // Helper functions
  function showError(message) {
    errorMessage.textContent = message
    errorMessage.classList.add("visible")
  }

  function setLoading(isLoading) {
    if (isLoading) {
      loginButton.disabled = true
      loginButton.classList.add("loading")
      loginButton.textContent = "Signing in..."
    } else {
      loginButton.disabled = false
      loginButton.classList.remove("loading")
      loginButton.textContent = "Sign in"
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
})

