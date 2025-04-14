"""
REST API Policy Configuration

This module defines the default policy settings for the REST API. It controls access permissions,
query limits, and allowed patterns for different HTTP methods across all endpoints.
"""

from pydal.restapi import Policy


def get_default_policy():
    """
    Create and return a default policy configuration for the REST API.

    The default policy:
    - Requires authorization for all methods
    - Sets a default limit of 1000 records for GET requests
    - Allows all query patterns

    Returns:
        Policy: Configured policy object for the REST API
    """
    policy = Policy()
    policy.set("*", "GET", authorize=True, limit=1000, allowed_patterns=["*"])
    policy.set("*", "POST", authorize=True)
    policy.set("*", "PUT", authorize=True)
    policy.set("*", "DELETE", authorize=True)
    return policy


# Create a singleton instance for common use
default_policy = get_default_policy()
