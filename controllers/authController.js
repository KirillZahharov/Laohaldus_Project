// Impordime vajalikud teegid ja mudelid
const bcrypt = require('bcryptjs'); // Paroolide räsi jaoks
const jwt = require('jsonwebtoken'); // JSON Web Tokenite jaoks
const { User, Client } = require('../models'); // Kasutame mudelid, mis laetakse index.js kaudu
require('dotenv').config(); // Laeme keskkonnamuutujad (.env failist)

// Kasutaja registreerimise funktsioon
exports.register = async (req, res) => {
  console.log("REGISTRI SISEND:", req.body);

  // Võtame body'st vajalikud väljad välja
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    role = "user", // Vaikimisi rolliks määrame "user"
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
    // Kontrollime, et kohustuslikud väljad oleksid olemas
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: "Puuduvad vajalikud väljad" });
    }

    // Kontrollime, kas kasutaja e-mail on juba süsteemis olemas
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "E-mail on juba kasutusel" });
    }

    // Krüpteerime kasutaja parooli
    const hashedPassword = await bcrypt.hash(password, 10);
    // Loome kasutajanime firstName + lastName alusel
    const username = `${firstName} ${lastName}`;

    // Loome uue kasutaja andmebaasi
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      phone
    });

    // Kui kasutaja roll on 'user', loome ka seotud kliendiandmed Client tabelisse
    if (role === 'user') {
      await Client.create({
        userId: user.id, // Seome kliendi loodud kasutajaga
        clientName: companyName || `${firstName} ${lastName}`, // Kui ettevõtte nimi puudub, kasutame isiku nime
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
        loadingDock: doorNumber || '', // Kui ukse number puudub, paneme tühjaks
        comment: comments || '' // Kui kommentaar puudub, paneme tühjaks
      });
    }

    // Loome JWT tokeni, mis kehtib 1 päeva
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Tagastame vastuse koos loodud kasutaja andmetega ja tokeniga
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

// Kasutaja sisselogimise funktsioon
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Otsime kasutaja e-maili järgi
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("Kasutajat ei leitud");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Võrdleme sisestatud parooli andmebaasis oleva räsi vastu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Vale parool");
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log("Kasutaja leitud:", user.toJSON());

    // Loome JWT tokeni edukalt autentitud kasutajale
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    console.log("Token loodud:", token);

    // Tagastame tokeni ja kasutaja põhiandmed
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
    console.error("Login viga:", err);
    res.status(500).json({ error: err.message });
  }
};
