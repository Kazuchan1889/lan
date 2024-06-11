const pool = require("../../db");
const queries = require("./queries");
const Excel = require("exceljs");
const check = require("../../public");
const path = require("path");
const imagePath = path.resolve(__dirname, "./Logo.jpg");
const pdfMake = require("pdfmake");
async function exportData(req, res) {
  const { date, tipe, month } = req.body;
  const utc = date ? new Date(date) : null;
  if (utc) utc.setUTCHours(utc.getUTCHours() + 7);
  console.log(utc);
  console.log(req.body);
  const object = [
    //0
    {
      query: queries.printDataAbsensi,
      values: [utc || null],
      op: "READ_ABSENSI",
    },
    //1
    {
      query: queries.printDataKaryawan,
      values: null,
      op: "READ_KARYAWAN",
    },
    //2
    {
      query: queries.printDataPengajuan,
      values: [req.body.tipe || null, utc || null],
      op: ["READ_CUTI", "READ_IZIN"],
    },
    //3
    {
      query: queries.printDataLaporan,
      values: [utc || null],
      op: "READ_LAPORAN",
    },
    //4
    {
      query: queries.printDataReimburst,
      values: [utc || null],
      op: "READ_REIMBURST",
    },
    //5
    {
      query: queries.printDataPayroll,
      values: [req.body.month || null],
      op: "READ_PAYROLL",
    },
    //6
    {
      query: queries.printDataResign,
      values: null,
      op: "READ_RESIGN",
    },
  ];
  const index = req.params.index;
  if (index >= object.length || index < 0 || isNaN(index))
    return res.status(200).send(`tidak terdapat index ${index}`);
  const { query, values, op } = object[index];
  const operation = req.userOperation;
  // console.log(operation);
  if (
    check.checkOperation(
      tipe != null ? (tipe === "izin" ? op[1] : op[0]) : op,
      operation,
      res
    )
  )
    return;

  try {
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(302)
        .json({ message: "Tidak ada data untuk di export" });
    }

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");

    const data = result.rows;

    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    worksheet.columns = headers.map((header) => ({
      header,
      key: header,
      width: 15,
    }));

    worksheet.addRows(data);
    worksheet.eachRow({ includeEmpty: true }, function (row, rowNumber) {
      row.eachCell((cell, colNumber) => {
        cell.alignment = {
          horizontal: "left",
          wrapText: true,
          vertical: "middle",
        };
      });
    });

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      cell.value = cell.value.charAt(0).toUpperCase() + cell.value.slice(1);
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "2E7D32" }, // Green color
      };
      cell.font = {
        color: { argb: "FFFFFF" },
      };
    });
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Exported_Data_.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}

const fileExt = async (req, res) => {
  const id = req.params.index;
  const file = req.params.file;
  const { rows } = await pool.query(queries.dataPayroll, [id]);
  try {
    if (file === "xlsx") slipGaji(res, rows);
    else if (file == "pdf") slipGajiPdf(res, rows);
  } catch (error) {
    console.log(error);
    return;
  }
};

