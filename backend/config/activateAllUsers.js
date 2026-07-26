const User = require('../models/User');

/**
 * Automatically ensures all users in MongoDB Atlas have active status.
 */
const activateAllUsers = async () => {
  try {
    const result = await User.updateMany(
      { $or: [{ isActive: false }, { status: { $regex: /^inactive$/i } }, { isActive: { $exists: false } }] },
      { $set: { isActive: true, status: 'Active' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`✅ [MongoDB Account Audit] Activated ${result.modifiedCount} accounts in MongoDB Atlas.`);
    }
  } catch (err) {
    console.error('⚠️ [MongoDB Account Audit Error]:', err.message);
  }
};

module.exports = activateAllUsers;
