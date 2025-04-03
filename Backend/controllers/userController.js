const userService = require('../services/userService');
const { uploadAndCompress } = require('../config/multerConfig');

class UserController {
  // Get all users
  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const user = await userService.getUserById(req.params.userId);
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Create new user
  async createUser(req, res) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const user = await userService.updateUser(req.params.userId, req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.userId);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Update profile image
  async updateProfileImage(req, res) {
    try {
      uploadAndCompress('image')(req, res, async () => {
        const userId = req.params.userId;
        console.log('Received userId:', userId);
        if (!userId) {
          return res.status(400).json({ error: 'User ID is required' });
        }
        const user = await userService.updateProfileImage(userId, req.file);
        res.json(user);
      });
    } catch (error) {
      console.error('Error in updateProfileImage controller:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get user permissions
  async getUserPermissions(req, res) {
    try {
      const permissions = await userService.getUserPermissions(req.params.userId);
      res.json(permissions);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  // Forgot Password
  async forgotPassword(req, res) {
    try {
      console.log('Received forgot password request:', req.body);
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const result = await userService.forgotPassword(email);
      res.json(result);
    } catch (error) {
      console.error('Error in forgotPassword controller:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  }

  // Reset Password
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password } = req.body;
      const result = await userService.resetPassword(token, password);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Change Password
  async changePassword(req, res) {
    try {
      console.log('Change password request body:', req.body);
      console.log('User from token:', req.user);
      const { currentPassword, newPassword } = req.body;
      const result = await userService.changePassword(req.user.userId, currentPassword, newPassword);
      res.json(result);
    } catch (error) {
      console.error('Error in changePassword:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Get Reset Password Form
  async getResetPasswordForm(req, res) {
    try {
      const { token } = req.params;
      
      // Verify token exists and is valid
      const user = await userService.verifyResetToken(token);
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
      }

      // Send HTML form with token embedded as a data attribute
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Reset Password</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              max-width: 500px;
              margin: 50px auto;
              padding: 20px;
            }
            .form-group {
              margin-bottom: 15px;
            }
            label {
              display: block;
              margin-bottom: 5px;
            }
            input {
              width: 100%;
              padding: 8px;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            button {
              background-color: #4CAF50;
              color: white;
              padding: 10px 15px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            button:hover {
              background-color: #45a049;
            }
            .error {
              color: red;
              margin-top: 10px;
            }
          </style>
        </head>
        <body>
          <h2>Reset Password</h2>
          <form id="resetForm" data-token="${token}">
            <div class="form-group">
              <label for="password">New Password:</label>
              <input type="password" id="password" name="password" required>
            </div>
            <div class="form-group">
              <label for="confirmPassword">Confirm Password:</label>
              <input type="password" id="confirmPassword" name="confirmPassword" required>
            </div>
            <button type="submit">Reset Password</button>
          </form>
          <div id="message"></div>

          <script>
            document.getElementById('resetForm').addEventListener('submit', async (e) => {
              e.preventDefault();
              const password = document.getElementById('password').value;
              const confirmPassword = document.getElementById('confirmPassword').value;
              const messageDiv = document.getElementById('message');
              const token = document.getElementById('resetForm').getAttribute('data-token');

              if (password !== confirmPassword) {
                messageDiv.innerHTML = '<p class="error">Passwords do not match</p>';
                return;
              }

              try {
                const response = await fetch('/api/users/reset-password/' + token, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ password }),
                });

                const data = await response.json();
                if (response.ok) {
                  messageDiv.innerHTML = '<p style="color: green;">Password reset successful! You can now login with your new password.</p>';
                  document.getElementById('resetForm').style.display = 'none';
                } else {
                  messageDiv.innerHTML = '<p class="error">' + data.error + '</p>';
                }
              } catch (error) {
                messageDiv.innerHTML = '<p class="error">An error occurred. Please try again.</p>';
              }
            });
          </script>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Error in getResetPasswordForm:', error);
      res.status(500).json({ error: 'Failed to load reset password form' });
    }
  }
}

module.exports = new UserController(); 