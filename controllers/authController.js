const bcrypt = require('bcryptjs');
const db = require('../model/db'); // Configuración de la base de datos
const enviarCorreoValidacion = require('../services/emailService');
const crypto = require('crypto'); // Para generar tokens únicos

// **LOGIN**
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Verificar si el usuario existe
    const [users] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar si la cuenta está validada
    if (!user.verificado) {
      return res.status(403).json({ message: 'Debes verificar tu cuenta antes de iniciar sesión.' });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Guardar la sesión del usuario
    req.session.user = {
      id: user.id,
      username: user.username,
      area: user.departamento,
      role: user.role,
      telefono: user.telefono,
      correo: user.correo
    };

    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// **REGISTRO DE USUARIO**
exports.register = async (req, res) => {
  const {
    nombre,
    rfc,
    curp,
    departamento,
    puesto,
    contrato,
    jornada,
    domicilio,
    nss,
    ingreso,
    password,
    telefono,
    correo
  } = req.body;

  try {
    // Verificar si el correo ya está registrado
    const [existingUsers] = await db.query('SELECT id FROM users WHERE correo = ?', [correo]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Este correo ya está registrado.' });
    }

    // Generar nombre de usuario único
    let username = nombre
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    // Verificar si el username ya existe y agregar un número si es necesario
    let counter = 1;
    let uniqueUsername = username;
    while (true) {
      const [existingUser] = await db.query('SELECT id FROM users WHERE username = ?', [uniqueUsername]);

      if (existingUser.length === 0) break; // Si no existe, lo usamos

      uniqueUsername = `${username}${counter}`; // Agregar número al username
      counter++;
    }
    username = uniqueUsername; // Usar el username único

    // Generar token de validación
    const token = crypto.randomBytes(32).toString('hex');

    // Insertar en la base de datos con la contraseña sin cifrar
    const [result] = await db.query(
      `INSERT INTO users 
        (empresa, nombre, username, rfc, curp, departamento, puesto, contrato, jornada, domicilio, nss, ingreso, password, role, telefono, correo, verificado, token) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'CALTECMEX',
        nombre.toUpperCase(),
        username,
        rfc.toUpperCase(),
        curp.toUpperCase(),
        departamento.toUpperCase(),
        puesto.toUpperCase(),
        contrato.toUpperCase(),
        jornada.toUpperCase(),
        domicilio.toUpperCase(),
        nss,
        ingreso,
        password, // Se enviará en texto plano al usuario antes de cifrarse
        'registered', // Rol por defecto
        telefono,
        correo.toLowerCase(),
        0, // No verificado aún
        token
      ]
    );

    // Enviar correo de validación con los datos
    await enviarCorreoValidacion(
      correo, nombre, username, rfc, curp, departamento, puesto, contrato, jornada, domicilio, nss, ingreso, password, telefono, token
    );

    res.status(201).json({ message: 'Registro exitoso. Revisa tu correo.', userId: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el empleado' });
  }
};

// **VALIDACIÓN DE CUENTA (Se cifra la contraseña después de la verificación)**
exports.validarCuenta = async (req, res) => {
  const { token } = req.params;

  try {
      // Buscar usuario por token
      const [users] = await db.query('SELECT * FROM users WHERE token = ?', [token]);
      const user = users[0];

      if (!user) {
          return res.status(400).json({ message: 'Token inválido o expirado' });
      }

      // Cifrar la contraseña después de la verificación
      const hashedPassword = await bcrypt.hash(user.password, 10);

      // Activar cuenta y actualizar la contraseña cifrada
      await db.query('UPDATE users SET verificado = 1, password = ?, token = NULL WHERE id = ?', [hashedPassword, user.id]);

      res.send('<h2>Cuenta verificada con éxito. Ahora puedes iniciar sesión.</h2>');
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al validar la cuenta' });
  }
};
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 64d0206 (commit admin ListaEmpleados Asignaciones)
=======
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47

exports.listaEmpleados = async (req, res) => {
  try {
      // Consultar empleados excluyendo los administradores y solo los verificados
      const [empleados] = await db.query(
          `SELECT id, empresa, nombre, username, rfc, curp, departamento, puesto, contrato, 
          jornada, domicilio, nss, ingreso, telefono, correo, role, created_at, updated_at 
          FROM users WHERE role != 'admin' AND verificado = 1`
      );

      res.status(200).json({ success: true, empleados });
  } catch (error) {
      console.error('Error al obtener la lista de empleados:', error);
      res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
};
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> def00b5 (commit perfiles)
=======
>>>>>>> 64d0206 (commit admin ListaEmpleados Asignaciones)
=======
>>>>>>> 46908865f5686494c4c81643364f016f3943aa47
