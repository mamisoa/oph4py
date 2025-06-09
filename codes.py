"""
Controller for Belgian healthcare nomenclature codes CRUD management.

Handles the main listing view and integrates with the frontend for CRUD operations.
"""

from typing import Any, Dict

from py4web import URL, action, redirect, response

from .common import auth, db, session
from .settings import (
    APP_NAME,
    ASSETS_FOLDER,
    ENV_STATUS,
    LOCAL_URL,
    NEW_INSTALLATION,
    TIMEOFFSET,
)


@action("codes")
@action.uses(auth.user, "manage/codes.html")
def codes() -> Dict[str, Any]:
    """
    Main view for nomenclature codes management.
    Requires user authentication.
    Renders the codes management template with context variables.

    Returns:
        dict: Context variables for the template.
    """
    return {
        "app_name": APP_NAME,
        "assets_folder": ASSETS_FOLDER,
        "env_status": ENV_STATUS,
        "local_url": LOCAL_URL,
        "new_installation": NEW_INSTALLATION,
        "timeOffset": TIMEOFFSET,
        # Add more context variables as needed for the template
    }
