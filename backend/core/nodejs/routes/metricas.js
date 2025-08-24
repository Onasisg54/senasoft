import express from 'express';
const router = express.Router();
import mysql from 'mysql2/promise';

// Configuración centralizada de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '0000',
    database: 'senasoft',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Pool de conexiones reutilizable
const pool = mysql.createPool(dbConfig);

// Función helper para consultas de base de datos
async function query(sql, params = []) {
    try {
        const [rows] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error('Error en consulta SQL:', error);
        throw error;
    }
}

router.get('/aprendices-por-centro', async (req, res) => {
    try {
        const sql = `
            SELECT
                d.name AS departamento,
                c.name AS centro_formacion,
                COUNT(*) AS cantidad_inscritos
            FROM apprentices AS a
            INNER JOIN centers AS c ON a.id_center_fk = c.id
            INNER JOIN departments AS d ON c.id_department_fk = d.id
            GROUP BY d.name, c.name
            ORDER BY cantidad_inscritos DESC
        `;

        const filas = await query(sql);

        res.status(200).json({
            success: true,
            message: "OK",
            data: filas
        });
    } catch (e) {
        console.error('Error en /centros-de-formacion-aprendices:', e);
        res.status(500).json({
            success: false,
            message: 'No se pudo recuperar los datos.',
            error: e.message
        });
    }
});

router.get('/recomendaciones-aprendices-instructores', async (req, res) => {
    try {
        const sql = `
            SELECT
                c.name AS centro_formacion,
                CONCAT(i.name, ' ', i.last_name) AS instructor,
                COUNT(*) AS recomendaciones_total
            FROM apprentices a
            JOIN centers c ON a.id_center_fk = c.id
            JOIN recommendations r ON a.id = r.id_aprendiz_fk
            JOIN instructors i ON r.id_instructor_fk = i.id
            GROUP BY c.name, i.id, i.name, i.last_name
            ORDER BY c.name, recomendaciones_total DESC
        `;

        const filas = await query(sql);

        res.status(200).json({
            success: true,
            message: "OK",
            data: filas
        });
    } catch (e) {
        console.error('Error en /instructores-recomendados:', e);
        res.status(500).json({
            success: false,
            message: 'No se pudo recuperar los datos.',
            error: e.message
        });
    }
});

router.get('/aprendices-por-programa-y-centro', async (req, res) => {
    try {
        const sql = `
            SELECT
                c.name AS centro_formacion,
                p.name AS programa_formacion,
                COUNT(a.id) AS cantidad_inscritos
            FROM apprentices a
            JOIN programs p ON a.id_program_fk = p.id
            JOIN centers c ON a.id_center_fk = c.id
            WHERE p.name IN (?, ?, ?, ?)
            GROUP BY c.name, p.name
            ORDER BY c.name
        `;

        const programas = [
            'Análisis y Desarrollo de Software',
            'Gestión de Proyectos de Software',
            'Producción de Multimedia',
            'Tecnología en Animación 3D'
        ];

        const filas = await query(sql, programas);

        res.status(200).json({
            success: true,
            message: "OK",
            data: filas
        });
    } catch (e) {
        console.error('Error en /centros-y-programas-aprendices:', e);
        res.status(500).json({
            success: false,
            message: 'No se pudo recuperar los datos.',
            error: e.message
        });
    }
});

router.get('/aprendices-por-departamento', async (req, res) => {
    try {
        const sql = `
            SELECT
                d.name AS departamento,
                COUNT(a.id) AS cantidad_inscritos
            FROM apprentices a
            JOIN centers c ON a.id_center_fk = c.id
            JOIN departments d ON c.id_department_fk = d.id
            GROUP BY d.name
            ORDER BY cantidad_inscritos DESC
        `;

        const filas = await query(sql);

        res.status(200).json({
            success: true,
            message: "OK",
            data: filas
        });
    } catch (e) {
        console.error('Error en /departamentos-aprendices:', e);
        res.status(500).json({
            success: false,
            message: 'No se pudo recuperar los datos.',
            error: e.message
        });
    }
});

router.get('/aprendices-por-github', async (req, res) => {
    try {
        const sql = `
            SELECT 
                COUNT(a.github_user) AS numero_usuarios_github
            FROM apprentices AS a
            WHERE a.github_user IS NOT NULL 
            AND a.github_user != ''
        `;

        const filas = await query(sql);

        res.status(200).json({
            success: true,
            message: "OK",
            data: filas
        });
    } catch (e) {
        console.error('Error en /github-aprendices:', e);
        res.status(500).json({
            success: false,
            message: 'No se pudo recuperar los datos.',
            error: e.message
        });
    }
});

router.get('/nivel-ingles-b1-y-b2', async (req, res) => {
    try {
        const sql = `
            SELECT 
                c.name AS centro_formacion,
                COUNT(*) AS numero_aprendices
            FROM apprentices a
            INNER JOIN centers c ON c.id = a.id_center_fk
            WHERE a.level_english IN (?, ?)
            GROUP BY c.name
            ORDER BY numero_aprendices DESC
        `;

        const nivelesIngles = ['B1', 'B2'];
        const filas = await query(sql, nivelesIngles);

        res.status(200).json({
            success: true,
            message: "OK",
            data: filas
        });
    } catch (e) {
        console.error('Error en /centros-ingles-aprendices:', e);
        res.status(500).json({
            success: false,
            message: 'No se pudo recuperar los datos.',
            error: e.message
        });
    }
});

// Middleware para cerrar el pool cuando la aplicación termine
process.on('SIGINT', async () => {
    console.log('Cerrando pool de conexiones...');
    await pool.end();
    process.exit(0);
});

export default router;