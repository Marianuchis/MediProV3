// backend/server.js
// ===============================================
// API del consultorio - Autenticación básica
// Tabla usada: login (usuario, contrasenia, tipo)
// ===============================================

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();

// --- CORS y parsing JSON ---
// Para desarrollo dejamos CORS abierto.
// En producción, reemplaza origin:'*' por tu dominio.
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// --- Config MySQL ---
// Ajusta usuario/password/host/BD a tu entorno
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "", // <-- tu password si aplica
  database: "consultorio", // <-- tu base de datos
});

// Conexión MySQL
db.connect((err) => {
  if (err) {
    console.error("Error MySQL:", err);
    process.exit(1);
  }
  console.log("MySQL conectado (consultorio)");
});

// Helper: promesa para consultas
const q = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) =>
      err ? reject(err) : resolve(results)
    );
  });

// Nombre de la tabla real
const TABLE = "login";

// -----------------------------------------------
// Healthcheck rápido
// -----------------------------------------------
app.get("/ping", (req, res) => res.json({ ok: true, t: Date.now() }));

// -----------------------------------------------
// AUTH - REGISTRO
// Body: { usuario, contrasenia, tipo? }
// - Si "contrasenia" viene en texto plano, se guarda como hash bcrypt.
// - "tipo" es opcional; por defecto 2.
// -----------------------------------------------
app.post("/auth/register", async (req, res) => {
  try {
    const { usuario, contrasenia, tipo = 2 } = req.body;

    if (!usuario || !contrasenia) {
      return res.status(400).json({ ok: false, message: "Faltan datos" });
    }

    // ¿Usuario ya existe?
    const exists = await q(`SELECT usuario FROM ${TABLE} WHERE usuario = ?`, [
      usuario,
    ]);
    if (exists.length) {
      return res
        .status(409)
        .json({ ok: false, message: "El usuario ya existe" });
    }

    // Hash seguro de la contraseña
    const hash = await bcrypt.hash(contrasenia, 10);

    // Insert en tu tabla real: login (usuario, contrasenia, tipo)
    await q(
      `INSERT INTO ${TABLE} (usuario, contrasenia, tipo) VALUES (?, ?, ?)`,
      [usuario, hash, tipo]
    );

    return res.json({ ok: true, message: "Registro exitoso" });
  } catch (err) {
    console.error("REGISTER ERR:", err);
    return res.status(500).json({ ok: false, message: "Error de servidor" });
  }
});

// -----------------------------------------------
// AUTH - LOGIN
// Body: { usuario, contrasenia }
// - Soporta contraseñas hasheadas (bcrypt).
// - Si detecta registros antiguos en texto plano, hace fallback temporal.
// -----------------------------------------------
app.post("/auth/login", async (req, res) => {
  try {
    const { usuario, contrasenia } = req.body;

    if (!usuario || !contrasenia) {
      return res.status(400).json({ ok: false, message: "Faltan datos" });
    }

    // Trae usuario de la tabla login
    const rows = await q(
      `SELECT usuario, contrasenia, tipo FROM ${TABLE} WHERE usuario = ?`,
      [usuario]
    );
    if (!rows.length) {
      return res
        .status(401)
        .json({ ok: false, message: "Credenciales inválidas" });
    }

    const u = rows[0];

    // ¿Está hasheada? (bcrypt inicia con "$2")
    let passOK = false;
    if (typeof u.contrasenia === "string" && u.contrasenia.startsWith("$2")) {
      passOK = await bcrypt.compare(contrasenia, u.contrasenia);
    } else {
      // Fallback: contraseñas antiguas en texto plano
      passOK = contrasenia === u.contrasenia;
    }

    if (!passOK) {
      return res
        .status(401)
        .json({ ok: false, message: "Credenciales inválidas" });
    }

    return res.json({
      ok: true,
      user: { usuario: u.usuario, tipo: u.tipo }, // no exponemos hash ni datos sensibles
      message: "Login exitoso",
    });
  } catch (err) {
    console.error("LOGIN ERR:", err);
    return res.status(500).json({ ok: false, message: "Error de servidor" });
  }
});

// -----------------------------------------------
// LISTA DE USUARIOS
// Petición para mostrar información de usuarios en una tabla.
// Muestra el id, el usuario y el tipo de usuario y los regresa como json
// Si encuentra un error, regresa un error de servidor
// -----------------------------------------------
app.get("/usuarios", async (req, res) => {
  try {
    const rows = await q(`SELECT idUsuario,usuario, tipo FROM ${TABLE}`);
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("USUARIOS ERR:", err);
    return res.status(500).json({ ok: false, message: "Error de servidor" });
  }
});

// -----------------------------------------------
// ELIMINAR USUARIO
// Borra un usuario especifico con el id que se envia desde la tabla
// en el frontend usando la ruta /usuarios/:id, donde :id es el id del usuario a borrar
// -----------------------------------------------
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validar id
    if (!id) return res.status(400).json({ ok: false, message: "Falta ID" });

    // Ejecutar eliminación
    const result = await q(`DELETE FROM ${TABLE} WHERE idUsuario = ?`, [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "Usuario no encontrado" });
    }
    return res.json({ ok: true, message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("DELETE ERR:", err);
    return res.status(500).json({ ok: false, message: "Error de servidor" });
  }
});

// --- Arranque del servidor ---
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`API en http://localhost:${PORT}`)
);
