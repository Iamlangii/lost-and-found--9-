document.addEventListener("DOMContentLoaded", () => {
  // Tab navigation
  const profileMenuLinks = document.querySelectorAll(".profile-menu a")
  const profileSections = document.querySelectorAll(".profile-section")

  profileMenuLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      // Remove active class from all links
      profileMenuLinks.forEach((link) => link.classList.remove("active"))

      // Add active class to clicked link
      this.classList.add("active")

      // Hide all sections
      profileSections.forEach((section) => section.classList.remove("active"))

      // Show the target section
      const targetId = this.getAttribute("href").substring(1)
      document.getElementById(targetId).classList.add("active")
    })
  })

  // Edit Personal Information
  const editPersonalInfoBtn = document.getElementById("editPersonalInfoBtn")
  const cancelPersonalInfoBtn = document.getElementById("cancelPersonalInfoBtn")
  const personalInfoForm = document.getElementById("personalInfoForm")
  const formInputs = personalInfoForm.querySelectorAll("input")
  const formActions = personalInfoForm.querySelector(".form-actions")

  editPersonalInfoBtn.addEventListener("click", () => {
    // Enable form inputs
    formInputs.forEach((input) => (input.disabled = false))

    // Show form actions
    formActions.style.display = "flex"

    // Hide edit button
    editPersonalInfoBtn.style.display = "none"
  })

  cancelPersonalInfoBtn.addEventListener("click", () => {
    // Disable form inputs
    formInputs.forEach((input) => (input.disabled = true))

    // Hide form actions
    formActions.style.display = "none"

    // Show edit button
    editPersonalInfoBtn.style.display = "block"

    // Reset form to original values
    personalInfoForm.reset()
  })

  personalInfoForm.addEventListener("submit", function (e) {
    e.preventDefault()

    // In a real application, you would send the form data to a server
    // For demo purposes, we'll just simulate a successful update

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'

    setTimeout(() => {
      // Disable form inputs
      formInputs.forEach((input) => (input.disabled = true))

      // Hide form actions
      formActions.style.display = "none"

      // Show edit button
      editPersonalInfoBtn.style.display = "block"

      // Reset submit button
      submitBtn.disabled = false
      submitBtn.textContent = "Save Changes"

      // Show success message
      alert("Personal information updated successfully!")
    }, 1500)
  })

  // Change Password Modal
  const changePasswordBtn = document.getElementById("changePasswordBtn")
  const changePasswordModal = document.getElementById("changePasswordModal")
  const closeModalButtons = document.querySelectorAll(".close-modal")
  const cancelButtons = document.querySelectorAll(".cancel-btn")
  const changePasswordForm = document.getElementById("changePasswordForm")
  const newPasswordInput = document.getElementById("newPassword")
  const confirmNewPasswordInput = document.getElementById("confirmNewPassword")
  const strengthMeter = document.getElementById("strengthMeter")
  const strengthText = document.getElementById("strengthText")
  const passwordMatch = document.getElementById("passwordMatch")
  const togglePasswordButtons = document.querySelectorAll(".toggle-password")

  // Open Change Password Modal
  changePasswordBtn.addEventListener("click", () => {
    changePasswordModal.style.display = "block"
    document.body.style.overflow = "hidden" // Prevent scrolling
  })

  // Close modals when clicking the X button
  closeModalButtons.forEach((button) => {
    button.addEventListener("click", () => {
      changePasswordModal.style.display = "none"
      document.body.style.overflow = "auto" // Re-enable scrolling
    })
  })

  // Close modals when clicking the Cancel button
  cancelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      changePasswordModal.style.display = "none"
      document.body.style.overflow = "auto" // Re-enable scrolling
    })
  })

  // Close modals when clicking outside the modal content
  window.addEventListener("click", (event) => {
    if (event.target === changePasswordModal) {
      changePasswordModal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  })

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
  newPasswordInput.addEventListener("input", function () {
    const password = this.value
    const strength = checkPasswordStrength(password)

    // Update strength meter
    strengthMeter.style.width = strength.score * 25 + "%"
    strengthMeter.style.backgroundColor = strength.color
    strengthText.textContent = strength.text
    strengthText.style.color = strength.color

    // Check if passwords match
    if (confirmNewPasswordInput.value) {
      checkPasswordsMatch()
    }
  })

  // Check if passwords match
  confirmNewPasswordInput.addEventListener("input", checkPasswordsMatch)

  function checkPasswordsMatch() {
    const password = newPasswordInput.value
    const confirmPassword = confirmNewPasswordInput.value

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

  // Form submission for Change Password
  changePasswordForm.addEventListener("submit", function (e) {
    e.preventDefault()

    // Get form values
    const currentPassword = document.getElementById("currentPassword").value
    const newPassword = newPasswordInput.value
    const confirmNewPassword = confirmNewPasswordInput.value

    // Validate form
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert("Please fill in all fields")
      return
    }

    // Password validation
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters long")
      return
    }

    // Password match validation
    if (newPassword !== confirmNewPassword) {
      alert("Passwords do not match")
      return
    }

    // Show loading state
    const submitBtn = this.querySelector('button[type="submit"]')
    submitBtn.disabled = true
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...'

    // In a real application, you would send this data to a server
    // For demo purposes, we'll just simulate a successful update
    setTimeout(() => {
      // Close modal
      changePasswordModal.style.display = "none"
      document.body.style.overflow = "auto"

      // Reset form
      changePasswordForm.reset()

      // Reset submit button
      submitBtn.disabled = false
      submitBtn.textContent = "Update Password"

      // Show success message
      alert("Password updated successfully!")
    }, 1500)
  })

  // Connect Find Items and Report Item links to modals in dashboard
  const findItemsLink = document.getElementById("findItemsLink")
  const reportItemLink = document.getElementById("reportItemLink")

  findItemsLink.addEventListener("click", (e) => {
    e.preventDefault()
    window.location.href = "dashboard.html?modal=find"
  })

  reportItemLink.addEventListener("click", (e) => {
    e.preventDefault()
    window.location.href = "dashboard.html?modal=report"
  })
})

