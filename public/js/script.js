document.addEventListener("DOMContentLoaded", async () => {
  // Declare API variable (assuming it's a global object or imported)
  const API = window.API || {} // Example: Assuming API is a global object

  // Check if user is authenticated
  let isAuthenticated = false
  let currentUser = null

  try {
    const authCheck = await API.auth.checkAuth()
    isAuthenticated = authCheck.isAuthenticated

    if (isAuthenticated) {
      const userData = await API.auth.getCurrentUser()
      currentUser = userData.user
    }
  } catch (error) {
    console.error("Authentication check error:", error)
  }

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
  if (togglePasswordButton) {
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
  }

  // Form submission handler
  if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
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

      try {
        // Attempt to login
        const response = await API.auth.login({ email, password })

        // Redirect to dashboard on success
        window.location.href = "dashboard.html"
      } catch (error) {
        showError(error.message || "Invalid email or password")
        setLoading(false)
      }
    })
  }

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

  // Handle logout
  const logoutButtons = document.querySelectorAll(".logout-btn")
  if (logoutButtons.length > 0) {
    logoutButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        e.preventDefault()

        try {
          await API.auth.logout()
          window.location.href = "index.html"
        } catch (error) {
          console.error("Logout error:", error)
          alert("Failed to log out. Please try again.")
        }
      })
    })
  }

  // Update UI based on authentication state
  updateAuthUI(isAuthenticated, currentUser)
})

// Update UI elements based on authentication state
function updateAuthUI(isAuthenticated, user) {
  const loginButtons = document.querySelectorAll(".login-btn, .header-login-btn")
  const logoutButtons = document.querySelectorAll(".logout-btn")
  const userProfile = document.querySelector(".user-profile")
  const welcomeMessage = document.querySelector(".welcome-message")

  if (isAuthenticated && user) {
    // User is logged in
    loginButtons.forEach((btn) => (btn.style.display = "none"))
    logoutButtons.forEach((btn) => (btn.style.display = "flex"))

    if (userProfile) {
      userProfile.style.display = "flex"
      const userImage = userProfile.querySelector("img")
      const userName = userProfile.querySelector("span")

      if (userImage && user.profilePicture) {
        userImage.src = user.profilePicture
      }

      if (userName) {
        userName.textContent = `${user.firstName} ${user.lastName}`
      }
    }

    if (welcomeMessage) {
      welcomeMessage.textContent = `Welcome back, ${user.firstName}! Here's what's happening with your lost and found items.`
    }
  } else {
    // User is logged out
    loginButtons.forEach((btn) => (btn.style.display = "flex"))
    logoutButtons.forEach((btn) => (btn.style.display = "none"))

    if (userProfile) {
      userProfile.style.display = "none"
    }

    if (welcomeMessage) {
      welcomeMessage.textContent = "Welcome to Lost & Found! Sign in to report or find lost items."
    }
  }
}

