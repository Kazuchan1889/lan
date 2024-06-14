const queries = require("./queries");
const pool = require("../../db");

const BASE_CALENDAR_URL = "https://www.googleapis.com/calendar/v3/calendars";
const BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY = "holiday@group.v.calendar.google.com";

//ganti jika expired atau bermasalah dengan google api
const API_KEY = "AIzaSyBgv966WTpAildktVrYeeyumSWdQ5YwP1M";
const CALENDAR_REGION = "id.indonesian";
const currentYear = new Date().getFullYear();

const timeMin = new Date(`${currentYear}-01-01`).toISOString();
const timeMax = new Date(`${currentYear}-12-31`).toISOString();

const getGoogleCalendar = async(req,res)=>{
  //fetch url from google calendar api
    const Calendar = await fetch(
        `${BASE_CALENDAR_URL}/${CALENDAR_REGION}%23${BASE_CALENDAR_ID_FOR_PUBLIC_HOLIDAY}/events?key=${API_KEY}&timeMin=${timeMin}&timeMax=${timeMax}`
    );

    const result = await Calendar.json();

    //cek apakah kalendar yang digunakan merupakan kalendar tahun ini
    //jika iya maka akan break loop untuk mencegah insert
    const newCalendar = []
    for (let index = 0; index < result.items.length; index++) {
      newCalendar[index] = {
        judul: result.items[index].summary,
        deskripsi: result.items[index].description,
        start: result.items[index].start.date,
        end: result.items[index].end.date
        
      };
    //   const tempDate = await new Date(newCalendar[index].start).toISOString();
      const checking = await pool.query(`select tanggal_mulai, judul
      from schedule_cal 
      where date_trunc('year', timestamp '${newCalendar[index].start}') = date_trunc('year', CURRENT_DATE) and tipe is false;`);
      if(checking.rowCount>0){
        console.log("more than 0");
        break;
      }else{
        //false untuk hari raya dari google
        pool.query(queries.insertScheduleCal,[
            false,
            newCalendar[index].start,
            newCalendar[index].end,
            newCalendar[index].judul,
            newCalendar[index].deskripsi]);
      }
    }

    // console.log(result.items.length);
    // console.log(newCalendar);

    const calendarVal = await pool.query(queries.getSchedulecal);
    return res.status(200).send(calendarVal.rows);
};

//butuh menghilangkan jadwal duplikat
const postScheduler = async(req,res)=>{
  const {
    tgl_mulai,
    tgl_selesai,
    judul,
    deskripsi,
    mulai,
    selesai,
    //jika tidak ingin assign karyawan bikin saja null
    karyawan,
  } = req.body;
  if(req.userRole!="admin"){
    return res.status(401).send("Akses ditolak");
  }
  else{
    try{
      await pool.query(queries.insertScheduleCal,[true,tgl_mulai,tgl_selesai,judul,deskripsi,mulai,selesai]);
      if(karyawan===null){
        console.log("reached");
        return res.status(200).send("Successfully Sent");
      }

      else if(karyawan.length>0&&karyawan!==null){
        console.log("test: ",karyawan);

        const scheduleCal = await pool.query(queries.getSpecificCal,[tgl_mulai,tgl_selesai,judul,deskripsi]);
        for (let index = 0; index < karyawan.length; index++) {
          await pool.query(queries.postAssign,[karyawan[index],scheduleCal.rows[0].id]);
          
        }
        console.log(scheduleCal.rows[0].id);
        return res.status(200).send("Successfully Sent");

      }
      
    }
    catch(error){
      return res.send(error);
    }
  }
  

};

const patchSchedule = async(req, res)=>{
  if(req.userRole!=='admin'){
    return res.status(403).send("Access denied");
  }
  const statusId = req.params.Id;
  console.log(statusId);

  const {
      tanggal_mulai,
      tanggal_selesai,
      mulai,
      selesai,
      judul,
      deskripsi,
      karyawan,
  }=req.body
  
  try{
      /*untuk sekarang query findPost digunakan untuk mengecek apakah tipe yang ada merupakan true
      dikarenakan tipe true berarti dibuat untuk schedule sedangkan false dapat digunakan untuk jadwal yang
      didapatkan dari googleapi */
      // const findPost = await pool.query(`select * from scheduler where id=${statusId} and tipe is true`);
      // if(findPost.rowCount<1){
      //     return res.status(204).send("post tidak ditemukan");
      // }
      await pool.query(queries.patchApprove,[tanggal_mulai,tanggal_selesai,mulai,selesai,judul,deskripsi,statusId]);
      // if(karyawan.length > 0){
      //   for (let index = 0; index < karyawan.length; index++) {
      //     const temp = await pool.query(queries.getAssignedScheduler,[karyawan[index],statusId]);
      //     if(temp.rowCount>0){
      //       console.log("Already Assigned");
      //       continue;
      //     }else{
      //       await pool.query(queries.postAssign,[karyawan[index],statusId]);
      //     }
          
      //     // console.log(index);
          
      //   }
      // }

      // // pool.query(queries.postAssign,[])
      // console.log("Updated"+findPost.rows[0].judul);
      return res.status(200).send("Updated");
  }catch(error){
      return res.send(error);
  }

}
const getSchedulerAssigned = async(req,res)=>{
  try{
    const getScheduler = await pool.query(queries.getKaryawanSchedule[0]);
    return res.status(200).send(getScheduler.rows);
  }
  catch(error){
    return res.send(error)
  }
};

const getSchedulerById = async(req,res)=>{
  try{
    const getScheduler = await pool.query(queries.getKaryawanSchedule[1],[req.params.Id]);
    return res.status(200).send(getScheduler.rows);
  }catch(error){
    return res.send(error);
  }
};

const getSchedulerByKaryawanId = async(req,res)=>{
  try{
    const getScheduler = await pool.query(queries.getKaryawanSchedule[2],[req.params.Id]);
    return res.status(200).send(getScheduler.rows);
  }catch(error){
    return res.send(error);
  }
};

const deleteAssignedPerson = async(req,res)=>{
  try{
    await pool.query(`delete from scheduler where id = ${req.params.Id};`);
    res.status(200).send("Assigned Deleted");
  }catch(error){
    return res.send(error);
  }
};

const deleteScheduler = async (req, res) => {
  try {
    const schedulerId = req.params.Id;
    const findSchedule = await pool.query(
      `SELECT id FROM schedule_cal WHERE tipe = true AND id = $1;`,
      [schedulerId]
    );

    if (findSchedule.rows.length > 0) {
      await pool.query(`DELETE FROM scheduler WHERE schedule_id = $1;`, [schedulerId]);
      await pool.query(`DELETE FROM schedule_cal WHERE id = $1 AND tipe = true;`, [schedulerId]);
      res.status(200).send("Schedule deleted successfully");
    } else {
      return res.status(204).send("Schedule not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  getGoogleCalendar,
  postScheduler,
  patchSchedule,
  getSchedulerAssigned,
  getSchedulerById,
  getSchedulerByKaryawanId,
  deleteAssignedPerson,
  deleteScheduler,
};