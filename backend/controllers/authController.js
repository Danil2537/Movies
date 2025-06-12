const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

exports.register = async (req, res) => {
  const { email, name, password, confirmPassword } = req.body;
  if (password !== confirmPassword)
    return res.status(400).json({ error: 'Passwords do not match' });

  const existing = await User.findOne({ where: { email } });
  if (existing) return res.status(400).json({ error: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, password: hashedPassword });

  const token = createToken(user);
  res.status(200).json({ token, status: 1 });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = createToken(user);
  res.status(200).json({ token, status: 1 });
};
