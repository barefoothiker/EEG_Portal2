import os
import datetime
from conf import *

BASE_DIR = os.path.dirname(os.path.dirname(__file__))

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = EMAIL_HOST_USER
EMAIL_HOST_PASSWORD = EMAIL_HOST_PASSWORD
EMAIL_PORT = 587

UPLOAD_FOLDER = "/home/siddhartha/self/andre/input_data/"

SUBMIT_FOLDER = "/data/Synology_Scans/Monitor/Submit/"
DELETE_FOLDER = "/data/Synology_Scans/Monitor/Delete/"
STATUS_FOLDER = "/data/Synology_Scans/Monitor/Status/"

ROI_FOLDER = "/data/Synology_Scans/bin/ROI_Viewer"

BASE_DATA_FOLDER = "/data/Synology_Scans/Processing/Ants"

ANAT_IMG_FOLDER = "/data/Synology_Scans/Processing/Ants/"
LOW_RES_FOLDER = "/T1/Image_Set/Low_Res/BrainExtr"
HIGH_RES_FOLDER = "/T1/Image_Set/High_Res/BrainExtr"

ROOT_URLCONF = 'eegPortalApp.urls'

## Make this unique, and don't share it with anybody.
SECRET_KEY = SECRET_KEY

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True
ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'eegPortalApp',
    'corsheaders',
    'rest_framework',
    'rest_framework.authtoken'
)

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        # 'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.TokenAuthentication',

    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'JWT_SECRET_KEY': SECRET_KEY,
    'JWT_ALLOW_REFRESH': True,
    'JWT_EXPIRATION_DELTA': datetime.timedelta(seconds=1800000)
}

STATICFILES_STORAGE = "require.storage.OptimizedStaticFilesStorage"

MIDDLEWARE = (
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)
# allow access to angular
CORS_ORIGIN_ALLOW_ALL = True

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = (
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
)

CORS_ALLOW_HEADERS = (
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
)

# table prefix name
DB_PREFIX = 'eegPortalApp'
# Local time zone for this installation. Choices can be found here:

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql', # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': EEG_DB_SCHEMA,                      # Or path to database file if using sqlite3.
        'USER': EEG_DB_USER,                      # Not used with sqlite3.
        'PASSWORD': EEG_DB_PASSWORD,                  # Not used with sqlite3.
        'HOST': 'localhost',                      # Set to empty string for localhost. Not used with sqlite3.
        'PORT': '3306',                      # Set to empty string for default. Not used with sqlite3.
        'OPTIONS': {
            'init_command': 'SET default_storage_engine=INNODB',
            }
    }
}

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

STATICFILES_DIRS = [
     os.path.join(BASE_DIR, './static'),
]

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static_final')

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
            },
    },
]

FILE_UPLOAD_HANDLERS = ("django.core.files.uploadhandler.MemoryFileUploadHandler",
                        "django.core.files.uploadhandler.TemporaryFileUploadHandler",)

MEDIA_URL = '/data/Synology_Scans/Monitor/Input/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

LOGIN_REDIRECT_URL = "/eegPortalApp/"
LOGOUT_REDIRECT_URL = "/eegPortalApp/"
