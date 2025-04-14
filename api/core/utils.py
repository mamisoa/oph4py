"""
REST API Utility Functions

This module provides common utility functions for the REST API, such as JSON conversion
and date validation.
"""

import datetime
import json


def date_handler(obj):
    """
    Custom JSON serializer for datetime and date objects.

    Args:
        obj: The object to serialize

    Returns:
        str: Formatted date string if object is a datetime or date, False otherwise
    """
    if isinstance(obj, datetime.datetime):
        return obj.strftime("%Y-%m-%d %H:%M:%S")
    elif isinstance(obj, datetime.date):
        return obj.strftime("%Y-%m-%d")
    else:
        return False


def rows2json(tablename, rows):
    """
    Converts a list of rows from a table into a JSON string.

    This function converts each row in the input list into a JSON object. If the row contains a datetime or date object,
    it is converted into a string format using strftime. The format for datetime is '%Y-%m-%d %H:%M:%S'
    and for date, it is '%Y-%m-%d'.
    The resulting JSON objects are concatenated into a single JSON array, which is then wrapped into a
    JSON object with the table name as the key.

    Args:
        tablename (str): The name of the table which the rows belong to. This is used as the key in the resulting JSON object.
        rows: A list-like object of rows to be converted into a JSON string. Each row should be a dictionary-like
            object where the keys correspond to the column names and the values correspond to the data in each cell.

    Returns:
        str: A string representation of the JSON object that contains the table data.

    Raises:
        TypeError: If any of the values in the rows are neither serializable as JSON nor instances
            of datetime.datetime or datetime.date.
    """
    rows = rows.as_list()
    concat = '{ "' + tablename + '": ['
    for row in rows:
        concat = concat + json.dumps(row, default=date_handler) + ","
    concat = concat.strip(",")
    concat = concat + "]}"
    return concat


def valid_date(datestring):
    """
    Check if a given date string is a valid date in the format 'YYYY-MM-DD'.

    Args:
        datestring (str): A string representing a date in the format 'YYYY-MM-DD'.

    Returns:
        bool: True if the datestring is a valid date, False otherwise.

    Example:
        >>> valid_date('2023-07-23')
        True
        >>> valid_date('2023-13-40')
        False
    """
    try:
        datetime.datetime.strptime(datestring, "%Y-%m-%d")
        return True
    except ValueError:
        return False


def format_response_datetime(data):
    """
    Format datetime objects in API response data to strings.

    Recursively processes dictionaries and lists to convert all datetime objects
    to string format.

    Args:
        data: Dictionary, list, or other value that may contain datetime objects

    Returns:
        The same data structure with datetime objects converted to strings
    """
    if isinstance(data, dict):
        return {key: format_response_datetime(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [format_response_datetime(item) for item in data]
    elif isinstance(data, datetime.datetime):
        return data.strftime("%Y-%m-%d %H:%M:%S")
    elif isinstance(data, datetime.date):
        return data.strftime("%Y-%m-%d")
    else:
        return data
