#!/usr/bin/env python3
"""
Simple test script for chart API endpoints
Run this from the py4web directory: python apps/oph4py/test_charts.py
"""

import sys

import requests

# Configuration
BASE_URL = "http://localhost:8000"  # Adjust if your py4web runs on different port
APP_NAME = "oph4py"


def test_chart_endpoint(table, period):
    """Test a specific chart endpoint"""
    url = f"{BASE_URL}/{APP_NAME}/api/chart_data/{table}/{period}"

    try:
        print(f"Testing: {url}")
        response = requests.get(url)

        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS: {table} ({period} months)")
            print(f"   - Total count: {data.get('total_count', 'N/A')}")
            print(f"   - Data points: {len(data.get('data', []))}")
            print(
                f"   - Date range: {data.get('labels', ['N/A'])[0] if data.get('labels') else 'N/A'} to {data.get('labels', ['N/A'])[-1] if data.get('labels') else 'N/A'}"
            )
            return True
        else:
            print(f"❌ FAILED: {response.status_code} - {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print(f"❌ CONNECTION ERROR: Could not connect to {BASE_URL}")
        print("   Make sure py4web is running with: py4web run apps")
        return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False


def main():
    """Run all chart tests"""
    print("🧪 Testing Chart API Endpoints")
    print("=" * 50)

    test_cases = [
        ("patients", 3),
        ("patients", 6),
        ("patients", 12),
        ("worklists", 3),
        ("worklists", 6),
        ("worklists", 12),
    ]

    success_count = 0
    total_tests = len(test_cases)

    for table, period in test_cases:
        if test_chart_endpoint(table, period):
            success_count += 1
        print()

    # Test invalid endpoints
    print("Testing invalid endpoints:")
    print("-" * 30)

    invalid_tests = [("invalid_table", 6), ("patients", 999), ("worklists", 0)]

    for table, period in invalid_tests:
        url = f"{BASE_URL}/{APP_NAME}/api/chart_data/{table}/{period}"
        try:
            response = requests.get(url)
            if response.status_code == 400:
                print(f"✅ VALIDATION: {table}/{period} correctly rejected (400)")
            else:
                print(
                    f"⚠️  UNEXPECTED: {table}/{period} returned {response.status_code}"
                )
        except Exception as e:
            print(f"❌ ERROR: {str(e)}")

    print("\n" + "=" * 50)
    print(f"📊 Results: {success_count}/{total_tests} tests passed")

    if success_count == total_tests:
        print("🎉 All chart endpoints are working correctly!")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
