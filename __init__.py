# check compatibility
import py4web

assert py4web.check_compatible("0.1.20190709.1")

# Importing the modular API structure instead of rest.py
# by importing controllers you expose the actions defined in it
from . import api, codes, controllers, defaults, manage, modalityctr, useful

# by importing db you expose it to the _dashboard/dbadmin
from .models import db
from .modules.dicom import dcm4chee
from .modules.eyesuite import eyesuite_rest
from .modules.topcon import cv5000_rest, cv5000xml
from .modules.visionix import vx_rest

# optional parameters
__version__ = "0.0.9"
__author__ = "Mamisoa Andriantafika <m.andriantafika@ophtalmologiste.be>"
__license__ = "GPLv3"
