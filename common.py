"""
This file defines cache, session, and translator T object for the app
These are fixtures that every app needs so probably you will not be editing this file
"""

import logging
import os
import sys
import uuid

from py4web import DAL, Cache, Field, Flash, Session, Translator, action
from py4web.utils.auth import Auth
from py4web.utils.downloader import downloader
from py4web.utils.factories import ActionFactory
from py4web.utils.form import (  # added import Field Form and FormStyleBulma to get form working
    Form,
    FormStyleBootstrap4,
    FormStyleBulma,
)
from py4web.utils.mailer import Mailer
from pydal.tools.tags import Tags

from . import settings

# from py4web.utils.factories import Inject


def str_uuid():
    unique_id = str(uuid.uuid4().hex)
    return unique_id


# #######################################################
# implement custom loggers form settings.LOGGERS
# #######################################################
logger = logging.getLogger("py4web:" + settings.APP_NAME)

# Remove all existing handlers to prevent duplicates
if logger.hasHandlers():
    logger.handlers.clear()

formatter = logging.Formatter(
    "%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s"
)

# Set logger to DEBUG level
logger.setLevel(logging.DEBUG)

# Add handlers based on settings
handlers_added = set()  # Track which handlers we've added to avoid duplicates
for item in settings.LOGGERS:
    level, filename = item.split(":", 1)
    handler_key = f"{level}:{filename}"

    if handler_key not in handlers_added:
        if filename in ("stdout", "stderr"):
            handler = logging.StreamHandler(getattr(sys, filename))
        else:
            handler = logging.FileHandler(filename)
        handler.setLevel(getattr(logging, level.upper(), logging.DEBUG))
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        handlers_added.add(handler_key)

# Test logger
logger.info("Logger initialized in common.py with debug level")

# #######################################################
# connect to db
# #######################################################
db = DAL(
    settings.DB_URI,
    folder=settings.DB_FOLDER,
    pool_size=settings.DB_POOL_SIZE,
    migrate=settings.DB_MIGRATE,
    fake_migrate=settings.DB_FAKE_MIGRATE,
    ignore_field_case=False,  # added for postgres
    entity_quoting=True,
)

dbo = DAL(
    settings.DB_OCTOPUS,
    folder=settings.DBO_FOLDER,
    pool_size=settings.DB_POOL_SIZE,
    migrate_enabled=False,
)

# #######################################################
# define global objects that may or may not be used by the actions
# #######################################################
cache = Cache(size=1000)
T = Translator(settings.T_FOLDER)
flash = Flash()

# #######################################################
# pick the session type that suits you best
# #######################################################
if settings.SESSION_TYPE == "cookies":
    session = Session(secret=settings.SESSION_SECRET_KEY)
elif settings.SESSION_TYPE == "redis":
    import redis

    host, port = settings.REDIS_SERVER.split(":")
    # for more options: https://github.com/andymccurdy/redis-py/blob/master/redis/client.py
    conn = redis.Redis(host=host, port=int(port))
    conn.set = lambda k, v, e, cs=conn.set, ct=conn.ttl: (
        cs(k, v, ct(k)) if ct(k) >= 0 else cs(k, v, e)
    )
    session = Session(secret=settings.SESSION_SECRET_KEY, storage=conn)
elif settings.SESSION_TYPE == "memcache":
    import time

    import memcache

    conn = memcache.Client(settings.MEMCACHE_CLIENTS, debug=0)
    session = Session(secret=settings.SESSION_SECRET_KEY, storage=conn)
elif settings.SESSION_TYPE == "database":
    from py4web.utils.dbstore import DBStore

    session = Session(secret=settings.SESSION_SECRET_KEY, storage=DBStore(db))

# #######################################################
# Instantiate the object and actions that handle auth
# #######################################################

db.define_table("gender", Field("sex", "string"), format="%(sex)s")

db.define_table("ethny", Field("ethny", "string"), format="%(ethny)s")

db.define_table("marital", Field("marital_status"), format="%(marital_status)s")

db.define_table(
    "membership",
    Field("membership", "string"),
    Field("hierarchy", "integer"),
    format="%(membership)s",
)

