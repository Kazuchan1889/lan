const pool = require("./db");

//var tunjangan
let tunjanganTransport = 500000;
let tunjanganKehadiran = 0;
let tunjanganKerajinan = 500000;
const totalTunjangan =
  tunjanganKehadiran + tunjanganTransport + tunjanganKerajinan;

let AbsensiHoliday = [];

let jamMasuk = {
  jam: 8,
  menit: 30,
};
let jamKeluar = {
  jam: 17,
  menit: 30,
};
let toleransiMasuk = 30;

let hariKerja = 22;

let stringCalculation = `((TT+TK) / 22) * CA +
(TK / 22) *
  ((CTL + CLT) / 2)`;

const calVariable = [
  "TT=tunjanganTransport",
  "TK=tunjanganKehadiran",
  "TR=tunjanganKerajinan",
  "TOT=totalTunjangan",
];

const allowedChars = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  " ",
  "-",
  "+",
  "/",
  "*",
  "TK",
  "TT",
  "TR",
  "GP",
  "JA",
  "JI",
  "JS",
  "JT",
  "JL",
];

//var absensi

function isStringAllowed(inputString) {
  // Create a regular expression pattern that matches any character not in the allowedChars array
  const pattern = new RegExp(`[^${allowedChars.join("")}]`);
  // const string = changeStringCalculation(inputString);
  const result = evaluateExpression(inputString);
  // console.log(!pattern.test(inputString));
  if (result === null) {
    console.log("formula gk valid");
    return false;
  }
  // Test the inputString against the pattern
  return !pattern.test(inputString);
}
function evaluateExpression(expression) {
  const GP = 100;
  const TT = 1;
  const TR = 1;
  const TK = 1;
  const JA = 1;
  const JI = 1;
  const JS = 1;
  const JT = 1;
  const JL = 1;
  try {
    const result = eval(expression);
    return result;
  } catch (error) {
    // Handle the error, e.g., invalid expression
    console.error("Error evaluating expression:", error.message);
    return null;
  }
}
function changeStringCalculation(string) {
  let endString = string;
  for (const item of calVariable) {
    const val = item.split("=");
    endString = endString.split(val[0]).join(val[1]);
    console.log(endString);
  }
  return endString;
}
async function calculationPotongan(noFormulaId, value, input, formulaId) {
  const { GP, JA, JI, JS, JT, JL } = value;

  const calculate = {
    alpha: null,
    izin: null,
    sakit: null,
    telat: null,
    laporan: null,
  };

  let TK = 0;
  let TT = 0;
  let TR = 0;
  const inputControl = {
    bonus: parseInt(input.bonus, 10),
    bpjs: parseInt(input.bpjs, 10),
    bjps: parseInt(input.bjps, 10),
    ph21: parseInt(input.ph21, 10),
    kasbon: parseInt(input.kasbon, 10),
  };
  if (!formulaId) {
    const { rumusAlpha, rumusIzin, rumusSakit, rumusTelat, rumusLaporan } =
      noFormulaId;

    TK = noFormulaId.TK;
    TT = noFormulaId.TT;
    TR = noFormulaId.TR;

    calculate.alpha = rumusAlpha;
    calculate.sakit = rumusSakit;
    calculate.izin = rumusIzin;
    calculate.telat = rumusTelat;
    calculate.laporan = rumusLaporan;
  } else {
    const { rows } = await pool.query(
      `select
    tunjangan_kehadiran as "TK",
    tunjangan_transport as "TT",
    tunjangan_kerajinan as "TR",
    rumus_alpha as "alpha",
    rumus_izin as "izin",
    rumus_sakit as "sakit",
    rumus_telat as "telat",
    rumus_laporan as "laporan"
    from formula
    where id = $1
    `,
      [formulaId]
    );
    // console.log(formulaId, rows);
    TK = rows[0].TK;
    TT = rows[0].TT;
    TR = rows[0].TR;

    calculate.alpha = rows[0].alpha;
    calculate.sakit = rows[0].sakit;
    calculate.izin = rows[0].izin;
    calculate.telat = rows[0].telat;
    calculate.laporan = rows[0].laporan;
  }
  const sanitizedRumusAlpha = calculate.alpha
    ? "(" + calculate.alpha + ")"
    : "0";
  const sanitizedRumusIzin = calculate.izin ? "(" + calculate.izin + ")" : "0";
  const sanitizedRumusSakit = calculate.sakit
    ? "(" + calculate.sakit + ")"
    : "0";
  const sanitizedRumusTelat = calculate.telat
    ? "(" + calculate.telat + ")"
    : "0";
  const sanitizedRumusLaporan = calculate.laporan
    ? "(" + calculate.laporan + ")"
    : "0";

  // Construct the string
  const string =
    sanitizedRumusAlpha +
    " + " +
    sanitizedRumusIzin +
    " + " +
    sanitizedRumusSakit +
    " + " +
    sanitizedRumusTelat +
    " + " +
    sanitizedRumusLaporan;

  const result = eval(string);

  // console.log(result);
  return {
    jumlah:
      Math.round(result) +
      (input.bjps + input.ph21 + input.kasbon - input.bonus),
    rumus: {
      TK: TK,
      TT: TT,
      TR: TR,
      TOT: TK + TT + TT,
      alpha: sanitizedRumusAlpha,
      izin: sanitizedRumusIzin,
      sakit: sanitizedRumusSakit,
      telat: sanitizedRumusTelat,
      laporan: sanitizedRumusLaporan,
    },
    detail: {
      alpha: Math.round(eval(sanitizedRumusAlpha)),
      izin: Math.round(eval(sanitizedRumusIzin)),
      sakit: Math.round(eval(sanitizedRumusSakit)),
      telat: Math.round(eval(sanitizedRumusTelat)),
      laporan: Math.round(eval(sanitizedRumusLaporan)),
      potonganPelanggaran: Math.round(result),
    },
    value: {
      gaji: GP,
      alpha: JA,
      izin: JI,
      sakit: JS,
      telat: JT,
      laporan: JL,
    },
    input: {
      bonus: inputControl.bonus ? inputControl.bonus : 0,
      bpjs: inputControl.bpjs ? inputControl.bpjs : 0,
      bjps: inputControl.bjps ? inputControl.bjps : 0,
      ph21: inputControl.ph21 ? inputControl.ph21 : 0,
      kasbon: inputControl.kasbon ? inputControl.kasbon : 0,
      potonganInput: inputControl.bjps + inputControl.ph21,
    },
  };
}

