const excelDatakaryawan = require("../DataKaryawan/queries");
const excelAbsensi = require("../Absensi/queries");
const excelPengajuan = require("../Pengajuan_izin&cuti/queries");
const excelLaporan = require("../Laporan/queries");
const excelReimburst = require("../Reimburst/queries");
const excelPayroll = require("../Payroll/queries");
const excelResign = require("../Resign/queries");

const printDataKaryawan = excelDatakaryawan.excelDataKaryawan;
const printDataAbsensi = excelAbsensi.excelAbsensi;
const printDataPengajuan = excelPengajuan.excelPengajuanDated;
const printDataLaporan = excelLaporan.excelLaporan;
const printDataReimburst = excelReimburst.excelReimburst;
const printDataPayroll = excelPayroll.excelPayroll;
const printDataResign = excelResign.excelResign;

const dataPayroll = `
select 
k.nama as nama,
k.jabatan as jabatan,
k.divisi as divisi,
k.nikid as nikid,
p.month as month,
p.year as year,
p.rumus as rumus,
p.detail as detail,
p.value as value,
p.potong as potong,
p.nominal as nominal,
p.input as input
from karyawan k join payroll p on k.id = p.idk
where p.id = $1
`;

module.exports = {
  printDataKaryawan,
  printDataAbsensi,
  printDataPengajuan,
  printDataLaporan,
  printDataReimburst,
  printDataPayroll,
  printDataResign,
  dataPayroll,
};
