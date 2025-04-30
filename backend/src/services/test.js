const formatosValidos = {
    "xlsx": "Archivo de Excel",
    "pdf": "Documento PDF",
    "jpg": "Imagen",
    "mp3": "Audio",
};

function test(filename) {
    let extension = filename.split('.').pop();
    let descripcion = formatosValidos[extension] || "Formato desconocido";

    console.log(`El archivo es un ${descripcion} con extensión .${extension}`);
}