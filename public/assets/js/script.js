const updateModal = new bootstrap.Modal(document.getElementById("updateModal"));

// carga los datos en el documento html al ingresar
document.addEventListener("DOMContentLoaded", async () => {
    let estudiantes = await getEstudiantes();
    cargarTablaEstudiantes(estudiantes);
});

// funcion para obtener estudiantes
const getEstudiantes = async () => {
    try {
        let respuesta = await fetch("/api/estudiantes");
        let datos = await respuesta.json();
        let estudiantes = datos.estudiantes;
        return estudiantes
    } catch (error) {
        console.log(error);
        alert("Error al obtener la lista de estudiantes desde la base de datos.")
    }
}

// funcion para cargar la tabla con datos de estudiantes
const cargarTablaEstudiantes = (estudiantes) => {
    let tablaEstudiantes = document.getElementById("tablaEstudiantes");
    let filas = "";
    let numeroLista = 0;

    for (const estudiante of estudiantes) {
        numeroLista++;
        filas += `
            <tr>
                <th scope="row">${numeroLista}</th>
                <td>${estudiante.nombre}</td>
                <td>${estudiante.rut}</td>
                <td>${estudiante.curso}</td>
                <td>${estudiante.nivel}</td>
                <td>
                    <button class="btn btn-danger" 
                    onclick="eliminarEstudiante('${estudiante.rut}')">Eliminar</button>
                    <button class="btn btn-warning" 
                    onclick="preUpdateEstudiante('${estudiante.rut}')"
                    data-bs-toggle="modal" data-bs-target="#updateModal">
                    Actualizar</button>
                </td>
            </tr>
        `;

        tablaEstudiantes.innerHTML = filas;
    }
}


// capturar datos del formulario para agregar estudiante
let formAddEstudiante = document.getElementById("formAddEstudiante");
let nombreAddEstudiante = document.getElementById("nombreAddEstudiante");
let rutAddEstudiante = document.getElementById("rutAddEstudiante");
let cursoAddEstudiante = document.getElementById("cursoAddEstudiante");
let nivelAddEstudiante = document.getElementById("nivelAddEstudiante");

formAddEstudiante.addEventListener("submit", async (event) => {
    try {
        event.preventDefault();
        let estudiante = await agregarEstudiante();
        console.log(estudiante);

        if (!estudiante) {
            alert("No se han recibido datos del nuevo estudiante.")
        } else {
            alert(`Estudiante ${estudiante[0]}, con rut ${estudiante[1]}, agregado correctamente.`)
        }

        let estudiantes = await getEstudiantes();
        console.log(estudiantes);
        cargarTablaEstudiantes(estudiantes);
        nombreAddEstudiante.value = "";
        rutAddEstudiante.value = "";
        cursoAddEstudiante.value = "";
        nivelAddEstudiante.value = "";
    } catch (error) {
        console.log(error);
        alert("Error al agregar un nuevo estudiante.");
    }
})

// agregar estudiante a la base de datos
const agregarEstudiante = async () => {
    try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            nombre: nombreAddEstudiante.value,
            rut: rutAddEstudiante.value,
            curso: cursoAddEstudiante.value,
            nivel: nivelAddEstudiante.value
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        let respuesta = await fetch("/api/estudiantes", requestOptions);

        if (respuesta.status == 201) {
            let datos = await respuesta.json();
            console.log(datos);
            let estudiante = datos.estudiante;
            return estudiante;
        } else {
            return false
        }

    } catch (error) {
        console.log(error);
        return false
    }
}

// eliminar estudiante
const eliminarEstudiante = async (rut) => {
    try {
        if (confirm(`Esta seguro que desea eliminar al estudiante con rut: ${rut}`)) {

            const requestOptions = {
                method: "DELETE",
                redirect: "follow"
            };

            let respuesta = await fetch(`/api/estudiantes/${rut}`, requestOptions)

            let datos = await respuesta.json();
            alert(datos.message);

            let estudiantes = await getEstudiantes();
            cargarTablaEstudiantes(estudiantes);

        }

    } catch (error) {
        alert("Error al obtener los usuarios desde la bd.");
    }
}

// actualizar estudiante
let rutUpdateEstudiante = document.getElementById("rutUpdateEstudiante");
let nombreUpdateEstudiante = document.getElementById("nombreUpdateEstudiante");
let cursoUpdateEstudiante = document.getElementById("cursoUpdateEstudiante");
let nivelUpdateEstudiante = document.getElementById("nivelUpdateEstudiante");

const cargarDatosModal = (estudiante) => {
    rutUpdateEstudiante.value = estudiante.rut;
    nombreUpdateEstudiante.value = estudiante.nombre;
    cursoUpdateEstudiante.value = estudiante.curso;
    nivelUpdateEstudiante.value = estudiante.nivel;

}

const preUpdateEstudiante = async (rut) => {
    try {
        let respuesta = await fetch(`/api/estudiantes/${rut}`);
        let datos = await respuesta.json();
        let { estudiante } = datos;

        cargarDatosModal(estudiante);
    } catch (error) {
        alert("Error al obtener información del estudiante que se quiere actualizar.");
    }
}

let formUpdateEstudiante = document.getElementById("formUpdateEstudiante");

formUpdateEstudiante.addEventListener("submit", async (event) => {
    try {
        event.preventDefault();

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            nombre: nombreUpdateEstudiante.value,
            rut: rutUpdateEstudiante.value,
            curso: cursoUpdateEstudiante.value,
            nivel: nivelUpdateEstudiante.value
        });

        const requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        let respuesta = await fetch("/api/estudiantes", requestOptions);

        if (respuesta.status == 201) {
            let datos = await respuesta.json();
            let { estudiante } = datos;

            console.log(datos);

            alert(`Estudiante ${estudiante[0]} actualizado exitosamente.`);

            let estudiantes = await getEstudiantes();
            cargarTablaEstudiantes(estudiantes);

            formUpdateEstudiante.reset();
            updateModal.hide();

        } else {
            alert("Error al actualizar los datos del estudiante.")
        }

    } catch (error) {
        console.log(error)
        alert("Error al actualizar los datos del estudiante.")
    }

})