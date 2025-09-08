#!/bin/bash
echo "Haciendo push al repositorio..."
git push origin main

echo "Ejecutando deploy en servidor..."
ssh root@195.200.4.76 "bash /var/www/html/ingresoFront/deploy.sh"
read -p "Presiona Enter para cerrar..."
echo "Despliegue completado."