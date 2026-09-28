export const login = (req, res) => {
  const { email, password } = req.body;

  // Simple prototype login check
  if (email && password) {
    return res.json({
      success: true,
      message: "Login successful",
      token: "mock-jwt-token-12345",
      user: {
        id: 1,
        name: "Admin User",
        email: email || "admin@mplad.gov.in",
        role: "Administrator"
      }
    });
  }

  return res.status(400).json({
    success: false,
    message: "Email and password are required"
  });
};

export const getMe = (req, res) => {
  return res.json({
    success: true,
    user: {
      id: 1,
      name: "Admin User",
      email: "admin@mplad.gov.in",
      role: "Administrator"
    }
  });
};
