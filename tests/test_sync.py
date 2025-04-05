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

import logging
import sys
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple, Union

import pymysql
import pymysql.cursors  # Explicitly import cursors module
import requests
from rich import print as rprint
from rich.console import Console
from rich.logging import RichHandler
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.table import Table

# Configuration
DB_CONFIG = {
    "host": "localhost",
    "user": "py4web",
    "password": "py4web",
    "database": "py4web2025",
    "port": 3306,
    "charset": "utf8mb4",
}
IAGENDA_API_URL = "https://iagenda.c66.ovh"

# Initialize rich console
console = Console()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[RichHandler(rich_tracebacks=True, console=console)],
)
logger = logging.getLogger("sync_script")


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


def search_iagenda_patient(
    first_name: str, last_name: str, dob: Optional[datetime] = None
) -> List[Dict[str, Any]]:
    """Search for patient in i-agenda API."""
    # Using direct search endpoint with firstname and lastname parameters
    search_params = {"firstname": first_name, "lastname": last_name}
    search_url = f"{IAGENDA_API_URL}/clients/search"

    logger.info(f"Search parameters: {search_params}")
    logger.info(f"Search URL: {search_url}")

    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[bold blue]Searching i-agenda API..."),
            console=console,
        ) as progress:
            task = progress.add_task("Searching", total=None)
            console.print(f"Searching i-agenda API using URL: {search_url}")
            console.print(f"Parameters: {search_params}")

            response = requests.get(search_url, params=search_params)

            if response.status_code == 200:
                data = response.json()
                logger.info(f"API response status: {data.get('status')}")

                if data.get("status") == "success" and data.get("patients"):
                    patients = data.get("patients", [])
                    logger.info(
                        f"Found {len(patients)} potential matches (total: {data.get('total_found', 0)}, filtered: {data.get('filtered_count', 0)})"
                    )

                    # Add additional logging
                    for i, patient in enumerate(patients):
                        logger.info(
                            f"Match {i+1}: {patient.get('name')} (similarity: {patient.get('similarity', 'N/A')})"
                        )

                    progress.update(task, completed=True)
                    return patients

                else:
                    logger.warning("No patients found in the response")
                    progress.update(task, completed=True)
                    return []
            else:
                progress.update(task, completed=True)
                logger.error(f"API error: {response.status_code} - {response.text}")
                console.print(
                    f"[bold red]API error:[/bold red] {response.status_code} - {response.text}"
                )
                return []
    except requests.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        console.print(f"[bold red]Request error:[/bold red] {e}")
        return []


def get_iagenda_patient_details(client_id: str) -> Optional[Dict[str, Any]]:
    """Get detailed patient information from i-agenda API."""
    try:
        with Progress(
            SpinnerColumn(),
            TextColumn(f"[bold blue]Getting details for client {client_id}..."),
            console=console,
        ) as progress:
            task = progress.add_task("Retrieving", total=None)
            logger.info(f"Getting detailed information for client ID {client_id}...")
            response = requests.get(f"{IAGENDA_API_URL}/client/{client_id}")

            if response.status_code == 200:
                data = response.json()
                if data.get("success") and data.get("data", {}).get("client"):
                    logger.info(
                        f"Successfully retrieved client details for ID {client_id}"
                    )
                    progress.update(task, completed=True)
                    return data["data"]["client"]

            logger.warning(f"No client details found for ID {client_id}")
            progress.update(task, completed=True)
            return None
    except requests.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        console.print(f"[bold red]Request error:[/bold red] {e}")
        return None


