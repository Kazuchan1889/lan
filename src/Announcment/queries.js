const getUserRole = `select role from karyawan where  id = $1`;

const postAnnouncement = `insert into announcement(admin_id, title, description, attachment, tanggal_upload) values ($1, $2, $3, $4, $5)`;

const getAnnouncement = `select id, title, description, attachment, tanggal_upload from announcement ORDER BY id DESC`;

const patchAnnouncement = `
  UPDATE announcement
  SET title = $1, description = $2, attachment = $3, tanggal_upload = $4
  WHERE id = $5;
`;

const deleteAnnouncement = `delete from announcement where id =$1;`;

module.exports = {
    getUserRole,
    postAnnouncement,
    getAnnouncement,
    deleteAnnouncement,
    patchAnnouncement,
}