auth = Auth(session, db, define_tables=False)
more_auth_fields = [
    Field("uid", "string", default=str_uuid()),
    Field("membership", "reference membership"),
    Field("maiden_name", "string", label="Maiden name"),
    Field("dob", "date", label="Date of birth"),
    Field("birth_town", "string", label="Town of birth"),
    Field("birth_country", "string", label="Country of birth"),
    Field("gender", "reference gender", label="Gender"),
    Field("marital", "reference marital", label="Marital status"),
    Field("ethny", "reference ethny", label="Ethny"),
    Field("idc_num", "string", label="ID card number"),
    Field("ssn", "string", label="SSN"),
    Field("user_notes", "string", label="User notes"),
    Field("chipnumber", "string", label="Chipnumber"),
    Field("validfrom", "date", label="ID valid from"),
    Field("validtill", "date", label="ID valid til"),
    Field("initials", "string", label="ID initials"),
    Field("nationality", "string", label="Nationality"),
    Field("noblecondition", "string", label="ID noble condition"),
    Field("documenttype", "integer", label="ID doctype"),
    Field("specialstatus", "integer", label="ID specialstatus"),
    Field("photob64", "blob", label="photo ID"),
    auth.signature,
]
auth.extra_auth_user_fields = more_auth_fields

auth.use_username = True
auth.param.registration_requires_confirmation = settings.VERIFY_EMAIL
auth.param.registration_requires_approval = settings.REQUIRES_APPROVAL
auth.param.allowed_actions = settings.ALLOWED_ACTIONS
auth.param.login_expiration_time = 3600
auth.param.password_complexity = {"entropy": 50}
auth.param.block_previous_password_num = 3
auth.param.formstyle = FormStyleBootstrap4
auth.define_tables()

# #######################################################
# Configure email sender for auth
# #######################################################
if settings.SMTP_SERVER:
    auth.sender = Mailer(
        server=settings.SMTP_SERVER,
        sender=settings.SMTP_SENDER,
        login=settings.SMTP_LOGIN,
        tls=settings.SMTP_TLS,
        ssl=settings.SMTP_SSL,
    )

# #######################################################
# Create a table to tag users as group members
# #######################################################
if auth.db:
    groups = Tags(db.auth_user, "groups")

# #######################################################
# Enable optional auth plugin
# #######################################################
if settings.USE_PAM:
    from py4web.utils.auth_plugins.pam_plugin import PamPlugin

    auth.register_plugin(PamPlugin())

if settings.USE_LDAP:
    from py4web.utils.auth_plugins.ldap_plugin import LDAPPlugin

    auth.register_plugin(LDAPPlugin(db=db, groups=groups, **settings.LDAP_SETTINGS))

if settings.OAUTH2GOOGLE_CLIENT_ID:
    from py4web.utils.auth_plugins.oauth2google import OAuth2Google  # TESTED

    auth.register_plugin(
        OAuth2Google(
            client_id=settings.OAUTH2GOOGLE_CLIENT_ID,
            client_secret=settings.OAUTH2GOOGLE_CLIENT_SECRET,
            callback_url="auth/plugin/oauth2google/callback",
        )
    )
if settings.OAUTH2FACEBOOK_CLIENT_ID:
    from py4web.utils.auth_plugins.oauth2facebook import OAuth2Facebook  # UNTESTED

    auth.register_plugin(
        OAuth2Facebook(
            client_id=settings.OAUTH2FACEBOOK_CLIENT_ID,
            client_secret=settings.OAUTH2FACEBOOK_CLIENT_SECRET,
            callback_url="auth/plugin/oauth2facebook/callback",
        )
    )

if settings.OAUTH2OKTA_CLIENT_ID:
    from py4web.utils.auth_plugins.oauth2okta import OAuth2Okta  # TESTED

    auth.register_plugin(
        OAuth2Okta(
            client_id=settings.OAUTH2OKTA_CLIENT_ID,
            client_secret=settings.OAUTH2OKTA_CLIENT_SECRET,
            callback_url="auth/plugin/oauth2okta/callback",
        )
    )

# #######################################################
# Define a convenience action to allow users to download
# files uploaded and reference by Field(type='upload')
# #######################################################
if settings.UPLOAD_FOLDER:

    @action("download/<filename>")
    @action.uses(db)
    def download(filename):
        return downloader(db, settings.UPLOAD_FOLDER, filename)

    # To take advantage of this in Form(s)
    # for every field of type upload you MUST specify:
    #
    # field.upload_path = settings.UPLOAD_FOLDER
    # field.download_url = lambda filename: URL('download/%s' % filename)

# #######################################################
# Optionally configure celery
# #######################################################
if settings.USE_CELERY:
    from celery import Celery

    # to use "from .common import scheduler" and then use it according
    # to celery docs, examples in tasks.py
    scheduler = Celery(
        "apps.%s.tasks" % settings.APP_NAME, broker=settings.CELERY_BROKER
    )


# #######################################################
# Enable authentication
# #######################################################
# auth.enable(uses=(session, T, db, Inject(TIMEOFFSET=settings.TIMEOFFSET)), env=dict(T=T))
auth.enable(uses=(session, T, db), env=dict(T=T))

# #######################################################
# Define convenience decorators
# #######################################################
unauthenticated = ActionFactory(db, session, T, flash, auth)
authenticated = ActionFactory(db, session, T, flash, auth.user)
