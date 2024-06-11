const pool = require("../../db");
const queries = require("./queries");
const check = require("../../public");

const getAnnounce = async(req,res)=>{
    const displayAnnouncement = await pool.query(queries.getAnnouncement);
    res.status(200).send(displayAnnouncement.rows);

};
//middleware works

const postAnnounce = async(req,res)=>{
    //TODO make admin the only one who can do this
    try{
        
        const {
            title,
            description,
            attachment,
            tanggal_upload
        }=req.body;
        if(req.userRole!='admin'){
        return res.status(403).send('Akses Ditolak');
        }

        if(title==null||title==""){
        return res.status(302).send('title needed');
        }
        if(attachment.length>10000000){
            return res.status(302).send('file too big');
        }
        else{
            const Announce = await pool.query(queries.postAnnouncement,[req.userId, title, description, attachment, tanggal_upload]);
            console.log('announcement successful');
            // res.status(200).send('announcement sent');
            return res.status(201).send(req.body);
        }
        
    }
    catch(error){
        return res.status(500).json({ error: error.message });
    }
};

const patchAnnounce = async (req, res) => {
    try {
      const { title, description, tanggal_upload, id } = req.body;
      let attachment = req.body.attachment; // Default to the existing attachment
  
      if (req.userRole !== 'admin') {
        return res.status(403).send('Akses Ditolak');
      }
  
      if (!title) {
        return res.status(302).send('title needed');
      }
  
      if (req.file) {
        attachment = req.file.path; // If a new file is uploaded, update the attachment path
        if (req.file.size > 10000000) {
          return res.status(302).send('file too big');
        }
      }
  
      const announce = await pool.query(queries.patchAnnouncement, [title, description, attachment, tanggal_upload, id]);
      console.log('Update successful');
      return res.status(201).send(req.body);
  
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };


const deleteAnnounce = async(req,res)=>{
    try{
        if(req.userRole!='admin'){
        return res.status(403).send('Akses Ditolak');
        }
        else{
            const Announce = await pool.query(queries.deleteAnnouncement,[req.params.id]);
            console.log('Delete successful');
            // res.status(200).send('announcement sent');
            return res.status(201).send(req.body);
        }
        
    }
    catch(error){
        return res.status(500).json({ error: error.message });
    }
};



module.exports={
    getAnnounce,
    postAnnounce,
    deleteAnnounce,
    patchAnnounce,

}