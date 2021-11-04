# check compatibility
import py4web

assert py4web.check_compatible("0.1.20190709.1")

# by importing db you expose it to the _dashboard/dbadmin
from .models import db

# by importing controllers you expose the actions defined in it
from . import controllers
from . import manage
from . import rest
from . import modalityctr
from . import defaults
from . import useful
from .modules.visionix import vx_rest
from .modules.topcon import cv5000_rest, cv5000xml

# optional parameters
__version__ = "0.0.0"
__author__ = "you <you@example.com>"
__license__ = "anything you want"

