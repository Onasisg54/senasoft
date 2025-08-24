// Seleccionar (o crear) la base
use("senasoft");

// Crear colección
db.createCollection("metrics_scalar");

// Insertar datos iniciales (1 fila de ejemplo)
db.metrics_scalar.insertOne([
    {
    "Metric": "PFFRONT",
    "Description": "% de perfiles DEV Frontend en los aprendices inscritos",
    "Value": "31.0%"
    }
]);
