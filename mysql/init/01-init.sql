-- Crear bases de datos
CREATE DATABASE IF NOT EXISTS inventarios_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS productos_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Crear usuario para replicación
CREATE USER IF NOT EXISTS 'replica_user'@'%' IDENTIFIED BY 'replica1234';
GRANT REPLICATION SLAVE ON *.* TO 'replica_user'@'%';
FLUSH PRIVILEGES;