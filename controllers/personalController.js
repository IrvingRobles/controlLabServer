const bcrypt = require('bcryptjs');
const db = require('../model/db'); // Configuración de la base de datos
const crypto = require('crypto'); // Para generar tokens únicos
exports.listaEmpleados = async (req, res) => {
    try {
        // Consultar empleados excluyendo los administradores y solo los verificados
        const [empleados] = await db.query(
            `SELECT id, empresa, nombre, username, rfc, curp, departamento, puesto, contrato, 
            jornada, domicilio, nss, ingreso, telefono, correo, role, created_at, updated_at 
            FROM users`
            // WHERE role !=  verificado = 1 AND 'admin' AND
        );
  
        res.status(200).json({ success: true, empleados });
    } catch (error) {
        console.error('Error al obtener la lista de empleados:', error);
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
  };

  exports.crearEmpleado = async (req, res) => {
    try {
        const { empresa, nombre, username, rfc, curp, departamento, puesto, contrato, jornada, 
                domicilio, nss, ingreso, telefono, correo, password, role, empleado_asignado } = req.body;
        
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insertar en la base de datos
        const query = `
            INSERT INTO users (empresa, nombre, username, rfc, curp, departamento, puesto, contrato, jornada, 
                              domicilio, nss, ingreso, telefono, correo, password, role, empleado_asignado, verificado)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `;
        await db.query(query, [empresa, nombre, username, rfc, curp, departamento, puesto, contrato, jornada, 
                              domicilio, nss, ingreso, telefono, correo, hashedPassword, role, empleado_asignado]);

        res.status(201).json({ success: true, message: "Empleado creado correctamente" });
    } catch (error) {
        console.error("Error al crear empleado:", error);
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};

exports.actualizarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { empresa, nombre, username, rfc, curp, departamento, puesto, contrato, jornada, 
                domicilio, nss, ingreso, telefono, correo, role, empleado_asignado } = req.body;
        
        const query = `
            UPDATE users 
            SET empresa = ?, nombre = ?, username = ?, rfc = ?, curp = ?, departamento = ?, puesto = ?, 
                contrato = ?, jornada = ?, domicilio = ?, nss = ?, ingreso = ?, telefono = ?, correo = ?, 
                role = ?, empleado_asignado = ?
            WHERE id = ?
        `;
        await db.query(query, [empresa, nombre, username, rfc, curp, departamento, puesto, contrato, jornada, 
                              domicilio, nss, ingreso, telefono, correo, role, empleado_asignado, id]);

        res.status(200).json({ success: true, message: "Empleado actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar empleado:", error);
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};

exports.eliminarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `DELETE FROM users WHERE id = ?`;
        await db.query(query, [id]);

        res.status(200).json({ success: true, message: "Empleado eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar empleado:", error);
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
};

exports.obtenerEmpleadoPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const query = `SELECT * FROM users WHERE id = ?`;
        const [empleado] = await db.query(query, [id]);

        if (!empleado) {
            return res.status(404).json({ success: false, message: "Empleado no encontrado" });
        }

        res.status(200).json({ success: true, empleado });
    } catch (error) {
        console.error("Error al obtener empleado:", error);
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
}; 

exports.getUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                id,
                empresa,
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
                telefono
            FROM users 
            WHERE id = ?
        `;
        
        const [user] = await db.query(query, [id]);
        
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "Usuario no encontrado" 
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error("Error en getUsuario:", error);
        res.status(500).json({
            success: false,
            message: "Error en la base de datos",
            error: error.message
        });
    }
};

exports.updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Verificar si el usuario existe antes de actualizar (opcional pero recomendado)
        const [user] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Usuario no encontrado" 
            });
        }

        // Actualizar todos los campos, incluida 'empresa' si viene en el body
        await db.query('UPDATE users SET ? WHERE id = ?', [updates, id]);
        
        res.status(200).json({ 
            success: true, 
            message: "Usuario actualizado correctamente",
            data: updates // Opcional: devolver los cambios aplicados
        });

    } catch (error) {
        console.error("Error en updateUsuario:", error);
        res.status(500).json({ 
            success: false,
            message: "Error al actualizar el usuario",
            error: error.message 
        });
    }
};