#! /bin/bash
set -e

# psql "host=postgres-db user=$DJANGO_POSTGRES_USER password=$DJANGO_POSTGRES_PASSWORD dbname=postgres" <<SQL
#
# -- Create DBs with permissive permissions.
#
# CREATE DATABASE template_secure;
# \c template_secure
#
# CREATE DATABASE ${DJANGO_DB_PREFIX}daphni_analysis_queue TEMPLATE template_secure;
# CREATE DATABASE ${DJANGO_DB_PREFIX}daphni_analysis_results TEMPLATE template_secure;
# CREATE DATABASE ${DJANGO_DB_PREFIX}daphni_patient_data TEMPLATE template_secure;
# CREATE DATABASE ${DJANGO_DB_PREFIX}daphni_processing TEMPLATE template_secure;
# CREATE DATABASE mm_phi TEMPLATE template_secure;
#
# \c mm_phi;
# DROP DATABASE template_secure;

# SQL


python3 manage.py migrate contenttypes
python3 manage.py migrate auth
python3 manage.py migrate admin
python3 manage.py migrate


# python3 manage.py shell <<MAKE_USER
# from django.contrib.auth.models import User
# user = User.objects.create_user('test', password='pass')
# user.save()
# MAKE_USER

uwsgi --emperor /app/uwsgi_sites/
