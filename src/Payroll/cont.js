const pool = require("../../db");
const queries = require("./queries");
const check = require("../../public");
//READ UPDATE ADD PAYROLL

function checkFormulaValid(alpha, izin, sakit, telat, laporan) {
  const isAlphaValid = check.isStringAllowed(alpha);
  const isIzinValid = check.isStringAllowed(izin);
  const isSakitValid = check.isStringAllowed(sakit);
  const isTelatValid = check.isStringAllowed(telat);
  const isLaporanValid = check.isStringAllowed(laporan);
  if (
    !isAlphaValid ||
    !isIzinValid ||
    !isSakitValid ||
    !isTelatValid ||
    !isLaporanValid
  ) {
    let string =
      `rumus ` +
      `${!isAlphaValid ? "alpha, " : ""}` +
      `${!isIzinValid ? "izin, " : ""}` +
      `${!isSakitValid ? "sakit, " : ""}` +
      `${!isTelatValid ? "telat, " : ""}` +
      `${!isLaporanValid ? "laporan, " : ""}` +
      `tidak valid`;
    console.log(string);
    return {
      bool: false,
      message: string,
    };
  } else {
    return {
      bool: true,
      message: "rumus valid",
    };
  }
}

function expectedDates(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const allExpectedDates = [];
  console.log(check.AbsensiHoliday);
  // Generate all dates for the specified month and year, excluding Saturdays and Sundays
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    date.setUTCHours(date.getUTCHours() + 7);
    const dayOfWeek = date.getDay(); // 0 for Sunday, 6 for Saturday
    if (
      check.AbsensiHoliday.some(
        (item) => item.tanggal !== date.toISOString().split("T")[0]
      )
    ) {
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        console.log(date.toISOString().split("T")[0]);
        const formattedDate = `${day.toString().padStart(2, "0")}/${month
          .toString()
          .padStart(2, "0")}/${year}`;
        allExpectedDates.push(formattedDate);
      }
    }
  }
  return allExpectedDates;
}