def demonstrate_sync_logic(
    py4web_data: Dict[str, Any], iagenda_data: Optional[Dict[str, Any]]
) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """
    Demonstrate the synchronization logic between py4web and i-agenda.

    Args:
        py4web_data (Dict[str, Any]): Patient data from py4web
        iagenda_data (Optional[Dict[str, Any]]): Patient data from i-agenda

    Returns:
        Tuple[Dict[str, Any], Dict[str, Any]]: Updated py4web and i-agenda data
    """
    logger.info("Calculating synchronization changes...")

    # Create copies of data to show what would be updated
    py4web_updated = {
        "basic_info": (
            py4web_data["basic_info"].copy() if py4web_data.get("basic_info") else {}
        ),
        "phones": [phone.copy() for phone in py4web_data.get("phones", [])],
        "addresses": py4web_data.get("addresses", []),
        "md_params": py4web_data.get("md_params", {}),
    }
    iagenda_updated = iagenda_data.copy() if iagenda_data else {}

    # py4web → i-agenda: lastname, firstname, dob
    if py4web_data.get("basic_info"):
        # Update lastname in i-agenda
        iagenda_updated["lastname"] = py4web_data["basic_info"].get("last_name", "")

        # Update firstname in i-agenda (though it's not the primary field used)
        iagenda_updated["firstname"] = py4web_data["basic_info"].get("first_name", "")

        # Most importantly, update the combined name field which is the primary identifier
        last_name = py4web_data["basic_info"].get("last_name", "").upper()
        first_name = py4web_data["basic_info"].get("first_name", "")
        iagenda_updated["name"] = f"{last_name} {first_name}"

        # Add null check for iagenda_data
        current_name = iagenda_data.get("name", "None") if iagenda_data else "None"
        logger.info(f"Name update: {current_name} -> {iagenda_updated.get('name')}")

        # Update DOB
        if py4web_data["basic_info"].get("dob"):
            iagenda_updated["ddn"] = format_date_for_iagenda(
                py4web_data["basic_info"].get("dob")
            )

    # i-agenda → py4web: email
    # Note: In real implementation, we'd check for duplicates
    if iagenda_data and iagenda_data.get("email"):
        if py4web_data.get("basic_info"):
            py4web_updated["basic_info"]["email"] = iagenda_data.get("email")
            logger.info(
                f"Email update: {py4web_data['basic_info'].get('email')} -> {iagenda_data.get('email')}"
            )

    # i-agenda → py4web: phones
    # For demonstration, just add i-agenda phone if not already in py4web
    if iagenda_data and py4web_data.get("phones") is not None:
        # Check for all possible phone fields in i-agenda
        phone_fields = ["tel", "tel_mob", "phone"]
        for field in phone_fields:
            iagenda_phone = iagenda_data.get(field)
            if iagenda_phone:
                # Check if this phone already exists in py4web
                phone_exists = any(
                    p.get("phone") == iagenda_phone for p in py4web_data["phones"]
                )

                if not phone_exists:
                    # In real implementation, we'd create a new phone record
                    # For demo, we'll add it to the list
                    new_phone = {
                        "id": None,  # Would be assigned by database
                        "phone_prefix": 32,  # Default for Belgium
                        "phone": iagenda_phone,
                        "phone_origin": f"iAgenda ({field})",  # Marking source
                    }
                    py4web_updated["phones"].append(new_phone)
                    logger.info(
                        f"Added new phone from i-agenda ({field}): {iagenda_phone}"
                    )

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
            "ID",
            str(basic.get("id")),
            str(iagenda_data.get("cf_id") if iagenda_data else "N/A"),
        )
        table.add_row(
            "Last Name",
            str(basic.get("last_name")),
            str(iagenda_data.get("lastname") if iagenda_data else "N/A"),
        )
        table.add_row(
            "First Name",
            str(basic.get("first_name")),
            str(iagenda_data.get("firstname") if iagenda_data else "N/A"),
        )
        table.add_row(
            "DOB",
            str(basic.get("dob")),
            str(iagenda_data.get("ddn") if iagenda_data else "N/A"),
        )
        table.add_row(
            "Email",
            str(basic.get("email")),
            str(iagenda_data.get("email") if iagenda_data else "N/A"),
        )
        table.add_row(
            "Username/SSN",
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
    py4web_updated, iagenda_updated = demonstrate_sync_logic(py4web_data, iagenda_data)

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
            "Name (primary)",
            str(iagenda_data.get("name")),
            str(iagenda_updated.get("name")),
            "✓" if iagenda_data.get("name") != iagenda_updated.get("name") else "",
        )

        # Last Name
        py4web_to_iagenda_table.add_row(
            "Last Name",
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
            "First Name (secondary)",
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
            "DOB",
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
            "Email",
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
            iagenda_to_py4web_table.add_row(
                "Phone",
                "N/A (New)",
                f"+{phone.get('phone_prefix')} {phone.get('phone')}",
                "✓",
            )

    console.print(iagenda_to_py4web_table)


def main():
    start_time = time.time()
    logger.info("=== py4web ↔ i-agenda Synchronization Test ===")
    console.print(
        "[bold blue]===== py4web ↔ i-agenda Synchronization Test =====[/bold blue]\n"
    )

    # 1. Get patient data from py4web
    patient_id = 29939  # ID for John Doe Little
    py4web_data = get_py4web_patient(patient_id)

    if not py4web_data:
        logger.error(f"Patient with ID {patient_id} not found in py4web database")
        console.print(
            f"[bold red]Error:[/bold red] Patient with ID {patient_id} not found in py4web database"
        )
        return 1

    logger.info(
        f"Found patient: {py4web_data['basic_info']['first_name']} {py4web_data['basic_info']['last_name']}"
    )
    console.print(
        f"[bold green]Found patient in py4web:[/bold green] {py4web_data['basic_info']['first_name']} {py4web_data['basic_info']['last_name']}"
    )

    # 2. Search for patient in i-agenda
    first_name = py4web_data["basic_info"]["first_name"]
    last_name = py4web_data["basic_info"]["last_name"]
    dob = py4web_data["basic_info"]["dob"]

    logger.info(f"Searching i-agenda for: {first_name} {last_name}, DOB: {dob}")
    console.print(
        f"\n[bold]Searching i-agenda for:[/bold] {first_name} {last_name}, DOB: {dob}"
    )

    # Use the search endpoint to find the patient
    iagenda_clients = search_iagenda_patient(first_name, last_name, dob)

    if not iagenda_clients:
        logger.warning("No matching patients found in i-agenda")
        console.print(
            "[bold yellow]No matching patients found in i-agenda[/bold yellow]"
        )
        iagenda_data = None
    else:
        logger.info(f"Found {len(iagenda_clients)} potential matches in i-agenda")
        console.print(
            f"[bold green]Found {len(iagenda_clients)} potential matches in i-agenda[/bold green]"
        )

        # Use the first match for demonstration
        client = iagenda_clients[0]
        client_id = client.get("cf_id")
        logger.info(f"Selected client ID {client_id} ({client.get('name', '')})")
        console.print(
            f"Using client ID [bold]{client_id}[/bold] ({client.get('name', '')})"
        )

        # For testing with the provided search results, use the data directly
        iagenda_data = client

        # In real production, we'd get detailed client info
        # iagenda_data = get_iagenda_patient_details(client["cf_id"])
        if not iagenda_data:
            logger.error("Could not retrieve detailed client information")
            console.print(
                "[bold red]Error:[/bold red] Could not retrieve detailed client information"
            )
            return 1

    # 3. Display data comparison
    display_comparison(py4web_data, iagenda_data)

    # 4. Demonstrate synchronization if we have i-agenda data
    if iagenda_data:
        display_sync_demonstration(py4web_data, iagenda_data)
    else:
        logger.warning("No i-agenda data available for synchronization demonstration")
        console.print(
            "\n[bold yellow]No i-agenda data available for synchronization demonstration[/bold yellow]"
        )

    elapsed_time = time.time() - start_time
    logger.info(f"=== Test Complete (Elapsed time: {elapsed_time:.2f} seconds) ===")
    console.print(
        f"\n[bold blue]===== Test Complete (Elapsed time: {elapsed_time:.2f} seconds) =====[/bold blue]"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
