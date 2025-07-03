"""
Test for combo application with unique codes that don't exist in nomenclature API.

This test verifies that when a combo contains unique codes (like 999000) with
descriptions stored in the combo definition, these descriptions are properly
used when the code doesn't exist in the external nomenclature API.
"""

import datetime
import json
import unittest
from unittest.mock import MagicMock, patch

# Test combo data with unique code that has descriptions
TEST_COMBO_DATA = {
    "combo_name": "Test Combo with Unique Code",
    "combo_description": "Test combo containing a unique code",
    "specialty": "ophthalmology",
    "combo_codes": [
        {
            "nomen_code": 999000,
            "nomen_desc_fr": "Conseil personnalisé",
            "nomen_desc_nl": "Gepersonaliseerd advies",
            "feecode": "N/A",
            "fee": "85.00",
            "secondary_nomen_code": None,
            "secondary_nomen_desc_fr": None,
            "secondary_feecode": None,
            "secondary_fee": None,
        }
    ],
}


class TestComboUniqueCodesApplication(unittest.TestCase):
    """Test combo application with unique codes."""

    def setUp(self):
        """Set up test fixtures."""
        self.test_combo_id = 1
        self.test_user_id = 1
        self.test_worklist_id = 1

    @patch("api.endpoints.billing.NomenclatureClient")
    @patch("api.endpoints.billing.db")
    @patch("api.endpoints.billing.auth")
    def test_apply_combo_with_unique_code_descriptions(
        self, mock_auth, mock_db, mock_nomenclature_client
    ):
        """Test that unique codes with descriptions are handled correctly."""

        # Mock the nomenclature client to return None for unique codes
        mock_nomenclature = mock_nomenclature_client.return_value
        mock_nomenclature.get_code_details.return_value = (
            None  # Simulates code not found in API
        )

        # Mock the combo record with JSON-encoded combo_codes
        mock_combo = MagicMock()
        mock_combo.id = self.test_combo_id
        mock_combo.combo_name = TEST_COMBO_DATA["combo_name"]
        mock_combo.combo_codes = json.dumps(TEST_COMBO_DATA["combo_codes"])

        # Mock database queries
        mock_db.return_value.select.return_value.first.return_value = mock_combo
        mock_db.billing_codes.insert.return_value = 1
        mock_db.billing_combo_usage.insert.return_value = 1

        # Mock auth user
        mock_auth.get_user.return_value = {
            "id": self.test_user_id,
            "email": "test@example.com",
        }

        # Mock the database record selection for created billing code
        mock_created_code = MagicMock()
        mock_created_code.as_dict.return_value = {
            "id": 1,
            "nomen_code": 999000,
            "nomen_desc_fr": "Conseil personnalisé",
            "nomen_desc_nl": "Gepersonaliseerd advies",
            "fee": "85.00",
            "feecode": "N/A",
        }
        mock_db.return_value.select.return_value.first.return_value = mock_created_code

        # Import the function to test
        from api.endpoints.billing import apply_billing_combo

        # Mock request data
        with patch("api.endpoints.billing.request") as mock_request:
            mock_request.json = {
                "id_auth_user": self.test_user_id,
                "id_worklist": self.test_worklist_id,
                "note": "Test application",
            }

            # Call the function
            result = apply_billing_combo(self.test_combo_id)

        # Verify that the nomenclature client was called to check for the code
        mock_nomenclature.get_code_details.assert_called_with(999000)

        # Verify that billing code was created with the correct data
        # The insert call should include the descriptions from the combo definition
        insert_call_args = mock_db.billing_codes.insert.call_args
        self.assertIsNotNone(insert_call_args)

        # Check that the insert was called with the descriptions from combo definition
        inserted_data = insert_call_args[1]  # keyword arguments
        self.assertEqual(inserted_data["nomen_code"], 999000)
        self.assertEqual(inserted_data["nomen_desc_fr"], "Conseil personnalisé")
        self.assertEqual(inserted_data["nomen_desc_nl"], "Gepersonaliseerd advies")
        self.assertEqual(inserted_data["fee"], "85.00")

        print("✅ Test passed: Unique codes with descriptions are handled correctly")


if __name__ == "__main__":
    unittest.main()