const slipGaji = async (res, rows) => {
  // console.log(id);
  try {
    if (rows.length === 0)
      return res.status(404).send("tidak terdapat payroll dengan id tersebut");
    const data = rows[0];
    // console.log(data);

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    //set header
    {
      // Add the image to the worksheet using the buffer
      const imageId = workbook.addImage({
        filename: imagePath,
        extension: "jpeg",
      });

      mergeIfNotMerged(worksheet, "A1", "K1");
      mergeIfNotMerged(worksheet, "A2", "K2");

      worksheet.getCell("A1").alignment = {
        vertical: "middle",
        horizontal: "right",
      };

      worksheet.getCell("A2").alignment = {
        vertical: "middle",
        horizontal: "right",
      };
      worksheet.getCell("A1").value = {
        richText: [
          { text: "PT. HEXAON BUSINESS MITRASINDO", font: { bold: true } },
        ],
      };

      worksheet.getCell("A2").value = {
        richText: [{ text: "Business Solution Management" }],
      };
      // Add the image to the worksheet at the top-left corner
      worksheet.addImage(0, "A1:D2");
    }
    //set Footer
    {
      const string =
        "Soho Podomoro 16th Fl Suite 1629  Jl. Let Jend. S. Parman Kav.28, Jakarta Barat 111470 – Indonesia Phone : +62 21 2789 3347 | Fax : +62 21 2789 3348 | info@hbm.co.id | www.hbm.co.id";

      // mergeIfNotMerged(worksheet, "A27", "K27");
      worksheet.mergeCells("A27:K28");
      worksheet.getCell("A27").alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };

      worksheet.getCell("A27").value = string;
    }
    const monthName = new Date(data.year, data.month - 1, 1).toLocaleString(
      "default",
      { month: "long" }
    );
    {
      worksheet.getColumn("C").width = 1;
      worksheet.getColumn("I").width = 1;
      worksheet.getColumn("J").width = 4.0;
      worksheet.getColumn("K").width = 14.22;
    }
    //set nama, jabatan, NIP, Departemen, gaji bulan (bagian atas)
    {
      worksheet.getCell("A4").value =
        "Berikut ini Slip Gaji karyawan di bawah ini, sebagai berikut :";

      worksheet.getCell("A5").value = "Nama";
      worksheet.getCell("C5").value = ":";
      worksheet.getCell("D5").value = data.nama;
      mergeIfNotMerged(worksheet, "D5", "E5");

      worksheet.getCell("A6").value = "Jabatan";
      worksheet.getCell("C6").value = ":";
      worksheet.getCell("D6").value = data.jabatan;
      mergeIfNotMerged(worksheet, "D6", "E6");

      worksheet.getCell("G5").value = "NIP";
      worksheet.getCell("I5").value = ":";
      worksheet.getCell("J5").value = data.nikid;
      mergeIfNotMerged(worksheet, "J5", "K5");

      worksheet.getCell("G6").value = "Departemen";
      worksheet.getCell("I6").value = ":";
      worksheet.getCell("J6").value = data.divisi;
      mergeIfNotMerged(worksheet, "J6", "K6");

      worksheet.getCell("A7").value = "Gaji bulan";
      worksheet.getCell("C7").value = ":";
      worksheet.getCell("D7").value = `${monthName} ${data.year}`;
      mergeIfNotMerged(worksheet, "D7", "E7");
    }
    //bagian kiri
    {
      //set gaji pokok, tunj kehadiran, tunj transport, tunj kerajinan
      {
        worksheet.getCell("A9").value = "Gaji Pokok (GP)";
        worksheet.getCell("C9").value = ":";
        worksheet.getCell("D9").value = data.value.gaji.toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        );
        mergeIfNotMerged(worksheet, "D9", "E9");

        worksheet.getCell("A10").value = "Tunjangan Kehadiran (TK)";
        worksheet.getCell("C10").value = ":";
        worksheet.getCell("D10").value = data.rumus.TK.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        });
        mergeIfNotMerged(worksheet, "D10", "E10");

        worksheet.getCell("A11").value = "Tunjangan Transport (TT)";
        worksheet.getCell("C11").value = ":";
        worksheet.getCell("D11").value = data.rumus.TT.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        });
        mergeIfNotMerged(worksheet, "D11", "E11");

        worksheet.getCell("A12").value = "Tunjangan Kerajinan (TR))";
        worksheet.getCell("C12").value = ":";
        worksheet.getCell("D12").value = data.rumus.TR.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        });
        mergeIfNotMerged(worksheet, "D12", "E12");
      }

      //set gaji kotor, thr/bonus
      {
        worksheet.getCell("A13").value = "Gaji Kotor";
        worksheet.getCell("C13").value = ":";
        worksheet.getCell("D13").value = data.value.gaji.toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        );
        mergeIfNotMerged(worksheet, "D13", "E13");

        worksheet.getCell("A14").value = "THR/Bonus";
        worksheet.getCell("C14").value = ":";
        worksheet.getCell("D14").value = data.input.bonus.toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        );
        mergeIfNotMerged(worksheet, "D14", "E14");

        setBorderBottom(worksheet, "A", "D", 14);
      }

      //total gaji kotor , total potongan
      {
        worksheet.getCell("A15").value = "Total Gaji Bersih";
        worksheet.getCell("C15").value = ":";
        worksheet.getCell("D15").value = eval(data.nominal).toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        );
        mergeIfNotMerged(worksheet, "D15", "E15");
      }
    }
    //bagian kanan
    {
      //set gaji pokok, tunj kehadiran, tunj transport, tunj kerajinan
      {
        worksheet.getCell("G8").value = "BPJS oleh PT";
        worksheet.getCell("I8").value = ":";
        worksheet.getCell("J8").value = data.input.bpjs.toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        ); //ini nanti input
        mergeIfNotMerged(worksheet, "J8", "K8");

        worksheet.getCell("G9").value = "PPh P21";
        worksheet.getCell("I9").value = ":";
        worksheet.getCell("J9").value = data.input.ph21.toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        ); //ini nanti input
        mergeIfNotMerged(worksheet, "J9", "K9");

        worksheet.getCell("G10").value = "Pot.BPJS-T&K";
        worksheet.getCell("I10").value = ":";
        worksheet.getCell("J10").value = data.input.bjps.toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        ); //ini nanti input
        mergeIfNotMerged(worksheet, "J10", "K10");

        worksheet.getCell("G11").value = "Pot.GP/TK+TR";
        worksheet.getCell("I11").value = ":";
        worksheet.getCell("J11").value =
          data.detail.potonganPelanggaran.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
          });
        mergeIfNotMerged(worksheet, "J11", "K11");

        worksheet.getCell("G12").value = "kasbon";
        worksheet.getCell("I12").value = ":";
        worksheet.getCell("J12").value = (
          data.input.kasbon ?? 0
        ).toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        });
        mergeIfNotMerged(worksheet, "J12", "K12");

        setBorderBottom(worksheet, "G", "K", 12);
      }

      //set total potongan
      {
        worksheet.getCell("G13").value = "Total Potongan";
        worksheet.getCell("I13").value = ":";
        worksheet.getCell("J13").value = data.potong.toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
        });

        setBorderBottom(worksheet, "G", "K", 13);
      }

      //set gaji kotor, thr/bonus
      {
        worksheet.getCell("G14").value = "Alpha";
        worksheet.getCell("H14").value = data.rumus.alpha;
        worksheet.getCell("I14").value = ":";
        worksheet.getCell("J14").value = data.value.alpha;
        worksheet.getCell("K14").value = data.detail.alpha.toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        );

        worksheet.getCell("G15").value = "IZIN";
        worksheet.getCell("H15").value = data.rumus.izin;
        worksheet.getCell("I15").value = ":";
        worksheet.getCell("J15").value = data.value.izin;
        worksheet.getCell("K15").value = data.detail.izin.toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        );

        worksheet.getCell("G16").value = "SAKIT";
        worksheet.getCell("H16").value = data.rumus.sakit;
        worksheet.getCell("I16").value = ":";
        worksheet.getCell("J16").value = data.value.sakit;
        worksheet.getCell("K16").value = data.detail.sakit.toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        );

        worksheet.getCell("G17").value = "TELAT";
        worksheet.getCell("H17").value = data.rumus.telat;
        worksheet.getCell("I17").value = ":";
        worksheet.getCell("J17").value = data.value.telat;
        worksheet.getCell("K17").value = data.detail.telat.toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        );

        worksheet.getCell("G18").value = "T.Laporan";
        worksheet.getCell("H18").value = data.rumus.laporan;
        worksheet.getCell("I18").value = ":";
        worksheet.getCell("J18").value = data.value.laporan;
        worksheet.getCell("K18").value = data.detail.laporan.toLocaleString(
          "id-ID",
          {
            style: "currency",
            currency: "IDR",
          }
        );
      }
    }
    //set bagian bawah
    {
      worksheet.getCell("A20").value =
        "Informasi Slip Gaji Karyawan ini bersifat rahasia dibuat untuk digunakan sebagaimana mestinya.";
      worksheet.getCell("A21").value = `Jakarta, ${monthName} ${data.year}`;
      worksheet.getCell("A23").value = "ttd Management Perusahaan";
    }
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=SlipGaji_${monthName}_${data.year}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const fontPDF = {
  Roboto: {
    normal: path.join(__dirname, "Roboto/Roboto-Regular.ttf"),
    bold: path.join(__dirname, "Roboto/Roboto-Bold.ttf"),
    italics: path.join(__dirname, "Roboto/Roboto-Italic.ttf"),
    bolditalics: path.join(__dirname, "Roboto/Roboto-BoldItalic.ttf"),
  },
};

