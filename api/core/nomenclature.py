"""
Nomenclature API Client

This module provides integration with the external Belgian healthcare tariff
nomenclature API server at https://nomen.c66.ovh
"""

import json
import logging
import time
from typing import Dict, List, Optional, Union
from urllib.parse import urlencode

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)


class NomenclatureClient:
    """
    Client for interfacing with the Belgian healthcare nomenclature API.

    Provides search functionality and code details retrieval with:
    - Automatic retries on network failures
    - Response caching for better performance
    - Comprehensive error handling
    - Rate limiting compliance
    """

    def __init__(self, base_url: str = "https://nomen.c66.ovh"):
        """
        Initialize the nomenclature client.

        Args:
            base_url: Base URL of the nomenclature API server
        """
        self.base_url = base_url.rstrip("/")

        # Create session with retry strategy
        self.session = requests.Session()
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

        # Set reasonable timeouts
        self.timeout = (5, 30)  # (connect, read) timeouts

        # Simple in-memory cache for code details
        self._cache = {}
        self._cache_ttl = 3600  # 1 hour cache TTL

    def _make_request(
        self, endpoint: str, params: Optional[Dict] = None
    ) -> Optional[Dict]:
        """
        Make a request to the nomenclature API.

        Args:
            endpoint: API endpoint path
            params: Query parameters

        Returns:
            JSON response data or None on error
        """
        try:
            url = f"{self.base_url}{endpoint}"

            logger.info(f"Making request to: {url} with params: {params}")

            response = self.session.get(
                url,
                params=params or {},
                timeout=self.timeout,
                headers={
                    "Accept": "application/json",
                    "User-Agent": "Oph4Py/1.0 (Medical Records System)",
                },
            )

            response.raise_for_status()
            return response.json()

        except requests.exceptions.Timeout:
            logger.error(f"Timeout while accessing nomenclature API: {url}")
            return None

        except requests.exceptions.ConnectionError:
            logger.error(f"Connection error while accessing nomenclature API: {url}")
            return None

        except requests.exceptions.HTTPError as e:
            logger.error(
                f"HTTP error {e.response.status_code} from nomenclature API: {url}"
            )
            return None

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON response from nomenclature API: {url}")
            return None

        except Exception as e:
            logger.error(f"Unexpected error accessing nomenclature API: {str(e)}")
            return None

    def search(
        self,
        code_prefix: Optional[str] = None,
        description: Optional[str] = None,
        feecode: Optional[int] = None,
        limit: int = 20,
        offset: int = 0,
    ) -> Dict:
        """
        Search nomenclature codes.

        Args:
            code_prefix: Search by nomenclature code prefix (minimum 3 digits)
            description: Search by description text (French/Dutch)
            feecode: Filter by fee code
            limit: Maximum number of results to return
            offset: Pagination offset

        Returns:
            Dictionary with search results:
            {
                "items": [...],
                "total": int,
                "has_more": bool
            }
        """
        params = {}

        if code_prefix:
            params["nomen_code_prefix"] = code_prefix
        if description:
            params["description_substring"] = description
        if feecode:
            params["feecode"] = feecode
        if limit:
            params["limit"] = limit
        if offset:
            params["offset"] = offset

        result = self._make_request("/tarifs/search", params)

        if result is None:
            return {
                "items": [],
                "total": 0,
                "has_more": False,
                "error": "API request failed",
            }

        # Normalize response format
        items = result.get("data", result.get("items", []))
        total = result.get("total", len(items))
        has_more = result.get("has_more", False) or (offset + limit < total)

        return {"items": items, "total": total, "has_more": has_more}

    def get_code_details(self, nomen_code: int) -> Optional[Dict]:
        """
        Get detailed information for a specific nomenclature code.

        Args:
            nomen_code: The nomenclature code to lookup

        Returns:
            Dictionary with code details or None if not found:
            {
                "nomen_code": int,
                "description_fr": str,
                "description_nl": str,
                "fee": float,
                "feecode": int,
                "valid_from": str,
                "valid_to": str,
                ...
            }
        """
        # Check cache first
        cache_key = f"code_{nomen_code}"
        if cache_key in self._cache:
            cached_data, cached_time = self._cache[cache_key]
            if time.time() - cached_time < self._cache_ttl:
                logger.debug(f"Returning cached details for code {nomen_code}")
                return cached_data

        # First try to get from search with exact code match
        search_result = self.search(code_prefix=str(nomen_code), limit=1)

        if search_result["items"]:
            for item in search_result["items"]:
                # Check if this is an exact match
                if (
                    item.get("nomen_code") == nomen_code
                    or item.get("code") == nomen_code
                ):
                    # Normalize field names
                    details = {
                        "nomen_code": item.get("nomen_code", item.get("code")),
                        "description_fr": item.get(
                            "description_fr",
                            item.get("desc_fr", item.get("description")),
                        ),
                        "description_nl": item.get(
                            "description_nl", item.get("desc_nl")
                        ),
                        "fee": item.get("fee", item.get("tarif")),
                        "feecode": item.get("feecode", item.get("fee_code")),
                        "valid_from": item.get("valid_from", item.get("date_debut")),
                        "valid_to": item.get("valid_to", item.get("date_fin")),
                    }

                    # Cache the result
                    self._cache[cache_key] = (details, time.time())

                    logger.info(f"Found details for code {nomen_code}")
                    return details

        # If not found in search, try direct API endpoint (if available)
        result = self._make_request(f"/tarifs/code/{nomen_code}")

        if result:
            # Normalize field names from direct API response
            details = {
                "nomen_code": result.get("nomen_code", result.get("code", nomen_code)),
                "description_fr": result.get(
                    "description_fr", result.get("desc_fr", result.get("description"))
                ),
                "description_nl": result.get("description_nl", result.get("desc_nl")),
                "fee": result.get("fee", result.get("tarif")),
                "feecode": result.get("feecode", result.get("fee_code")),
                "valid_from": result.get("valid_from", result.get("date_debut")),
                "valid_to": result.get("valid_to", result.get("date_fin")),
            }

            # Cache the result
            self._cache[cache_key] = (details, time.time())

            logger.info(f"Found details for code {nomen_code} via direct API")
            return details

        logger.warning(f"No details found for nomenclature code {nomen_code}")
        return None

    def clear_cache(self):
        """Clear the internal cache."""
        self._cache.clear()
        logger.info("Nomenclature cache cleared")

    def get_cache_stats(self) -> Dict:
        """Get cache statistics."""
        current_time = time.time()
        valid_entries = 0
        expired_entries = 0

        for cached_data, cached_time in self._cache.values():
            if current_time - cached_time < self._cache_ttl:
                valid_entries += 1
            else:
                expired_entries += 1

        return {
            "total_entries": len(self._cache),
            "valid_entries": valid_entries,
            "expired_entries": expired_entries,
            "cache_ttl": self._cache_ttl,
        }
