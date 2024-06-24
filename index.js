import express from 'express';
import pool from './database.js';

const app = express();

app.listen(3000, () => {
    console.log("Servidor en http://localhost:3000")
})

app.use(express.json());
app.use(express.urlencoded({ extended : true }));

app.use(express.static("public"));

//Agregar nuevo estudiante
app.post("/api/estudiantes", async (req, res) => {
    try {
        let { nombre, rut, curso, nivel } = req.body;

        if(!nombre || !rut || !curso || !nivel){
            return res.status(400).json({
                message: "Debe ingresar todos los datos solicitados"
            })
        }

        let consulta = {
            text: "INSERT INTO usuarios (nombre, rut, curso, nivel) VALUES ($1, $2, $3, $4) RETURNING *",
            values: [nombre, rut, curso, nivel],
            rowMode: "array"
        }

        let results =  await pool.query(consulta);

        console.log(results.rows);

        res.status(201).json({
            message: "Estudiante agregado con exito.",
            estudiante: results.rows[0]
        })

    } catch (error) {
        console.log(error);
        if(error.code == "23505"){
            return res.status(400).json({
                message: "Ya existe un estudiante registrado con el rut proporcionado."
            })
        }
        res.status(500).json({
            message: "Ha ocurrido un error con el servidor."
        })
    }
})

//Consultar estudiantes registrados
app.get("/api/estudiantes", async (req, res) => {
    try {
        let consulta = {
            text: "SELECT nombre, rut, curso, nivel FROM usuarios",
            values: []
        };

        let results =  await pool.query(consulta);
        if(results.rowCount > 0){
            res.json({
                estudiantes: results.rows,
                cantidad: results.rowCount,
                message: "OK"
            })
        } else {
            res.json({
                message: "No existen usuarios registrados.",
                usuarios: results.rows,
                cantidad: results.rowCount
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener los datos de estudiantes."
        })
    }
})

//Consultar estudiante por rut.
app.get("/api/estudiantes/:rut", async (req, res) => {
    try {
        let rut = req.params.rut;
        let consulta = {
            text: "SELECT nombre, rut, curso, nivel FROM usuarios WHERE rut = $1",
            values: [rut]
        };

        let results =  await pool.query(consulta);
        if(results.rowCount > 0){
            res.json({
                estudiante: results.rows[0],
                message: "OK"
            })
        } else {
            res.status(404).json({
                message: "Estudiante no encontrado",
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener los datos del estudiante."
        })
    }
})

//Actualizar la información de un estudiante.
app.put("/api/estudiantes", async (req, res) => {
    try {
        let { nombre, rut, curso, nivel } = req.body;

        if(!nombre || !rut || !curso || !nivel){
            return res.status(400).json({
                message: "Debe ingresar todos los datos solicitados"
            })
        }

        let consulta = {
            text: "UPDATE usuarios SET nombre = $1, curso = $2, nivel = $3 WHERE rut = $4 RETURNING nombre, rut, curso, nivel",
            values: [nombre, curso, nivel, rut],
            rowMode: "array"
        }

        let results =  await pool.query(consulta);

        if(results.rowCount<1){
            return res.status(400).json({
                message: "El rut ingresado no existe."
            })
        }

        console.log(results.rows);

        res.status(201).json({
            message: "Estudiante actualizado con exito.",
            estudiante: results.rows[0]
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Ha ocurrido un error con el servidor."
        })
    }
})

//Eliminar el registro de un estudiante.
app.delete("/api/estudiantes/:rut", async (req, res) => {
    try {
        let rut = req.params.rut;
        let consulta = {
            text: "DELETE FROM usuarios WHERE rut = $1 RETURNING nombre, rut",
            values: [rut]
        };

        let results =  await pool.query(consulta);
        if(results.rowCount > 0){
            res.json({
                usuario: results.rows[0],
                message: "Estudiante eliminado correctamente"
            })
        } else {
            res.status(404).json({
                message: "Error al eliminar el estudiante",
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Error al obtener los datos del estudiante."
        })
    }
})