const footerPDF = {
  text: "Soho Podomoro 16th Fl Suite 1629  Jl. Let Jend. S. Parman Kav.28, Jakarta Barat 111470 – Indonesia Phone : +62 21 2789 3347 | Fax : +62 21 2789 3348 | info@hbm.co.id | www.hbm.co.id",
  style: ["alignCenter", "small"],
  margin: [40, 0, 40, 0],
};

const stylePDF = {
  bold: {
    bold: true,
  },
  italics: {
    italics: true,
  },
  headerTable: {
    margin: [0, 0, 0, 20],
  },
  alignRight: {
    alignment: "right",
  },
  alignLeft: {
    alignment: "left",
  },
  alignCenter: {
    alignment: "center",
  },
  underline: {
    // decoration : 'underline',
    border: [false, false, false, true],
  },
  small: {
    fontSize: 10,
  },
};

const imagesPDF = {
  header: path.join(__dirname, "Logo.jpg"),
};

const slipGajiPdf = async (res, rows) => {
  const data = rows[0];
  // console.log(data);
  const monthName = new Date(data.year, data.month - 1, 1).toLocaleString(
    "default",
    { month: "long" }
  );
  var fonts = fontPDF;
  const printer = new pdfMake(fonts);
  var dd = {
    content: [
      {
        style: "headerTable",
        layout: "noBorders",
        table: {
          widths: ["*", "*"],
          body: [
            [
              {
                image: "header",
                width: 200,
              },
              {
                type: "none",
                style: ["bold", "alignRight"],
                ul: [
                  "PT. HEXAON BUSINESS MITRASINDO",
                  "Business Solution Management",
                ],
              },
            ],
          ],
        },
      },
      "Berikut ini Slip Gaji karyawan di bawah ini, sebagai berikut :",
      "\n\n",
      {
        alignment: "justify",
        columnGap: 10,
        columns: [
          {
            layout: "noBorders",
            width: 250,
            table: {
              widths: ["34%", "1%", "65%"],
              body: [
                ["Nama", ":", data.nama],
                ["Jabatan", ":", data.jabatan],
                ["Gaji Bulan", ":", `${monthName}, ${data.year}`],
                ["\n", "", ""],
                [
                  "Gaji Pokok",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (data.value.gaji ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                ],
                [
                  "T.Kehadiran",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (data.rumus.TK ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                ],
                [
                  "T.Transport",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: data.rumus.TT.toLocaleString("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                ],
                [
                  "T.Kerajinan",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (data.rumus.TR ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                  // {
                  //   text: data.rumus.TR.toLocaleString("id-ID", {
                  //     style: "currency",
                  //     currency: "IDR",
                  //   }),
                  //   style: "alignRight",
                  // },
                ],
                [
                  "Gaji Kotor",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (data.value.gaji ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                  // {
                  //   text: data.value.gaji.toLocaleString("id-ID", {
                  //     style: "currency",
                  //     currency: "IDR",
                  //   }),
                  //   style: "alignRight",
                  // },
                ],
                [
                  "THR/Bonus",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (data.input.bonus ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                ],
                [
                  {
                    canvas: [
                      {
                        type: "line",
                        x1: 0,
                        y1: 5, // Adjust the Y-coordinate as needed
                        x2: 250, // Adjust the length of the line as needed
                        y2: 5, // Adjust the Y-coordinate as needed
                        lineWidth: 1, // Adjust the line width as needed
                      },
                    ],
                  },
                  "",
                  "",
                ], //buat horizontal line
                [
                  "Gaji Bersih",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (eval(data.nominal) ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                  // {
                  //   text: eval(data.nominal).toLocaleString("id-ID", {
                  //     style: "currency",
                  //     currency: "IDR",
                  //   }),
                  //   style: "alignRight",
                  // },
                ],
              ],
            },
          },
          {
            layout: "noBorders",
            widths: 250,
            table: {
              widths: ["34%", "1%", "65%"],
              body: [
                ["NIP", ":", data.nikid],
                ["Departemen", ":", data.divisi],
                ["\n", "", ""],
                [
                  "BPJS oleh PT",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (data.input.bpjs ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                  // {
                  //   text: (data.input.bpjs ?? 0).toLocaleString("id-ID", {
                  //     style: "currency",
                  //     currency: "IDR",
                  //   }),
                  //   style: "alignRight",
                  // },
                ],
                ["\n", "", ""],
                [
                  "PPh p21",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (data.input.ph21 ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                  // {
                  //   text: (data.input.ph21 ?? 0).toLocaleString("id-ID", {
                  //     style: "currency",
                  //     currency: "IDR",
                  //   }),
                  //   style: "alignRight",
                  // },
                ],
                [
                  "Pot.BPJS-T&K",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (data.input.bjps ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                  // {
                  //   text: (data.input.bjps ?? 0).toLocaleString("id-ID", {
                  //     style: "currency",
                  //     currency: "IDR",
                  //   }),
                  //   style: "alignRight",
                  // },
                ],
                [
                  "Pot.GP/TK+TR",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (data.detail.potonganPelanggaran ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                  // {
                  //   text: (data.detail.potonganPelanggaran ?? 0).toLocaleString(
                  //     "id-ID",
                  //     {
                  //       style: "currency",
                  //       currency: "IDR",
                  //     }
                  //   ),
                  //   style: "alignRight",
                  // },
                ],
                [
                  "Bon",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (data.input.kasbon ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                  // {
                  //   text: (data.input.kasbon ?? 0).toLocaleString("id-ID", {
                  //     style: "currency",
                  //     currency: "IDR",
                  //   }),
                  //   style: "alignRight",
                  // },
                ],
                [
                  {
                    canvas: [
                      {
                        type: "line",
                        x1: 0,
                        y1: 5, // Adjust the Y-coordinate as needed
                        x2: 250, // Adjust the length of the line as needed
                        y2: 5, // Adjust the Y-coordinate as needed
                        lineWidth: 1, // Adjust the line width as needed
                      },
                    ],
                  },
                  "",
                  "",
                ], //buat horizontal line
                [
                  "Total Potongan",
                  ":",
                  {
                    width: "100%",
                    columns: [
                      { text: "Rp.", width: "20%", style: "alignLeft" },
                      {
                        text: (data.potong ?? 0)
                          .toLocaleString("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          })
                          .replace("Rp", "")
                          .trim(),
                        style: "alignRight",
                        width: "80%",
                      },
                    ],
                  },
                  // {
                  //   text: data.potong.toLocaleString("id-ID", {
                  //     style: "currency",
                  //     currency: "IDR",
                  //   }),
                  //   style: "alignRight",
                  // },
                ],
                ["\n", "", ""],
              ],
            },
          },
        ],
      },
      "\n",
      {
        alignment: "justify",
        columnGap: 0,
        columns: [
          { text: "", width: 185 },
          {
            layout: "noBorders",
            table: {
              body: [
                ["Keterangan"],
                [
                  {
                    layout: "noBorders",
                    widths: 300,
                    table: {
                      widths: [
                        (300 * 20) / 100,
                        (300 * 32) / 100,
                        (300 * 1) / 100,
                        (300 * 7) / 100,
                        (300 * 40) / 100,
                      ],
                      body: [
                        [
                          "Alpha",
                          data.rumus.alpha,
                          ":",
                          data.value.alpha,
                          {
                            width: "100%",
                            columns: [
                              { text: "Rp.", width: "20%", style: "alignLeft" },
                              {
                                text: (data.detail.alpha ?? 0)
                                  .toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  })
                                  .replace("Rp", "")
                                  .trim(),
                                style: "alignRight",
                                width: "80%",
                              },
                            ],
                          },
                          // {
                          //   text: data.detail.alpha.toLocaleString("id-ID", {
                          //     style: "currency",
                          //     currency: "IDR",
                          //   }),
                          //   style: "alignRight",
                          // },
                        ],
                        [
                          "Izin",
                          data.rumus.izin,
                          ":",
                          data.value.izin,
                          {
                            width: "100%",
                            columns: [
                              { text: "Rp.", width: "20%", style: "alignLeft" },
                              {
                                text: (data.detail.izin ?? 0)
                                  .toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  })
                                  .replace("Rp", "")
                                  .trim(),
                                style: "alignRight",
                                width: "80%",
                              },
                            ],
                          },
                          // {
                          //   text: data.detail.izin.toLocaleString("id-ID", {
                          //     style: "currency",
                          //     currency: "IDR",
                          //   }),
                          //   style: "alignRight",
                          // },
                        ],
                        [
                          "Sakit",
                          data.rumus.sakit,
                          ":",
                          data.value.sakit,
                          {
                            width: "100%",
                            columns: [
                              { text: "Rp.", width: "20%", style: "alignLeft" },
                              {
                                text: (data.detail.sakit ?? 0)
                                  .toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  })
                                  .replace("Rp", "")
                                  .trim(),
                                style: "alignRight",
                                width: "80%",
                              },
                            ],
                          },
                          // {
                          //   text: data.detail.sakit.toLocaleString("id-ID", {
                          //     style: "currency",
                          //     currency: "IDR",
                          //   }),
                          //   style: "alignRight",
                          // },
                        ],
                        [
                          "Telat",
                          data.rumus.telat,
                          ":",
                          data.value.telat,
                          {
                            width: "100%",
                            columns: [
                              { text: "Rp.", width: "20%", style: "alignLeft" },
                              {
                                text: (data.detail.telat ?? 0)
                                  .toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  })
                                  .replace("Rp", "")
                                  .trim(),
                                style: "alignRight",
                                width: "80%",
                              },
                            ],
                          },
                          // {
                          //   text: data.detail.telat.toLocaleString("id-ID", {
                          //     style: "currency",
                          //     currency: "IDR",
                          //   }),
                          //   style: "alignRight",
                          // },
                        ],
                        [
                          "T.Laporan",
                          data.rumus.laporan,
                          ":",
                          data.value.laporan,
                          {
                            width: "100%",
                            columns: [
                              { text: "Rp.", width: "20%", style: "alignLeft" },
                              {
                                text: (data.detail.laporan ?? 0)
                                  .toLocaleString("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  })
                                  .replace("Rp", "")
                                  .trim(),
                                style: "alignRight",
                                width: "80%",
                              },
                            ],
                          },
                          // {
                          //   text: data.detail.laporan.toLocaleString("id-ID", {
                          //     style: "currency",
                          //     currency: "IDR",
                          //   }),
                          //   style: "alignRight",
                          // },
                        ],
                      ],
                    },
                  },
                ],
              ],
            },
          },
        ],
      },
      "\n\n\n\n",
      "Informasi Slip Gaji Karyawan ini bersifat rahasia dibuat untuk digunakan sebagaimana mestinya.",
      `Jakarta, ${monthName} ${data.year}`,
      "\n\n",
      "ttd Management Perusahaan",
      "\n\n\n\n",
    ],
    footer: footerPDF,
    styles: stylePDF,
    images: imagesPDF,
  };
  try {
    const pdfDoc = printer.createPdfKitDocument(dd);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ConvertedPDF.pdf"
    );

    // Pipe the PDF stream directly to the response
    pdfDoc.pipe(res);

    // Finalize the PDF stream
    pdfDoc.end();
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

function columnLetterToNumber(columnLetter) {
  let result = 0;

  for (let i = 0; i < columnLetter.length; i++) {
    const charCode = columnLetter.charCodeAt(i) - 64; // 'A' is 65 in ASCII
    result = result * 26 + charCode;
  }

  return result;
}

const setBorderBottom = (worksheet, startCol, finishCol, row) => {
  const numbStart = columnLetterToNumber(startCol);
  const numbFinish = columnLetterToNumber(finishCol);

  for (let col = numbStart; col <= numbFinish; col++) {
    worksheet.getCell(`${String.fromCharCode(64 + col)}${row}`).border = {
      bottom: { style: "thin" },
    };
  }
};

function isCellMerged(worksheet, cellAddress) {
  const cell = worksheet.getCell(cellAddress);
  return cell && cell.isMerged;
}

// Function to merge cells if they are not already merged
function mergeIfNotMerged(worksheet, startCell, endCell) {
  const cellRange = `${startCell}:${endCell}`;

  // Check if any cell in the range is already merged
  for (let row = startCell[1]; row <= endCell[1]; row++) {
    for (
      let col = startCell.charCodeAt(0);
      col <= endCell.charCodeAt(0);
      col++
    ) {
      const currentCellAddress = `${String.fromCharCode(col)}${row}`;
      if (isCellMerged(worksheet, currentCellAddress)) {
        // console.log(`cell ${startCell}:${endCell} sudah termerge`);
        return; // Exit if any cell is already merged
      }
    }
  }

  // If no cell is already merged, merge the cells
  worksheet.mergeCells(cellRange);
}

const reimburseDetailPdf = async (req, res) => {
  const { data } = req.body;
  const monthName = new Date(data.tahun, data.bulan - 1, 1).toLocaleString(
    "default",
    { month: "long" }
  );
  var fonts = fontPDF;
  const printer = new pdfMake(fonts);
  const detail = [["Keterangan", "Tanggal", "Biaya"]];

  await data.detail.forEach((data) => {
    detail.push([
      data.keterangan,
      data.date,
      {
        width: "100%",
        columns: [
          { text: "Rp.", width: "20%", style: "alignLeft" },
          {
            text: data.biaya.replace("Rp. ", "").trim(),
            style: "alignRight",
            width: "80%",
          },
        ],
      },
    ]);
  });
  try {
    var dd2 = {
      content: [
        {
          style: "headerTable",
          layout: "noBorders",
          table: {
            widths: ["*", "*"],
            body: [
              [
                {
                  image: "header",
                  width: 200,
                },
                {
                  type: "none",
                  style: ["bold", "alignRight"],
                  ul: [
                    "PT. HEXAON BUSINESS MITRASINDO",
                    "Business Solution Management",
                  ],
                },
              ],
            ],
          },
        },
        "Berikut ini Reimburse karyawan di bawah ini, sebagai berikut :",
        "\n\n",
        {
          alignment: "justify",
          columnGap: 10,
          columns: [
            {
              layout: "noBorders",
              width: 250,
              table: {
                widths: ["34%", "1%", "65%"],
                body: [
                  ["Nama", ":", data.nama],
                  ["Jabatan", ":", data.jabatan],
                  ["Bulan", ":", `${monthName},${data.tahun}`],
                ],
              },
            },
          ],
        },
        "\n",
        {
          table: {
            widths: ["60%", "20%", "20%"],
            body: detail,
          },
        },
        {
          layout: "noBorders",
          table: {
            widths: ["60%", "20%", "20%"],
            body: [
              [
                "",
                "Jumlah",
                {
                  width: "100%",
                  columns: [
                    { text: "Rp.", width: "20%", style: "alignLeft" },
                    {
                      text: data.jumlah.replace("Rp", "").trim(),
                      style: "alignRight",
                      width: "80%",
                    },
                  ],
                },
              ],
              [
                "",
                "",
                {
                  canvas: [
                    {
                      type: "line",
                      x1: 0,
                      y1: 0, // Adjust the Y-coordinate as needed
                      x2: 100, // Adjust the length of the line as needed
                      y2: 0, // Adjust the Y-coordinate as needed
                      lineWidth: 1, // Adjust the line width as needed
                    },
                  ],
                },
              ],
            ],
          },
        },
        "Informasi Reimburse Karyawan ini bersifat rahasia dibuat untuk digunakan sebagaimana mestinya.",
        `Jakarta, ${monthName},${data.tahun}`,
        "\n\n",
        {
          layout: "noBorders",
          alignment: "center",
          table: {
            widths: ["33%", "33%", "33%"],
            body: [
              [
                "Mengetahui\n\n\n\n\nIrva Nur F.",
                "",
                "Mengetahui\n\n\n\n\nSalwa Anindya",
              ],
              ["", "Menyetujui\n\n\n\n\nRoeddy Kasim", ""],
            ],
          },
        },
      ],
      footer: footerPDF,
      styles: stylePDF,
      images: imagesPDF,
    };
    const pdfDoc = printer.createPdfKitDocument(dd2);

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=ConvertedPDF.pdf"
    );

    // Pipe the PDF stream directly to the response
    pdfDoc.pipe(res);

    // Finalize the PDF stream
    pdfDoc.end();
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};
module.exports = {
  exportData,
  slipGaji,
  fileExt,
  reimburseDetailPdf,
};

// {
//   "content": [
//     {
//       "text": "Sheet 1",
//       "style": "header",
//       "margin": [
//         0,
//         10
//       ],
//       "table": {
//         "headerRows": 1,
//         "widhts": [
//           "*",
//           "*",
//         ],
//         "body": [
//           [
//             "PT. HEXAON BUSINESS MITRASINDO"
//           ],
//           [
//             "Business Solution Management"
//           ],
//           [
//             "Berikut ini Slip Gaji karyawan di bawah ini, sebagai berikut :"
//           ],
//           [
//             "Nama",
//             ":",
//             "Hououin Kyoma",
//             "NIP",
//             ":",
//             "1111112"
//           ],
//           [
//             "Jabatan",
//             ":",
//             "DiRekTur",
//             "Departemen",
//             ":",
//             "all"
//           ],
//           [
//             "Gaji bulan",
//             ":",
//             "December 2023"
//           ],
//           [
//             "BPJS oleh PT",
//             ":",
//             "Rp 10.000,00"
//           ],
//           [
//             "Gaji Pokok (GP)",
//             ":",
//             "Rp 10.000.000,00",
//             "PPh P21",
//             ":",
//             "Rp 10.000,00"
//           ],
//           [
//             "Tunjangan Kehadiran (TK)",
//             ":",
//             "Rp 500.000,00",
//             "Pot.BPJS-T&K",
//             ":",
//             "Rp 10.000,00"
//           ],
//           [
//             "Tunjangan Transport (TT)",
//             ":",
//             "Rp 500.000,00",
//             "Pot.GP/TK+TR",
//             ":",
//             "Rp 863.636,00"
//           ],
//           [
//             "Tunjangan Kerajinan (TR))",
//             ":",
//             "Rp 500.000,00"
//           ],
//           [
//             "Gaji Kotor",
//             ":",
//             "Rp 10.000.000,00",
//             "Total Potongan",
//             ":",
//             "Rp 883.636,00"
//           ],
//           [
//             "THR/Bonus",
//             ":",
//             "Rp 0,00",
//             "Alpha",
//             "((GP/22)*JA)",
//             ":",
//             1,
//             "Rp 454.545,00"
//           ],
//           [
//             "Total Gaji Bersih",
//             ":",
//             "Rp 10.616.364,00",
//             "IZIN",
//             "((TK+TT)/22*JI)",
//             ":",
//             1,
//             "Rp 45.455,00"
//           ],
//           [
//             "SAKIT",
//             "((TK+TT)/22*JS)",
//             ":",
//             0,
//             "Rp 0,00"
//           ],
//           [
//             "TELAT",
//             "((TK+TT)/22*JT)",
//             ":",
//             2,
//             "Rp 90.909,00"
//           ],
//           [
//             "T.Laporan",
//             "((TK+TT)/22*JL)",
//             ":",
//             6,
//             "Rp 272.727,00"
//           ],
//           [
//             "Informasi Slip Gaji Karyawan ini bersifat rahasia dibuat untuk digunakan sebagaimana mestinya."
//           ],
//           [
//             "Jakarta, December 2023"
//           ],
//           [
//             "ttd Management Perusahaan"
//           ],
//           [
//             "Soho Podomoro 16th Fl Suite 1629  Jl. Let Jend. S. Parman Kav.28, Jakarta Barat 111470 – Indonesia Phone : +62 21 2789 3347 | Fax : +62 21 2789 3348 | info@hbm.co.id | www.hbm.co.id"
//           ]
//         ]
//       }
//     }
//   ],
//   "styles": {
//     "header": {
//       "bold": true,
//       "fontSize": 14
//     }
//   }
// }
