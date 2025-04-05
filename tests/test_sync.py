#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Patient Synchronization Test Script

This script tests the synchronization between py4web and i-agenda systems.
It retrieves patient data from both systems and demonstrates the proposed
synchronization logic.

Steps:
1. Retrieves a patient (John Doe Little) from py4web database
2. Searches for matching patient(s) in i-agenda using the API
3. Displays comparison between both systems' data
4. Demonstrates the synchronization logic:
   - py4web → i-agenda: lastname, firstname, dob
   - i-agenda → py4web: email, phone numbers

Usage:
python test_sync.py
"""

import copy
import json  # Import json module for pretty printing
import logging
import re
import sys
import time
from datetime import date, datetime
from typing import Any, Dict, List, Optional, Tuple, Union

import pymysql
import pymysql.cursors  # Explicitly import cursors module
import requests
from rich import print as rprint
from rich.box import SIMPLE_HEAVY, Box
from rich.console import Console
from rich.layout import Layout
from rich.logging import RichHandler
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.spinner import Spinner
from rich.style import Style
from rich.table import Table
from rich.text import Text

# Configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "py4web",
    "password": "py4web",
    "database": "py4web2025",
    "port": 3306,
    "charset": "utf8mb4",
    "cursorclass": pymysql.cursors.DictCursor,
}
IAGENDA_API_URL = "https://iagenda.c66.ovh"
PY4WEB_API_URL = "http://localhost:8000/oph4py/api"  # Base URL for py4web FastAPI

# Constants for the test script
PATIENT_ID = 29939  # ID for John Doe Little

# Initialize rich console
console = Console()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,  # Changed from INFO to DEBUG for more detailed logs
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[RichHandler(rich_tracebacks=True, console=console)],
)
logger = logging.getLogger("sync_script")

# Enable HTTP request logging
logging.getLogger("urllib3").setLevel(logging.DEBUG)
logging.getLogger("requests").setLevel(logging.DEBUG)


def get_py4web_patient(patient_id: int) -> Optional[Dict[str, Any]]:
    """Retrieve patient data from py4web database."""
    try:
        logger.info(
            f"Connecting to database {DB_CONFIG['database']} at {DB_CONFIG['host']}:{DB_CONFIG['port']}..."
        )

        with Progress(
            SpinnerColumn(),
            TextColumn("[bold blue]Connecting to database..."),
            console=console,
        ) as progress:
            task = progress.add_task("Connecting", total=None)
            connection = pymysql.connect(**DB_CONFIG)
            progress.update(task, completed=True)

        logger.info("Database connection successful!")

        with connection.cursor(pymysql.cursors.DictCursor) as cursor:
            # Get basic user data
            with Progress(
                SpinnerColumn(),
                TextColumn("[bold blue]Retrieving patient data..."),
                console=console,
            ) as progress:
                task = progress.add_task("Retrieving", total=None)

                cursor.execute(
                    """
                    SELECT u.id, u.username, u.email, u.first_name, u.last_name, 
                           u.dob, u.nationality, u.ssn
                    FROM auth_user u 
                    WHERE u.id = %s
                """,
                    (patient_id,),
                )
                user_data = cursor.fetchone()

                if not user_data:
                    progress.update(task, completed=True)
                    logger.warning(f"No patient found with ID {patient_id}")
                    return None

                # Get phone numbers
                cursor.execute(
                    """
                    SELECT id, phone_prefix, phone, phone_origin 
                    FROM phone 
                    WHERE id_auth_user = %s AND is_active = 'T'
                """,
                    (patient_id,),
                )
                phones = cursor.fetchall()

                # Get addresses
                cursor.execute(
                    """
                    SELECT id, home_num, box_num, address1, address2, zipcode, town, country, address_rank
                    FROM address 
                    WHERE id_auth_user = %s AND is_active = 'T'
                    ORDER BY address_rank
                """,
                    (patient_id,),
                )
                addresses = cursor.fetchall()

                # Get medical params if exists
                cursor.execute(
                    """
                    SELECT id, inami, email as md_email, officename
                    FROM md_params 
                    WHERE id_auth_user = %s AND is_active = 'T'
                """,
                    (patient_id,),
                )
                md_params = cursor.fetchone()

                progress.update(task, completed=True)

        connection.close()

        # Format the data
        result = {
            "basic_info": user_data,
            "phones": phones,
            "addresses": addresses,
            "md_params": md_params,
        }

        logger.info(
            f"Found patient data: {user_data['first_name']} {user_data['last_name']}"
        )

        return result

    except pymysql.OperationalError as e:
        error_code, error_message = e.args
        logger.error(f"Database connection error ({error_code}): {error_message}")
        console.print(
            f"[bold red]Database connection error[/bold red] ({error_code}): {error_message}"
        )
        console.print("\n[bold yellow]Troubleshooting tips:[/bold yellow]")
        console.print("1. Verify the MySQL server is running")
        console.print("2. Check if the user credentials are correct")
        console.print("3. Ensure the database name is correct")
        console.print("4. Check if a firewall is blocking the connection")
        console.print(
            f"5. Try connecting using the mysql client: mysql -h {DB_CONFIG['host']} -u {DB_CONFIG['user']} -p"
        )
        return None
    except pymysql.MySQLError as e:
        logger.error(f"Database error: {str(e)}")
        console.print(f"[bold red]Database error:[/bold red] {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        console.print(f"[bold red]Unexpected error:[/bold red] {e}")
        return None


def format_date_for_iagenda(date_obj: Optional[datetime]) -> str:
    """Convert Python date to DD/MM/YYYY format for iAgenda."""
    if not date_obj:
        return ""
    return date_obj.strftime("%d/%m/%Y")


def search_iagenda(firstname, lastname, email=""):
    """
    Search for a patient in the i-agenda system.

    Args:
        firstname: First name to search for
        lastname: Last name to search for
        email: Optional email to further refine search

    Returns:
        Dictionary with search results
    """
    try:
        # Log the search parameters
        search_params = {"firstname": firstname, "lastname": lastname}
        logger.info(f"Search parameters: {search_params}")

        # Prepare the URL for the search endpoint
        search_url = f"{IAGENDA_API_URL}/clients/search"
        logger.info(f"Search URL: {search_url}")

        # Log the API request
        console.print(f"Searching i-agenda API using URL: {search_url}")
        console.print(f"Parameters: {search_params}")

        # Make the API request
        response = requests.get(search_url, params=search_params)

        # Check for a successful response
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                logger.info("API response status: success")

                # Extract the client data
                clients = data.get("patients", [])
                total_found = data.get("total_found", 0)
                filtered_count = data.get("filtered_count", 0)

                logger.info(
                    f"Found {filtered_count} potential matches (total: {total_found}, filtered: {filtered_count})"
                )

                # Process each potential match
                matches = []
                for i, client in enumerate(clients):
                    similarity = client.get("similarity", 0)
                    name = client.get("name", "Unknown")
                    logger.info(f"Match {i+1}: {name} (similarity: {similarity})")
                    matches.append(client)

                # Return the search results
                return {
                    "matches": matches,
                    "total_found": total_found,
                    "filtered_count": filtered_count,
                }
            else:
                logger.error(f"API error: {data.get('error', 'Unknown error')}")
                return None
        else:
            logger.error(f"API error: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        logger.error(f"Error searching i-agenda: {str(e)}")
        return None


def get_iagenda_client(client_id):
    """
    Get detailed information about a specific client from i-agenda.

    Args:
        client_id: The client ID to retrieve

    Returns:
        Dictionary with client data
    """
    try:
        # Prepare the URL for the client endpoint
        client_url = f"{IAGENDA_API_URL}/clients/{client_id}"
        logger.info(f"Getting client details from: {client_url}")

        # Make the API request
        response = requests.get(client_url)

        # Check for a successful response
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                logger.info(f"Successfully retrieved client {client_id}")
                return data.get("data", {})
            else:
                logger.error(f"API error: {data.get('error', 'Unknown error')}")
                return None
        else:
            logger.error(f"API error: {response.status_code} - {response.text}")
            return None

    except Exception as e:
        logger.error(f"Error getting client details: {str(e)}")
        return None


def demonstrate_sync_logic(py4web_data, iagenda_data, changes):
    """
    Calculate and demonstrate synchronization changes between py4web and i-agenda.

    Args:
        py4web_data: Patient data from py4web
        iagenda_data: Patient data from i-agenda
        changes: Dictionary to populate with changes to apply

    Returns:
        Tuple of (py4web_updated, iagenda_updated) with the changes applied
    """
    logger.info("Calculating synchronization changes...")

    # Initialize updated data with copies of original data
    py4web_updated = copy.deepcopy(py4web_data)
    iagenda_updated = copy.deepcopy(iagenda_data)

    # --- i-agenda → py4web synchronization ---

    # 1. Name handling from py4web to i-agenda (already formatted correctly in i-agenda)
    if py4web_data and iagenda_data:
        # Get py4web name components
        py4web_first_name = py4web_data.get("first_name", "")
        py4web_last_name = py4web_data.get("last_name", "")

        # Get i-agenda name components (uses "nom" field that may contain both)
        iagenda_name = iagenda_data.get("nom", "")

        # Log the comparison
        logger.info(
            f"Name update: {iagenda_name} -> {py4web_last_name} {py4web_first_name}"
        )

        # Update in changes dictionary
        changes["lastname_update"] = py4web_last_name
        changes["firstname_update"] = py4web_first_name

    # 2. Email from i-agenda to py4web
    if py4web_data and iagenda_data and "email" in iagenda_data:
        py4web_email = py4web_data.get("email", "")
        iagenda_email = iagenda_data.get("email", "")

        if iagenda_email and iagenda_email != py4web_email:
            # Use i-agenda email in py4web
            logger.info(f"Email update: {py4web_email} -> {iagenda_email}")
            py4web_updated["email"] = iagenda_email

            # Add to changes dictionary
            changes["email_update"] = iagenda_email

    # 3. Phone numbers from i-agenda to py4web (if not already in py4web)
    if py4web_data and iagenda_data:
        # Initialize new phones dictionary
        changes["new_phones"] = {}

        # Check mobile phone
        iagenda_mobile = iagenda_data.get("tel_mob", "")
        if iagenda_mobile:
            # Find if this phone already exists in py4web
            py4web_has_mobile = False
            for phone in py4web_data.get("phones", []):
                if clean_phone_number(phone.get("number", "")) == clean_phone_number(
                    iagenda_mobile
                ):
                    py4web_has_mobile = True
                    break

            if not py4web_has_mobile:
                # Add this mobile to py4web
                logger.info(
                    f"Added new phone from i-agenda (tel_mob): {iagenda_mobile}"
                )
                new_phone = {
                    "number": iagenda_mobile,
                    "number_type": "Mobile",
                    "active": True,
                }
                py4web_updated.setdefault("phones", []).append(new_phone)

                # Add to changes
                changes["new_phones"]["tel_mob"] = iagenda_mobile

        # Check general phone
        iagenda_phone = iagenda_data.get("tel", "")
        if iagenda_phone:
            # Find if this phone already exists in py4web
            py4web_has_phone = False
            for phone in py4web_data.get("phones", []):
                if clean_phone_number(phone.get("number", "")) == clean_phone_number(
                    iagenda_phone
                ):
                    py4web_has_phone = True
                    break

            if not py4web_has_phone:
                # Add this phone to py4web
                logger.info(f"Added new phone from i-agenda (phone): {iagenda_phone}")
                new_phone = {
                    "number": iagenda_phone,
                    "number_type": "General",
                    "active": True,
                }
                py4web_updated.setdefault("phones", []).append(new_phone)

                # Add to changes
                changes["new_phones"]["phone"] = iagenda_phone

    # 4. DOB from py4web to i-agenda
    if py4web_data and iagenda_data and "dob" in py4web_data:
        py4web_dob = py4web_data.get("dob", "")

        if py4web_dob:
            # Update DOB in changes
            changes["dob_update"] = py4web_dob

    return py4web_updated, iagenda_updated


def display_comparison(
    py4web_data: Dict[str, Any], iagenda_data: Optional[Dict[str, Any]]
) -> None:
    """Display comparison between py4web and i-agenda data."""
    logger.info("Displaying data comparison between systems")
    console.print("\n[bold]DATA COMPARISON[/bold]\n", style="blue on white")

    # Basic information comparison
    table = Table(title="Basic Information")
    table.add_column("Field", style="cyan")
    table.add_column("py4web", style="green")
    table.add_column("i-agenda", style="yellow")

    if py4web_data.get("basic_info"):
        basic = py4web_data["basic_info"]
        table.add_row(
            "ID / cf_id",
            str(basic.get("id")),
            str(iagenda_data.get("cf_id") if iagenda_data else "N/A"),
        )
        table.add_row(
            "last_name / lastname",
            str(basic.get("last_name")),
            str(iagenda_data.get("lastname") if iagenda_data else "N/A"),
        )
        table.add_row(
            "first_name / firstname",
            str(basic.get("first_name")),
            str(iagenda_data.get("firstname") if iagenda_data else "N/A"),
        )
        table.add_row(
            "dob / ddn",
            str(basic.get("dob")),
            str(iagenda_data.get("ddn") if iagenda_data else "N/A"),
        )
        table.add_row(
            "email",
            str(basic.get("email")),
            str(iagenda_data.get("email") if iagenda_data else "N/A"),
        )
        table.add_row(
            "username / cada",
            str(basic.get("username")),
            str(iagenda_data.get("cada") if iagenda_data else "N/A"),
        )

    console.print(table)

    # Phone information
    console.print("\n[bold]Phone Numbers[/bold]", style="blue on white")
    phone_table = Table()
    phone_table.add_column("Phone Number", style="cyan")
    phone_table.add_column("py4web Origin", style="green")
    phone_table.add_column("In i-agenda", style="yellow")

    # py4web phones
    if py4web_data.get("phones"):
        for phone in py4web_data["phones"]:
            formatted_phone = f"+{phone.get('phone_prefix')} {phone.get('phone')}"
            phone_table.add_row(formatted_phone, str(phone.get("phone_origin", "")), "")

    # i-agenda phone
    if iagenda_data and (
        iagenda_data.get("tel")
        or iagenda_data.get("tel_mob")
        or iagenda_data.get("phone")
    ):
        # Get all available phone numbers
        phone_numbers = []
        if iagenda_data.get("tel"):
            phone_numbers.append(("Phone", iagenda_data.get("tel")))
        if iagenda_data.get("tel_mob"):
            phone_numbers.append(("Mobile", iagenda_data.get("tel_mob")))
        if iagenda_data.get("phone"):
            phone_numbers.append(("General", iagenda_data.get("phone")))

        for phone_type, iagenda_phone in phone_numbers:
            if not iagenda_phone:
                continue

            # Check if this phone already exists in py4web list
            phone_exists = False
            if py4web_data.get("phones") and iagenda_phone:
                for p in py4web_data["phones"]:
                    phone_val = f"+{p.get('phone_prefix')} {p.get('phone')}"
                    if iagenda_phone in phone_val:
                        phone_exists = True
                        break

            if not phone_exists:
                phone_table.add_row(str(iagenda_phone), "", f"✓ ({phone_type})")

        # Instead of modifying rows directly, create a new table with correct data
        new_phone_table = Table()
        new_phone_table.add_column("Phone Number", style="cyan")
        new_phone_table.add_column("py4web Origin", style="green")
        new_phone_table.add_column("In i-agenda", style="yellow")

        # Recreate the table with the updated marks
        if py4web_data.get("phones"):
            for phone in py4web_data["phones"]:
                formatted_phone = f"+{phone.get('phone_prefix')} {phone.get('phone')}"
                in_iagenda = ""

                # Check if this phone exists in any of the i-agenda phone fields
                for phone_type, iagenda_phone in phone_numbers:
                    if iagenda_phone and iagenda_phone in formatted_phone:
                        in_iagenda = f"✓ ({phone_type})"
                        break

                new_phone_table.add_row(
                    formatted_phone, str(phone.get("phone_origin", "")), in_iagenda
                )

        # Add any i-agenda phones that don't exist in py4web
        for phone_type, iagenda_phone in phone_numbers:
            if not iagenda_phone:
                continue

            phone_exists = False
            if py4web_data.get("phones"):
                for p in py4web_data["phones"]:
                    phone_val = f"+{p.get('phone_prefix')} {p.get('phone')}"
                    if iagenda_phone in phone_val:
                        phone_exists = True
                        break

            if not phone_exists:
                new_phone_table.add_row(str(iagenda_phone), "", f"✓ ({phone_type})")

        # Replace the original table
        phone_table = new_phone_table

    console.print(phone_table)

    # Address information
    console.print("\n[bold]Addresses[/bold]", style="blue on white")
    address_table = Table()
    address_table.add_column("Address", style="cyan")
    address_table.add_column("py4web Rank", style="green")
    address_table.add_column("In i-agenda", style="yellow")

    # py4web addresses
    if py4web_data.get("addresses"):
        for addr in py4web_data["addresses"]:
            formatted_addr = f"{addr.get('home_num', '')} {addr.get('address1', '')}, {addr.get('zipcode', '')} {addr.get('town', '')}"
            address_table.add_row(formatted_addr, str(addr.get("address_rank", "")), "")

    # i-agenda address
    if iagenda_data and (iagenda_data.get("adresse") or iagenda_data.get("ville")):
        formatted_addr = f"{iagenda_data.get('adresse', '')}, {iagenda_data.get('cp', '')} {iagenda_data.get('ville', '')}"
        address_table.add_row(formatted_addr, "", "✓")

    console.print(address_table)


def display_sync_demonstration(
    py4web_data: Dict[str, Any], iagenda_data: Optional[Dict[str, Any]]
) -> None:
    """
    Display what would happen with synchronization.

    Args:
        py4web_data (Dict[str, Any]): Patient data from py4web
        iagenda_data (Optional[Dict[str, Any]]): Patient data from i-agenda
    """
    logger.info("Demonstrating synchronization changes")
    py4web_updated, iagenda_updated = demonstrate_sync_logic(
        py4web_data, iagenda_data, {}
    )

    console.print(
        "\n[bold]SYNCHRONIZATION DEMONSTRATION[/bold]\n", style="white on blue"
    )
    console.print("This shows what would happen if synchronization was performed:\n")

    # py4web → i-agenda updates
    console.print(Panel("[bold]py4web → i-agenda updates[/bold]", style="green"))
    py4web_to_iagenda_table = Table()
    py4web_to_iagenda_table.add_column("Field", style="cyan")
    py4web_to_iagenda_table.add_column("Current i-agenda", style="yellow")
    py4web_to_iagenda_table.add_column("Updated Value", style="green")
    py4web_to_iagenda_table.add_column("Changed", style="red")

    if py4web_data.get("basic_info") and iagenda_data:
        # Combined Name (primary field in i-agenda)
        py4web_to_iagenda_table.add_row(
            "name (primary)",
            str(iagenda_data.get("name")),
            str(iagenda_updated.get("name")),
            "✓" if iagenda_data.get("name") != iagenda_updated.get("name") else "",
        )

        # Last Name
        py4web_to_iagenda_table.add_row(
            "lastname",
            str(iagenda_data.get("lastname")),
            str(iagenda_updated.get("lastname")),
            (
                "✓"
                if iagenda_data.get("lastname") != iagenda_updated.get("lastname")
                else ""
            ),
        )

        # First Name (not primary in i-agenda)
        py4web_to_iagenda_table.add_row(
            "firstname (secondary)",
            str(iagenda_data.get("firstname")),
            str(iagenda_updated.get("firstname")),
            (
                "✓"
                if iagenda_data.get("firstname") != iagenda_updated.get("firstname")
                else ""
            ),
        )

        # DOB
        py4web_to_iagenda_table.add_row(
            "ddn",
            str(iagenda_data.get("ddn")),
            str(iagenda_updated.get("ddn")),
            "✓" if iagenda_data.get("ddn") != iagenda_updated.get("ddn") else "",
        )

    console.print(py4web_to_iagenda_table)

    # i-agenda → py4web updates
    console.print(Panel("[bold]i-agenda → py4web updates[/bold]", style="yellow"))
    iagenda_to_py4web_table = Table()
    iagenda_to_py4web_table.add_column("Field", style="cyan")
    iagenda_to_py4web_table.add_column("Current py4web", style="green")
    iagenda_to_py4web_table.add_column("Updated Value", style="yellow")
    iagenda_to_py4web_table.add_column("Changed", style="red")

    # Email update
    if py4web_data.get("basic_info") and iagenda_data and iagenda_data.get("email"):
        iagenda_to_py4web_table.add_row(
            "email",
            str(py4web_data["basic_info"].get("email")),
            str(py4web_updated["basic_info"].get("email")),
            (
                "✓"
                if py4web_data["basic_info"].get("email")
                != py4web_updated["basic_info"].get("email")
                else ""
            ),
        )

    # Phone additions
    if len(py4web_updated.get("phones", [])) > len(py4web_data.get("phones", [])):
        new_phones = py4web_updated.get("phones", [])[
            len(py4web_data.get("phones", [])) :
        ]
        for phone in new_phones:
            phone_field = (
                phone.get("phone_origin", "").replace("iAgenda (", "").replace(")", "")
            )
            iagenda_to_py4web_table.add_row(
                f"{phone_field}",
                "N/A (New)",
                f"+{phone.get('phone_prefix')} {phone.get('phone')}",
                "✓",
            )

    console.print(iagenda_to_py4web_table)


def perform_synchronization(py4web_patient_data, iagenda_client_data, changes):
    """
    Perform actual synchronization between py4web and i-agenda systems.

    Args:
        py4web_patient_data: Patient data from py4web
        iagenda_client_data: Client data from i-agenda
        changes: Dictionary of changes to apply

    Returns:
        True if synchronization successful, False otherwise
    """
    try:
        logger.info("Starting actual synchronization process...")

        # No need to calculate changes here, they should be passed in already

        # 1. Update i-agenda client with py4web data
        logger.info(f"Updating i-agenda client {iagenda_client_data['cf_id']}...")

        # First get current full client data
        client_id = iagenda_client_data["cf_id"]
        logger.info(f"Fetching current client data for cf_id: {client_id}")

        get_url = f"https://iagenda.c66.ovh/clients/{client_id}"
        response = requests.get(get_url)

        if response.status_code != 200:
            logger.error(
                f"Failed to retrieve current client data: {response.status_code} - {response.text}"
            )
            return False

        current_client_data = response.json()
        logger.debug(f"Current client data retrieved successfully")

        # Prepare client data for update
        client_data = current_client_data.get("data", {})

        # Convert all null values to empty strings
        for key, value in client_data.items():
            if value is None:
                client_data[key] = ""

        # Set cf_tiers_id to the py4web patient ID as string
        client_data["cf_tiers_id"] = str(py4web_patient_data.get("id", ""))

        # Structure the client_data exactly as expected
        if "lastname_update" in changes and "firstname_update" in changes:
            # Format name as "LASTNAME Firstname" as shown in the example
            client_data["nom"] = (
                f"{changes['lastname_update'].upper()} {changes['firstname_update']}"
            )
            # Keep prenom empty as in the example
            client_data["prenom"] = ""

        if "dob_update" in changes:
            # Handle datetime.date objects
            dob = changes["dob_update"]
            if isinstance(dob, date):
                # Convert date object to string in DD/MM/YYYY format
                client_data["ddn"] = dob.strftime("%d/%m/%Y")
            elif isinstance(dob, str) and "-" in dob:
                # Convert YYYY-MM-DD to DD/MM/YYYY
                dob_parts = dob.split("-")
                if len(dob_parts) == 3:
                    client_data["ddn"] = f"{dob_parts[2]}/{dob_parts[1]}/{dob_parts[0]}"
            else:
                # Use as is
                client_data["ddn"] = str(dob)

        # Ensure tabChamp has the correct structure
        client_data["tabChamp"] = [
            {
                "champ_id": 1,
                "nom": "champ1",
                "partage": "O",
                "valeur": "Custom field value",
            }
        ]

        # Prepare mask exactly as in the example
        mask = {
            "adresse": "N",
            "bp": "N",
            "cada": "N",
            "civilite": "N",
            "cp": "N",
            "ddn": "O",
            "email": "O",
            "indes": "N",
            "langue": "N",
            "motif": "N",
            "nom": "O",
            "note": "O",
            "prenom": "N",
            "sexe": "N",
            "tabChamp": [{"champ_id": 1, "valeur": "N"}],
            "tel": "N",
            "tel_box": "N",
            "tel_mob": "N",
            "tel_pro": "N",
            "ville": "N",
        }

        # Prepare payload that follows the expected structure
        payload = {"client_data": client_data, "mask": mask}

        # Log full payload for debugging
        logger.debug(f"Full API payload: {json.dumps(payload, indent=2)}")

        # Make API request
        put_url = f"https://iagenda.c66.ovh/clients/{client_id}"
        logger.info(f"Making API request to: {put_url} with PUT")

        headers = {"Content-Type": "application/json", "Accept": "application/json"}
        logger.debug(f"Request headers: {headers}")

        response = requests.put(put_url, json=payload, headers=headers)
        logger.debug(f"Response status code: {response.status_code}")
        logger.debug(f"Response headers: {response.headers}")

        try:
            response_data = response.json()
            logger.debug(f"Response data: {json.dumps(response_data, indent=2)}")
        except:
            logger.debug(f"Response text: {response.text}")

        if response.status_code >= 400:
            error_msg = f"{response.status_code} - {response.text}"
            logger.error(f"API error: {error_msg}")

            # If method not allowed, try the alternative endpoint format
            if response.status_code == 405:
                logger.warning("Trying alternative endpoint...")
                alt_url = f"https://iagenda.c66.ovh/clients/update"
                logger.info(f"Trying alternative endpoint: {alt_url} (POST)")

                response = requests.post(alt_url, json=payload, headers=headers)
                logger.debug(
                    f"Alternative response status code: {response.status_code}"
                )

                try:
                    alt_response_data = response.json()
                    logger.debug(
                        f"Alternative response data: {json.dumps(alt_response_data, indent=2)}"
                    )
                except:
                    logger.debug(f"Alternative response text: {response.text}")

                if response.status_code >= 400:
                    error_msg = f"{response.status_code} - {response.text}"
                    logger.error(f"Alternative API error: {error_msg}")
                    return False
            else:
                return False

        logger.info("i-agenda update successful!")

        # 2. Update py4web with i-agenda data
        logger.info("Updating py4web database with i-agenda data...")

        # Set up database connection with explicit parameters, avoiding duplicates
        db_host = DB_CONFIG.get("host", "localhost")
        db_port = DB_CONFIG.get("port", 3306)
        db_name = DB_CONFIG.get("database", "py4web2025")
        db_user = DB_CONFIG.get("user", "py4web")
        db_password = DB_CONFIG.get("password", "")

        conn = pymysql.connect(
            host=db_host,
            port=db_port,
            user=db_user,
            password=db_password,
            database=db_name,
            charset="utf8mb4",
        )

        cursor = conn.cursor(pymysql.cursors.DictCursor)

        try:
            # Email update
            if "email_update" in changes:
                new_email = changes["email_update"]
                logger.info(f"Updating email to: {new_email}")

                # Get the patient_id from the patient_data
                patient_id = py4web_patient_data.get("id")

                if not patient_id:
                    logger.error(
                        "Cannot update email: patient_id not found in py4web_patient_data"
                    )
                    return False

                cursor.execute(
                    "UPDATE auth_user SET email = %s WHERE id = %s",
                    (new_email, patient_id),
                )

                logger.info(f"Updated email in auth_user table")

            # Phone updates
            phones_to_add = []
            if "new_phones" in changes:
                for phone_type, phone_number in changes["new_phones"].items():
                    phones_to_add.append(
                        (
                            py4web_patient_data.get("id"),  # patient_id
                            phone_number,  # number
                            phone_type,  # number_type (e.g., "tel_mob", "phone")
                            1,  # rank (default to 1 for new numbers)
                            True,  # active
                        )
                    )

            if phones_to_add:
                for phone_data in phones_to_add:
                    logger.info(
                        f"Adding phone: {phone_data[1]} (type: {phone_data[2]})"
                    )

                    # Check if phone already exists
                    cursor.execute(
                        "SELECT id FROM phone WHERE id_auth_user = %s AND phone = %s",
                        (phone_data[0], phone_data[1]),
                    )
                    existing_phone = cursor.fetchone()

                    if existing_phone:
                        logger.info(f"Phone already exists, updating instead")
                        cursor.execute(
                            """
                            UPDATE phone SET 
                            phone_origin = %s, 
                            modified_on = %s,
                            modified_by = %s,
                            is_active = %s 
                            WHERE id = %s
                            """,
                            (
                                phone_data[2],
                                datetime.now(),
                                1,  # Default system user ID
                                "T",
                                existing_phone["id"],
                            ),
                        )
                    else:
                        # Map i-agenda phone type to py4web phone origin
                        phone_origin_map = {
                            "tel": "Home",
                            "tel_mob": "Mobile",
                            "tel_pro": "Work",
                            "tel_box": "Other",
                        }

                        origin = phone_origin_map.get(phone_data[2], "Other")

                        # Insert new phone
                        cursor.execute(
                            """
                            INSERT INTO phone 
                            (id_auth_user, phone, phone_origin, created_on, created_by, is_active)
                            VALUES (%s, %s, %s, %s, %s, %s)
                            """,
                            (
                                phone_data[0],
                                phone_data[1],
                                origin,
                                datetime.now(),
                                1,  # Default system user ID
                                "T",
                            ),
                        )

                        logger.info(f"Added new phone to database")

            # Commit all changes
            conn.commit()
            logger.info("py4web database update successful!")

            return True

        except Exception as e:
            conn.rollback()
            logger.error(f"Database error: {str(e)}")
            return False

        finally:
            cursor.close()
            conn.close()

    except Exception as e:
        logger.error(f"Synchronization error: {str(e)}")
        return False


def prompt_for_confirmation():
    """
    Prompt the user for confirmation before performing synchronization.

    Returns:
        bool: True if the user confirms, False otherwise
    """
    console.print(
        "\n[bold yellow]Warning:[/bold yellow] The above changes are just a preview."
    )
    console.print("Do you want to perform the actual synchronization? ", end="")

    # Get user input with default 'no'
    try:
        user_input = input().strip().lower()
        return user_input == "y" or user_input == "yes"
    except KeyboardInterrupt:
        console.print("\n[yellow]Operation cancelled by user.[/yellow]")
        return False


def get_patient_data_from_db(patient_id):
    """
    Retrieve patient data from the py4web database.

    Args:
        patient_id: The patient ID to retrieve

    Returns:
        Dictionary with patient data
    """
    conn = None
    cursor = None
    try:
        # Connect to database
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Get basic patient info - now directly from auth_user table
        cursor.execute(
            """
            SELECT id, last_name, first_name, dob, email, username
            FROM auth_user
            WHERE id = %s
            """,
            (patient_id,),
        )
        patient = cursor.fetchone()

        if not patient:
            return None

        # Get phone numbers from phone table
        cursor.execute(
            """
            SELECT id, id_auth_user, phone, phone_prefix, phone_origin, is_active
            FROM phone
            WHERE id_auth_user = %s AND is_active = 'T'
            """,
            (patient_id,),
        )
        phones = cursor.fetchall()

        # Get addresses - There's no address table directly linked to users in the schema
        # We'll leave this empty for now
        addresses = []

        # Combine all data - convert patient to dict if it's a tuple
        if isinstance(patient, tuple):
            # Create dict from tuple based on column names
            cols = ["id", "last_name", "first_name", "dob", "email", "username"]
            result = {cols[i]: patient[i] for i in range(len(cols))}
        else:
            # Already a dict
            result = dict(patient)

        result["phones"] = phones
        result["addresses"] = addresses

        return result

    except Exception as e:
        logger.error(f"Database error: {str(e)}")
        return None

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def main():
    """Main function to orchestrate the synchronization test."""
    start_time = time.time()

    console = Console()
    console.print(
        f"\n===== py4web ↔ i-agenda Synchronization Test =====\n",
        style="bold blue",
    )

    logger.info("=== py4web ↔ i-agenda Synchronization Test ===")

    # Connect to py4web database and get patient data
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]Connecting to database..."),
        console=console,
    ) as progress:
        task = progress.add_task("Connecting", total=None)

        # Connect to the database
        try:
            logger.info(
                f"Connecting to database {DB_CONFIG['database']} at {DB_CONFIG['host']}:{DB_CONFIG['port']}..."
            )
            conn = pymysql.connect(**DB_CONFIG)
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            logger.info("Database connection successful!")
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            console.print(f"[bold red]Database connection error:[/bold red] {e}")
            return 1

        progress.update(task, completed=True)

    # Get py4web patient data
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]Retrieving patient data..."),
        console=console,
    ) as progress:
        task = progress.add_task("Retrieving", total=None)

        py4web_patient_data = get_patient_data_from_db(PATIENT_ID)

        if not py4web_patient_data:
            console.print(
                f"[bold red]Error:[/bold red] Patient with ID {PATIENT_ID} not found."
            )
            progress.update(task, completed=True)
            return 1

        logger.info(
            f"Found patient data: {py4web_patient_data['first_name']} {py4web_patient_data['last_name']}"
        )

        progress.update(task, completed=True)

    # Log and display patient information
    logger.info(
        f"Found patient: {py4web_patient_data['first_name']} {py4web_patient_data['last_name']}"
    )
    console.print(
        f"\nFound patient in py4web: {py4web_patient_data['first_name']} {py4web_patient_data['last_name']}"
    )

    # Search for the patient in i-agenda
    patient_name = (
        f"{py4web_patient_data['first_name']} {py4web_patient_data['last_name']}"
    )
    patient_dob = py4web_patient_data["dob"]

    logger.info(f"Searching i-agenda for: {patient_name}, DOB: {patient_dob}")
    console.print(f"\nSearching i-agenda for: {patient_name}, DOB: {patient_dob}")

    iagenda_client_data = None
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]Searching i-agenda API..."),
        console=console,
    ) as progress:
        task = progress.add_task("Searching", total=None)

        # Search for the patient in i-agenda
        search_results = search_iagenda(
            py4web_patient_data["first_name"],
            py4web_patient_data["last_name"],
            py4web_patient_data.get("email", ""),
        )

        if (
            search_results
            and isinstance(search_results, dict)
            and "matches" in search_results
        ):
            matches = search_results["matches"]  # type: ignore
            logger.info(f"Found {len(matches)} potential matches in i-agenda")
            console.print(f"Found {len(matches)} potential matches in i-agenda")

            # For demo, use the first match
            if matches:
                best_match = matches[0]
                client_id = best_match.get("cf_id")
                client_name = best_match.get("name", "Unknown")

                if client_id:
                    logger.info(f"Selected client ID {client_id} ({client_name})")
                    console.print(f"Using client ID {client_id} ({client_name})")

                    # Get detailed client data
                    iagenda_client_data = get_iagenda_client(client_id)
                else:
                    logger.warning("No client ID found in the best match")
            else:
                logger.warning("No matches found despite search results")
        else:
            logger.warning("No matching patients found in i-agenda")
            console.print(
                "[bold yellow]No matching patients found in i-agenda[/bold yellow]"
            )

        progress.update(task, completed=True)

    # If we found data in both systems, compare and demonstrate synchronization
    if py4web_patient_data and iagenda_client_data:
        # Display the data comparison
        display_comparison(py4web_patient_data, iagenda_client_data)

        # Display synchronization demonstration
        changes = {}
        demonstrate_sync_logic(py4web_patient_data, iagenda_client_data, changes)

        # If user confirms, perform actual synchronization
        if prompt_for_confirmation():
            console.print("\nStarting actual synchronization...", style="bold yellow")
            success = perform_synchronization(
                py4web_patient_data, iagenda_client_data, changes
            )

            if success:
                console.print(
                    "[bold green]Synchronization completed successfully![/bold green]"
                )
            else:
                console.print("[bold red]Synchronization failed![/bold red]")
        else:
            console.print(
                "\n[bold yellow]Synchronization cancelled by user.[/bold yellow]"
            )

    else:
        console.print(
            "[bold yellow]Cannot demonstrate synchronization without data from both systems[/bold yellow]"
        )

    # Calculate elapsed time
    elapsed_time = time.time() - start_time
    logger.info(f"=== Test Complete (Elapsed time: {elapsed_time:.2f} seconds) ===")
    console.print(
        f"\n===== Test Complete (Elapsed time: {elapsed_time:.2f} seconds) =====\n",
        style="bold blue",
    )

    return 0


def clean_phone_number(phone):
    """Clean phone number by removing non-digit characters."""
    return "".join(c for c in str(phone) if c.isdigit())


def format_phone_number(phone_obj):
    """
    Format phone number from phone object.

    Args:
        phone_obj: Phone object with phone and phone_prefix fields

    Returns:
        Formatted phone number string
    """
    phone_number = phone_obj.get("phone", "")

    # Check if prefix exists and is not None/None string
    prefix = phone_obj.get("phone_prefix")
    if prefix and str(prefix).lower() not in ["none", "null"]:
        return f"+{prefix} {phone_number}"

    return phone_number


def display_data_comparison(py4web_data, iagenda_data):
    """
    Display a comparison of patient data between py4web and i-agenda systems.

    Args:
        py4web_data: Patient data from py4web
        iagenda_data: Client data from i-agenda
    """
    logger.info("Displaying data comparison between systems")

    print("\nDATA COMPARISON\n")

    # Basic information table
    basic_info_table = Table(show_header=True, header_style="bold", box=SIMPLE_HEAVY)
    basic_info_table.add_column("Field", style="cyan")
    basic_info_table.add_column("py4web", style="green")
    basic_info_table.add_column("i-agenda", style="magenta")

    # Add rows for basic information
    basic_info_table.add_row(
        "ID", str(py4web_data.get("id", "")), str(iagenda_data.get("cf_id", ""))
    )
    basic_info_table.add_row(
        "Last Name", py4web_data.get("last_name", ""), iagenda_data.get("lastname", "")
    )
    basic_info_table.add_row(
        "First Name",
        py4web_data.get("first_name", ""),
        iagenda_data.get("firstname", ""),
    )
    basic_info_table.add_row(
        "Date of Birth", str(py4web_data.get("dob", "")), iagenda_data.get("ddn", "")
    )
    basic_info_table.add_row(
        "Email", py4web_data.get("email", ""), iagenda_data.get("email", "")
    )
    basic_info_table.add_row("Username", py4web_data.get("username", ""), "")

    # Print the basic information table
    print(basic_info_table)

    # Phone numbers table
    print("\nPhone Numbers")
    phone_table = Table(show_header=True, header_style="bold", box=SIMPLE_HEAVY)
    phone_table.add_column("Phone Number", style="cyan")
    phone_table.add_column("py4web Origin", style="green")
    phone_table.add_column("In i-agenda", style="magenta")

    # Extract phone numbers from py4web data
    py4web_phones = []
    if py4web_data.get("phones"):
        for phone in py4web_data.get("phones", []):
            phone_number = format_phone_number(phone)
            py4web_phones.append((phone_number, phone.get("phone_origin", "")))

    # Extract phone numbers from i-agenda data
    iagenda_phones = []
    for phone_type in ["tel", "tel_mob", "tel_pro", "tel_box"]:
        if iagenda_data.get(phone_type) and iagenda_data.get(phone_type).strip():
            iagenda_phones.append((iagenda_data.get(phone_type), phone_type))

    # Add py4web phones to table
    for phone, origin in py4web_phones:
        # Check if phone exists in i-agenda
        in_iagenda = False
        for i_phone, i_type in iagenda_phones:
            if phone == i_phone:
                in_iagenda = True
                break

        phone_table.add_row(phone, origin, "✓" if in_iagenda else "")

    # Add i-agenda phones not in py4web to table
    for phone, phone_type in iagenda_phones:
        # Check if phone exists in py4web
        in_py4web = False
        for p_phone, p_origin in py4web_phones:
            if phone == p_phone:
                in_py4web = True
                break

        if not in_py4web:
            # Map phone type to human-readable format
            type_map = {
                "tel": "Home",
                "tel_mob": "Mobile",
                "tel_pro": "Work",
                "tel_box": "Other",
            }
            readable_type = type_map.get(phone_type, phone_type)

            phone_table.add_row(
                phone,  # Remove any None values in formatting
                "",
                f"✓ ({readable_type})",
            )

    # Print the phone numbers table
    print(phone_table)

    # Addresses table
    print("\nAddresses")
    addr_table = Table(show_header=True, header_style="bold", box=SIMPLE_HEAVY)
    addr_table.add_column("Address", style="cyan")
    addr_table.add_column("py4web Rank", style="green")
    addr_table.add_column("In i-agenda", style="magenta")

    # Extract addresses from py4web data
    py4web_addresses = []
    if py4web_data.get("addresses"):
        for addr in py4web_data.get("addresses", []):
            # Format address
            address_parts = [
                addr.get("line1", ""),
                addr.get("line2", ""),
                addr.get("city", ""),
                addr.get("zip", ""),
                addr.get("country", ""),
            ]
            address_str = " ".join([part for part in address_parts if part])
            py4web_addresses.append((address_str, addr.get("rank", "")))

    # Extract address from i-agenda data
    iagenda_address = ""
    address_parts = [
        iagenda_data.get("adresse", ""),
        iagenda_data.get("cp", ""),
        iagenda_data.get("ville", ""),
    ]
    iagenda_address = " ".join(
        [part for part in address_parts if part and part.strip()]
    )

    # Add py4web addresses to table
    for address, rank in py4web_addresses:
        in_iagenda = "✓" if iagenda_address and address == iagenda_address else ""
        addr_table.add_row(address, str(rank), in_iagenda)

    # Add i-agenda address if not in py4web
    if iagenda_address and not any(
        addr[0] == iagenda_address for addr in py4web_addresses
    ):
        addr_table.add_row(iagenda_address, "", "✓")

    # Print the addresses table
    print(addr_table)


if __name__ == "__main__":
    sys.exit(main())
