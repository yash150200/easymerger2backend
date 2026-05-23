const express = require('express');
const router = express.Router();

const path = require('path');
const fs = require('fs');

const { PDFDocument } = require('pdf-lib');
const { v4: uuidv4 } = require('uuid');

const { uploadPdfs } = require('./upload');

const OUTPUTS_DIR = path.join(__dirname, '..', 'outputs');

const getDownloadUrl = (req, filename) => {
  return `${req.protocol}://${req.get('host')}/outputs/${filename}`;
};

router.post('/pdfs', (req, res) => {

  uploadPdfs(req, res, async (err) => {

    if (err) {
      return res.status(400).json({
        error: err.message,
      });
    }

    if (!req.files || req.files.length < 2) {
      return res.status(400).json({
        error: 'Minimum 2 PDFs required',
      });
    }

    try {

      const mergedPdf =
        await PDFDocument.create();

      for (const file of req.files) {

        const pdfBytes = fs.readFileSync(
          file.path
        );

        const pdf =
          await PDFDocument.load(pdfBytes);

        const copiedPages =
          await mergedPdf.copyPages(
            pdf,
            pdf.getPageIndices()
          );

        copiedPages.forEach(page => {
          mergedPdf.addPage(page);
        });

        fs.unlinkSync(file.path);
      }

      const finalPdf =
        await mergedPdf.save();

      const outName =
        `easymerge_merged_${uuidv4()}.pdf`;

      const outPath = path.join(
        OUTPUTS_DIR,
        outName
      );

      fs.writeFileSync(
        outPath,
        finalPdf
      );

      return res.json({
        success: true,
        fileName: outName,
        downloadUrl: getDownloadUrl(req, outName),
      });

    } catch (e) {

      console.log(e);

      return res.status(500).json({
        error: 'Merge failed',
      });

    }

  });

});

module.exports = router;