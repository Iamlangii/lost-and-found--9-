document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm")
  const signupButton = document.getElementById("signupButton")
  const errorMessage = document.getElementById("errorMessage")
  const passwordInput = document.getElementById("password")
  const confirmPasswordInput = document.getElementById("confirmPassword")
  const strengthMeter = document.getElementById("strengthMeter")
  const strengthText = document.getElementById("strengthText")
  const passwordMatch = document.getElementById("passwordMatch")
  const togglePasswordButtons = document.querySelectorAll(".toggle-password")

  // Toggle password visibility
  togglePasswordButtons.forEach((button) => {
    button.addEventListener("click", function () {
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
  })

  // Check password strength
  passwordInput.addEventListener("input", function () {
    const password = this.value
    const strength = checkPasswordStrength(password)

    // Update strength meter
    strengthMeter.style.width = strength.score * 25 + "%"
    strengthMeter.style.backgroundColor = strength.color
    strengthText.textContent = strength.text
    strengthText.style.color = strength.color

    // Check if passwords match
    if (confirmPasswordInput.value) {
      checkPasswordsMatch()
    }
  })

  // Check if passwords match
  confirmPasswordInput.addEventListener("input", checkPasswordsMatch)

  function checkPasswordsMatch() {
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value

    if (!confirmPassword) {
      passwordMatch.textContent = ""
      passwordMatch.className = ""
      return
    }

    if (password === confirmPassword) {
      passwordMatch.textContent = "Passwords match"
      passwordMatch.className = "match-success"
    } else {
      passwordMatch.textContent = "Passwords do not match"
      passwordMatch.className = "match-error"
    }
  }

  // Check password strength
  function checkPasswordStrength(password) {
    // Default values
    let score = 0
    let color = "#e5e7eb"
    let text = "Password strength"

    if (!password) {
      return { score, color, text }
    }

    // Length check
    if (password.length >= 8) {
      score += 1
    }

    // Complexity checks
    if (/[A-Z]/.test(password)) {
      score += 1
    }

    if (/[0-9]/.test(password)) {
      score += 1
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1
    }

    // Set color and text based on score
    switch (score) {
      case 0:
      case 1:
        color = "#ef4444" // Red
        text = "Weak"
        break
      case 2:
        color = "#f59e0b" // Orange
        text = "Fair"
        break
      case 3:
        color = "#10b981" // Green
        text = "Good"
        break
      case 4:
        color = "#059669" // Dark green
        text = "Strong"
        break
    }

    return { score, color, text }
  }

  // Form submission
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault()

    // Clear previous error
    errorMessage.textContent = ""
    errorMessage.classList.remove("visible")

    // Get form values
    const firstName = document.getElementById("firstName").value.trim()
    const lastName = document.getElementById("lastName").value.trim()
    const email = document.getElementById("email").value.trim()
    const password = passwordInput.value
    const confirmPassword = confirmPasswordInput.value
    const termsAgreement = document.getElementById("termsAgreement").checked

    // Validate form
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showError("Please fill in all fields")
      return
    }

    // Email validation
    if (!isValidEmail(email)) {
      showError("Please enter a valid email address")
      return
    }

    // Password validation
    if (password.length < 8) {
      showError("Password must be at least 8 characters long")
      return
    }

    // Password match validation
    if (password !== confirmPassword) {
      showError("Passwords do not match")
      return
    }

    // Terms agreement validation
    if (!termsAgreement) {
      showError("You must agree to the Terms of Service and Privacy Policy")
      return
    }

    // Show loading state
    setLoading(true)

    // Simulate API call (replace with actual registration)
    setTimeout(() => {
      // For demo purposes, let's consider registration successful
      // In a real application, you would send the data to a server

      // Simulate successful registration
      setLoading(false)

      // Store email in localStorage for demo purposes
      localStorage.setItem("userEmail", email)

      // Redirect to login page
      window.location.href = "index.html?registered=true"

      // If you want to simulate a failed registration instead, uncomment this:
      // setLoading(false);
      // showError('This email is already registered');
    }, 1500)
  })

  // Helper functions
  function showError(message) {
    errorMessage.textContent = message
    errorMessage.classList.add("visible")
  }

  function setLoading(isLoading) {
    if (isLoading) {
      signupButton.disabled = true
      signupButton.classList.add("loading")
      signupButton.textContent = "Creating Account..."
    } else {
      signupButton.disabled = false
      signupButton.classList.remove("loading")
      signupButton.textContent = "Create Account"
    }
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Check if user was redirected from login page
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get("signup") === "true") {
    // Focus on first name field
    document.getElementById("firstName").focus()
  }
})

