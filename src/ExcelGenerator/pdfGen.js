// playground requires you to assign document definition to a variable called dd

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
              ["Nama", ":", "Dhani Susilo"],
              ["Jabatan", ":", "Peternak Ayam"],
              ["Gaji Bulan", ":", "December 2023"],
              ["\n", "", ""],
              [
                "Gaji Pokok",
                ":",
                { text: "Rp 10.000.000,00", style: "alignRight" },
              ],
              [
                "T.Kehadiran",
                ":",
                { text: "Rp 500.000,00", style: "alignRight" },
              ],
              [
                "T.Transport",
                ":",
                { text: "Rp 500.000,00", style: "alignRight" },
              ],
              [
                "T.Kerajinan",
                ":",
                { text: "Rp 500.000,00", style: "alignRight" },
              ],
              [
                "Gaji Kotor",
                ":",
                { text: "Rp 10.000.000,00", style: "alignRight" },
              ],
              ["THR/Bonus", ":", { text: "Rp 0,00", style: "alignRight" }],
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
                { text: "Rp 10.616.364,00", style: "alignRight" },
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
              ["NIP", ":", "123123321"],
              ["Departemen", ":", "123123321"],
              ["\n", "", ""],
              [
                "BPJS oleh PT",
                ":",
                { text: "Rp 10.000,00", style: "alignRight" },
              ],
              ["\n", "", ""],
              ["PPh p21", ":", { text: "Rp 10.000,00", style: "alignRight" }],
              [
                "Pot.BPJS-T&K",
                ":",
                { text: "Rp 10.000,00", style: "alignRight" },
              ],
              [
                "Pot.GP/TK+TR",
                ":",
                { text: "Rp 863.636,00", style: "alignRight" },
              ],
              ["Bon", ":", { text: "Rp 0,00", style: "alignRight" }],
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
                { text: "Rp 883.636,00", style: "alignRight" },
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
                        "((GP/22)*JA)",
                        ":",
                        "1x",
                        { text: "Rp 454.545,00", style: "alignRight" },
                      ],
                      [
                        "Izin",
                        "((TK+TT)/22*JI)",
                        ":",
                        "1x",
                        { text: "Rp 45.455,00", style: "alignRight" },
                      ],
                      [
                        "Sakit",
                        "((GP/22)*JA)",
                        ":",
                        "0x",
                        { text: "Rp 0,00", style: "alignRight" },
                      ],
                      [
                        "Telat",
                        "((GP/22)*JA)",
                        ":",
                        "2x",
                        { text: "Rp 90.909,00", style: "alignRight" },
                      ],
                      [
                        "T.Laporan",
                        "((GP/22)*JA)",
                        ":",
                        "6x",
                        { text: "Rp 272.727,00", style: "alignRight" },
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
    "Jakarta, December 2023",
    "\n\n",
    "ttd Management Perusahaan",
    "\n\n\n\n",
    {
      text: "Soho Podomoro 16th Fl Suite 1629  Jl. Let Jend. S. Parman Kav.28, Jakarta Barat 111470 – Indonesia Phone : +62 21 2789 3347 | Fax : +62 21 2789 3348 | info@hbm.co.id | www.hbm.co.id",
      style: "alignCenter",
    },
  ],
  styles: {
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
    underline: {
      // decoration : 'underline',
      border: [false, false, false, true],
    },
    alignCenter: {
      alignment: "center",
    },
  },
  images: {
    header: "./Logo.jpg",
  },
};

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
              ["Nama", ":", "Dhani Susilo"],
              ["Jabatan", ":", "Peternak Ayam"],
              ["Bulan", ":", "December 2023"],
            ],
          },
        },
      ],
    },
    "\n",
    {
      table: {
        widths: ["60%", "20%", "20%"],
        body: [
          ["Keterangan", "Tanggal", "Biaya"],
          [
            "Beli Sesuatu atau bayar sesuatu, jadi gitu lah",
            "12/01/2023",
            "Rp 100.000",
          ],
          [
            "Beli Sesuatu atau bayar sesuatu, jadi gitu lah",
            "12/01/2023",
            "Rp 100.000",
          ],
          [
            "Beli Sesuatu atau bayar sesuatu, jadi gitu lah",
            "12/01/2023",
            "Rp 100.000",
          ],
          [
            "Beli Sesuatu atau bayar sesuatu, jadi gitu lah",
            "12/01/2023",
            "Rp 100.000",
          ],
        ],
      },
    },
    {
      layout: "noBorders",
      table: {
        widths: ["60%", "20%", "20%"],
        body: [
          ["", "Jumlah", "Rp 400.000"],
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
    "\n\n\n\n",
    "Informasi Reimburse Karyawan ini bersifat rahasia dibuat untuk digunakan sebagaimana mestinya.",
    "Jakarta, December 2023",
    "\n\n",
    "ttd Management Perusahaan",
    "\n\n\n\n",
    {
      text: "Soho Podomoro 16th Fl Suite 1629  Jl. Let Jend. S. Parman Kav.28, Jakarta Barat 111470 – Indonesia Phone : +62 21 2789 3347 | Fax : +62 21 2789 3348 | info@hbm.co.id | www.hbm.co.id",
      style: "alignCenter",
    },
  ],
  styles: {
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
    underline: {
      // decoration : 'underline',
      border: [false, false, false, true],
    },
    alignCenter: {
      alignment: "center",
    },
  },
  images: {
    header: "./Logo.jpg",
  },
};
