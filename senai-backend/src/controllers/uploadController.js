// src/controllers/uploadController.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Garante que o diretório de uploads existe
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nome = `foto_${timestamp}${ext}`;
    cb(null, nome);
  },
});

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Apenas imagens JPG, PNG e WEBP são permitidas."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
});

// Middleware de upload único
const uploadFoto = upload.single("foto");

// Controller para receber a foto
function salvarFoto(req, res) {
  uploadFoto(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "Arquivo muito grande. Máximo: 5MB.",
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    }

    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Nenhum arquivo enviado." });
    }

    res.json({
      success: true,
      message: "Foto salva com sucesso!",
      data: {
        filename: req.file.filename,
        url: `/uploads/${req.file.filename}`,
        size: req.file.size,
      },
    });
  });
}

// Controller para receber foto em base64 (usado pela câmera no front)
function salvarFotoBase64(req, res) {
  try {
    const { imagem_base64, prefixo = "foto" } = req.body;

    if (!imagem_base64) {
      return res.status(400).json({ success: false, message: "Imagem base64 é obrigatória." });
    }

    // Remove o prefixo "data:image/jpeg;base64,"
    const matches = imagem_base64.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ success: false, message: "Formato de imagem inválido." });
    }

    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const data = matches[2];
    const filename = `${prefixo}_${Date.now()}.${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filepath, data, "base64");

    res.json({
      success: true,
      message: "Foto salva com sucesso!",
      data: {
        filename,
        url: `/uploads/${filename}`,
      },
    });
  } catch (err) {
    console.error("Erro ao salvar foto base64:", err);
    res.status(500).json({ success: false, message: "Erro ao salvar imagem." });
  }
}

module.exports = { salvarFoto, salvarFotoBase64 };
