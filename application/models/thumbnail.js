const path = require("path");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const ffmpegPath = "ffmpeg"; // Ensure 'ffmpeg' is in your PATH, or provide the full path to the ffmpeg executable

module.exports = {
  makeThumbnail: async function (req, res, next) {
    if (!req.file) {
      return next(new Error("File upload failed"));
    }

    try {
      const destinationOfThumbnail = `public/uploads/thumbnails/thumbnail-${
        req.file.filename.split(".")[0]
      }.png`;
      const thumbnailCommand = `${ffmpegPath} -ss 00:00:01 -i ${req.file.path} -y -s 200x200 -vframes 1 -f image2 ${destinationOfThumbnail}`;

      await exec(thumbnailCommand);
      req.file.thumbnail = destinationOfThumbnail;
      next();
    } catch (error) {
      next(error);
    }
  },
};
