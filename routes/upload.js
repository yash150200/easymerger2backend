const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR =
  path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, {
    recursive: true,
  });
}

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {

    const ext =
      path.extname(file.originalname);

    cb(null, `${uuidv4()}${ext}`);
  },

});

const imageFilter = (req, file, cb) => {

  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/octet-stream'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only images allowed'));
  }

};

const wordFilter = (req, file, cb) => {

  const ext =
    path.extname(file.originalname)
      .toLowerCase();

  if (
    ext === '.doc' ||
    ext === '.docx'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only DOC/DOCX allowed'));
  }

};

const pdfFilter = (req, file, cb) => {

  const ext =
    path.extname(file.originalname)
      .toLowerCase();

  if (ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files allowed'));
  }

};

const LIMITS = {
  fileSize: 50 * 1024 * 1024,
};

module.exports = {

  uploadImages: multer({
    storage,
    fileFilter: imageFilter,
    limits: LIMITS,
  }).array('images', 20),

  uploadWord: multer({
    storage,
    fileFilter: wordFilter,
    limits: LIMITS,
  }).single('document'),

  uploadPdfs: multer({
    storage,
    fileFilter: pdfFilter,
    limits: LIMITS,
  }).array('pdfs', 20),

};