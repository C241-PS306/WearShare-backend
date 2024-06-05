// models/userModel.js
const db = require('../database/firestore');

class User {
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password;
  }

  static async createUser(username, email, password) {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (doc.exists) {
      throw new Error('User already exists');
    }

    await userRef.set({
      username,
      email,
      password
    });

    return new User(username, email, password);
  }

  static async getUserByEmail(email) {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      return null;
    }

    const userData = doc.data();
    console.log('Fetched user data:', userData);

    return new User(userData.username, userData.email, userData.password);
  }
}

module.exports = User;

