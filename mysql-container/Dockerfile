FROM mysql:8.0

# Variables de entorno para configuración
ENV MYSQL_ROOT_PASSWORD=MyS3cureP@ss2024!
ENV MYSQL_DATABASE=hospital_service
ENV MYSQL_USER=hospital_user
ENV MYSQL_PASSWORD=HospitalP@ss2024!

# Directorios para datos y certificados
RUN mkdir -p /var/lib/mysql /etc/mysql/ssl /docker-entrypoint-initdb.d

# Script para generar certificados TLS auto-firmados
COPY generate-certs.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/generate-certs.sh

# Configuración personalizada de MySQL
COPY custom.cnf /etc/mysql/conf.d/

# Script SQL para inicializar esquema (se ejecuta automáticamente al inicializar MySQL)
COPY init-mysql-schema.sql /docker-entrypoint-initdb.d/

# Configurar permisos
RUN chown -R mysql:mysql /var/lib/mysql /etc/mysql/ssl

# Entrypoint personalizado que genera certificados si no existen
COPY docker-entrypoint-init.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint-init.sh

# Puerto MySQL
EXPOSE 3306

# Usar entrypoint personalizado
ENTRYPOINT ["/usr/local/bin/docker-entrypoint-init.sh"]
CMD ["mysqld"]


