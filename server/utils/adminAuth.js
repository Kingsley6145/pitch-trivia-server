const { auth } = require('../firebase/admin');

const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [
  'Games@pitchtrivia.com',
  'games@pitchtrivia.com',
];

/**
 * Verify if a user is an admin
 */
async function verifyAdmin(token) {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const email = decodedToken.email?.toLowerCase();
    
    const isAdmin = ADMIN_EMAILS.some(
      (adminEmail) => adminEmail.toLowerCase() === email
    ) || decodedToken.admin === true;

    if (!isAdmin) {
      throw new Error('Unauthorized: Admin access required');
    }

    return decodedToken;
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

/**
 * Middleware to protect admin routes
 */
async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await verifyAdmin(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
}

module.exports = { verifyAdmin, requireAdmin };

