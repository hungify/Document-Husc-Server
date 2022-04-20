// const { google } = require("googleapis");
// const fs = require("fs");
// const path = require("path");
// const { googleAPI } = require("../configs/env.config");

// const oauth2Client = new google.auth.OAuth2(
//   googleAPI.clientID,
//   googleAPI.clientSecret,
//   googleAPI.redirectUrl
// );
// oauth2Client.setCredentials({ refresh_token: googleAPI.refreshToken });

// const drive = google.drive({ version: "v3", auth: oauth2Client });

// const that = (module.exports = {
//   setFilePublic: async (fileId) => {
//     try {
//       await drive.permissions.create({
//         fileId,
//         requestBody: {
//           role: "reader",
//           type: "anyone",
//         },
//       });
//       const fileUrl = await drive.files.get({
//         fileId,
//         fields: "id, name, mimeType, webViewLink, webContentLink",
//       });
//       return fileUrl.data;
//     } catch (error) {
//       console.log(error);
//     }
//   },
//   uploadFile: async (option) => {
//     try {
//       const createFile = await drive.files.create({
//         requestBody: {
//           name: "photo",
//           mimeType: "image/webp",
//         },
//         media: {
//           mimeType: "image/webp",
//           body: fs.createReadStream(path.join(__dirname, ".././routes/photo.webp")),
//         },
//       });
//       const fileId = createFile.data.id;
//       const getUrl = await that.setFilePublic(fileId);
//       return getUrl;
//     } catch (error) {
//       console.log(error);
//     }
//   },
//   deleteFile: async (fileId) => {
//     try {
//       const deleteFile = await drive.files.delete({
//         fileId,
//       });
//       console.log(deleteFile.data, deleteFile.status);
//     } catch (error) {
//       console.log(error);
//     }
//   },
// });
