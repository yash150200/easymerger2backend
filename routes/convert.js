const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');

const { PDFDocument } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');

const sharp = require('sharp');
const ConvertAPI = require('convertapi');

const { uploadImages, uploadWord } = require('./upload');

const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');

const getDownloadUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/outputs/${filename}`;
};

// IMAGE TO PDF
router.post('/image-to-pdf', (req, res) => {

  uploadImages(req, res, async (err) => {

    if (err) {
      return res.status(400).json({
        error: err.message,
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No images uploaded',
      });
    }

    try {

      const pdfDoc = await PDFDocument.create();

      for (const file of req.files) {

        const pngBuffer = await sharp(file.path)
          .rotate()
          .png()
          .toBuffer();

        const image = await pdfDoc.embedPng(pngBuffer);

        const page = pdfDoc.addPage([
          image.width,
          image.height,
        ]);

        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });

        fs.unlinkSync(file.path);
      }

      const pdfBytes = await pdfDoc.save();

      const outName =
        `easymerge_${uuidv4()}.pdf`;

      const outPath = path.join(
        OUTPUTS_DIR,
        outName
      );

      fs.writeFileSync(
        outPath,
        pdfBytes
      );

      return res.json({
        success: true,
        fileName: outName,
        downloadUrl: getDownloadUrl(req, outName),
      });

    } catch (e) {

      console.log(e);

      return res.status(500).json({
        error: 'Image conversion failed',
      });

    }

  });

});

// WORD TO PDF
router.post('/word-to-pdf', (req, res) => {

  uploadWord(req, res, async (err) => {

    if (err) {
      return res.status(400).json({
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No document uploaded',
      });
    }

    try {

      const convertapi = ConvertAPI(
        process.env.CONVERT_API_SECRET
      );

      const result = await convertapi.convert(
        'pdf',
        {
          File: req.file.path,
        },
        'docx'
      );

      const outName =
        `easymerge_${uuidv4()}.pdf`;

      const outPath = path.join(
        OUTPUTS_DIR,
        outName
      );

      await result.file.save(outPath);

      fs.unlinkSync(req.file.path);

      return res.json({
        success: true,
        fileName: outName,
        downloadUrl: getDownloadUrl(req, outName),
      });

    } catch (e) {

      console.log(e);

      return res.status(500).json({
        error: 'Word conversion failed',
      });

    }

  });

});

module.exports = router;