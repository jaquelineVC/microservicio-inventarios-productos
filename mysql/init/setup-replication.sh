#!/bin/bash
set -e

echo 'Esperando 25 segundos...'
sleep 25

echo '====================================='
echo 'Configurando replicacion'
echo '====================================='

echo '1. Creando usuarios...'
mysql -h mysql-master-inventarios -uroot -proot1234 -e "CREATE USER IF NOT EXISTS 'replica_user'@'%' IDENTIFIED WITH mysql_native_password BY 'replica1234'; GRANT REPLICATION SLAVE ON *.* TO 'replica_user'@'%'; FLUSH PRIVILEGES;"
mysql -h mysql-master-productos -uroot -proot1234 -e "CREATE USER IF NOT EXISTS 'replica_user'@'%' IDENTIFIED WITH mysql_native_password BY 'replica1234'; GRANT REPLICATION SLAVE ON *.* TO 'replica_user'@'%'; FLUSH PRIVILEGES;"

echo '2. Obteniendo posiciones...'
INV_FILE=$(mysql -h mysql-master-inventarios -uroot -proot1234 --batch --skip-column-names -e 'SHOW MASTER STATUS' | cut -f1)
INV_POS=$(mysql -h mysql-master-inventarios -uroot -proot1234 --batch --skip-column-names -e 'SHOW MASTER STATUS' | cut -f2)
echo "   Inventarios - File: $INV_FILE Position: $INV_POS"

PROD_FILE=$(mysql -h mysql-master-productos -uroot -proot1234 --batch --skip-column-names -e 'SHOW MASTER STATUS' | cut -f1)
PROD_POS=$(mysql -h mysql-master-productos -uroot -proot1234 --batch --skip-column-names -e 'SHOW MASTER STATUS' | cut -f2)
echo "   Productos - File: $PROD_FILE Position: $PROD_POS"

echo '3. Configurando canal Inventarios...'
mysql -h mysql-replica -uroot -proot1234 -e "CHANGE REPLICATION SOURCE TO SOURCE_HOST='mysql-master-inventarios', SOURCE_PORT=3306, SOURCE_USER='replica_user', SOURCE_PASSWORD='replica1234', SOURCE_LOG_FILE='${INV_FILE}', SOURCE_LOG_POS=${INV_POS}, GET_SOURCE_PUBLIC_KEY=1 FOR CHANNEL 'inventarios'; START REPLICA FOR CHANNEL 'inventarios';"

echo '4. Configurando canal Productos...'
mysql -h mysql-replica -uroot -proot1234 -e "CHANGE REPLICATION SOURCE TO SOURCE_HOST='mysql-master-productos', SOURCE_PORT=3306, SOURCE_USER='replica_user', SOURCE_PASSWORD='replica1234', SOURCE_LOG_FILE='${PROD_FILE}', SOURCE_LOG_POS=${PROD_POS}, GET_SOURCE_PUBLIC_KEY=1 FOR CHANNEL 'productos'; START REPLICA FOR CHANNEL 'productos';"

echo '5. Creando bases de datos en masters para que se repliquen...'
mysql -h mysql-master-inventarios -uroot -proot1234 -e "CREATE DATABASE IF NOT EXISTS inventarios_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -h mysql-master-productos -uroot -proot1234 -e "CREATE DATABASE IF NOT EXISTS productos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo '6. Esperando que las BDs se repliquen...'
sleep 10

echo '7. Verificando BDs en replica...'
mysql -h mysql-replica -uroot -proot1234 -e "SHOW DATABASES;"

echo '8. Verificando canales...'
echo '--- Canal Inventarios ---'
mysql -h mysql-replica -uroot -proot1234 -e "SHOW REPLICA STATUS FOR CHANNEL 'inventarios'\G" | grep -E 'Running|Error|Channel_Name|Seconds'
echo '--- Canal Productos ---'
mysql -h mysql-replica -uroot -proot1234 -e "SHOW REPLICA STATUS FOR CHANNEL 'productos'\G" | grep -E 'Running|Error|Channel_Name|Seconds'

echo '====================================='
echo 'Replicacion lista'
echo '====================================='