const hapusFormula = async (req, res) => {
  if (check.checkOperation("UPDATE_PAYROLL", req.userOperation, res)) return;

  const formulaId = req.params.index;
  console.log(formulaId);
  try {
    const deleteFormula = await pool.query(
      `DELETE FROM formula WHERE id = $1 returning *`,
      [formulaId]
    );
    console.log(deleteFormula.rows);
    // Check if rows were affected
    if (deleteFormula.rowCount > 0) {
      return res
        .status(200)
        .send(`Formula with id ${formulaId} has been deleted`);
    } else {
      return res.status(404).send(`Formula with id ${formulaId} not found`);
    }
  } catch (error) {
    console.error("Error deleting formula:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const tambahFormula = async (req, res) => {
  if (check.checkOperation("UPDATE_PAYROLL", req.userOperation, res)) return;

  const { alpha, izin, sakit, telat, laporan, TK, TR, TT, nama } = req.body;
  console.log(req.body);
  const isValid = checkFormulaValid(alpha, izin, sakit, telat, laporan);

  if (!isValid.bool) {
    return res.status(302).send(isValid.message);
  } else {
    const insertFormula = await pool.query(
      `insert into formula
      (
      tunjangan_kehadiran,
      tunjangan_transport,
      tunjangan_kerajinan,
      rumus_nama,
      rumus_alpha,
      rumus_izin,
      rumus_sakit,
      rumus_telat,
      rumus_laporan
      )
      values
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      returning *`,
      [TK, TT, TR, nama, alpha, izin, sakit, telat, laporan]
    );
    return res.status(200).json({
      message: isValid.message,
      bool: true,
      data: insertFormula.rows[0],
    });
  }
};

const gantiFormula = async (req, res) => {
  // if (check.checkOperation("UPDATE_PAYROLL", req.userOperation, res)) return;

  const { TK, TR, TT, nama, alpha, izin, sakit, telat, laporan } = req.body;
  const formulaId = req.params.index;
  const isValid = checkFormulaValid(alpha, izin, sakit, telat, laporan);

  if (!isValid.bool) {
    return res.status(302).send(isValid.message);
  } else {
    const updateFormula = await pool.query(
      `update formula
    set
      tunjangan_kehadiran = $1,
      tunjangan_transport = $2,
      tunjangan_kerajinan = $3,
      rumus_nama = $4,
      rumus_alpha = $5,
      rumus_izin = $6,
      rumus_sakit = $7,
      rumus_telat = $8,
      rumus_laporan = $9
    where id = $10
    returning *
    `,
      [TK, TR, TT, nama, alpha, izin, sakit, telat, laporan, formulaId]
    );
    return res.status(200).json({
      message: isValid.message,
      bool: true,
      data: updateFormula.rows[0],
    });
  }
};

const getFormula = async (req, res) => {
  const { rows } = await pool.query(`select * from formula`);

  return res.status(200).send(rows);
};

const updateTunjanganGaji = (req, res) => {
  // if (check.checkOperation("UPDATE_PAYROLL", req.userOperation, res)) return;

  const { kehadiran, transportasi } = req.body;
  console.log(req.body);

  check.tunjanganKehadiran =
    kehadiran != null ? kehadiran : check.tunjanganKehadiran;
  check.tunjanganTransport =
    transportasi != null ? transportasi : check.tunjanganTransport;

  return res
    .status(200)
    .send(
      `set\ntunjangan kehadiran : ${check.tunjanganKehadiran}\ntunjangan transportasi : ${check.tunjanganTransport}`
    );
};

const getPayrollFiltered = async (req, res) => {
  if (check.checkOperation("READ_PAYROLL", req.userOperation, res)) return;
  const { month, search, year } = req.body;

  //console.log(req.body)
  const result = await pool.query(queries.getPayrollFiltered, [
    month,
    `%${search}%`,
    year,
  ]);
  // console.log(result.rows)
  res.status(200).json(result.rows);
};

const getPayrollself = async (req, res) => {
  if (check.checkOperation("SELF_FORM", req.userOperation, res)) return;

  const result = await pool.query(queries.getPayrollself, [req.userId]);
  // console.log(result.rows)
  res.status(200).json(result.rows);
};

const postPayroll = async (req, res) => {
  if (check.checkOperation("ADD_PAYROLL", req.userOperation, res)) return;
  console.log(req.body);
  const { month, year, bjps, ph21, bpjs, kasbon, formulaId, batchId } =
    req.body;
  console.log(req.body);
  const currDate = new Date();
  const currYear = year ? year : currDate.getUTCFullYear();
  const expected = expectedDates(month, currYear);
  console.log(expected);
  try {
    const result = await pool.query(queries.postPayroll[0]);
    for (const row of result.rows) {
      let countMasalahAbsensi = 0;
      let countLaporanTerlambat = 0;
      let countTidakLaporan = 0;
      const countStats = {
        alpha: 0,
        izin: 0,
        sakitsurat: 0,
        sakittanpasurat: 0,
        telat: 0,
        laporan: 0,
        cuti: 0,
        gaktau: 0,
      };
      const tidakPerluLapor = [];
      const expect = expected;
      const masalahAbsensi = [];
      const absensiTerlambat = [];
      const laporanTerlambat = [];
      const laporanTepatWaktu = [];
      let updatedMissingDates = [];
      if (row.operation.includes("SELF_ABSENSI") && batchId.includes(row.id)) {
        const result2 = await pool.query(queries.postPayroll[1], [
          row.id,
          month,
        ]);
        for (const row2 of result2.rows) {
          if (!check.checkWeekend(row2.date)) {
            // console.log(row2);
            const string = `${row2.date}, kehadiran ${row2.status} ${row2.alasan}`;
            const data = await pool.query(
              `select alasan,suratsakit,jenis from pengajuan where id = $1`,
              [row2.pid]
            );
            // console.log(data.rows, row2);
            // console.log(data.rows[0]);
            switch (row2.status.toLowerCase()) {
              case "tanpa alasan":
                countStats.alpha++;
                tidakPerluLapor.push(string);
                break;
              case "izin":
                console.log(row2, row2.pid);
                if (data.rows[0].jenis.toLowerCase() === "sehari penuh") {
                  countStats.izin++;
                  tidakPerluLapor.push(string);
                }

                break;
              case "sakit":
                if (data.rows[0].suratsakit) countStats.sakitsurat++;
                else countStats.sakittanpasurat++;
                tidakPerluLapor.push(string);

                break;
              case "cuti":
                countStats.cuti++;
                tidakPerluLapor.push(string);

                break;
              case "libur":
                tidakPerluLapor.push(string);
              case "terlambat":
                absensiTerlambat.push(string);
                countStats.telat++;
                break;
              default:
                countStats.gaktau++;
                break;
            }
          }
        }

        const result3 = await pool.query(queries.postPayroll[2], [
          row.id,
          month,
        ]);
        // const tempLaporan
        let countLaporan = {
          tepatwaktu: 0,
          terlambat: 0,
          tidaklapor: 0,
        };
        result3.rows.forEach(async (row2) => {
          if (row2.ontime_true_count > 0) {
            laporanTepatWaktu.push(row2.date);
            countLaporan.tepatwaktu++;
          } else {
            laporanTerlambat.push(row2.date);
            countLaporan.terlambat++;
          }
        });
        const pelanggaranLaporan = laporanTerlambat.filter(
          (date) =>
            !laporanTepatWaktu.some((existingDate) =>
              existingDate.includes(date)
            )
        );

        const missingDates = expect
          .filter(
            (date) =>
              !tidakPerluLapor.some((existingDate) =>
                existingDate.includes(date)
              )
          )
          .filter(
            (date) =>
              !laporanTepatWaktu.some((existingDate) =>
                existingDate.includes(date)
              )
          )
          .filter(
            (date) =>
              !laporanTerlambat.some((existingDate) =>
                existingDate.includes(date)
              )
          );

        updatedMissingDates = missingDates.map(
          (date) => `${date}, tidak melakukan laporan`
        );
        countMasalahAbsensi = masalahAbsensi.length + absensiTerlambat.length;
        countLaporanTerlambat = laporanTerlambat.filter(
          (date) =>
            !laporanTepatWaktu.some((existingDate) =>
              existingDate.includes(date)
            )
        ).length;
        countTidakLaporan = updatedMissingDates.length;
        countLaporan.tidaklapor = countTidakLaporan;
        countStats.laporan += countTidakLaporan + countLaporan.terlambat / 2;
        // console.log(countStats, row.id);
        // console.log(countLaporan);
      }
      const value = {
        GP: row.gaji,
        JA: countStats.alpha,
        JI: countStats.izin,
        JS: countStats.sakittanpasurat,
        JT: countStats.telat,
        JL: countStats.laporan,
      };
      const input = {
        bonus: 0,
        bpjs: bpjs ? eval(bpjs) : 0,
        bjps: bjps ? eval(bjps) : 0,
        ph21: ph21 ? eval(ph21) : 0,
        kasbon: kasbon ? eval(kasbon) : 0,
      };
      const potongan = await check.calculationPotongan(
        null,
        value,
        input,
        formulaId
      );
      // console.log(potongan);
      pool.query(
        queries.postPayroll[3],
        [row.id, month, currYear],
        async (err, result) => {
          if (err) throw err;
          if (batchId.includes(row.id)) {
            if (result.rowCount > 0) {
              const updatePayroll = await pool.query(queries.postPayroll[4], [
                potongan.jumlah,
                row.gaji - potongan.jumlah + potongan.rumus.TOT,
                potongan.rumus,
                potongan.detail,
                potongan.value,
                potongan.input,
                row.id,
                month,
                currYear,
              ]);
              // console.log("update", row.id, updatePayroll.rows);
            } else {
              const insertPayroll = await pool.query(queries.postPayroll[5], [
                row.id,
                potongan.jumlah,
                row.gaji - potongan.jumlah + potongan.rumus.TOT,
                potongan.rumus,
                potongan.detail,
                potongan.value,
                potongan.input,
                month,
                currYear,
              ]);
              // console.log("insert", row.id, insertPayroll.rows);
            }
          }
        }
      );
    }
    return res.status(200).send(`data payroll bulan ${month}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error");
  }
};
const bonusPayroll = async (req, res) => {
  // if (check.checkOperation("ADD_PAYROLL", req.userOperation, res)) return;
  console.log(req.body);

  const { bonus, ph21, batchId, year, month } = req.body;
  const currDate = new Date();
  const currYear = year ? year : currDate.getUTCFullYear();
  try {
    const result = await pool.query(queries.postBonusPayroll[0]);
    for (const row of result.rows) {
      if (batchId.includes(row.id)) {
        const value = {
          GP: 0,
          JA: 0,
          JI: 0,
          JS: 0,
          JT: 0,
          JL: 0,
        };
        const input = {
          bonus: bonus ? eval(bonus) : 0,
          bpjs: 0,
          bjps: 0,
          ph21: ph21 ? eval(ph21) : 0,
        };
        const rumus = {
          TK: 0,
          TT: 0,
          TR: 0,
          rumusAlpha: 0,
          rumusIzin: 0,
          rumusSakit: 0,
          rumusTelat: 0,
          rumusLaporan: 0,
        };
        const potongan = await check.calculationPotongan(
          rumus,
          value,
          input,
          null
        );
        pool.query(
          queries.postBonusPayroll[1],
          [row.id, month, currYear],
          async (err, result) => {
            if (err) return res.status(402).send(err.message);
            if (result.rowCount > 0) {
              const updatePayroll = await pool.query(
                queries.postBonusPayroll[2],
                [
                  potongan.jumlah,
                  potongan.value.gaji - potongan.jumlah + potongan.rumus.TOT,
                  potongan.rumus,
                  potongan.detail,
                  potongan.value,
                  potongan.input,
                  result.rows[0].id,
                ]
              );
              console.log("update", row.id, updatePayroll.rows);
            } else {
              const insertPayroll = await pool.query(
                queries.postBonusPayroll[3],
                [
                  row.id,
                  potongan.jumlah,
                  potongan.value.gaji - potongan.jumlah + potongan.rumus.TOT,
                  potongan.rumus,
                  potongan.detail,
                  potongan.value,
                  potongan.input,
                  month,
                  currYear,
                ]
              );
              console.log("insert", row.id, insertPayroll.rows);
            }
          }
        );
      }
    }
    return res.status(200).send(`bonus bulan ${month} tahun ${currYear}`);
  } catch (err) {
    console.log(err);
    return res.status(402).send(err);
  }
};

module.exports = {
  postPayroll,
  getPayrollFiltered,
  getPayrollself,
  updateTunjanganGaji,
  tambahFormula,
  gantiFormula,
  getFormula,
  hapusFormula,
  bonusPayroll,
};
