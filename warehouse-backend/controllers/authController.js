const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Client } = require('../models'); // kasutame index.js kaudu
require('dotenv').config();

exports.register = async (req, res) => {
  console.log("REGISTRI SISEND:", req.body);

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    role = "user",
    isBusiness,
    companyName,
    registrationCode,
    businessEmail,
    accountNumber,
    vatNumber,
    address,
    city,
    region,
    country,
    postalCode,
    doorNumber,
    comments
  } = req.body;

  try {
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Puuduvad vajalikud väljad" });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "E-mail on juba kasutusel" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = `${firstName} ${lastName}`;

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      phone
    });

    if (role === 'user') {
      await Client.create({
        userId: user.id,
        clientName: companyName || `${firstName} ${lastName}`,
        firstName,
        lastName,
        phone,
        email,
        isBusiness,
        companyName,
        registrationCode,
        businessEmail,
        accountNumber,
        vatNumber,
        address,
        city,
        region,
        country,
        postalCode,
        loadingDock: doorNumber || '',
        comment: comments || ''
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      message: 'Kasutaja registreeritud',
      userId: user.id,
      token,
      user: {
        id: user.id,
        role: user.role,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("❌ Kasutajat ei leitud");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Vale parool");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log("✅ Kasutaja leitud:", user.toJSON());

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log("✅ Token loodud:", token);

    res.json({
      token,
      user: {
        id: user.id,
        role: user.role,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error("❌ Login viga:", err);
    res.status(500).json({ error: err.message });
  }
};
