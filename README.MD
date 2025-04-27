# Laohaldussüsteem

Terviklik laohaldussüsteem (Warehouse Management System), mis võimaldab:
- Klientide registreerimist ja autentimist
- Laoruumide otsimist ja broneerimist
- Tellimuste haldust ja maksete kinnitamist
- Transporditellimuste loomist ja haldust
- Arvete ja ettemaksuarvete genereerimist (PDF) ja saatmist e-maili teel
- Automaatseid meeldetuletusi ja tellimuste pikendamise võimalust
- Statistika ja aruannete vaatamist administraatoritele

---

## Tehnoloogiad

- **Backend**: Node.js, Express.js
- **Andmebaas**: PostgreSQL (Sequelize ORM)
- **Autentimine**: JWT (JSON Web Token)
- **Failide genereerimine**: PDFKit
- **E-posti saatmine**: Nodemailer
- **Dokumentatsioon**: Swagger (API /api-docs kaudu)

---

## Paigaldus ja käivitamine

1. **Klooni projekt**
```bash
git clone https://github.com/sinu-kasutajanimi/laohaldus-project.git
cd laohaldus-project/warehouse-backend
```

2. **Paigalda sõltuvused**
```bash
npm install
```

3. **.env fail**
.env fail asub Moodles 
```

4. **Käivita server**
```bash
node server.js
```

Server töötab aadressil:  
[http://localhost:5000](http://localhost:5000)

API dokumentatsioon on saadaval:  
[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

---

##  Projektistruktuur

```
warehouse-backend/
├── config/
├── controllers/
├── invoices/
├── middleware/
├── models/
├── preinvoices/
├── routes/
├── utils/
├── public/images/
├── .env
├── server.js
└── README.md
```

---

##  Autentimine ja rollid

- **Admin**: ligipääs kõikidele funktsioonidele
- **Tellimuste spetsialist**: kinnitab tellimusi
- **Transpordispetsialist**: kinnitab ja lõpetab transporditellimusi
- **Tavakasutaja**: haldab oma tellimusi ja profiili

---

##  Lisainfo

- **Swagger API** dokumentatsioon: `/api-docs`
- **Tellimuste arved ja ettemaksuarved** salvestatakse `/preinvoices/` ja `/invoices/` kaustadesse.
- **Pikendamise funktsionaalsus** on toetatud.
- **Automaatne meeldetuletuste ja transpordi loomine** on olemas `/api/orders/reminders` kaudu.

---

##  Autor

Projekt: **Laohaldus OÜ**  
Arendajad: [Kirill Zahharov; Dmitri Suhodol]

---