//fungsi untuk check hak operasi
function checkOperation(string, arr, res) {
  // console.log(arr, string);
  if (arr == null) return res.status(302).send("tidak memiliki authentikasi");
  if (arr.includes(string)) return false;
  res.status(420).send(`tidak memiliki hak operasi '${string}'`);
  return true;
}

function checkWeekend(dateString) {
  const [day, month, year] = dateString.split("/").map(Number);
  const myDate = new Date(year, month - 1, day); // Month is 0-based in JavaScript Date
  const dayOfWeek = myDate.getDay(); // 0 for Sunday, 6 for Saturday
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function getDateOnThisWeek(dateString) {
  const date = new Date(dateString);
  const currentDayOfWeek = date.getUTCDay();
  const monday = new Date(date);
  monday.setUTCHours(monday.getUTCHours() + 7);
  monday.setUTCDate(date.getUTCDate() - (currentDayOfWeek - 1));
  const sunday = new Date(date);
  sunday.setUTCHours(sunday.getUTCHours() + 7);
  sunday.setUTCDate(date.getUTCDate() + (7 - currentDayOfWeek));

  return {
    monday: monday.toISOString().split("T")[0],
    sunday: sunday.toISOString().split("T")[0],
  };
}

async function saveAudit(id, task) {
  try {
    const result = await pool.query(
      `select nama from karyawan where id = ${id}`
    );
    const nama = result.rowCount ? result.rows[0].nama : "N/A";
    const detail = `${nama}, ${task}`;
    const date = new Date();
    date.setUTCHours(date.getUTCHours() + 7);
    const submit = await pool.query(
      `insert into audit (detail,date) values($1, $2) returning *`,
      [detail, date]
    );
    console.log(submit.rows[0]);
  } catch (error) {
    console.error(error);
  }
}

async function checkIsRequirementValid(object) {
  let isNullValue = false;

  try {
    for (const [key, value] of Object.entries(object)) {
      if (value) {
        console.log(`${key} is ${value}`);
      } else {
        console.log(`${key} is null`);
        isNullValue = true;
        return {
          bool: false,
          message: `${key} is null`,
        };
      }
    }
  } finally {
    if (!isNullValue) {
      return {
        bool: true,
      };
    }
  }
}

function checkDokumenSize(dokumen, res) {
  // console.log(dokumen);
  if (!dokumen) {
    console.log("gk ada");
    return false;
  }
  if (dokumen.length > 10000000) {
    console.log("kebesaran");
    res.status(302).send("file terlalu besar");
    return true;
  } else {
    console.log("sesuai");
    return false;
  }
}

const controllOperation = async () => {
  const operation = await pool.query("select operation from operation");

  // console.log("update valid operation");

  const flatArray = operation.rows.map((item) => Object.values(item)[0]);
  // console.log(operation.rows, flatArray);

  pool.query(`select operation,id from karyawan`, async (err, result) => {
    await result.rows.forEach(async (row) => {
      // console.log(`id ${row.id} start ${row.operation}`);
      row.operation = await row.operation.filter((value) =>
        flatArray.includes(value)
      );

      // console.log(`id ${row.id} end ${row.operation}`);

      const update = await pool.query(
        `update karyawan set operation = $1 where id = $2 returning id,operation`,
        [row.operation, row.id]
      );

      // console.log(update.rows);
    });
  });
};

const initiateAbsence = () => {
  const absence = require("./src/Absensi/cont");
  absence.postAbsensiToday();
  controllOperation();

  {
    // const date = new Date();
    // date.setUTCHours(date.getUTCHours() + 7);
    // const currDate = date.toISOString().split("T")[0];
    // const checkDay = date.getDay();
    // //debug
    // {
    //   // console.log(currDate);
    //   // console.log(AbsensiHoliday);
    // }
    // if (
    //   AbsensiHoliday.some((item) => item.tanggal === currDate) ||
    //   checkDay === 6 ||
    //   checkDay === 0
    // ) {
    //   console.log("libur");
    // } else {
    //   console.log("masuk");
    // }
  }
};

module.exports = {
  saveAudit,
  checkOperation,
  checkWeekend,
  evaluateExpression,
  isStringAllowed,
  calculationPotongan,
  getDateOnThisWeek,
  checkIsRequirementValid,
  checkDokumenSize,
  initiateAbsence,
  tunjanganKehadiran,
  tunjanganTransport,
  tunjanganKerajinan,
  totalTunjangan,
  jamMasuk,
  jamKeluar,
  toleransiMasuk,
  stringCalculation,
  AbsensiHoliday,
};
