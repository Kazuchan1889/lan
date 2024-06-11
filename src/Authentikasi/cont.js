const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const pool = require("../../db");
const queries = require("./queries");
const check = require("../../public");
const nodemailer = require("nodemailer");

const minutesValid = 5;
const otpStorage = {};
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASS,
  },
});

//login user. tidak memerlukan operation
const loginUser = async (req, res) => {
  const { email, password, mobile } = req.body;
  try {
    const { rows } = await pool.query(queries.login[0], [email]);

    if (rows.length === 1) {
      const user = rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      const date = new Date();
      date.setUTCHours(date.getUTCHours() + 7);
      const count = await pool.query(queries.login[1], [user.id, date]);
      const countValue = count.rows[0];
      // console.log(countValue);
      let result = "";
      const role = user.role;
      const jabatan = user.jabatan;
      const operation = user.operation;
      const status = countValue ? countValue.status : null;
      if (countValue) {
        switch (true) {
          case countValue.udahmasuk != null:
            result = "udahMasuk";
            break;
          case countValue.udahkeluar != null:
            result = "udahKeluar";
            break;
          default:
            // case countValue.status === "tanpa alasan":
            result = "belumMasuk";
            break;
          // result = "libur";
          // break;
        }
      } else result = "belumMasuk";
      if (isPasswordValid) {
        const accessToken = jwt.sign(
          {
            id: user.id,
            role: user.role,
            jabatan: user.jabatan,
            divisi: user.divisi,
            operation: user.operation,
            level: user.level,
          },
          process.env.SK,
          !mobile
            ? {
                expiresIn: "6000s",
              }
            : null
        );
        console.log(`${user.id} login`);
        console.log(result, role, jabatan, countValue, status);
        // const accessToken = ({id: user.id, role: user.role})
        res
          .status(200)
          .json({ accessToken, result, role, jabatan, operation, status });
      } else {
        res.status(404).send("Invalid credentials");
      }
    } else {
      res.status(404).send("Invalid credentials");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

//menambahkan user, need operation 'ADD_KARYAWAN'
const registerUser = async (req, res) => {
  if (check.checkOperation("ADD_KARYAWAN", req.userOperation, res)) return;
  const {
    nama,
    email,
    password,
    jabatan,
    role,
    status,
    operation,
    dob,
    nik,
    npwp,
    gender,
    level,
    lokasikerja,
    gaji,
    divisi,
    notelp,
  } = req.body;
  console.log(req.body);
  try {
    const result = await pool.query(queries.register[0], [email]);

    if (result.rowCount > 0) {
      return res.status(200).send(`sudah ada pengguna dengan email ${email}`);
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const addedUser = await pool.query(queries.register[1], [
        nama,
        email,
        hashedPassword,
        jabatan,
        role,
        status,
        operation,
        dob,
        nik,
        npwp,
        gender,
        level,
        lokasikerja,
        gaji,
        divisi,
        notelp,
      ]);
      check.saveAudit(
        req.userId,
        `menambahkan user baru dengan nama ${addedUser.rows[0].nama}`
      );
      return res.send("User registered successfully");
    }
  } catch (error) {
    return res.status(400).send(error.message);
  }
};

const ubahpassword = async (req, res) => {
  const { changepass, confirmpass } = req.body;
  try {
    const { rows } = await pool.query("select id from karyawan where id = $1", [
      req.userId,
    ]);

    if (rows.length === 1) {
      if (changepass != confirmpass)
        return res.status(200).json({
          message: "password dan confirm password tidak sama",
          bool: false,
        });
      else {
        const hashedPassword = await bcrypt.hash(changepass, 10);
        await pool.query("update karyawan set password = $1 where id= $2", [
          hashedPassword,
          rows.id,
        ]);
        return res
          .status(200)
          .json({ message: "password telah diganti", bool: true });
      }
    } else return res.status(401).send("user tidak ada");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const ubahPasswordOtp = async (req, res) => {
  const { email, changepass, confirmpass } = req.body;
  try {
    const { rows } = await pool.query(
      "select id from karyawan where email = $1",
      [email]
    );

    if (rows.length === 1) {
      if (changepass != confirmpass)
        return res.status(200).json({
          message: "password dan confirm password tidak sama",
          bool: false,
        });
      else {
        const hashedPassword = await bcrypt.hash(changepass, 10);
        await pool.query("update karyawan set password = $1 where id= $2", [
          hashedPassword,
          rows.id,
        ]);
        return res
          .status(200)
          .json({ message: "password telah diganti", bool: true });
      }
    } else
      return res.status(200).json({ message: "user tidak ada", bool: false });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const checkjawaban = async (req, res) => {
  const { password } = req.body;
  console.log(req.body);
  try {
    const { rows } = await pool.query(
      "select id, password from karyawan where id = $1",
      [req.userId]
    );
    const isPasswordValid = await bcrypt.compare(password, rows[0].password);
    if (!isPasswordValid)
      return res
        .status(200)
        .json({ message: "password tidak benar", bool: false });
    else return res.status(200).json({ message: "password benar", bool: true });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const generateOTP = async (req, res) => {
  const { email } = req.body;
  const checkEmail = await pool.query(
    "select id from karyawan where email = $1",
    [email]
  );
  if (checkEmail.rowCount === 0)
    return res
      .status(200)
      .json({ message: "email tersebut tidak terdaftar", bool: false });

  const otp = {
    otp: Math.floor(1000 + Math.random() * 9000).toString(),
    time: Date.now(),
  };

  const mailOption = JSON.parse(process.env.MAIL_OPTIONS);
  mailOption.to = email;
  mailOption.text = `Your OTP code is: ${otp.otp} \nvalid time ${minutesValid} minutes`;

  transporter.sendMail(mailOption, (error, info) => {
    if (error) {
      console.error(error);
      return res
        .status(200)
        .json({ message: "Error sending OTP via email", bool: false });
    } else {
      console.log("Email sent: " + info.response);

      // Store OTP
      otpStorage[email] = otp;

      return res.json({
        message: "OTP generated and sent via email successfully",
        bool: true,
      });
    }
  });
};

const checkOTP = async (req, res) => {
  const { email, otp } = req.body;
  const storedOTP = otpStorage[email];

  if (
    storedOTP &&
    storedOTP.otp === otp &&
    Date.now() - storedOTP.time <= minutesValid * 60 * 1000
  ) {
    delete otpStorage[email];
    const { rows } = await pool.query(
      "select id from karyawan where email = $1",
      [email]
    );

    return res
      .status(200)
      .json({ message: "OTP Valid", bool: true, id: rows.id });
  } else
    return res.status(200).json({ message: "OTP tidak Valid", bool: false });
};

const checkAT = (req, res) => {
  return res.status(200).send("token valid");
};

const getAllOperation = (req, res) => {
  pool.query("select * from operation order by operation", (err, result) => {
    if (err) console.log(err);
    return res.status(200).json(result.rows);
  });
};

const controllOperation = async () => {
  const result = await pool.query("select operation from operation");

  console.log(result.rows);
};

module.exports = {
  generateOTP,
  checkOTP,
  registerUser,
  loginUser,
  checkjawaban,
  ubahpassword,
  ubahPasswordOtp,
  getAllOperation,
  checkAT,
};
