// testUserCreation.cjs
const User = require('./models/user.cjs');

async function testUserCreation() {
  try {
    const newUser = await User.create({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securepassword',
    });
    console.log('User created:', newUser);
  } catch (error) {
    console.error('Error creating user:', error);
  }
}

testUserCreation();